export const environment = {
  production: true,
  claudeApiKey: process.env['CLAUDE_API_KEY'] || '',
  claudeApiUrl: 'https://api.anthropic.com/v1/messages'
};
