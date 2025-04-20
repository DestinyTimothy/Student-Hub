document.addEventListener('DOMContentLoaded', () => {
    const notesListDiv = document.getElementById('notes-list'); // This is now the horizontal list div
    const newNoteBtn = document.getElementById('new-note-btn'); // This button is now in the bottom section
    const saveNoteBtn = document.getElementById('save-note-btn');
    const printNoteBtn = document.getElementById('print-note-btn');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentTextarea = document.getElementById('note-content');
    const currentTimeElement = document.getElementById('current-time');
    const noNotesMessage = document.querySelector('.no-notes-message'); // This message is now in the bottom section

    // Removed modal elements references

    let notes = []; // Array to store notes
    let currentNoteId = null; // To track the currently loaded note

    // --- Clock Logic (Static for now) ---
    // In a real app, you would use setInterval to update this every second
    // and fetch/calculate the actual time in the WAT timezone.
    function updateClock() {
        // Static time based on your request for now
        const currentTime = "17:00 WAT"; // Replace with dynamic time in a real app
        currentTimeElement.textContent = currentTime;

        // Example of how you might get current local time (needs timezone handling for WAT)
        /*
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}`; // This is local time, not WAT
        */
    }

    // Initial call to set the clock text
    updateClock();

    // --- Notes App Logic ---

    // Load notes from local storage
    function loadNotes() {
        const storedNotes = localStorage.getItem('studentNotes');
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
        } else {
            notes = []; // Initialize as empty array if nothing is stored
        }
        renderNotesList(); // Render the list when notes are loaded
    }

    // Save notes to local storage
    function saveNotes() {
        localStorage.setItem('studentNotes', JSON.stringify(notes));
    }

    // Render the list of notes in the horizontal scroll section
    function renderNotesList() {
        notesListDiv.innerHTML = ''; // Clear current list
        if (notes.length === 0) {
            noNotesMessage.style.display = 'flex'; // Show "No notes" message (using flex for centering)
            notesListDiv.appendChild(noNotesMessage); // Add message to the list container
        } else {
             noNotesMessage.style.display = 'none'; // Hide "No notes" message
            // Sort notes by timestamp descending (newest first)
            notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            notes.forEach(note => {
                const noteItem = document.createElement('div');
                noteItem.classList.add('note-item');
                noteItem.dataset.id = note.id; // Store the note ID
                const date = new Date(note.timestamp);
                const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const formattedTimestamp = date.toLocaleDateString(undefined, options); // Format date and time

                noteItem.innerHTML = `
                    <h3>${note.title || 'Untitled Note'}</h3>
                    <p>${note.content ? note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '') : 'Empty Note'}</p>
                    <span class="note-timestamp">${formattedTimestamp}</span>
                `;

                noteItem.addEventListener('click', () => {
                    loadNoteForEditing(note.id);
                    // No modal to close anymore
                });

                notesListDiv.appendChild(noteItem);
            });
        }
    }

    // Load a specific note into the editor
    function loadNoteForEditing(id) {
        const noteToLoad = notes.find(note => note.id === id);
        if (noteToLoad) {
            currentNoteId = noteToLoad.id;
            noteTitleInput.value = noteToLoad.title || '';
            noteContentTextarea.value = noteToLoad.content || '';
        }
    }

    // Clear the editor for a new note
    function startNewNote() {
        currentNoteId = null; // No ID means it's a new note
        noteTitleInput.value = '';
        noteContentTextarea.value = '';
        noteTitleInput.focus(); // Set focus to the title
        // No modal to hide anymore
    }

    // Event listener for the "New Note" button (now in the bottom section)
    newNoteBtn.addEventListener('click', startNewNote);

    // Event listener for the "Save Note" button
    saveNoteBtn.addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentTextarea.value.trim();

        if (!title && !content) {
            alert("Cannot save an empty note.");
            return;
        }

        const now = new Date();

        if (currentNoteId) {
            // Update existing note
            notes = notes.map(note => {
                if (note.id === currentNoteId) {
                    return {
                        id: note.id,
                        title: title,
                        content: content,
                        timestamp: now.toISOString() // Update timestamp on save
                    };
                }
                return note;
            });
        } else {
            // Create new note
            const newNote = {
                id: Date.now(), // Simple unique ID based on timestamp
                title: title,
                content: content,
                timestamp: now.toISOString() // ISO string for easy sorting and parsing
            };
            notes.push(newNote);
            currentNoteId = newNote.id; // Set current ID to the new note
        }

        saveNotes(); // Save to local storage
        renderNotesList(); // Update the list display in the bottom section
        alert("Note saved!"); // Simple feedback
    });

    // Event listener for the "Print Note" button
    printNoteBtn.addEventListener('click', () => {
        // Check if there's content to print
        if (noteTitleInput.value.trim() || noteContentTextarea.value.trim()) {
             window.print(); // Trigger the browser's print dialog
        } else {
             alert("There is no note content to print.");
        }
    });

    // Removed modal functionality event listeners

    // Initial load of notes when the page opens
    loadNotes();
});
