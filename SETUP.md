# Gemini Code Builder Setup

## Google Gemini API Configuration

To use the AI code generation features, you need to set up your Google Gemini API key:

### 1. Get Gemini API Key

- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Sign in with your Google account
- Create a new API key (free tier available)
- Copy the key (starts with `AIza...`)

### 2. Configure Environment Variables

- Open `.env.local` file in the root directory
- Replace `your-gemini-api-key-here` with your actual API key:
  ```
  VITE_GEMINI_API_KEY=your-actual-api-key-here
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

- **AI-Powered Generation**: Complete project generation with Google Gemini
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
- **AI**: Google Gemini API
- **Code Editor**: CodeMirror 6
- **Icons**: Lucide React
- **Build Tool**: Vite
