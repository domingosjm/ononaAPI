import axios from 'axios';
import { config } from '../config/config';
import authService from './authService';

class BloggerService {
  constructor() {
    this.api = axios.create({
      baseURL: config.blogger.apiUrl,
      params: {
        key: config.google.apiKey
      }
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      const token = authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ============ BLOGS ============

  // Obter informações do blog
  async getBlog() {
    try {
      const response = await this.api.get(`/blogs/${config.blogger.blogId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter blog:', error);
      throw error;
    }
  }

  // Obter blogs do usuário
  async getUserBlogs() {
    try {
      const response = await this.api.get('/users/self/blogs');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter blogs do usuário:', error);
      throw error;
    }
  }

  // ============ IMAGENS ============

  // Upload de imagem para o Blogger
  async uploadImage(blogId, file) {
    try {
      // Converter arquivo para base64
      const base64 = await this.fileToBase64(file);
      
      // O Blogger API não tem endpoint direto para upload de imagens
      // Vamos usar uma técnica alternativa: criar um post temporário com a imagem
      // e extrair a URL hospedada pelo Blogger
      
      const tempPost = {
        kind: 'blogger#post',
        blog: { id: blogId },
        title: `temp_image_${Date.now()}`,
        content: `<img src="${base64}" />`,
        labels: ['temp_image']
      };

      const response = await this.api.post(`/blogs/${blogId}/posts`, tempPost, {
        params: { isDraft: true }
      });

      // Extrair URL da imagem do conteúdo retornado pelo Blogger
      const content = response.data.content;
      const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      
      if (imgMatch && imgMatch[1]) {
        const hostedUrl = imgMatch[1];
        
        // Deletar o post temporário
        await this.api.delete(`/blogs/${blogId}/posts/${response.data.id}`);
        
        return hostedUrl;
      }

      throw new Error('Não foi possível extrair a URL da imagem');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  }

  // Converter arquivo para base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // ============ POSTS ============

  // Listar todas as postagens
  async getPosts(params = {}) {
    try {
      const response = await this.api.get(`/blogs/${config.blogger.blogId}/posts`, {
        params: {
          fetchImages: true,
          fetchBodies: true,
          maxResults: params.maxResults || 10,
          pageToken: params.pageToken,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar postagens:', error);
      throw error;
    }
  }

  // Obter todas as postagens (sem paginação)
  async getAllPosts() {
    try {
      const response = await this.api.get(`/blogs/${config.blogger.blogId}/posts`, {
        params: {
          fetchImages: true,
          fetchBodies: true,
          maxResults: 500
        }
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Erro ao listar todas as postagens:', error);
      throw error;
    }
  }

  // Obter uma postagem específica
  async getPost(postId) {
    try {
      const response = await this.api.get(
        `/blogs/${config.blogger.blogId}/posts/${postId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter postagem:', error);
      throw error;
    }
  }

  // Buscar postagens
  async searchPosts(query) {
    try {
      const response = await this.api.get(
        `/blogs/${config.blogger.blogId}/posts/search`,
        {
          params: { q: query }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar postagens:', error);
      throw error;
    }
  }

  // Criar nova postagem
  async createPost(postData) {
    try {
      const response = await this.api.post(
        `/blogs/${config.blogger.blogId}/posts`,
        {
          kind: 'blogger#post',
          blog: {
            id: config.blogger.blogId
          },
          title: postData.title,
          content: postData.content,
          labels: postData.labels || []
        },
        {
          params: {
            isDraft: postData.isDraft || false
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar postagem:', error);
      throw error;
    }
  }

  // Atualizar postagem
  async updatePost(postId, postData) {
    try {
      const response = await this.api.put(
        `/blogs/${config.blogger.blogId}/posts/${postId}`,
        {
          kind: 'blogger#post',
          id: postId,
          blog: {
            id: config.blogger.blogId
          },
          title: postData.title,
          content: postData.content,
          labels: postData.labels || []
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar postagem:', error);
      throw error;
    }
  }

  // Atualizar postagem parcialmente (PATCH)
  async patchPost(postId, changes) {
    try {
      const response = await this.api.patch(
        `/blogs/${config.blogger.blogId}/posts/${postId}`,
        changes
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar postagem:', error);
      throw error;
    }
  }

  // Deletar postagem
  async deletePost(postId) {
    try {
      await this.api.delete(`/blogs/${config.blogger.blogId}/posts/${postId}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar postagem:', error);
      throw error;
    }
  }

  // ============ COMENTÁRIOS ============

  // Listar comentários de uma postagem
  async getComments(postId, params = {}) {
    try {
      const response = await this.api.get(
        `/blogs/${config.blogger.blogId}/posts/${postId}/comments`,
        {
          params: {
            maxResults: params.maxResults || 20,
            pageToken: params.pageToken,
            ...params
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao listar comentários:', error);
      throw error;
    }
  }

  // Obter um comentário específico
  async getComment(postId, commentId) {
    try {
      const response = await this.api.get(
        `/blogs/${config.blogger.blogId}/posts/${postId}/comments/${commentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter comentário:', error);
      throw error;
    }
  }

  // ============ PÁGINAS ============

  // Listar páginas do blog
  async getPages(params = {}) {
    try {
      const response = await this.api.get(`/blogs/${config.blogger.blogId}/pages`, {
        params: {
          fetchBodies: true,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar páginas:', error);
      throw error;
    }
  }

  // Obter uma página específica
  async getPage(pageId) {
    try {
      const response = await this.api.get(
        `/blogs/${config.blogger.blogId}/pages/${pageId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter página:', error);
      throw error;
    }
  }
}

export default new BloggerService();
