import './Home.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, BookOpen, Plus } from 'lucide-react';
import bloggerService from '../../services/bloggerService';
import authService from '../../services/authService';
import PostCard from '../../components/PostCard/PostCard';
import Loading from '../../components/Loading/Loading';
import { toast } from 'react-toastify';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticação antes de carregar
    if (!authService.isAuthenticated()) {
      toast.warning('Por favor, faça login para continuar');
      navigate('/login');
      return;
    }
    loadPosts();
  }, [navigate]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await bloggerService.getPosts({ maxResults: 50 });
      setPosts(response.items || []);
    } catch (error) {
      // Verificar se é erro de autenticação
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Sessão expirada. Faça login novamente');
        authService.signOut();
        navigate('/login');
      } else {
        toast.error('Erro ao carregar postagens');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      const response = await bloggerService.searchPosts(searchTerm);
      setPosts(response.items || []);
      toast.info(`${response.items?.length || 0} resultado(s) encontrado(s)`);
    } catch (error) {
      toast.error('Erro ao buscar postagens');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta postagem?')) {
      return;
    }

    try {
      await bloggerService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Postagem excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir postagem');
      console.error(error);
    }
  };

  const handleEdit = (post) => {
    navigate(`/edit/${post.id}`, { state: { post } });
  };

  const handleView = (post) => {
    window.open(post.url, '_blank');
  };

  const filteredPosts = searchTerm
    ? posts
    : posts;

  return (
    <div className="home-container">
      <div className="home-header">
        <h2><BookOpen size={32} /> Biblioteca Digital OnonaMais</h2>
        <p>Gerencie sua coleção de livros com tecnologia de ponta</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Buscar livros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button onClick={handleSearch} className="btn-search">
          <Search size={18} />
          <span>Buscar</span>
        </button>
        <button onClick={loadPosts} className="btn-refresh">
          <RefreshCw size={18} />
          <span>Atualizar</span>
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} />
              <p>Nenhuma postagem encontrada</p>
              <button onClick={() => navigate('/create')} className="btn-primary">
                <Plus size={18} />
                <span>Criar primeira postagem</span>
              </button>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
