import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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

  const createNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setBody('');
    setIsEditing(true);
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setBody(note.body);
    setIsEditing(false);
  };

  const saveNote = async () => {
    try {
      if (selectedNote) {
        await fetch(`${API_URL}/${selectedNote.id}`, {
          method: 'DELETE',
        });
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body }),
      });

      const newNote = await response.json();
      await fetchNotes();
      setSelectedNote(newNote);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      await fetchNotes();
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
        setTitle('');
        setBody('');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setBody(selectedNote.body);
      setIsEditing(false);
    } else {
      setTitle('');
      setBody('');
      setIsEditing(false);
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Notes</h1>
          <button onClick={createNewNote} className="new-note-btn">
            + New Note
          </button>
        </div>
        <div className="notes-list">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
              onClick={() => selectNote(note)}
            >
              <h3>{note.title}</h3>
              <p>{note.body.substring(0, 50)}{note.body.length > 50 ? '...' : ''}</p>
              <small>{new Date(note.created_at).toLocaleDateString()}</small>
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
          ))}
        </div>
      </div>
      <div className="editor">
        {selectedNote || isEditing ? (
          <>
            <div className="editor-header">
              {isEditing ? (
                <>
                  <button onClick={saveNote} className="save-btn">Save</button>
                  <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                </>
              ) : (
                <button onClick={handleEdit} className="edit-btn">Edit</button>
              )}
            </div>
            <div className="editor-content">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title"
                    className="title-input"
                  />
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Note content"
                    className="body-input"
                  />
                </>
              ) : (
                <>
                  <h2>{selectedNote.title}</h2>
                  <div className="note-body">{selectedNote.body}</div>
                </>
              )}
            </div>
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
