/**
 * This module is used to communicate between renderer processes.
 */
import EventEmitter from "events";
import { CHANNELS } from "common/constants/events";
import * as ipc from "common/ipc";

const emitter = new EventEmitter();

// Start listening for rpc channel
ipc.on(CHANNELS.RendererToRenderer, (_, { message, payload }) => {
  console.log(`[rtr] emit ${message}`);
  emitter.emit(message, payload);
});

/**
 * Send message to the other renderer process
 */
export const send = (message: string, payload: any) => {
  console.log(`[rtr] send ${message}`);
  ipc.send(CHANNELS.RendererToRenderer, { message, payload });
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
