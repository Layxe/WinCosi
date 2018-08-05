
/** ##################################################################################################################### *\
 *  @author      Alexander Niedmerayer <alexander.niedermayer0@gmail.com>
 *  @version     1.0.2
 *  @description Emuliere Code welcher für einen Von Neumann Rechner geschrieben
 *               wurde
\** ##################################################################################################################### */


/**
 * Kurze Erläuterung eines COSI Befehls
 * 
 * LDA     <- Befehl / Kommando
 * U/D/I/R <- Adressierungsmodus | Zusätzliche
 * <zahl>  <- Adresse            | Parameter
 */

// Konstante Befehle
// #####################################################################################################################

// Cosi Befehle die entweder eine direkte Zahl entgegen nehmen oder den Inhalt einer Speicheradresse
const STANDARD_COSI = ['LDA', 'ADD', 'SUB', 'MUL', 'DIV']
// Cosi Befehle die immer auf eine Speicherzelle weisen
const REFERING_COSI = ['BRT', 'BRE', 'BRP', 'STO']
// Cosi Befehle welche über keine zusätzlichen Parameter verfügen
const DIRECT_COSI   = ['END', 'PUS', 'POP', 'ADS', 'SUS', 'MUS', 'DIS']

// Mikroadressregister
// #####################################################################################################################

/** MAR
 * --------------------------
 *  Speicherort für alle gewünschten Befehle, können nach belieben
 *  erweitert werden, schlussendlich muss der Befehl nur oben
 *  in den konstanten Befehlen hinzugefügt werden
 */

class MAR {

  constructor(emulator) {
    this.emulator = emulator
  }

  isValidCommand(command) {

    if(STANDARD_COSI.includes(command) || REFERING_COSI.includes(command) || DIRECT_COSI.includes(command))
      return true

    return false

  }

  /* Sprungebefehle basieren immer auf dem gleichen Prinzip, da der Befehlszeiger aus technischen
     Gründen immer am Anfang eines Zyklus addiert wird springt das Programm zur vorherigen Speicherzelle
     (address-1), da somit schlussendlich die gewünschte Adresse erreicht wird
   */

  BRT(address) {
    this.emulator.BZ = address-1
  }

  BRP(address) {
    
    if(this.emulator.AK >= 0) {
      this.emulator.BZ = address-1
    }

  }

  BRE(address) {

    if(this.emulator.AK == 0) {
      this.emulator.BZ = address-1
    }

  }

  /**
   * Speichere den Akkuinhalt in einer Speicherzelle
   * @param address {number} Zu speichernde Adresse
   */

  STO(address) {
    this.emulator.setData(address, this.emulator.AK)
  }

  /**
   * Lade den gegebenen Wert (direkt oder aus einer Speicherzelle)
   * in den Akku
   */

  LDA(value) {
    this.emulator.AK = value
  }
  
  ADD(value) {
    this.emulator.AK += value
  }

  SUB(value) {
    this.emulator.AK -= value
  }

  MUL(value) {
    this.emulator.AK *= value
  }

  DIS(value) {
    this.emulator.AK /= value
  }

  /**
   * Verschiedene Stackoperationen
   */

  PUS() {
    this.emulator.STACK.push(this.emulator.AK)
  }

  POP() {
    this.emulator.AK = this.emulator.STACK.pop()
  }

  ADS() {
    let x = this.emulator.STACK.pop()
    this.emulator.STACK[this.emulator.STACK.length-1] += x
  }

  SUS() {
    let x = this.emulator.STACK.pop()
    this.emulator.STACK[this.emulator.STACK.length-1] -= x
  }

  MUS() {
    let x = this.emulator.STACK.pop()
    this.emulator.STACK[this.emulator.STACK.length-1] *= x
  }

  DIS() {
    let x = this.emulator.STACK.pop()
    this.emulator.STACK[this.emulator.STACK.length-1] /= x
  }

  /**
   * Zusätzliche Operationen
   */

  END() {
    this.emulator.finished = true
  }

}

// Emulator
// #####################################################################################################################

/**
 * Vorgehensweise
 * --------------
 *  - Trimme den Code -> Entferne Kommentare
 *  - Analyziere den Code und vergleiche ihn mit den gespeicherten
 *    Befehlen
 *  - Führe den Befehl aus
 */

class Emulator {

// Konstruktor
// #####################################################################################################################

