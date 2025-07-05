  document.addEventListener('DOMContentLoaded', () => {
            // --- DOM Elements ---
            const welcomeMessage = document.getElementById('welcome-message');
            const currentTimeElement = document.getElementById('current-time');
            const inputMessageBox = document.getElementById('input-message-box'); // Kept for general utility messages
            const toolCards = document.querySelectorAll('.tool-card'); // All feature cards
            const disclaimerModal = document.getElementById('disclaimer-modal');
            const featureNameDisplay = document.getElementById('feature-name-display');
            const continueFeatureBtn = document.getElementById('continue-feature-btn');
            const cancelDisclaimerBtn = document.getElementById('cancel-disclaimer-btn');

            let targetFeatureUrl = ''; // Variable to store the URL of the clicked feature

            // --- Utility: Show custom message box (replaces alert()) ---
            /**
             * Displays a temporary message to the user.
             * @param {string} message - The message text.
             * @param {'success' | 'error' | 'info'} type - The type of message for styling.
             */
            function showMessageBox(message, type = 'error') {
                inputMessageBox.textContent = message;
                // Reset classes and apply new ones for visibility and styling
                inputMessageBox.className = 'message-box show';
                if (type === 'success') {
                    inputMessageBox.style.backgroundColor = '#34C759'; // Green for success
                } else if (type === 'error') {
                    inputMessageBox.style.backgroundColor = '#FF4500'; // Red-orange for error
                } else {
                    inputMessageBox.style.backgroundColor = '#007AFF'; // Blue for info
                }

                // Position the message box gracefully
                inputMessageBox.style.bottom = '20px';
                inputMessageBox.style.left = '50%';
                inputMessageBox.style.transform = 'translateX(-50%)';
                inputMessageBox.style.padding = '10px 20px';
                inputMessageBox.style.borderRadius = '8px';
                inputMessageBox.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                inputMessageBox.style.zIndex = '1001';
                inputMessageBox.style.transition = 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out';


                setTimeout(() => {
                    inputMessageBox.classList.remove('show');
                }, 3000); // Hide after 3 seconds
            }

            // --- Static Welcome Message ---
            // The welcome message is now static as the name input feature is removed.
            welcomeMessage.textContent = `Welcome to Student Hub!`;


            // --- Live Clock Functionality ---
            /**
             * Updates the clock display with the current time in WAT (West Africa Time).
             */
            function updateClock() {
                const now = new Date();
                const options = {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false, // 24-hour format
                    timeZone: 'Africa/Lagos' // Consistent timezone for Nigeria
                };
                const formattedTime = new Intl.DateTimeFormat('en-US', options).format(now);
                currentTimeElement.textContent = `${formattedTime} WAT`;
            }

            // Initial call to set the clock text
            updateClock();
            // Update the clock every second for live display
            setInterval(updateClock, 1000);

            // --- Local Storage Disclaimer Modal Logic ---
            toolCards.forEach(card => {
                card.addEventListener('click', (event) => {
                    // Prevent default navigation initially
                    event.preventDefault();

                    // Get the target URL from the href attribute
                    targetFeatureUrl = card.href;

                    // Get the feature name from the data attribute
                    const featureName = card.dataset.featureName || 'this feature';
                    featureNameDisplay.textContent = featureName;

                    // Show the disclaimer modal
                    disclaimerModal.classList.add('visible');
                });
            });

            // Event listener for the "Continue to Feature" button
            continueFeatureBtn.addEventListener('click', () => {
                // Hide the modal
                disclaimerModal.classList.remove('visible');
                // Navigate to the stored URL after disclaimer is accepted
                if (targetFeatureUrl) {
                    window.location.href = targetFeatureUrl;
                }
            });

            // Event listener for the "Cancel" button on the disclaimer modal
            cancelDisclaimerBtn.addEventListener('click', () => {
                // Just hide the modal
                disclaimerModal.classList.remove('visible');
                targetFeatureUrl = ''; // Clear the stored URL
            });
        });