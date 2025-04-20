document.addEventListener('DOMContentLoaded', () => {
    const nameModal = document.getElementById('name-modal');
    const usernameInput = document.getElementById('username-input');
    const saveNameBtn = document.getElementById('save-name-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const currentTimeElement = document.getElementById('current-time'); // Added for clarity

    // --- Name Prompt Logic ---

    const savedUsername = localStorage.getItem('studentUsername');

    if (savedUsername) {
        // If name is saved, display welcome message
        welcomeMessage.textContent = `Welcome, ${savedUsername}!`;
        // Hide the modal (just in case, though it should be hidden by default CSS)
        nameModal.classList.remove('visible');
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

            // Hide the modal with a slight delay for a smoother transition
            nameModal.classList.remove('visible');
             // Optional: Add a slight delay before hiding to allow transition
             // setTimeout(() => { nameModal.style.display = 'none'; }, 300); // If not using visibility transition
        } else {
            // Optionally, show a message asking for input
            alert('Please enter your name.');
        }
    });

    // --- Clock Logic (Conceptual) ---
    // Note: A truly live clock requires updating this every second.
    // This is a conceptual outline using the time you provided.
    // For a real app, you would use setInterval to update this.

    function updateClock() {
        // In a real app, get current time in Nigeria (WAT)
        // This requires using Date objects and potentially timezone libraries
        // For this static example, we'll use the provided time: 16:24 WAT
        const currentTime = "16:24 WAT"; // Replace with dynamic time in a real app
        currentTimeElement.textContent = currentTime;

         // In a real app, you would use:
         /*
         const now = new Date();
         // Need logic here to format time and handle WAT timezone
         // Example (basic local time):
         // const hours = now.getHours().toString().padStart(2, '0');
         // const minutes = now.getMinutes().toString().padStart(2, '0');
         // currentTimeElement.textContent = `${hours}:${minutes}`;
         */
    }

    // Initial call to set the clock text
    updateClock();

    // In a real app, update the clock every second:
    // setInterval(updateClock, 1000);

    // --- Add any other JavaScript for tool links or future features here ---
});