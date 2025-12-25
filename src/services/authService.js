import { config } from '../config/config';

class AuthService {
  constructor() {
    this.googleAuth = null;
    this.isInitialized = false;
  }

  // Inicializa o Google API Client
  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initializeGoogleAuth();
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  initializeGoogleAuth() {
    window.google.accounts.id.initialize({
      client_id: config.google.clientId,
      callback: this.handleCredentialResponse.bind(this)
    });
    this.isInitialized = true;
  }

  handleCredentialResponse(response) {
    if (response.credential) {
      const token = response.credential;
      localStorage.setItem('google_token', token);
      window.dispatchEvent(new Event('authStateChanged'));
    }
  }

  // Login com OAuth 2.0
  async signIn() {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: config.google.clientId,
        scope: config.google.scope,
        callback: (response) => {
          if (response.access_token) {
            this.setAccessToken(response.access_token);
            resolve(response.access_token);
          } else {
            reject(new Error('Falha na autenticação'));
          }
        },
        error_callback: (error) => {
          reject(error);
        }
      });
      
      client.requestAccessToken();
    });
  }

  // Logout
  signOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('google_token');
    window.dispatchEvent(new Event('authStateChanged'));
  }

  // Verifica se o usuário está autenticado
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Retorna o token de acesso
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  // Define o token de acesso
  setAccessToken(token) {
    localStorage.setItem('access_token', token);
    window.dispatchEvent(new Event('authStateChanged'));
  }

  // Obtém informações do usuário autenticado
  async getCurrentUser() {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(
        `${config.blogger.apiUrl}/users/self?key=${config.google.apiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao obter informações do usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }
}

export default new AuthService();
