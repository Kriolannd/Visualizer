const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow = null;

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    title: "Visualizer App",
    // webPreferences: {
    //   additionalArguments: [`--yourKey=${yourValue}`]
    // }
  });

  const configFile = path.join(process.resourcesPath, 'extraResources', 'config.json');
  const properties = require(configFile);

  mainWindow.loadURL((isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`) + `?props=${JSON.stringify(properties)}`);
  
  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault()
  });
}
