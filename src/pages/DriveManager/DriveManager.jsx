import './DriveManager.css';
import { useState, useEffect } from 'react';
import { Upload, Trash2, Link2, FolderPlus, RefreshCw, HardDrive, LogOut, FileText, Download } from 'lucide-react';
import driveService from '../../services/driveService';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';

function DriveManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    initDrive();
  }, []);

  const initDrive = async () => {
    try {
      await driveService.init();
      setIsAuthenticated(driveService.isAuthenticated());
      if (driveService.isAuthenticated()) {
        await loadFiles();
      }
    } catch (error) {
      console.error('Erro ao inicializar Drive:', error);
      toast.error('Erro ao inicializar Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await driveService.signIn();
      setIsAuthenticated(true);
      await loadFiles();
      toast.success('Conectado ao Google Drive!');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Erro ao conectar com Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    driveService.signOut();
    setIsAuthenticated(false);
    setFiles([]);
    toast.info('Desconectado do Google Drive');
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      const bookFiles = await driveService.listBookFiles();
      setFiles(bookFiles);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro ao carregar arquivos do Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedFile = await driveService.uploadFile(file);
      toast.success(`Arquivo "${uploadedFile.name}" enviado com sucesso!`);
      await loadFiles();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleMakePublic = async (fileId, fileName) => {
    try {
      const links = await driveService.makeFilePublic(fileId);
      setSelectedFile({ id: fileId, name: fileName, ...links });
      toast.success('Arquivo público! Link gerado com sucesso.');
    } catch (error) {
      console.error('Erro ao gerar link:', error);
      toast.error('Erro ao tornar arquivo público');
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (!confirm(`Deseja realmente deletar "${fileName}"?`)) return;

    try {
      await driveService.deleteFile(fileId);
      toast.success('Arquivo deletado!');
      await loadFiles();
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast.error('Erro ao deletar arquivo');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="drive-manager">
        <div className="drive-login-container">
          <div className="drive-login-card">
            <HardDrive size={64} className="drive-icon" />
            <h1>Google Drive</h1>
            <p>Conecte-se ao Google Drive para gerenciar seus arquivos de livros</p>
            <button onClick={handleSignIn} className="btn btn-primary">
              <HardDrive size={20} />
              Conectar com Google Drive
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="drive-manager">
      <div className="drive-header">
        <div className="drive-header-left">
          <HardDrive size={32} />
          <div>
            <h1>Gerenciador de Arquivos</h1>
            <p>Google Drive - {files.length} arquivo(s)</p>
          </div>
        </div>
        <div className="drive-header-actions">
          <button onClick={loadFiles} className="btn btn-icon" title="Recarregar">
            <RefreshCw size={20} />
          </button>
          <button onClick={handleSignOut} className="btn btn-danger" title="Desconectar">
            <LogOut size={20} />
            Desconectar
          </button>
        </div>
      </div>

      <div className="drive-toolbar">
        <div className="drive-search">
          <input
            type="text"
            placeholder="Buscar arquivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <label className="btn btn-primary" htmlFor="file-upload">
          <Upload size={20} />
          {uploading ? 'Enviando...' : 'Upload de Livro'}
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".pdf,.epub,.mobi,.azw,.azw3"
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="drive-content">
        <div className="drive-files-list">
          <h3>Meus Livros</h3>
          {filteredFiles.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>Nenhum arquivo encontrado</p>
              <small>Faça upload de seus livros em PDF, EPUB ou MOBI</small>
            </div>
          ) : (
            <div className="files-grid">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`file-card ${selectedFile?.id === file.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="file-icon">
                    {driveService.getFileIcon(file.mimeType)}
                  </div>
                  <div className="file-info">
                    <h4>{file.name}</h4>
                    <span className="file-size">
                      {driveService.formatFileSize(file.size)}
                    </span>
                  </div>
                  <div className="file-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMakePublic(file.id, file.name);
                      }}
                      className="btn-icon"
                      title="Gerar link público"
                    >
                      <Link2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id, file.name);
                      }}
                      className="btn-icon btn-danger"
                      title="Deletar arquivo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="drive-file-details">
            <h3>Detalhes do Arquivo</h3>
            <div className="file-details-card">
              <div className="file-detail-icon">
                {driveService.getFileIcon(selectedFile.mimeType)}
              </div>
              <h4>{selectedFile.name}</h4>
              
              {selectedFile.size && (
                <p className="file-meta">
                  Tamanho: {driveService.formatFileSize(selectedFile.size)}
                </p>
              )}

              {selectedFile.downloadLink && (
                <div className="link-section">
                  <label>Link de Download Direto:</label>
                  <div className="link-input-group">
                    <input
                      type="text"
                      value={selectedFile.downloadLink}
                      readOnly
                    />
                    <button
                      onClick={() => copyToClipboard(selectedFile.downloadLink, 'Link de download')}
                      className="btn btn-sm"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {selectedFile.webViewLink && (
                <div className="link-section">
                  <label>Link de Visualização:</label>
                  <div className="link-input-group">
                    <input
                      type="text"
                      value={selectedFile.webViewLink}
                      readOnly
                    />
                    <button
                      onClick={() => copyToClipboard(selectedFile.webViewLink, 'Link de visualização')}
                      className="btn btn-sm"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              <div className="file-actions-full">
                <a
                  href={selectedFile.downloadLink || selectedFile.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <Download size={18} />
                  Abrir no Drive
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriveManager;
