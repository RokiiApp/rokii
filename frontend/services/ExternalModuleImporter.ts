import { pathToFileURL } from 'url';

/**
 * This class is used to import external modules dynamically.
 */
export class ExternalModuleImporter {
  static async importModule (modulePath: string) {
    const normalizedPath = this.normalizePath(modulePath);
    try {
      const module = await import(normalizedPath);
      return { module, error: null };
    } catch (error) {
      console.error(error);
      return { module: null, error };
    }
  }

  private static normalizePath (path: string) {
    return pathToFileURL(path).href;
  }
}
