// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const electronDialog = require('electron').dialog;
const IpcMain = require('electron').ipcMain;
const path = require('node:path')
const listDirectory = require("./fslist.js");

let mainWindow;
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 1100,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: true,
      sandbox: true,
      enableBlinkFeatures: "CSSColorSchemeUARendering",
    },
    frame: false,
    //autoHideMenuBar: true,
  })


  // and load the index.html of the app.
  const mainHtml = path.resolve(__dirname,'index.html')
  mainWindow.loadFile(mainHtml)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// -------------------------------------
// Important handler for selecting the directory containing the audio files
// Response Object contains the Selection path and all the audio files in the dir
// -------------------------------------

IpcMain.handle('get-dir', () => {
  return electronDialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
    .then(async (result) => {
      if (result.canceled) {
        return { 'status': 'canceled' }
      } else {
        const fileList = await listDirectory(result.filePaths[0], { matchWhat: "ext", match: "mp3", resultType: "objects" })
        try {
          return { dir: result.filePaths[0], files: (fileList.length === 0) ? { 'status': 'empty' } : fileList };
        }
        catch (error) {
          console.error(error);
          return { 'status': 'error' }
        }
      }
    })
})

IpcMain.handle('close', () => {
  app.quit()
})
IpcMain.handle('minimize', () => {
  BrowserWindow.getFocusedWindow().minimize();
})
IpcMain.handle('maximize', () => {
  BrowserWindow.getFocusedWindow().maximize();
})  
