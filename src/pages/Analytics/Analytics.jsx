import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, FileText, Tag, Calendar, Clock } from 'lucide-react';
import analyticsService from '../../services/analyticsService';
import Loading from '../../components/Loading/Loading';
import './Analytics.css';

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getBlogStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadStats} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <BarChart3 className="icon-large" />
        <h1>Estatísticas e Analytics</h1>
        <p className="analytics-subtitle">{stats.overview.blogName}</p>
      </div>

      {/* Cards de Visão Geral */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FileText />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.overview.totalPosts}</span>
            <span className="stat-label">Total de Postagens</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon published">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.overview.publishedPosts}</span>
            <span className="stat-label">Publicadas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon draft">
            <Clock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.overview.draftPosts}</span>
            <span className="stat-label">Rascunhos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Tag />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.overview.totalTags}</span>
            <span className="stat-label">Tags Únicas</span>
          </div>
        </div>
      </div>

      <div className="analytics-row">
        {/* Posts por Mês */}
        <div className="analytics-card">
          <div className="card-header">
            <Calendar className="card-icon" />
            <h2>Postagens por Mês</h2>
          </div>
          <div className="chart-container">
            {stats.postsByMonth.map((item, index) => {
              const maxCount = Math.max(...stats.postsByMonth.map(i => i.count));
              const percentage = (item.count / maxCount) * 100;
              
              return (
                <div key={index} className="chart-bar-wrapper">
                  <div className="chart-bar-label">{formatMonth(item.month)}</div>
                  <div className="chart-bar-track">
                    <div 
                      className="chart-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="chart-bar-value">{item.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags Mais Usadas */}
        <div className="analytics-card">
          <div className="card-header">
            <Tag className="card-icon" />
            <h2>Tags Mais Usadas</h2>
          </div>
          <div className="tags-list">
            {stats.tagStats.slice(0, 10).map((item, index) => (
              <div key={index} className="tag-item">
                <span className="tag-name">{item.tag}</span>
                <span className="tag-count">{item.count} posts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Postagens Recentes */}
      <div className="analytics-card">
        <div className="card-header">
          <Clock className="card-icon" />
          <h2>Postagens Recentes</h2>
        </div>
        <div className="recent-posts">
          {stats.recentPosts.map((post) => (
            <div key={post.id} className="recent-post-item">
              <div className="recent-post-content">
                <h3 className="recent-post-title">{post.title}</h3>
                <span className="recent-post-date">{formatDate(post.published)}</span>
              </div>
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-view"
              >
                Ver Post
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="info-grid">
        <div className="info-card">
          <span className="info-label">Posts com Imagens</span>
          <span className="info-value">{stats.overview.postsWithImages}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Tamanho Médio do Conteúdo</span>
          <span className="info-value">{stats.overview.avgContentLength.toLocaleString()} caracteres</span>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
