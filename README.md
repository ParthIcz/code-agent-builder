# 🤖 AI Code Builder

A powerful web-based IDE that uses OpenAI's GPT-4 to generate complete projects from natural language descriptions. Build full-stack applications, websites, and more with just a conversation!

![AI Code Builder](https://img.shields.io/badge/AI-Powered-brightgreen) ![React](https://img.shields.io/badge/React-18+-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3+-blue)

## 🚀 Features

### 🧠 AI-Powered Generation

- **Natural Language to Code**: Describe your project in plain English
- **Complete Project Generation**: Get full file structures, components, and configurations
- **Smart Code Understanding**: AI analyzes and improves existing code
- **Multiple Project Types**: Portfolios, dashboards, e-commerce, blogs, and more

### 💻 Advanced Code Editor

- **Syntax Highlighting**: VS Code-style highlighting for multiple languages
- **Real-time Editing**: Live code editing with immediate feedback
- **File Tree Navigation**: Full project structure management
- **Multiple Tabs**: Work with multiple files simultaneously
- **Intelligent Autocomplete**: Context-aware code completion

### 📱 Responsive Workspace

- **Resizable Panels**: Customizable layout with drag-to-resize panels
- **Mobile Optimized**: Full functionality on mobile devices
- **Live Preview**: Real-time preview of your applications
- **Viewport Testing**: Test responsive designs across different screen sizes

### 🛠 Development Tools

- **Project Export**: Download complete projects as ZIP files
- **Error Handling**: Smart error detection and AI-powered fixes
- **Code Optimization**: AI suggestions for performance improvements
- **Modern Stack**: Built with the latest web technologies

## 🛠 Tech Stack

### Frontend

- **React 18+** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for beautiful, accessible components

### Code Editor

- **CodeMirror 6** with VS Code-like features
- **Syntax highlighting** for 10+ languages
- **Intelligent autocomplete** and error detection
- **Customizable themes** and layouts

### AI Integration

- **OpenAI GPT-4** for code generation
- **Axios** for API communication
- **Smart prompting** for optimal results
- **Error recovery** and retries

### Additional Tools

- **React Router** for navigation
- **JSZip** for project exports
- **Lucide React** for icons
- **Date-fns** for time formatting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-code-builder
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure OpenAI API**
   - Copy `.env.local` and add your OpenAI API key:

   ```bash
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:8080`
   - Start building with AI!

## 📖 How to Use

### 1. Generate a Project

Start a conversation with the AI by describing what you want to build:

```
"Create a modern portfolio website with React and Tailwind CSS"
"Build a todo app with TypeScript and local storage"
"Generate a dashboard with charts and user management"
```

### 2. Edit and Customize

- Use the powerful code editor to modify generated files
- Navigate through the file tree to explore the project structure
- Make real-time changes and see instant results

### 3. Preview and Test

- Use the live preview panel to see your application in action
- Test responsive designs with different viewport sizes
- Debug and refine your application

### 4. Export and Deploy

- Download your complete project as a ZIP file
- Deploy to any hosting platform
- Continue development in your preferred IDE

## 🎯 Example Prompts

### Portfolio Websites

```
"Create a developer portfolio with a hero section, about me, projects gallery, and contact form using React and Tailwind CSS"
```

### Web Applications

```
"Build a task management app with drag-and-drop functionality, user authentication, and data persistence"
```

### Landing Pages

```
"Generate a SaaS landing page with pricing tables, feature comparisons, and testimonials"
```

### E-commerce

```
"Create a product catalog with search, filtering, shopping cart, and checkout flow"
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Optional customization
VITE_MODEL_NAME=gpt-4  # or gpt-3.5-turbo
VITE_MAX_TOKENS=4000
VITE_TEMPERATURE=0.7
```

### Customization Options

- **Panel Sizes**: Adjust default panel sizes in Editor.tsx
- **Theme Colors**: Modify Tailwind config for custom themes
- **AI Prompts**: Customize system prompts in OpenAI service
- **File Types**: Add support for new languages in CodeEditor

## 📂 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── ChatAgent.tsx   # AI chat interface
│   ├── CodeEditor.tsx  # Code editing interface
│   └── LivePreview.tsx # Live preview component
├── pages/              # Route components
│   ├── Index.tsx       # Landing page
│   ├── Editor.tsx      # Main editor interface
│   └── NotFound.tsx    # 404 page
├── services/           # External services
│   └── openai.ts       # OpenAI API integration
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
└── types/              # TypeScript definitions
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for the powerful GPT-4 API
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [CodeMirror](https://codemirror.net) for the excellent code editor
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [React](https://reactjs.org) and [Vite](https://vitejs.dev) for the development experience

## 📞 Support

- 📧 Email: support@ai-code-builder.com
- 💬 Discord: [Join our community](https://discord.gg/ai-code-builder)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Docs: [Documentation](https://docs.ai-code-builder.com)

---

**Built with ❤️ and AI** • Create amazing applications faster than ever before!
