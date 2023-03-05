export const CHANNELS = {
    UpdateDownloaded: 'update-downloaded',
    UpdateTheme: 'update-theme',
    ClearInput: 'clear-input',
    UpdateSettings: 'update-settings',
    ShowTerm: 'show-term',
    RendererToRenderer: 'renderer-to-renderer',
} as const

export type ChannelInterfaces = {
    [CHANNELS.UpdateDownloaded]: undefined,
    [CHANNELS.UpdateTheme]: string,
    [CHANNELS.ClearInput]: undefined,
    [CHANNELS.UpdateSettings]: {
        settingName: string,
        newValue: any,
    },
    [CHANNELS.ShowTerm]: string,
    [CHANNELS.RendererToRenderer]: {
        message: string,
        payload: any,
    },
}

export type ChannelInterfacesWithoutNeccesaryArgs = {
    [K in keyof ChannelInterfaces]: ChannelInterfaces[K] extends undefined ? K : never;
}[keyof ChannelInterfaces];

export type ChannelInterfacesWithNeccesaryArgs = {
    [K in keyof ChannelInterfaces]: ChannelInterfaces[K] extends undefined ? never : K;
}[keyof ChannelInterfaces];

