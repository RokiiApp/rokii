import type { NPMPackageSearchResult, NPM_SearchResult } from "../types";

const sortByPopularity = (a: NPMPackageSearchResult, b: NPMPackageSearchResult) =>
  a.score.detail.popularity > b.score.detail.popularity ? -1 : 1;

/**
 * Get all available plugins for Cerebro
 */
export const getNPMPlugins = async () => {
  if (!navigator.onLine) return [];

  /**
   * API endpoint to search all cerebro plugins
  */
  const URL =
    "https://registry.npmjs.com/-/v1/search?from=0&size=500&text=keywords:cerebro-plugin,cerebro-extracted-plugin";

  try {
    const { objects: plugins } = await fetch(URL).then((res) => res.json() as Promise<NPM_SearchResult>);
    plugins.sort(sortByPopularity);

    return plugins.map((p) => ({
      name: p.package.name,
      version: p.package.version,
      description: p.package.description,
      homepage: p.package.links.homepage,
      repo: p.package.links.repository,
    }));
  } catch (err) {
    console.log(err);
    return [];
  }
};

/**
 * Get plugin Readme.md content
 */
export const getReadme = async (repo: string) => {
  const response = await fetch(`https://api.github.com/repos/${repo}/readme`);
  const json = await response.json();
  return Buffer.from(json.content, "base64").toString();
}