  /**
   * Erstelle einen neuen Emulator
   * @constructor
   * @param input Input ohne Kommentare
   */

  constructor(input, ...options) {

    // ### Variablen ###

    // Speichere den Code als Reihung
    this.code = input.split('\n')

    this.BZ       = -1 // Befehlszähler
    this.AK       = 0  // Akkumulator
    this.counter  = 0 // Stepper counter

    this.finished = false
    this.stepMode = true

    this.STACK    = [] // Stack

    // Befehlsregister
    this.BR = {
      command: '',
      method : '',
      address: 0
    }

    this.mar = new MAR(this)

  }

  // Funktionen
  // #################################################################################################

  /**
   * Emuliere den eingespeisten Code
   */

  emulate() {

    while(!this.finished) {

      this.counter += 1

      this.BZ += 1

      this.BR.command  = this.code[this.BZ].substring(0,3)     // Type of command f.e. BRT
      this.BR.method   = this.code[this.BZ].charAt(3)          // Type of addressing f.e. D
      this.BR.address  = parseInt(this.code[this.BZ].slice(5)) // Given address f.e. 5

      // Vergleiche den aktuell geladenen Befehl mit den gespeicherten
      // Befehlen
      this.compareWithMAR()

      displayEmulator(this)

      if(this.stepMode) 
        this.finished = true

    }

  }

  nextStep() {
    this.finished = false
    this.emulate()
    displayResult(this.code)
  }

  /**
   * Gebe eine Fehlernachricht aus
   */

  error(msg) {

    alert(`${this.BZ}: "${this.code[this.BZ]}" > ${msg}`)
    this.finished = true

  }

  compareWithMAR() {

    // Erhalte die gewünschte Adresse
    let address = null

    // Verwende die Addressierung für einen standard Cosi Befehl
    if(STANDARD_COSI.includes(this.BR.command))
      address = this.getAddress(this.BR.method, this.BR.address)

    // Verwende die zweite Adressierungsart bei den gewünschten Befehlen
    if(REFERING_COSI.includes(this.BR.command))
      address = this.getJumpAddress(this.BR.method, this.BR.address)

    if(!this.mar.isValidCommand(this.BR.command)) {
      this.error('Befehl existiert nicht!')
    }

    // Führe den Befehl aus
    this.mar[this.BR.command](address)

  }

  /**
   * Erhalte den Inhalt einer Speicherzelle
   * @param address {number} Speicheradresse
   * @returns value {string} Inhalt
   */

  getData(address) {
    return this.code[address]
  }

  /**
   * Setze den Inhalt einer Speicherzelle
   * @param address {number} Speicheradresse
   * @param value {string|number} Inhalt
   */

  setData(address, value) {
    this.code[address] = value
  }

  /**
   * Erhalte die gewünschte Addresse / den gewünschten Wert
   * @param type {string} Methode, welche zur Adressierung verwendet wird
   * @param value {number} Wert der für den Vorgang verwendet wird
   */
  getAddress(type, value) {

    switch(type) {

      case 'U':
        return value
      break

      case 'D':
        return parseInt(this.code[value])
      break

      case 'I':
        return parseInt(this.code[parseInt(this.code[value])])
      break

      case 'R':
        return parseInt(this.code[this.BZ - value])
      break

      default:
        this.error('Der verwendete Adressierungsmodus existiert nicht!')
      break

    }

  }

  /**
   * Erhalte die gewünschte Speicherzellenadresse auf
   * die zugegriffen werden soll (wird bei 'referring' Befehlen)
   * verwendet
   * @param type {string} 
   * @param value {number}
   */

  getJumpAddress(type, value) {

    switch(type) {

      case 'U':
        this.error('Please do not use BRT, BRP or BRE with U')
        return value
      break

      case 'D':
        return value
      break

      case 'I':
        return parseInt(this.code[value])
      break

      case 'R':
        return (this.BZ) - value
      break;

      default:
        this.error('Die verwendete Adressierungsart existiert nicht')
      break;

    }

  }

}

// Hilfsfunktionen
// #####################################################################################################################

let emulator

function emulateCosiCode() {

  emulator = new Emulator(getCode())
  emulator.stepMode = document.getElementById('stepper').checked
  emulator.emulate()
  displayResult(emulator.code)

}

function emulateCode() {

  if(executeMode == 'COSI') {
    emulateCosiCode()
  }

}
