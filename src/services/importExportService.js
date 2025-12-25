import bloggerService from './bloggerService';

class ImportExportService {
  // ============ EXPORTAÇÃO ============

  // Exportar todas as postagens
  async exportAllPosts() {
    try {
      const posts = await bloggerService.getAllPosts();
      const exportData = {
        exportDate: new Date().toISOString(),
        blogId: posts[0]?.blog?.id || 'unknown',
        totalPosts: posts.length,
        posts: posts.map(post => this.formatPostForExport(post))
      };

      return exportData;
    } catch (error) {
      console.error('Erro ao exportar posts:', error);
      throw error;
    }
  }

  // Exportar posts selecionados
  async exportSelectedPosts(postIds) {
    try {
      const allPosts = await bloggerService.getAllPosts();
      const selectedPosts = allPosts.filter(post => postIds.includes(post.id));

      const exportData = {
        exportDate: new Date().toISOString(),
        totalPosts: selectedPosts.length,
        posts: selectedPosts.map(post => this.formatPostForExport(post))
      };

      return exportData;
    } catch (error) {
      console.error('Erro ao exportar posts selecionados:', error);
      throw error;
    }
  }

  // Formatar post para exportação
  formatPostForExport(post) {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      labels: post.labels || [],
      status: post.status,
      published: post.published,
      updated: post.updated,
      url: post.url,
      author: post.author,
      images: post.images || []
    };
  }

  // Download do arquivo JSON
  downloadJSON(data, filename = 'blogger-posts-export.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ============ IMPORTAÇÃO ============

  // Importar posts de arquivo JSON
  async importPosts(jsonData, options = {}) {
    try {
      const {
        skipExisting = true,
        updateExisting = false,
        asDraft = false
      } = options;

      if (!jsonData.posts || !Array.isArray(jsonData.posts)) {
        throw new Error('Formato de arquivo inválido');
      }

      const results = {
        total: jsonData.posts.length,
        imported: 0,
        skipped: 0,
        errors: [],
        details: []
      };

      // Obter posts existentes para verificar duplicados
      const existingPosts = await bloggerService.getAllPosts();
      const existingTitles = new Set(existingPosts.map(p => p.title.toLowerCase()));
      const existingIds = new Set(existingPosts.map(p => p.id));

      for (const post of jsonData.posts) {
        try {
          // Verificar se já existe (por ID ou título)
          const postExists = existingIds.has(post.id) || 
                           existingTitles.has(post.title.toLowerCase());

          if (postExists && skipExisting && !updateExisting) {
            results.skipped++;
            results.details.push({
              title: post.title,
              status: 'skipped',
              reason: 'Post já existe'
            });
            continue;
          }

          // Preparar dados do post
          const postData = {
            title: post.title,
            content: post.content,
            labels: post.labels || []
          };

          let importedPost;

          if (postExists && updateExisting) {
            // Atualizar post existente
            const existingPost = existingPosts.find(
              p => p.id === post.id || p.title.toLowerCase() === post.title.toLowerCase()
            );
            importedPost = await bloggerService.updatePost(existingPost.id, postData);
            results.details.push({
              title: post.title,
              status: 'updated',
              id: importedPost.id
            });
          } else {
            // Criar novo post
            importedPost = await bloggerService.createPost(postData, asDraft);
            results.details.push({
              title: post.title,
              status: 'created',
              id: importedPost.id
            });
          }

          results.imported++;

          // Pequeno delay para evitar rate limiting
          await this.delay(500);

        } catch (error) {
          results.errors.push({
            title: post.title,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Erro ao importar posts:', error);
      throw error;
    }
  }

  // Validar arquivo de importação
  validateImportFile(jsonData) {
    const errors = [];

    if (!jsonData) {
      errors.push('Arquivo vazio ou inválido');
      return { valid: false, errors };
    }

    if (!jsonData.posts || !Array.isArray(jsonData.posts)) {
      errors.push('Propriedade "posts" não encontrada ou não é um array');
      return { valid: false, errors };
    }

    if (jsonData.posts.length === 0) {
      errors.push('Nenhum post encontrado no arquivo');
      return { valid: false, errors };
    }

    // Validar cada post
    jsonData.posts.forEach((post, index) => {
      if (!post.title) {
        errors.push(`Post ${index + 1}: Título obrigatório`);
      }
      if (!post.content) {
        errors.push(`Post ${index + 1}: Conteúdo obrigatório`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      postsCount: jsonData.posts.length
    };
  }

  // Ler arquivo JSON
  async readJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Erro ao analisar arquivo JSON'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsText(file);
    });
  }

  // Delay helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============ BACKUP ============

  // Criar backup completo
  async createBackup() {
    try {
      const data = await this.exportAllPosts();
      const filename = `blogger-backup-${new Date().toISOString().split('T')[0]}.json`;
      this.downloadJSON(data, filename);
      return { success: true, filename };
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  }
}

export default new ImportExportService();
