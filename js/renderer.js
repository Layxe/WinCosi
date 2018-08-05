/** ##################################################################################################################### *\
 *  @author      Alexander Niedmerayer <alexander.niedermayer0@gmail.com>
 *  @version     1.0.2
 *  @description Simpler Code Editor für COSI Assembler mit OPL Syntax Highlighting
\** ##################################################################################################################### */

// Konstanten
// #####################################################################################################################

const lineHeight = 25;
const lineLimit  = 150;


try {
  const {dialog} = require('electron').remote
  const fs       = require('fs')
} catch(error) {
  alert('Browser-Modus aktiviert')
}

const STACK_SYMBOLS = ['PUS', 'POP', 'ADS', 'SUS', 'MUS', 'DIS']
const COSI_SYMBOLS = ['BRT', 'BRP', 'BRE', 'ADD', 'SUB', 'LDA', 'STO', 'MUL', 'DIV', 'COU']
const COSI_ADDRESS = ['U', 'D', 'I', 'R']

const DIGITS       = ['0','1','2','3','4','5','6','7','8','9']

// OPL Symbole, wird nicht vollkommen unterstützt
const SYMBOLS      = [['END', 'main-symbol'], ['PROGRAM', 'main-symbol'], ['VAR', 'main-symbol'], ['WHILE', 'main-symbol'], ['DO', 'main-symbol'], ['BEGIN', 'main-symbol']]

// Variablen
// #####################################################################################################################

let input         = document.getElementById('input-field')
let cursorElement = document.getElementById('cursor')
let output        = document.getElementById('output-field')
let activeRow     = document.getElementById('active-row')

let cursor = {
  x: 0,
  y: 0
}

let pointerVisible = false
let executeMode = 'COSI'

// Gespeicherter Code
let lineContent = new Array()

for(let i = 0; i <= 17; i++) {
  lineContent[i] = ''
  updateDisplay()
}


// Events
// #####################################################################################################################

window.addEventListener("keydown", function(event) {

  // Tab wurde gedrückt
  if(event.keyCode == 9) {
    event.preventDefault()
    lineContent[cursor.y] = addObj(lineContent[cursor.y], cursor.x, '  ')
    cursor.x += 2
    updateLine()
    return
  }

  // Linke Pfeiltaste
  if(event.keyCode == 37) {
    input.scrollLeft = (cursor.x * 12)
    event.preventDefault()
    if(cursor.x > 0)
      cursor.x -= 1 // move the cursor to the left
    return
  }

  // Obere Pfeiltaste
  if(event.keyCode == 38) {
    if(cursor.y > 0) {
      input.scrollTop -= lineHeight
      event.preventDefault()
      cursor.y -= 1 // move the cursor up
      // adjust the x position
      if(cursor.x > lineContent[cursor.y].length)
        cursor.x = lineContent[cursor.y].length
    }
  }

  // Rechte Pfeiltaste
  if(event.keyCode == 39) {
    input.scrollLeft = (cursor.x * 12) - input.clientWidth*0.8
    event.preventDefault()
    if(cursor.x < lineContent[cursor.y].length)
      cursor.x += 1 // move cursor to the right
  }

  // Untere Pfeiltaste
  if(event.keyCode == 40) {
    if(cursor.y < lineContent.length-1) {
      input.scrollTop += lineHeight
      event.preventDefault()
      cursor.y += 1 // move cursor down
      // adjust x position
      if(cursor.x > lineContent[cursor.y].length)
        cursor.x = lineContent[cursor.y].length
    }
  }

  // Backspace
  if(event.keyCode == 8) {
    // Lösche die Zeile, wenn sie leer ist
    if(cursor.x > 0) {
      cursor.x -= 1 // Bewege den Cursor zurück
    } else {
      if(cursor.y > 0) {
        deleteLine(cursor.y)
        cursor.y -= 1
        // Positioniere den Cursor am Ende der nächsten Zeile
        cursor.x = lineContent[cursor.y].length 
        updateDisplay()
        return
      }
    }

    // Entferne das Zeichen von der aktuelle Cursor Position
    lineContent[cursor.y] = removeObj(lineContent[cursor.y], cursor.x)
    updateLine()
    return

  }

  if(lineContent[cursor.y].length > lineLimit)
    return

  // Space
  if(event.keyCode == 32) {
    lineContent[cursor.y] = addObj(lineContent[cursor.y], cursor.x, ' ')
    cursor.x += 1
    event.preventDefault() // Verhindere, dass gescrollt wird
    updateLine()
    return

  }

})

