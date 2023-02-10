/**
 * This module is used to communicate between renderer processes.
 */
import { ipcRenderer } from "electron";
import EventEmitter from "events";
import { RTR_CHANNEL } from "common/constants/ui";

const emitter = new EventEmitter();

// Start listening for rpc channel
ipcRenderer.on(RTR_CHANNEL, (_, { message, payload }) => {
  console.log(`[rtr] emit ${message}`);
  emitter.emit(message, payload);
});

/**
 * Send message to the other renderer process
 */
export const send = (message: string, payload: any) => {
  console.log(`[rtr] send ${message}`);
  ipcRenderer.send(RTR_CHANNEL, { message, payload });
};

/**
 * Listen to messages from the other renderer process
 */
export const on = emitter.on.bind(emitter);

/**
 * Remove listener from messages from the other renderer process
 */
export const off = emitter.removeListener.bind(emitter);

/**
 * Listen to messages from the other renderer process only once
 */
export const once = emitter.once.bind(emitter);
