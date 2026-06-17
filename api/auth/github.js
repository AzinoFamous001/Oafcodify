export default async function handler(req, res) {
  const githubAuthUrl = 'https://github.com/login/oauth/authorize';
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'user:email',
  });
  
  res.redirect(`${githubAuthUrl}?${params.toString()}`);
}
