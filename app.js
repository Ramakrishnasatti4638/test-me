const API_URL = 'http://localhost:3001/api/notes';

let notes = [];
let currentNoteId = null;

// DOM elements
const notesList = document.getElementById('notes-list');
const newNoteBtn = document.getElementById('new-note-btn');
const emptyState = document.getElementById('empty-state');
const noteEditor = document.getElementById('note-editor');
const noteTitle = document.getElementById('note-title');
const noteBody = document.getElementById('note-body');
const deleteBtn = document.getElementById('delete-btn');

// Load notes on startup
loadNotes();

// Event listeners
newNoteBtn.addEventListener('click', createNewNote);
deleteBtn.addEventListener('click', deleteCurrentNote);

// Auto-save on input
let saveTimeout;
noteTitle.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCurrentNote, 500);
});

noteBody.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCurrentNote, 500);
});

// Functions
async function loadNotes() {
  try {
    const response = await fetch(API_URL);
    notes = await response.json();
    renderNotesList();
  } catch (error) {
    console.error('Error loading notes:', error);
  }
}

function renderNotesList() {
  notesList.innerHTML = '';
  
  notes.forEach(note => {
    const li = document.createElement('li');
    li.className = 'note-item';
    if (note.id === currentNoteId) {
      li.classList.add('active');
    }
    
    li.innerHTML = `
      <div class="note-item-title">${note.title || 'Untitled'}</div>
      <div class="note-item-preview">${note.body.substring(0, 50)}${note.body.length > 50 ? '...' : ''}</div>
    `;
    
    li.addEventListener('click', () => selectNote(note.id));
    notesList.appendChild(li);
  });
}

function selectNote(id) {
  currentNoteId = id;
  const note = notes.find(n => n.id === id);
  
  if (note) {
    noteTitle.value = note.title;
    noteBody.value = note.body;
    emptyState.style.display = 'none';
    noteEditor.style.display = 'flex';
    renderNotesList();
  }
}

async function createNewNote() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Untitled',
        body: ''
      })
    });
    
    const newNote = await response.json();
    notes.unshift(newNote);
    selectNote(newNote.id);
    renderNotesList();
    noteTitle.focus();
    noteTitle.select();
  } catch (error) {
    console.error('Error creating note:', error);
  }
}

async function saveCurrentNote() {
  if (!currentNoteId) return;
  
  const note = notes.find(n => n.id === currentNoteId);
  if (!note) return;
  
  const title = noteTitle.value || 'Untitled';
  const body = noteBody.value;
  
  // Update local state
  note.title = title;
  note.body = body;
  renderNotesList();
  
  // Save to backend (delete and recreate since we don't have PUT)
  try {
    await fetch(`${API_URL}/${currentNoteId}`, { method: 'DELETE' });
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
    
    const savedNote = await response.json();
    note.id = savedNote.id;
    currentNoteId = savedNote.id;
  } catch (error) {
    console.error('Error saving note:', error);
  }
}

async function deleteCurrentNote() {
  if (!currentNoteId) return;
  
  if (!confirm('Delete this note?')) return;
  
  try {
    await fetch(`${API_URL}/${currentNoteId}`, { method: 'DELETE' });
    notes = notes.filter(n => n.id !== currentNoteId);
    currentNoteId = null;
    noteTitle.value = '';
    noteBody.value = '';
    emptyState.style.display = 'flex';
    noteEditor.style.display = 'none';
    renderNotesList();
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}
