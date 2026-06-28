import { Octokit } from "octokit";

export interface GithubConfig {
  owner: string;
  repo: string;
  path: string;
  token: string;
}

export class GithubService {
  private octokit: Octokit;
  private config: GithubConfig;

  constructor(config: GithubConfig) {
    this.config = config;
    this.octokit = new Octokit({ auth: config.token });
  }

  async testConnection() {
    try {
      await this.octokit.rest.users.getAuthenticated();
      return { success: true };
    } catch (error) {
      console.error("GitHub Auth Error:", error);
      return { success: false, error };
    }
  }

  async saveFile(content: string, message: string = "Save location data", customPath?: string, isBinary: boolean = false) {
    try {
      const targetPath = customPath || this.config.path;
      // Get the SHA of the existing file to update it
      let sha: string | undefined;
      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: targetPath,
        });
        if (!Array.isArray(data)) {
          sha = data.sha;
        }
      } catch (e) {
        // File might not exist yet
      }

      // Encode content
      let base64Content: string;
      if (isBinary) {
        // Assume content is already Base64 but might have data:image/webp;base64, prefix
        base64Content = content.includes('base64,') ? content.split('base64,')[1] : content;
      } else {
        // Robust Base64 encoding for UTF-8 content
        base64Content = btoa(new TextEncoder().encode(content).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      }

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: targetPath,
        message,
        content: base64Content,
        sha,
      });
      return { success: true };
    } catch (error) {
      console.error("Error saving to GitHub:", error);
      return { success: false, error };
    }
  }
}
