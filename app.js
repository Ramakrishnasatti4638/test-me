const API_URL = 'http://localhost:3001/api/notes';

let notes = [];
let currentNote = null;

// DOM elements
const notesList = document.getElementById('notes-list');
const newNoteBtn = document.getElementById('new-note-btn');
const editorEmpty = document.getElementById('editor-empty');
const editorContent = document.getElementById('editor-content');
const noteTitle = document.getElementById('note-title');
const noteBody = document.getElementById('note-body');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');

// Load notes on startup
async function loadNotes() {
  try {
    const response = await fetch(API_URL);
    notes = await response.json();
    renderNotesList();
  } catch (error) {
    console.error('Error loading notes:', error);
  }
}

// Render notes list
function renderNotesList() {
  notesList.innerHTML = '';
  
  notes.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    if (currentNote && currentNote.id === note.id) {
      noteItem.classList.add('active');
    }
    
    noteItem.innerHTML = `
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.body)}</p>
    `;
    
    noteItem.addEventListener('click', () => selectNote(note));
    notesList.appendChild(noteItem);
  });
}

// Select a note
function selectNote(note) {
  currentNote = note;
  noteTitle.value = note.title;
  noteBody.value = note.body;
  
  editorEmpty.style.display = 'none';
  editorContent.classList.remove('hidden');
  
  renderNotesList();
}

// Create new note
newNoteBtn.addEventListener('click', () => {
  currentNote = { title: '', body: '' };
  noteTitle.value = '';
  noteBody.value = '';
  
  editorEmpty.style.display = 'none';
  editorContent.classList.remove('hidden');
  noteTitle.focus();
  
  renderNotesList();
});

// Save note
saveBtn.addEventListener('click', async () => {
  const title = noteTitle.value.trim();
  const body = noteBody.value.trim();
  
  if (!title || !body) {
    alert('Please enter both title and body');
    return;
  }
  
  try {
    if (currentNote.id) {
      // Note already exists - for this simple app, we'll delete and recreate
      // In a real app, you'd implement a PUT/PATCH endpoint
      alert('Editing existing notes is not supported in this version. Please create a new note.');
      return;
    } else {
      // Create new note
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
      
      const newNote = await response.json();
      notes.unshift(newNote);
      currentNote = newNote;
      renderNotesList();
      alert('Note saved!');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Error saving note');
  }
});

// Delete note
deleteBtn.addEventListener('click', async () => {
  if (!currentNote || !currentNote.id) {
    return;
  }
  
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  try {
    await fetch(`${API_URL}/${currentNote.id}`, {
      method: 'DELETE'
    });
    
    notes = notes.filter(n => n.id !== currentNote.id);
    currentNote = null;
    
    noteTitle.value = '';
    noteBody.value = '';
    editorEmpty.style.display = 'flex';
    editorContent.classList.add('hidden');
    
    renderNotesList();
  } catch (error) {
    console.error('Error deleting note:', error);
    alert('Error deleting note');
  }
});

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
loadNotes();