window.addEventListener("keypress", function(event) {


  // Springe zur nächsten Zeile
  if(event.keyCode == 13) {
    cursor.y += 1

    let newLinecontent = []

    // Füge den Teil über dem Cursor hinzu
    for(let i = 0; i < lineContent.slice(0,cursor.y).length; i++) {
      newLinecontent.push(lineContent[i])
    }

    // Entferne den Bereich vor dem Cursor
    newLinecontent[lineContent.slice(0,cursor.y).length-1] = lineContent[cursor.y-1].substring(0, cursor.x)

    // Füge der neuen Zeile den entfernten Bereich hinzu
    newLinecontent.push(lineContent[cursor.y-1].substring(cursor.x, lineContent[cursor.y-1].length))

    // Füge den Teil unter dem Cursor hinzu
    for(let i = 0; i < lineContent.slice(cursor.y).length; i++) {
      newLinecontent.push(lineContent[cursor.y+i])
    }

    lineContent = newLinecontent

    // Aktualisiere die Adressen, falls sie sich geändert haben
    lineContent.forEach((line, index) => {

      // Adressierung an eine Speicherzelle
      if(line.charAt(3) == 'D' || line.charAt(3) == 'I') {

        let splittedLine = line.split(' ')
        let possibleNumber = parseInt(splittedLine[1])

        if(!isNaN(possibleNumber)) {

          console.log(possibleNumber + ' ' + cursor.y)

          if(possibleNumber >= cursor.y || (possibleNumber == cursor.y-1 && cursor.x == 0)) {
            possibleNumber += 1
            splittedLine[1] = possibleNumber.toString()
            lineContent[index] = splittedLine.join(' ')

          }
        
        }

      }

    })

    updateDisplay()

    if(cursor.y == lineContent.length-1 || cursor.y > input.clientHeight) {
      input.scrollTop = input.scrollHeight+500;
    }

    // Setze die x Position des Cursors zurück
    cursor.x = 0

    return

  }

  if(lineContent[cursor.y].length > lineLimit)
    return

  // Füge das Zeichen hinzu
  lineContent[cursor.y] = addObj(lineContent[cursor.y], cursor.x, event.key)

  // Bewege den Cursor
  cursor.x += 1

  updateLine()

  // Scolle zum neuen Zeichen
  input.scrollLeft = (cursor.x * 12 + 12)

})

// Funktionen
// #####################################################################################################################

let updateLine = () => {
  let line = cursor.y
  input.childNodes[line].lastChild.innerHTML = highlightSyntax(lineContent[line])
}

let oldContent = ''

// Akualisiere den Cursor
setInterval(updateCursor, 1000/30)

function updateCursor() {

  let baseY = 10, baseX = 83

  let content = lineContent[cursor.y].substring(0, cursor.x)

  // Ersetze alle Leerzeichen mit einem Platzhalterzeichen
  activeRow.innerHTML = content.replace(/ /g , '&nbsp;')

  cursorElement.style.left = ((85 + activeRow.clientWidth) - input.scrollLeft) + 'px'

  cursorElement.style.top  = ((10 + cursor.y*25) - input.scrollTop) + 'px'

  if((10 + cursor.y*25) - input.scrollTop > input.clientHeight)
    cursorElement.style.display = 'none'
  else
    cursorElement.style.display = 'block'

  if((85 + cursor.x*12) - input.scrollLeft > input.clientWidth+13) {

    cursorElement.style.display = 'none'

  } else {

    if(cursorElement.style.display != 'none')
    cursorElement.style.display = 'block'

  }
}

