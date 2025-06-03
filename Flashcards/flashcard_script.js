        // Get references to DOM elements
        const flashcardFrontInput = document.getElementById('flashcard-front');
        const flashcardBackInput = document.getElementById('flashcard-back');
        const createFlashcardBtn = document.getElementById('create-flashcard-btn');
        const flashcardsDisplay = document.getElementById('flashcards-display');
        const noFlashcardsMessage = document.getElementById('no-flashcards-message');

        // Modal elements
        const customModalOverlay = document.getElementById('custom-modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalConfirmBtn = document.getElementById('modal-confirm-btn');
        const modalCancelBtn = document.getElementById('modal-cancel-btn');
        const modalOkBtn = document.getElementById('modal-ok-btn');

        // Array to store flashcard data
        let flashcards = [];

        // Array of available card colors (CSS variable names)
        const cardColors = [
            'card-color-1', 'card-color-2', 'card-color-3', 'card-color-4',
            'card-color-5', 'card-color-6', 'card-color-7'
        ];
        let currentColorIndex = 0; // To cycle through colors

        // --- Utility Functions ---

        /**
         * Generates a unique ID for a flashcard.
         * @returns {string} A unique identifier.
         */
        function generateUniqueId() {
            return 'flashcard-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }

        /**
         * Saves the current flashcards array to localStorage.
         */
        function saveFlashcards() {
            try {
                localStorage.setItem('flashcards', JSON.stringify(flashcards));
            } catch (e) {
                console.error("Error saving flashcards to localStorage:", e);
                showModal('Error', 'Could not save flashcards. Your browser might be in private mode or storage is full.', 'alert');
            }
        }

        /**
         * Loads flashcards from localStorage.
         */
        function loadFlashcards() {
            try {
                const storedFlashcards = localStorage.getItem('flashcards');
                if (storedFlashcards) {
                    flashcards = JSON.parse(storedFlashcards);
                    renderAllFlashcards();
                }
            } catch (e) {
                console.error("Error loading flashcards from localStorage:", e);
                showModal('Error', 'Could not load saved flashcards. The data might be corrupted.', 'alert');
                flashcards = []; // Reset if corrupted
            }
        }

        /**
         * Shows a custom modal with a message and type (alert or confirm).
         * @param {string} title - The title of the modal.
         * @param {string} message - The message to display.
         * @param {'alert'|'confirm'} type - The type of modal (shows OK or Confirm/Cancel buttons).
         * @returns {Promise<boolean>} Resolves to true for 'confirm' if confirmed, false if cancelled. For 'alert', resolves to true when OK is clicked.
         */
        function showModal(title, message, type) {
            return new Promise((resolve) => {
                modalTitle.textContent = title;
                modalMessage.textContent = message;

                // Reset button visibility
                modalConfirmBtn.classList.add('hidden');
                modalCancelBtn.classList.add('hidden');
                modalOkBtn.classList.add('hidden');

                // Clear previous listeners
                modalConfirmBtn.onclick = null;
                modalCancelBtn.onclick = null;
                modalOkBtn.onclick = null;

                if (type === 'alert') {
                    modalOkBtn.classList.remove('hidden');
                    modalOkBtn.onclick = () => {
                        customModalOverlay.classList.remove('visible');
                        resolve(true);
                    };
                } else if (type === 'confirm') {
                    modalConfirmBtn.classList.remove('hidden');
                    modalCancelBtn.classList.remove('hidden');

                    modalConfirmBtn.onclick = () => {
                        customModalOverlay.classList.remove('visible');
                        resolve(true);
                    };
                    modalCancelBtn.onclick = () => {
                        customModalOverlay.classList.remove('visible');
                        resolve(false);
                    };
                }

                customModalOverlay.classList.add('visible');
            });
        }

        // --- Flashcard Rendering and Management ---

        /**
         * Renders all flashcards currently in the 'flashcards' array.
         */
        function renderAllFlashcards() {
            flashcardsDisplay.innerHTML = ''; // Clear existing cards
            if (flashcards.length === 0) {
                noFlashcardsMessage.classList.remove('hidden');
            } else {
                noFlashcardsMessage.classList.add('hidden');
                // Render in reverse to show newest first, but maintain original order in array
                [...flashcards].reverse().forEach(cardData => {
                    const cardElement = createFlashcardElement(cardData);
                    flashcardsDisplay.appendChild(cardElement);
                });
            }
        }

        /**
         * Creates a single flashcard DOM element.
         * @param {object} flashcardData - The data for the flashcard (id, front, back, colorClass).
         * @returns {HTMLElement} The created flashcard DOM element.
         */
        function createFlashcardElement(flashcardData) {
            const flashcardContainer = document.createElement('div');
            flashcardContainer.classList.add('flashcard-container');
            flashcardContainer.id = flashcardData.id; // Set ID on the container

            const flashcard = document.createElement('div');
            flashcard.classList.add('flashcard', flashcardData.colorClass);

            const flashcardFront = document.createElement('div');
            flashcardFront.classList.add('flashcard-front');
            flashcardFront.textContent = flashcardData.front;

            const flashcardBack = document.createElement('div');
            flashcardBack.classList.add('flashcard-back');
            flashcardBack.textContent = flashcardData.back;

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-card-btn');
            deleteButton.innerHTML = '<i class="ph-bold ph-x-circle text-xl"></i>';
            deleteButton.title = 'Delete Flashcard';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent card from flipping when delete button is clicked
                confirmDeleteFlashcard(flashcardData.id);
            });

            // Append front, back, and delete button to the flashcard
            flashcard.appendChild(flashcardFront);
            flashcard.appendChild(flashcardBack);
            flashcard.appendChild(deleteButton);


            // Add click listener to flip the card
            flashcard.addEventListener('click', () => {
                flashcard.classList.toggle('flipped');
            });

            // Append the flashcard to its container
            flashcardContainer.appendChild(flashcard);

            return flashcardContainer;
        }

        /**
         * Adds a new flashcard to the display and saves it.
         */
        function addFlashcard() {
            const frontContent = flashcardFrontInput.value.trim();
            const backContent = flashcardBackInput.value.trim();

            if (frontContent === '' || backContent === '') {
                showModal('Missing Content', 'Please enter content for both the front and back of the flashcard.', 'alert');
                return;
            }

            // Get the next color class from the array, cycling through
            const colorClass = cardColors[currentColorIndex];
            currentColorIndex = (currentColorIndex + 1) % cardColors.length;

            const newFlashcard = {
                id: generateUniqueId(),
                front: frontContent,
                back: backContent,
                colorClass: colorClass
            };

            flashcards.push(newFlashcard); // Add to the array
            saveFlashcards(); // Save to localStorage

            const flashcardElement = createFlashcardElement(newFlashcard);
            flashcardsDisplay.prepend(flashcardElement); // Add to display (prepend to show newest first)

            // Clear input fields
            flashcardFrontInput.value = '';
            flashcardBackInput.value = '';

            // Hide "No flashcards" message if cards are present
            if (flashcards.length > 0) {
                noFlashcardsMessage.classList.add('hidden');
            }
        }

        /**
         * Confirms with the user before deleting a flashcard.
         * @param {string} id - The ID of the flashcard to delete.
         */
        async function confirmDeleteFlashcard(id) {
            const confirmed = await showModal('Delete Flashcard', 'Are you sure you want to delete this flashcard? This action cannot be undone.', 'confirm');
            if (confirmed) {
                deleteFlashcard(id);
            }
        }

        /**
         * Deletes a flashcard by its ID.
         * @param {string} id - The ID of the flashcard to delete.
         */
        function deleteFlashcard(id) {
            const cardElement = document.getElementById(id);
            if (cardElement) {
                // Add removing class for animation
                cardElement.classList.add('removing');
                cardElement.addEventListener('animationend', () => {
                    cardElement.remove(); // Remove from DOM after animation
                    flashcards = flashcards.filter(card => card.id !== id); // Remove from array
                    saveFlashcards(); // Save updated array to localStorage

                    if (flashcards.length === 0) {
                        noFlashcardsMessage.classList.remove('hidden'); // Show message if no cards left
                    }
                }, { once: true }); // Ensure listener runs only once
            }
        }

        /**
         * Initializes the application: loads saved flashcards and sets up event listeners.
         */
        function initializeApp() {
            loadFlashcards(); // Load existing flashcards on startup
            createFlashcardBtn.addEventListener('click', addFlashcard);

            // Initially show/hide "No flashcards" message based on loaded data
            if (flashcards.length === 0) {
                noFlashcardsMessage.classList.remove('hidden');
            } else {
                noFlashcardsMessage.classList.add('hidden');
            }
        }

        // Initialize the app when the DOM is fully loaded
        document.addEventListener('DOMContentLoaded', initializeApp);