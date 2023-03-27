type CommandMode = 'background' | 'page';

export type CommandApiInfo = {
    title: string;
    subtitle: string;
    name: string;
    mode?: CommandMode;
}

export type CommandInfo = {
    title: string;
    subtitle: string;
    path: string;
    mode?: CommandMode;
}
