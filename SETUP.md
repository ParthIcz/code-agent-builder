# AI Code Builder Setup

## OpenAI API Configuration

To use the AI code generation features, you need to set up your OpenAI API key:

### 1. Get OpenAI API Key

- Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
- Sign in or create an account
- Create a new API key
- Copy the key (starts with `sk-...`)

### 2. Configure Environment Variables

- Open `.env.local` file in the root directory
- Replace `your-openai-api-key-here` with your actual API key:
  ```
  VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
  ```

### 3. Start Development Server

```bash
npm run dev
```

## How to Use

1. **Generate Projects**: Describe what you want to build in the chat
   - "Create a modern portfolio website with React and Tailwind CSS"
   - "Build a todo app with TypeScript and local storage"
   - "Generate a landing page for a SaaS product"

2. **Edit Code**: Use the code editor to modify generated files

3. **Live Preview**: See your changes in real-time

4. **Download**: Export your project as a ZIP file

## Features

- **AI-Powered Generation**: Complete project generation with GPT-4
- **Real-time Editing**: CodeMirror-based code editor with syntax highlighting
- **Live Preview**: Instant preview of your changes
- **Resizable Panels**: Adjustable workspace layout
- **File Management**: Full file tree navigation
- **Export Functionality**: Download projects as ZIP files

## Supported Project Types

- Portfolio websites
- Todo applications
- Landing pages
- Dashboards
- E-commerce sites
- Blog websites
- And more...

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4 API
- **Code Editor**: CodeMirror 6
- **Icons**: Lucide React
- **Build Tool**: Vite
