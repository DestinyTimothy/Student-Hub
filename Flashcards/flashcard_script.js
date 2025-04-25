document.addEventListener('DOMContentLoaded', () => {
    const cardFrontInput = document.getElementById('card-front-input');
    const cardBackInput = document.getElementById('card-back-input');
    const saveCardBtn = document.getElementById('save-card-btn');
    const updateCardBtn = document.getElementById('update-card-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editCardIdInput = document.getElementById('edit-card-id'); // Hidden input
    const flashcardContainer = document.getElementById('flashcard-container');
    const flashcard = document.getElementById('flashcard');
    const cardFrontDisplay = document.getElementById('card-front-display');
    const cardBackDisplay = document.getElementById('card-back-display');
    const navigationControls = document.querySelector('.navigation-controls');
    const prevCardBtn = document.getElementById('prev-card-btn');
    const nextCardBtn = document.getElementById('next-card-btn');
    const cardCounterSpan = document.getElementById('card-counter');
    const noCardsMessage = document.getElementById('no-cards-message');
    const currentTimeElement = document.getElementById('current-time');

    let flashcards = []; // Array to store flashcards
    let currentCardIndex = 0; // Index of the currently displayed card

    // --- Live Clock Logic ---
    function updateClock() {
        const now = new Date();
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
            timeZone: 'Africa/Lagos' // Specify the timezone for WAT
        };
        try {
             const formattedTime = now.toLocaleTimeString('en-US', options);
             currentTimeElement.textContent = `${formattedTime} WAT`;
        } catch (error) {
             console.error("Error getting time in Africa/Lagos timezone, falling back to UTC:", error);
             const utcOptions = {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'UTC'
             };
             const utcTime = now.toLocaleTimeString('en-US', utcOptions);
             currentTimeElement.textContent = `${utcTime} UTC`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock(); // Initial call


    // --- Flashcard Data Management ---

    // Load flashcards from local storage
    function loadFlashcards() {
        const storedFlashcards = localStorage.getItem('studentFlashcards');
        if (storedFlashcards) {
            flashcards = JSON.parse(storedFlashcards);
        } else {
            flashcards = [];
        }
        displayCurrentCard(); // Display the first card on load
        updateNavigation(); // Update navigation state
    }

    // Save flashcards to local storage
    function saveFlashcards() {
        localStorage.setItem('studentFlashcards', JSON.stringify(flashcards));
        displayCurrentCard(); // Update display after saving
        updateNavigation(); // Update navigation state
    }

    // Add or Update a flashcard
    function addOrUpdateCard() {
        const front = cardFrontInput.value.trim();
        const back = cardBackInput.value.trim();
        const cardId = editCardIdInput.value;

        if (!front || !back) {
            alert("Both front and back of the card are required.");
            return;
        }

        const cardColors = [ // Define colors here to use in JS
            'var(--card-color-1)',
            'var(--card-color-2)',
            'var(--card-color-3)',
            'var(--card-color-4)',
            'var(--card-color-5)',
            'var(--card-color-6)',
            'var(--card-color-7)'
        ];

        if (cardId) {
            // Update existing card
            flashcards = flashcards.map(card => {
                if (card.id === parseFloat(cardId)) {
                    return { ...card, front: front, back: back }; // Keep existing color
                }
                return card;
            });
             alert("Card updated!");
        } else {
            // Add new card
            const newCard = {
                id: Date.now(), // Simple unique ID
                front: front,
                back: back,
                 // Assign a color based on the current number of cards
                color: cardColors[flashcards.length % cardColors.length]
            };
            flashcards.push(newCard);
            currentCardIndex = flashcards.length - 1; // Go to the new card
             alert("Card saved!");
        }

        saveFlashcards();
        clearForm();
        exitEditMode();
    }

    // Delete a flashcard
    function deleteCard(idToDelete) {
        if (confirm("Are you sure you want to delete this flashcard?")) {
            flashcards = flashcards.filter(card => card.id !== idToDelete);

            // Adjust current index if the deleted card was the current one or before it
            if (currentCardIndex >= flashcards.length) {
                currentCardIndex = Math.max(0, flashcards.length - 1);
            }

            saveFlashcards();
            displayCurrentCard(); // Update display
            updateNavigation(); // Update navigation state
             alert("Card deleted!");
        }
    }

    // --- Flashcard Display and Navigation ---

    // Display the current flashcard
    function displayCurrentCard() {
        if (flashcards.length === 0) {
            flashcard.classList.add('hidden');
            noCardsMessage.classList.remove('hidden');
            navigationControls.classList.add('hidden');
        } else {
            flashcard.classList.remove('hidden');
            noCardsMessage.classList.add('hidden');
            navigationControls.classList.remove('hidden');

            const currentCard = flashcards[currentCardIndex];
            cardFrontDisplay.textContent = currentCard.front;
            cardBackDisplay.textContent = currentCard.back;

            // Apply the card color to BOTH the front and the back
            flashcard.querySelector('.flashcard-front').style.backgroundColor = currentCard.color;
            flashcard.querySelector('.flashcard-back').style.backgroundColor = currentCard.color; // <-- Fix applied here

            // Ensure the card is showing the front side initially when displayed
            flashcard.classList.remove('flipped');

            updateNavigation(); // Update navigation state and counter
        }
    }

    // Update navigation buttons and counter
    function updateNavigation() {
        cardCounterSpan.textContent = `${flashcards.length > 0 ? currentCardIndex + 1 : 0} / ${flashcards.length}`;

        prevCardBtn.disabled = currentCardIndex === 0;
        nextCardBtn.disabled = currentCardIndex === flashcards.length - 1;

        // Add/remove disabled class for styling
        if (prevCardBtn.disabled) prevCardBtn.classList.add('disabled'); else prevCardBtn.classList.remove('disabled');
        if (nextCardBtn.disabled) nextCardBtn.classList.add('disabled'); else nextCardBtn.classList.remove('disabled');
    }

    // Navigate to the previous card
    prevCardBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            displayCurrentCard();
        }
    });

    // Navigate to the next card
    nextCardBtn.addEventListener('click', () => {
        if (currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
            displayCurrentCard();
        }
    });

    // Flip the flashcard
    flashcard.addEventListener('click', (event) => {
        // Prevent flipping if clicking on the action buttons
        if (event.target.closest('.card-actions-top button')) {
            return;
        }
         if (flashcards.length > 0) { // Only flip if there are cards
             flashcard.classList.toggle('flipped');
         }
    });

    // --- Edit Mode ---

    // Enter edit mode
    function enterEditMode(cardId) {
        const cardToEdit = flashcards.find(card => card.id === cardId);
        if (cardToEdit) {
            editCardIdInput.value = cardToEdit.id;
            cardFrontInput.value = cardToEdit.front;
            cardBackInput.value = cardToEdit.back;

            // Switch button visibility
            saveCardBtn.classList.add('hidden');
            updateCardBtn.classList.remove('hidden');
            cancelEditBtn.classList.remove('hidden');

            cardFrontInput.focus(); // Set focus to the front input
        }
    }

    // Exit edit mode
    function exitEditMode() {
        editCardIdInput.value = '';
        saveCardBtn.classList.remove('hidden');
        updateCardBtn.classList.add('hidden');
        cancelEditBtn.classList.add('hidden');
        clearForm();
    }

    // Add event listeners to edit and delete buttons (delegation might be better for many cards)
    // For simplicity here, we'll add listeners when displaying the card
    // This is handled within the displayCurrentCard function now.


    // --- Form Management ---

    // Clear input form
    function clearForm() {
        cardFrontInput.value = '';
        cardBackInput.value = '';
    }

    // --- Event Listeners ---
    saveCardBtn.addEventListener('click', addOrUpdateCard);
    updateCardBtn.addEventListener('click', addOrUpdateCard);
    cancelEditBtn.addEventListener('click', exitEditMode);

    // Event listeners for edit/delete buttons on the displayed card
    flashcard.addEventListener('click', (event) => {
        const editBtn = event.target.closest('.edit-card-btn');
        const deleteBtn = event.target.closest('.delete-card-btn');
        const currentCard = flashcards[currentCardIndex];

        if (editBtn && currentCard) {
            enterEditMode(currentCard.id);
        } else if (deleteBtn && currentCard) {
            deleteCard(currentCard.id);
        }
    });


    // --- Initial Load ---
    loadFlashcards(); // Load flashcards and initialize the app
});
