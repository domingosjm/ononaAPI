import './CreatePost.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus } from 'lucide-react';
import bloggerService from '../../services/bloggerService';
import PostForm from '../../components/PostForm/PostForm';
import { toast } from 'react-toastify';

function CreatePost() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = async (file) => {
    try {
      const blogId = bloggerService.api.defaults.params.key ? 
        window.location.hostname.includes('localhost') ? 
          import.meta.env.VITE_BLOG_ID : 
          import.meta.env.VITE_BLOG_ID 
        : import.meta.env.VITE_BLOG_ID;
      
      const imageUrl = await bloggerService.uploadImage(blogId, file);
      return imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  };

  const handleSubmit = async (postData) => {
    try {
      setLoading(true);
      await bloggerService.createPost(postData);
      toast.success('Postagem criada com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao criar postagem');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="create-post-container">
      <div className="page-header">
        <h2><FilePlus size={32} /> Nova Postagem</h2>
        <p>Adicione um novo livro à sua biblioteca digital</p>
      </div>

      {loading ? (
        <div className="loading-message">
          <p>Publicando...</p>
        </div>
      ) : (
        <PostForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          onImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
}

export default CreatePost;