/**
 * Lösche die gewünschte Zeile
 * @param line {number} Zeile
 */

let deleteLine = (line) => {

  if(lineContent[line].length >= 0) {

      if(line > 0) {
    
        cursor.x = lineContent[line-1].length
        lineContent[line-1] += lineContent[line]

        // Aktualisiere die Adressen, falls sie sich geändert haben
        lineContent.forEach((line, index) => {

          console.log('HELP ME')

          // Adressierung an eine Speicherzelle
          if(line.charAt(3) == 'D' || line.charAt(3) == 'I') {

            let splittedLine = line.split(' ')
            let possibleNumber = parseInt(splittedLine[1])

            if(!isNaN(possibleNumber)) {

              if(possibleNumber >= cursor.y) {
                possibleNumber -= 1
                splittedLine[1] = possibleNumber.toString()
                lineContent[index] = splittedLine.join(' ')

              }

            }

          }

        })

      }

  }

  delete lineContent[line]
  updateLineArray()
}

/**
 * Reinige die Reihung falls ein null Objekt vorkommt
 */

let updateLineArray = () => {
  let lines = new Array()
  let counter = 0
  for(let i = 0; i < lineContent.length; i++) {
    if(lineContent[i] != null) {
      lines[counter] = lineContent[i]
      counter++
    }
  }

  lineContent = lines

}

/**
 * Füge ein neues Zeichen hinzu
 * @param value {string} Zeichenkette zu der das Zeichen hinzugefügt werden soll
 * @param index {number} Ort an dem das Zeichen hinzugefügt werden soll
 * @param char  {string} Hinzugefügtes Zeichen
 */

let addObj = (value, index, char) => {
  return value.slice(0,index) + char + value.slice(index)
}

/**
 * Lösche ein Zeichen aus einer Zeichenkette
 * @param value {string} Zeichenkette
 * @param index {number} Ort an dem das Zeichen gelöscht werden soll
 */

let removeObj = (value, index) => {
  return value.slice(0,index) + value.slice(index+1)
}

/**
 * Aktualisiere die angezeigten Objekte im Editor
 */

function updateLineContent() {

  for(let i = 0; i < lineContent.length; i++) {

    input.childNodes[i].lastChild.innerHTML = highlightSyntax(lineContent[i])

  }

}

/**
 * Aktualisiere die Zeilennummern
 */

function updateLineNumbers() {

  for(let i = 0; i < lineContent.length; i++) {

    input.childNodes[i].firstChild.innerHTML = i

  }

}

/**
 * Füge neue Zeilen etc. zu dem Editor hinzu
 */

function updateDisplay() {

  if(lineContent.length > input.childNodes.length) {

    let element = document.createElement('div')
    element.setAttribute('class', 'line')
    element.innerHTML = `<div class='number'></div><div></div>`

    input.appendChild(element)
  } else if(lineContent.length < input.childNodes.length) {
    input.removeChild(input.lastChild)
  }

  updateLineContent()
  updateLineNumbers()

}

/**
 * Erhalte den geschrieben Code mit \n an jedem Ende einer Zeile
 */

let getCode = () => {

  let code = ''

  for(let i = 0; i < lineContent.length; i++) {

    let line = lineContent[i]
    let trimmedLine = ''

    for(let k = 0; k < line.length; k++) {

      // Ignore comments
      if(line.charAt(k) == '/' && line.charAt(k+1) == '/')
        break

      trimmedLine += line.charAt(k)

    }

    code += trimmedLine

    if(i < lineContent.length-1)
      code += '\n'

  }

  return code

}

/**
 * Stelle den fertig emulierten Code auf dem Bildschirm dar
 * @param result {array} Fertiger Code
 */

let displayResult = (result) => {

  output.innerHTML = ''

  for(let i = 0; i < result.length; i++) {

      output.innerHTML += `<div class='line'><div>${i}</div>${result[i]}</div>`

  }

}

let BZ    = document.getElementById('bz')
let AK    = document.getElementById('akku')
let BR    = document.getElementById('br')
let STACK = document.getElementById('stack')
let CTER  = document.getElementById('counter')

