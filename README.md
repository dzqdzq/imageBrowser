# 📸 Image Browser

A modern image browser application built with Vue 3 + Vite + TypeScript, supporting drag-and-drop local directories, image search, and more.

Live Demo: https://image-browser.aqiegames.com/

## 🌐 Language Support

- [English](./README.md) (Current)
- [中文](./README.zh-CN.md)

## ✨ Features

### 🚀 Core Features
- **Drag & Drop Support**: Directly drag local folders into the browser, automatically recognizing image files
- **Multi-format Support**: JPG, JPEG, PNG, GIF, WebP, SVG, BMP, ICO, TIFF and other common image formats
- **Powerful Search**: Fuzzy search based on Fuse.js, supporting filename and extension search
- **Multiple View Modes**: Grid view and list view support, with small, medium, and large grid sizes
- **Image Preview**: Click images for full-screen preview with keyboard navigation (arrow keys, ESC)
- **Zoom Functionality**: Mouse wheel zoom, double-click to zoom, drag to pan, up to 5x magnification
- **Long Image Optimization**: Special width-adaptive mode for perfect display of long screenshots, comics, etc.
- **Smart Path Display**: Shows complete paths relative to selected directory, including subdirectory structure
- **Responsive Design**: Perfect adaptation for desktop, tablet, and mobile devices

### 🎨 Interface Highlights
- **Modern UI**: Gradient backgrounds, glassmorphism effects, shadows, and other modern design elements
- **Smooth Animations**: Hover effects, page transitions, modal dialogs with smooth animations
- **Dark Mode**: Automatic adaptation to system dark mode settings
- **Optimized Experience**: Lazy loading, keyboard shortcuts, accessibility features, and other detail optimizations
- **Friendly Interaction**: Default grid view display, user-initiated preview clicks, no forced popups
- **Professional Preview**: Fixed-size preview window (83% screen), integrated toolbar design, professional image viewer experience

## 🛠️ Tech Stack

- **Vue 3**: Using Composition API and setup syntax sugar
- **TypeScript**: Complete type support for enhanced development experience
- **Vite**: Lightning-fast development server and build tool
- **VueUse**: Powerful Vue composition utilities library
- **Fuse.js**: Lightweight fuzzy search library
- **pnpm**: Fast, disk-space-efficient package manager

## 📦 Installation & Usage

### Requirements
- Node.js 16+
- pnpm 8+

### Quick Start

1. **Install Dependencies**
```bash
pnpm install
```

2. **Start Development Server**
```bash
pnpm dev
```

3. **Build for Production**
```bash
pnpm build
```

4. **Preview Production Build**
```bash
pnpm preview
```

## 🎯 User Guide

### Basic Operations

1. **Adding Images**
   - Drag and drop folders containing images directly into the browser window
   - Or click the "Select Folder" button to choose a local folder

2. **Browsing Images**
   - After dragging or selecting a folder, grid view is displayed by default without auto-preview
   - Grid View: Click to switch between different sizes (small/medium/large), hover to show full path
   - List View: Display detailed file information and complete paths
   - Click images to enter full-screen preview mode with complete path information

3. **Searching Images**
   - Enter keywords in the search box
   - Supports searching filenames and extensions
   - Real-time search, no need to press Enter

4. **Image Zoom and Navigation**
   - **Mouse Wheel**: Zoom in/out on images
   - **Double-click Image**: Zoom to 2x or restore to original size
   - **Drag to Pan**: After zooming, drag to view different areas of the image
   - **Adaptive Modes**:
     - 🔲 Fit Window: Default mode, image displayed completely within window
     - ↔ Fit Width: Recommended for long images, image width fills screen, scrollable
     - 🔲 Original Size: Display image at actual size, supports bidirectional scrolling

5. **Keyboard Shortcuts**
   - `←` `→`: Switch to previous/next image in full-screen preview
   - `ESC`: Exit full-screen preview mode

### Advanced Features

- **Batch Management**: Add multiple folders to manage all images uniformly
- **Clear Function**: One-click clear all loaded images
- **Smart Path Display**:
  - Grid View: Keep it concise, show full path on hover
  - List View: Display complete file paths directly
  - Preview Mode: Provide detailed path information
- **Advanced Preview Features**:
  - Multi-level Zoom: Precise zoom control from 0.1x to 5x
  - Smart Adaptation: Automatically recognize long images and provide optimal display mode
  - Drag Pan: Freely drag to view details after zooming
  - Integrated Toolbar: Fused with image information display, space-saving without blocking image content
- **File Information**: Display image size, modification time, and other detailed information

## 🚀 Deployment

### Static Deployment
Built files can be deployed to any static file server:

```bash
pnpm build
# Deploy the dist/ directory to your server
```

For detailed configuration instructions, please refer to [PUBLISH_README.md](./PUBLISH_README.md)

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

## 📄 License

MIT License

## 🙏 Acknowledgments

- Vue.js Team
- Vite Team

---

If this project helps you, please give it a ⭐️! 