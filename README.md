# 📚 OnonaMais - Biblioteca Digital

Sistema de gerenciamento de blog Blogger com integração Google Drive e recursos avançados de publicação.

## ✨ Funcionalidades

- 🔐 Autenticação segura com Google OAuth 2.0
- 📝 Criar, editar e excluir postagens
- 🔍 Busca de postagens
- 📊 Analytics e estatísticas do blog
- ☁️ Gerenciamento de arquivos no Google Drive
- 🎨 Interface moderna e responsiva
- 📱 Design mobile-first

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **React Router** - Navegação
- **Axios** - Requisições HTTP
- **Blogger API v3** - Integração com Blogger
- **Google Drive API** - Gerenciamento de arquivos
- **Lucide React** - Ícones
- **React Toastify** - Notificações

## 📋 Pré-requisitos

- Node.js 16+ 
- NPM ou Yarn
- Conta Google
- Blog no Blogger
- Projeto no Google Cloud Console

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/onona-blogger-manager.git
cd onona-blogger-manager
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as credenciais Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs:
   - Blogger API v3
   - Google Drive API
4. Crie credenciais OAuth 2.0:
   - Tipo: Aplicativo da Web
   - URIs de redirecionamento autorizados: `http://localhost:5173`
5. Copie o Client ID e API Key

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=sua_api_key
VITE_BLOG_ID=seu_blog_id
```

Para obter o Blog ID:
1. Acesse seu blog no Blogger
2. A URL será algo como: `https://www.blogger.com/blogger.g?blogID=1234567890`
3. O número após `blogID=` é seu Blog ID

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

Para testar o build:

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
onona-blogger-manager/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Loading/
│   │   ├── Navbar/
│   │   ├── PostCard/
│   │   └── PostForm/
│   ├── pages/              # Páginas da aplicação
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── CreatePost/
│   │   ├── EditPost/
│   │   ├── Analytics/
│   │   └── DriveManager/
│   ├── services/           # Serviços e APIs
│   │   ├── authService.js
│   │   ├── bloggerService.js
│   │   ├── driveService.js
│   │   └── analyticsService.js
│   ├── config/             # Configurações
│   │   └── config.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env.example
├── vite.config.js
└── package.json
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` com suas credenciais reais!

- O `.gitignore` já está configurado para ignorar arquivos sensíveis
- Use sempre o `.env.example` como referência
- Em produção, configure as variáveis de ambiente no seu host

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Domingos J. Mangação**

## 🙏 Agradecimentos

- Google Blogger API
- React Community
- Vite Team

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!