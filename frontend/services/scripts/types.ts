export type Script = {
    /**
     * The keyword to trigger the script
     */
    keyword: string;
    /**
     * The name of the script. Will be displayed in the results
     */
    name: string;
    /**
     * The content of the script. Will be executed when the keyword is triggered
     */
    content: string;
    /**
     * @default 'background'
     */
    mode?: ScriptMode;
};

export type ScriptMode = 'background' | 'plugin';
