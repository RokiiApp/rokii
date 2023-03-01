export type PluginInfo = {
    name: string;
    description: string;
    version: string;
    installedVersion?: string;
    settings?: any;
    isInstalled: boolean;
    isUpdateAvailable: boolean;
    isDebugging?: boolean;
    repo?: string;
  };


export type NPM_Package = {
    name: string;
    version: string;
    description: string;
    links: {
        homepage: string;
        repository: string;
    };
}

export type NPMPackageSearchResult = {
    package: NPM_Package;
    score: {
        final: number;
        detail: {
            quality: number;
            popularity: number;
            maintenance: number;
        };
    };
    searchScore: number;
};



export type NPM_SearchResult = {
    objects: NPMPackageSearchResult[];
}
