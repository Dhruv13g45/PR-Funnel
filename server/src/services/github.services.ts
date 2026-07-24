export async function githubWebhookService(event: string, payload: any) {
  switch (event) {
    case "installation":
      console.log("Installation Event");
      console.log(payload);
      break;

    case "installation_repositories":
      console.log("Installation Repositories Event");
      console.log(payload);
      break;

    case "pull_request":
      console.log("Pull Request Event");
      console.log(payload);
      break;

    case "ping":
      console.log("Ping Event");
      console.log(payload);
      break;

    default:
      console.log(`Unhandled event: ${event}`);
  }
}

export function githubInstallationService(state: string): string {
  return `https://github.com/apps/${process.env.GITHUB_APP_SLUG}/installations/new?state=${encodeURIComponent(state)}`;
}
