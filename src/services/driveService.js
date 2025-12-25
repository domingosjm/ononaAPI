import axios from 'axios';

class DriveService {
  constructor() {
    this.accessToken = null;
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
  }

  // Inicializar Google Drive API
  async init() {
    return new Promise((resolve, reject) => {
      // Carregar GAPI
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          this.gapiInited = true;
          this.maybeEnableButtons(resolve);
        } catch (error) {
          console.error('Erro ao inicializar GAPI:', error);
          reject(error);
        }
      });

      // Inicializar GIS (Google Identity Services)
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
        callback: '', // definido mais tarde
      });
      this.gisInited = true;
      this.maybeEnableButtons(resolve);
    });
  }

  maybeEnableButtons(resolve) {
    if (this.gapiInited && this.gisInited && resolve) {
      resolve();
    }
  }

  // Login no Google Drive
  signIn() {
    return new Promise((resolve, reject) => {
      this.tokenClient.callback = async (response) => {
        if (response.error !== undefined) {
          reject(response);
          return;
        }
        this.accessToken = response.access_token;
        resolve(response);
      };

      if (this.accessToken === null) {
        // Solicitar token de acesso
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        // Pular o prompt se já tiver token
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  // Logout do Google Drive
  signOut() {
    if (this.accessToken) {
      window.google.accounts.oauth2.revoke(this.accessToken);
      this.accessToken = null;
    }
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return this.accessToken !== null;
  }

  // ============ UPLOAD DE ARQUIVOS ============

  // Upload de arquivo para o Google Drive
  async uploadFile(file, folderId = null) {
    if (!this.accessToken) {
      throw new Error('Não autenticado no Google Drive');
    }

    const metadata = {
      name: file.name,
      mimeType: file.type,
    };

    // Se especificar uma pasta, adicionar aos parents
    if (folderId) {
      metadata.parents = [folderId];
    }

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    try {
      const response = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,size',
        form,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  // ============ GERENCIAMENTO DE ARQUIVOS ============

  // Listar arquivos do Drive
  async listFiles(query = null, pageSize = 100) {
    if (!this.accessToken) {
      throw new Error('Não autenticado no Google Drive');
    }

    try {
      let url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)`;
      
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }

  // Buscar arquivos de livros (PDF, EPUB, MOBI, etc)
  async listBookFiles() {
    const query = "mimeType='application/pdf' or mimeType='application/epub+zip' or name contains '.mobi' or name contains '.azw'";
    return this.listFiles(query);
  }

  // Obter detalhes de um arquivo específico
  async getFile(fileId) {
    if (!this.accessToken) {
      throw new Error('Não autenticado no Google Drive');
    }

    try {
      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,description`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao obter arquivo:', error);
      throw error;
    }
  }

  // Deletar arquivo
  async deleteFile(fileId) {
    if (!this.accessToken) {
      throw new Error('Não autenticado no Google Drive');
    }

    try {
      await axios.delete(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  // ============ COMPARTILHAMENTO ============

  // Tornar arquivo público e obter link de download
  async makeFilePublic(fileId) {
    if (!this.accessToken) {
      throw new Error('Não autenticado no Google Drive');
    }

    try {
      // Criar permissão pública
      await axios.post(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          role: 'reader',
          type: 'anyone',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Obter link de download direto
      const file = await this.getFile(fileId);
      return {
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        downloadLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
      };
    } catch (error) {
      console.error('Erro ao tornar arquivo público:', error);
      throw error;
    }
  }

  // ============ PASTAS ============

  // Criar pasta
  async createFolder(folderName, parentFolderId = null) {
    if (!this.accessToken) {
      throw new Error('Não autenticado no Google Drive');
    }

    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    try {
      const response = await axios.post(
        'https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink',
        metadata,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      throw error;
    }
  }

  // Listar pastas
  async listFolders() {
    const query = "mimeType='application/vnd.google-apps.folder'";
    return this.listFiles(query);
  }

  // ============ UTILITÁRIOS ============

  // Formatar tamanho de arquivo
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Obter ícone baseado no tipo de arquivo
  getFileIcon(mimeType) {
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('epub')) return '📘';
    if (mimeType.includes('zip')) return '📦';
    if (mimeType.includes('folder')) return '📁';
    return '📄';
  }
}

export default new DriveService();
