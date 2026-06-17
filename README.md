# Notes App Frontend

Modern note-taking web application built with React and Vite.

## Features

- **Two-panel Layout**: Notes list on left, editor on right
- **Create Notes**: Click "+ New Note" button to create new notes
- **View/Edit Notes**: Click any note to view and edit
- **Delete Notes**: Click × button to delete notes
- **Persistent Storage**: Notes saved to SQLite database via API
- **Clean UI**: Modern, minimalist design

## Technology Stack

- React 18
- Vite (build tool & dev server)
- CSS3 (no framework, custom styles)

## Prerequisites

Backend API must be running on `http://localhost:3001`

See [API_DB repository](https://github.com/Ramakrishnasatti4638/API_DB) for backend setup.

## Installation

```bash
npm install
```

## Usage

```bash
npm run dev
```

App runs on `http://localhost:3000`

## Features in Detail

### Note List (Left Panel)
- Displays all notes with title and preview
- Newest notes appear first
- Click any note to open in editor
- Delete button (×) on each note
- Active note highlighted in blue

### Editor (Right Panel)
- Edit title and body of selected note
- Changes sync automatically
- Empty state shown when no note selected
- Clean, distraction-free interface

### Create New Note
1. Click "+ New Note" button
2. Enter title and body
3. Click "Save Note"
4. Note appears in list immediately

### Data Persistence
All notes persist across:
- Page refreshes
- Browser restarts
- Server restarts

Data stored in SQLite database on backend.
