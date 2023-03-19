export type Command = {
    /**
     * The keyword to trigger the command
     */
    keyword: string;
    /**
     * The name of the command. Will be displayed in the results
     */
    name: string;
    /**
     * The command to run
     */
    command: string;
    /**
     * @default 'background'
     */
    mode?: CommandMode;
};

export type CommandMode = 'background' | 'statusbar' | 'plugin';
