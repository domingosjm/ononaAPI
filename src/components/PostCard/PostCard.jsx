import './PostCard.css';
import { Calendar, Tag, Eye, Edit, Trash2 } from 'lucide-react';

function PostCard({ post, onEdit, onDelete, onView }) {
  const getExcerpt = (content, maxLength = 150) => {
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-meta">
          <span className="post-date">
            <Calendar size={16} />
            {formatDate(post.published)}
          </span>
          {post.labels && post.labels.length > 0 && (
            <div className="post-labels">
              {post.labels.map((label, index) => (
                <span key={index} className="label">
                  <Tag size={12} />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="post-card-body">
        <p className="post-excerpt">{getExcerpt(post.content)}</p>
      </div>

      <div className="post-card-footer">
        <button onClick={() => onView(post)} className="btn btn-secondary">
          <Eye size={16} />
          <span>Ver</span>
        </button>
        <button onClick={() => onEdit(post)} className="btn btn-primary">
          <Edit size={16} />
          <span>Editar</span>
        </button>
        <button onClick={() => onDelete(post.id)} className="btn btn-danger">
          <Trash2 size={16} />
          <span>Excluir</span>
        </button>
      </div>
    </div>
  );
}

export default PostCard;
