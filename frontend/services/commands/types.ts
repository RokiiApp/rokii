type CommandMode = 'background' | 'page';

export type CommandInfo = {
    title: string;
    subtitle: string;
    path: string;
    mode?: CommandMode;
}
