// ### Module ############################################################### //

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const {dialog} = require('electron')
const path = require('path')
const url = require('url')

// Menü Template
// #####################################################################################################################

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        click: () => {
					mainWindow.webContents.send('ping', 'open')
        }
      },
      {
        label: 'Save',
        click: () => {
          mainWindow.webContents.send('ping', 'save')
        }
      }
    ]
  },
  {
      label: 'Edit',
      submenu: [
          {
              label: 'Open dev tools',
              click: () => {
                  mainWindow.webContents.openDevTools()
              }
          }
      ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// Variablen
// #####################################################################################################################

let mainWindow = undefined

// Funktionen
// #####################################################################################################################

let init = () => {

  createWindow() // Erstelle ein neues Fenster

}


let terminate = () => {

  mainWindow = null

}

/**
 * Diese Funktion erstellt ein neues Browser Fenster
 * @param width {number} Window width
 * @param height {number} Window height
 */

function createWindow (width, height) {
  // Main browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600
  })

  // Lade die index.html Datei
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Falls das Fenster geschlossen wird
  mainWindow.on('closed', function () {
    terminate()
  })
}

// Events
// #####################################################################################################################

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
