export const config = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    scope: 'https://www.googleapis.com/auth/blogger',
    discoveryDocs: ['https://blogger.googleapis.com/$discovery/rest?version=v3']
  },
  blogger: {
    blogId: import.meta.env.VITE_BLOG_ID,
    apiUrl: 'https://www.googleapis.com/blogger/v3'
  }
};
