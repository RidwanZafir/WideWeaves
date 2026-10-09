const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("archive", {
  worldCount: () => ipcRenderer.invoke("archive:world-count"),
  worlds: () => ipcRenderer.invoke("archive:worlds"),
  objectCount: () => ipcRenderer.invoke("archive:object-count"),
  objects: (opts) => ipcRenderer.invoke("archive:objects", opts),
  object: (id) => ipcRenderer.invoke("archive:object", id),
  certaintyBadge: (certainty) => ipcRenderer.invoke("archive:certainty-badge", certainty),
  addNextAction: (objectId, action, why) => ipcRenderer.invoke("archive:add-next-action", objectId, action, why),
  meta: () => ipcRenderer.invoke("archive:meta")
});