let displayEmulator = emulator => {

  let address = ''

  if(!isNaN(emulator.BR.address))
    address = emulator.BR.address

  BZ.innerHTML = emulator.BZ
  AK.innerHTML = emulator.AK
  BR.innerHTML = `<br>&nbsp;&nbsp; Kommando: ${emulator.BR.command}${emulator.BR.method} ${address}`

  STACK.innerHTML = ''

  emulator.STACK.forEach(val => {
    STACK.innerHTML += `&nbsp;&nbsp;<span>${val}</span><br>`
  })

  CTER.innerHTML = `Schritt: ${emulator.counter}`

}

// Interaktion mit der Electron API
// #####################################################################################################################

try {
  
require('electron').ipcRenderer.on('ping', (event,message) => {

	switch(message) {
		case 'open':
			openFile()
			break;
		case 'save':
			saveFile()
			break;
	}

})

} catch(error) {

}


// Dateimanagement
// #####################################################################################################################

/**
 * Speichere die Datei mit einem Speicherdialog
 */

function saveFile() {

	dialog.showSaveDialog({filters: [
		{name: 'OurProgrammingLanguage', extensions: ['opl']},
		{name: 'Cosi Assembler', extensions: ['cosi']}
	]}, (fileName) => {

		if(fileName == null)
			return

		let data = ''

		for(let i = 0; i < lineContent.length; i++) {

			if(lineContent[i] != '')
				data += lineContent[i]
			else
				data += '\r'

			if(i != lineContent.length-1 && lineContent[i] != '')
				data += '\n'
		}

		fs.writeFile(fileName, data, (err) => {
			if(err != null)
				alert(err)
			else
				alert('Datei gespeichert!')
		})

	})

}

/**
 * Öffne eine COSI Datei
 */

function openFile() {
	dialog.showOpenDialog({
		filters: [
			{name: 'OurProgrammingLanguage', extensions: ['opl']},
      {name: 'Cosi Assembler', extensions: ['cosi']}
		]
	}, (fileNames) => {

		if(fileNames == null)
			return

		let fileName = fileNames[0]

		fs.readFile(fileName, 'utf-8', (err, data) => {
			// Put code into the editor
			lineContent = data.split(/\r|\n/)
			updateDisplay()

		})

	})

}

// ### Syntax Highlighting #################################################### //

/**
 * Lese den aktuellen Code und probiere gewisse Stellen
 * hervorzuheben
 * @param value {string} Zeile
 * @returns editString {string} Formatierte Zeile
 */

function highlightSyntax(value) {

  // Cosi Assembler highlighting
  for(let k = 0; k < COSI_ADDRESS.length; k++) {
    for(let i = 0; i < COSI_SYMBOLS.length; i++) {
      value = value.replace(COSI_SYMBOLS[i]+COSI_ADDRESS[k], '<span class="main-symbol">' + COSI_SYMBOLS[i] + '</span>' + '<span class="syntax-mode">' + COSI_ADDRESS[k] + '</span>')
    }

  }

  // Highlighting für STACK Befehle
  STACK_SYMBOLS.forEach(symbol => {
    value = value.replace(symbol, `<span class="main-symbol">${symbol}</span>`)
  })

  //  Generelle Symbole auch aus OPL
  for(let i = 0; i < SYMBOLS.length; i++) {
    value = value.replace(SYMBOLS[i][0], `<span class=${SYMBOLS[i][1]}>${SYMBOLS[i][0]}</span>`)
  }

  let editString = ''

  // Probiere Nummern hervorzuheben
  for(let i = 0; i < value.length; i++) {

    let hasFoundNumber = false

    for(let k = 0; k < DIGITS.length; k++) {

      if(value.charAt(i) == DIGITS[k]) {

        editString += `<span class='syntax-number'>${k}</span>`
        hasFoundNumber = true

      }

    }

    if(!hasFoundNumber) {
      editString += value.charAt(i)
    } 

  }

  return editString

}
