       document.addEventListener('DOMContentLoaded', () => {
            const nameModal = document.getElementById('name-modal');
            const usernameInput = document.getElementById('username-input');
            const saveNameBtn = document.getElementById('save-name-btn');
            const welcomeMessage = document.getElementById('welcome-message');
            const currentTimeElement = document.getElementById('current-time');
            const inputMessageBox = document.getElementById('input-message-box');

            /**
             * Displays a temporary message in a dedicated message box.
             * @param {string} message - The message to display.
             * @param {string} type - 'success' or 'error' (can be extended for different styles).
             */
            function showMessageBox(message, type = 'error') {
                inputMessageBox.textContent = message;
                inputMessageBox.className = 'message-box show'; // Reset class and show
                // Optionally change background based on type
                if (type === 'error') {
                    inputMessageBox.style.backgroundColor = '#FF4500'; // Red-orange for error
                } else {
                    inputMessageBox.style.backgroundColor = '#34C759'; // Green for success
                }

                setTimeout(() => {
                    inputMessageBox.classList.remove('show');
                }, 3000); // Hide after 3 seconds
            }

            // --- Name Prompt Logic ---
            const savedUsername = localStorage.getItem('studentUsername');

            if (savedUsername) {
                // If name is saved, display welcome message
                welcomeMessage.textContent = `Welcome, ${savedUsername}!`;
                nameModal.classList.remove('visible'); // Ensure modal is hidden
            } else {
                // If no name is saved, show the modal
                nameModal.classList.add('visible');
            }

            saveNameBtn.addEventListener('click', () => {
                const username = usernameInput.value.trim();

                if (username) {
                    // Save the name to local storage
                    localStorage.setItem('studentUsername', username);

                    // Update the welcome message
                    welcomeMessage.textContent = `Welcome, ${username}!`;

                    // Hide the modal with a smooth transition
                    nameModal.classList.remove('visible');
                } else {
                    // Show a message asking for input using the custom message box
                    showMessageBox('Please enter your name.');
                }
            });

            // --- Clock Logic ---
            /**
             * Updates the clock display with the current time in WAT (West Africa Time).
             */
            function updateClock() {
                const now = new Date();

                // Options for formatting the time, including the timezone
                const options = {
                    hour: '2-digit',
                    minute: '2-digit',
                    // second: '2-digit', // Uncomment if seconds are desired
                    hour12: false, // 24-hour format
                    timeZone: 'Africa/Lagos' // Lagos is a common city in WAT
                };

                // Format the time
                const formattedTime = new Intl.DateTimeFormat('en-US', options).format(now);

                // Append the timezone abbreviation
                currentTimeElement.textContent = `${formattedTime} WAT`;
            }

            // Initial call to set the clock text immediately
            updateClock();

            // Update the clock every second
            setInterval(updateClock, 1000); // 1000 milliseconds = 1 second
        });