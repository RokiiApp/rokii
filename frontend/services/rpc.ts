import { ipcRenderer } from "electron";
import EventEmitter from "events";

const emitter = new EventEmitter();

/**
 * Channel name that is managed by main process.
 */
const CHANNEL = "message";

// Start listening for rpc channel
ipcRenderer.on(CHANNEL, (_, { message, payload }) => {
  console.log(`[rpc] emit ${message}`);
  emitter.emit(message, payload);
});

/**
 * Send message to rpc-channel
 */
export const send = (message: string, payload: any) => {
  console.log(`[rpc] send ${message}`);
  ipcRenderer.send(CHANNEL, { message, payload });
};

export const on = emitter.on.bind(emitter);
export const off = emitter.removeListener.bind(emitter);
export const once = emitter.once.bind(emitter);
