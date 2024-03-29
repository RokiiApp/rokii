export const CHANNELS = {
  UpdateDownloaded: 'update-downloaded',
  UpdateTheme: 'update-theme',
  ClearInput: 'clear-input',
  UpdateSettings: 'update-settings',
  ShowTerm: 'show-term',
  RendererToRenderer: 'renderer-to-renderer',
  FocusInput: 'focus-input',
  FocusPreview: 'focus-preview',
  StatusBarUpdate: 'status-bar-update'
} as const;

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
    [CHANNELS.FocusInput]: undefined,
    [CHANNELS.FocusPreview]: undefined,
    [CHANNELS.StatusBarUpdate]: StatusBarState
}

export type ChannelInterfacesWithoutNeccesaryArgs = {
    [K in keyof ChannelInterfaces]: ChannelInterfaces[K] extends undefined ? K : never;
}[keyof ChannelInterfaces];

export type ChannelInterfacesWithNeccesaryArgs = {
    [K in keyof ChannelInterfaces]: ChannelInterfaces[K] extends undefined ? never : K;
}[keyof ChannelInterfaces];

export type StatusBarState = {
    statusBarText: string;
    icon: 'success' | 'error' | 'info' | 'loading' | null;
    /**
     * The time that the status bar should be visible.
     */
    timeout: number | null;
  };
