import './PostForm.css';
import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Download, BookOpen, Plus } from 'lucide-react';

function PostForm({ post, onSubmit, onCancel, onImageUpload }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    labels: '',
    isDraft: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Estado para o gerador de botão de download
  const [showDownloadGenerator, setShowDownloadGenerator] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState({
    bookTitle: '',
    author: '',
    format: 'PDF',
    fileSize: '',
    driveLink: '',
    description: ''
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        labels: post.labels ? post.labels.join(', ') : '',
        isDraft: false
      });
      
      const imgMatch = post.content?.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        setImagePreview(imgMatch[1]);
      }
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleDownloadInfoChange = (e) => {
    const { name, value } = e.target;
    setDownloadInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateDownloadButton = () => {
    const { bookTitle, author, format, fileSize, driveLink, description } = downloadInfo;
    
    if (!bookTitle || !driveLink) {
      alert('Título do livro e link do Drive são obrigatórios!');
      return;
    }

    const downloadHTML = `
<!-- Botão de Download Gerado por OnonaMais -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 2.5rem; margin: 2.5rem 0; box-shadow: 0 15px 50px rgba(102, 126, 234, 0.4); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  
  <!-- Cabeçalho com Ícone e Título -->
  <div style="display: flex; align-items: flex-start; gap: 1.5rem; margin-bottom: 1.5rem;">
    <div style="font-size: 4rem; line-height: 1; flex-shrink: 0;">📚</div>
    <div style="flex: 1;">
      <h3 style="color: white; margin: 0 0 0.5rem 0; font-size: 1.8rem; font-weight: 800; line-height: 1.2;">${bookTitle}</h3>
      ${author ? `<p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 1.1rem; font-weight: 500;">por ${author}</p>` : ''}
    </div>
  </div>
  
  <!-- Descrição -->
  ${description ? `
  <div style="background: rgba(255,255,255,0.15); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; backdrop-filter: blur(10px);">
    <p style="color: white; margin: 0; line-height: 1.7; font-size: 1rem;">${description}</p>
  </div>
  ` : ''}
  
  <!-- Informações do Arquivo -->
  <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
    ${format ? `
    <div style="background: rgba(255,255,255,0.2); padding: 0.75rem 1.5rem; border-radius: 10px; backdrop-filter: blur(10px); display: inline-flex; align-items: center; gap: 0.5rem;">
      <span style="font-size: 1.2rem;">📄</span>
      <span style="color: white; font-weight: 700; font-size: 1rem;">${format}</span>
    </div>
    ` : ''}
    ${fileSize ? `
    <div style="background: rgba(255,255,255,0.2); padding: 0.75rem 1.5rem; border-radius: 10px; backdrop-filter: blur(10px); display: inline-flex; align-items: center; gap: 0.5rem;">
      <span style="font-size: 1.2rem;">💾</span>
      <span style="color: white; font-weight: 700; font-size: 1rem;">${fileSize}</span>
    </div>
    ` : ''}
    <div style="background: rgba(255,255,255,0.2); padding: 0.75rem 1.5rem; border-radius: 10px; backdrop-filter: blur(10px); display: inline-flex; align-items: center; gap: 0.5rem;">
      <span style="font-size: 1.2rem;">☁️</span>
      <span style="color: white; font-weight: 700; font-size: 1rem;">Google Drive</span>
    </div>
  </div>
  
  <!-- Botão de Download -->
  <div style="text-align: center;">
    <a href="${driveLink}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 1rem; background: white; color: #667eea; padding: 1.25rem 3rem; border-radius: 15px; text-decoration: none; font-weight: 800; font-size: 1.2rem; box-shadow: 0 8px 25px rgba(0,0,0,0.3); transition: all 0.3s ease; border: none;">
      <span style="font-size: 1.8rem; animation: bounce 2s infinite;">⬇️</span>
      <span>BAIXAR LIVRO GRÁTIS</span>
    </a>
  </div>
  
  <!-- Nota de Rodapé -->
  <p style="text-align: center; color: rgba(255,255,255,0.8); margin: 1.5rem 0 0 0; font-size: 0.9rem; font-style: italic;">
    ✨ Download direto e seguro via Google Drive
  </p>
</div>

<style>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>
`;

    // Adicionar ao conteúdo atual
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + downloadHTML
    }));

    // Limpar o formulário do gerador
    setDownloadInfo({
      bookTitle: '',
      author: '',
      format: 'PDF',
      fileSize: '',
      driveLink: '',
      description: ''
    });
    
    setShowDownloadGenerator(false);
    alert('✅ Botão de download adicionado ao conteúdo!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let content = formData.content;
    
    if (imageFile && onImageUpload) {
      setUploadingImage(true);
      try {
        const imageUrl = await onImageUpload(imageFile);
        content = `<div class="post-cover-image"><img src="${imageUrl}" alt="${formData.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 1.5rem;" /></div>\n\n${content}`;
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. A postagem será criada sem a imagem de capa.');
      } finally {
        setUploadingImage(false);
      }
    }
    
    const postData = {
      title: formData.title,
      content: content,
      labels: formData.labels
        .split(',')
        .map(label => label.trim())
        .filter(label => label.length > 0),
      isDraft: formData.isDraft
    };

    onSubmit(postData);
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Título do Livro *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: O Senhor dos Anéis - J.R.R. Tolkien"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="coverImage">Imagem de Capa</label>
        <div className="image-upload-container">
          {imagePreview ? (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button 
                type="button" 
                className="btn-remove-image" 
                onClick={removeImage}
                title="Remover imagem"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <label htmlFor="coverImage" className="image-upload-label">
              <ImageIcon size={48} />
              <span>Clique para selecionar uma imagem</span>
              <small>PNG, JPG ou GIF (máx. 5MB)</small>
            </label>
          )}
          <input
            type="file"
            id="coverImage"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>
        <small className="form-hint">
          A imagem será enviada para o servidor do Blogger e aparecerá no topo da postagem
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="content">Conteúdo da Postagem *</label>
        
        <div className="content-toolbar">
          <button
            type="button"
            onClick={() => setShowDownloadGenerator(!showDownloadGenerator)}
            className="btn btn-secondary btn-sm"
          >
            <Download size={16} />
            Adicionar Botão de Download
          </button>
        </div>

        {showDownloadGenerator && (
          <div className="download-generator">
            <h4>
              <Download size={20} />
              Gerador de Botão de Download
            </h4>
            
            <div className="generator-grid">
              <div className="generator-field">
                <label>Título do Livro *</label>
                <input
                  type="text"
                  name="bookTitle"
                  value={downloadInfo.bookTitle}
                  onChange={handleDownloadInfoChange}
                  placeholder="Ex: O Senhor dos Anéis"
                />
              </div>

              <div className="generator-field">
                <label>Autor</label>
                <input
                  type="text"
                  name="author"
                  value={downloadInfo.author}
                  onChange={handleDownloadInfoChange}
                  placeholder="Ex: J.R.R. Tolkien"
                />
              </div>

              <div className="generator-field">
                <label>Formato</label>
                <select
                  name="format"
                  value={downloadInfo.format}
                  onChange={handleDownloadInfoChange}
                >
                  <option value="PDF">PDF</option>
                  <option value="EPUB">EPUB</option>
                  <option value="MOBI">MOBI</option>
                  <option value="AZW3">AZW3</option>
                  <option value="ZIP">ZIP</option>
                </select>
              </div>

              <div className="generator-field">
                <label>Tamanho do Arquivo</label>
                <input
                  type="text"
                  name="fileSize"
                  value={downloadInfo.fileSize}
                  onChange={handleDownloadInfoChange}
                  placeholder="Ex: 5.2 MB"
                />
              </div>

              <div className="generator-field full-width">
                <label>Link do Google Drive *</label>
                <input
                  type="url"
                  name="driveLink"
                  value={downloadInfo.driveLink}
                  onChange={handleDownloadInfoChange}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="generator-field full-width">
                <label>Descrição (opcional)</label>
                <textarea
                  name="description"
                  value={downloadInfo.description}
                  onChange={handleDownloadInfoChange}
                  rows="3"
                  placeholder="Breve descrição do livro..."
                />
              </div>
            </div>

            <div className="generator-actions">
              <button
                type="button"
                onClick={() => setShowDownloadGenerator(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={generateDownloadButton}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                Adicionar ao Conteúdo
              </button>
            </div>
          </div>
        )}

        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows="15"
          placeholder="Inclua informações sobre o livro, link de download, etc..."
          required
        />
        <small className="form-hint">
          Dica: Use o botão acima para adicionar botões de download formatados ou use HTML personalizado
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="labels">Tags (separadas por vírgula)</label>
        <input
          type="text"
          id="labels"
          name="labels"
          value={formData.labels}
          onChange={handleChange}
          placeholder="Ex: Fantasia, Aventura, J.R.R. Tolkien"
        />
        <small className="form-hint">
          As tags ajudam a organizar e encontrar suas postagens
        </small>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isDraft"
            checked={formData.isDraft}
            onChange={handleChange}
          />
          <span>Salvar como rascunho</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-cancel" disabled={uploadingImage}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-submit" disabled={uploadingImage}>
          {uploadingImage ? 'Enviando imagem...' : post ? 'Atualizar' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}

export default PostForm;
