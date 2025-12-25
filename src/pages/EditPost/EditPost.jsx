import './EditPost.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Edit } from 'lucide-react';
import bloggerService from '../../services/bloggerService';
import PostForm from '../../components/PostForm/PostForm';
import Loading from '../../components/Loading/Loading';
import { toast } from 'react-toastify';

function EditPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const handleImageUpload = async (file) => {
    try {
      const blogId = import.meta.env.VITE_BLOG_ID;
      const imageUrl = await bloggerService.uploadImage(blogId, file);
      return imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (location.state?.post) {
      setPost(location.state.post);
      setLoading(false);
    } else {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await bloggerService.getPost(id);
      setPost(data);
    } catch (error) {
      toast.error('Erro ao carregar postagem');
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (postData) => {
    try {
      setSubmitting(true);
      await bloggerService.updatePost(id, postData);
      toast.success('Postagem atualizada com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao atualizar postagem');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="edit-post-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="edit-post-container">
      <div className="page-header">
        <h2><Edit size={32} /> Editar Postagem</h2>
        <p>Atualize as informações do livro</p>
      </div>

      {submitting ? (
        <div className="loading-message">
          <p>Atualizando...</p>
        </div>
      ) : (
        <PostForm 
          post={post} 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          onImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
}

export default EditPost;
