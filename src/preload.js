const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

// Exposed protected methods in the render process
contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods
    'ipcRenderer', {
    // From render to main and back again
    getDir: () => {
        return ipcRenderer.invoke('get-dir');
    },
    closeWindow: () => {
        return ipcRenderer.invoke('close');
    },
    minimizeWindow: () => {
        return ipcRenderer.invoke('minimize');
    },
    maximizeWindow: () => {
        return ipcRenderer.invoke('maximize');
    },
}
);
