import './Login.css';
import { useState } from 'react';
import { Sparkles, Edit3, Search, Tag, Smartphone, LogIn } from 'lucide-react';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await authService.signIn();
      toast.success('Login realizado com sucesso!');
      if (onLogin) onLogin();
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1><Sparkles size={36} /> OnonaMais</h1>
          <p>Gerencie suas postagens de livros com estilo</p>
        </div>

        <div className="login-body">
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon"><Edit3 size={24} /></span>
              <span>Criar e editar postagens</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon"><Search size={24} /></span>
              <span>Buscar livros facilmente</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon"><Tag size={24} /></span>
              <span>Organizar com tags</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon"><Smartphone size={24} /></span>
              <span>Interface responsiva</span>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-login"
          >
            <LogIn size={20} />
            {loading ? 'Conectando...' : 'Entrar com Google'}
          </button>

          <p className="login-note">
            Você será redirecionado para fazer login com sua conta Google
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
