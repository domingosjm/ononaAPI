import './Navbar.css';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Plus, LogOut, HardDrive } from 'lucide-react';
import authService from '../../services/authService';

function Navbar({ user, onLogout }) {
  const handleLogout = () => {
    authService.signOut();
    if (onLogout) onLogout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1><Sparkles size={24} /> OnonaMais</h1>
        </Link>

        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/" className="navbar-link">
                <BookOpen size={18} />
                <span>Postagens</span>
              </Link>
              <Link to="/create" className="navbar-link">
                <Plus size={18} />
                <span>Nova Postagem</span>
              </Link>
              <Link to="/drive" className="navbar-link">
                <HardDrive size={18} />
                <span>Arquivos</span>
              </Link>
              <div className="navbar-user">
                <span className="user-name">{user.displayName || 'Usuário'}</span>
                <button onClick={handleLogout} className="btn-logout">
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <span className="auth-message">Faça login para gerenciar postagens</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
