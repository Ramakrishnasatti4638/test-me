import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'Untitled', body })
      });
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setTitle(newNote.title);
      setBody(newNote.body);
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setTitle('');
        setBody('');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setBody(note.body);
    setIsCreating(false);
  };

  const startNewNote = () => {
    setIsCreating(true);
    setSelectedNote(null);
    setTitle('');
    setBody('');
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Notes</h1>
          <button onClick={startNewNote} className="new-note-btn">+ New Note</button>
        </div>
        <div className="notes-list">
          {notes.map(note => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
              onClick={() => selectNote(note)}
            >
              <div className="note-item-header">
                <h3>{note.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="delete-btn"
                >
                  ×
                </button>
              </div>
              <p>{note.body.substring(0, 50)}{note.body.length > 50 ? '...' : ''}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="editor">
        {(selectedNote || isCreating) ? (
          <>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
            />
            <textarea
              placeholder="Start typing your note..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="body-input"
            />
            {isCreating && (
              <button onClick={createNote} className="save-btn">
                Save Note
              </button>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
