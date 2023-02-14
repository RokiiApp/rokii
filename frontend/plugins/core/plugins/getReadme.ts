/**
 * Get plugin Readme.md content
 *
 */
export default (repo: string) =>
  fetch(`https://api.github.com/repos/${repo}/readme`)
    .then((response) => response.json())
    .then((json) => Buffer.from(json.content, "base64").toString());
