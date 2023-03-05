import electron from 'electron';
import {
    ChannelInterfacesWithoutNeccesaryArgs,
    ChannelInterfacesWithNeccesaryArgs,
    ChannelInterfaces,
    CHANNELS
} from "./constants/events"

/**
 * A helper function to send messages between the main and renderer processes
 */
export function send<T extends ChannelInterfacesWithNeccesaryArgs>(channel: T, info: ChannelInterfaces[T]): void
export function send<T extends ChannelInterfacesWithoutNeccesaryArgs>(channel: T): void

export function send(channel: keyof typeof CHANNELS, info?: any) {
    if (electron.ipcRenderer) {
        electron.ipcRenderer.send(channel, info);
    } else {
        electron.webContents.getAllWebContents().forEach(webContent => webContent.send(channel, info));
    }
}

type Listener<T extends keyof ChannelInterfaces> = (event: electron.IpcRendererEvent | electron.IpcMainEvent, info: ChannelInterfaces[T]) => void;

/**
 * A helper function to listen to messages between the main and renderer processes
 */
export async function on<T extends ChannelInterfacesWithNeccesaryArgs>(channel: T, listener: Listener<T>): Promise<void>
export async function on<T extends ChannelInterfacesWithoutNeccesaryArgs>(channel: T, listener: Listener<T>): Promise<void>

export async function on<T extends keyof typeof CHANNELS>(channel: T, listener: Listener<typeof CHANNELS[T]>) {
    if (electron.ipcRenderer) {
        electron.ipcRenderer.on(channel, listener);
    } else {
        electron.ipcMain.on(channel, listener);
    }

}
