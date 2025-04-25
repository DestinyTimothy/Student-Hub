document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const currentTimeElement = document.getElementById('current-time');

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


    // --- Chatbot Logic ---

    // Function to add a message to the chat box
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerHTML = `<div class="message-bubble">${text}</div>`;
        chatBox.appendChild(messageElement);
        // Scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Function to send a message (user input or potentially AI response)
    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === "") {
            return; // Don't send empty messages
        }

        // Add user message to chat box
        addMessage(userText, 'user');
        userInput.value = ''; // Clear the input field

        // Disable input and button while waiting for AI response
        userInput.disabled = true;
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="ph-fill ph-circle-notch animate-spin"></i> Sending...'; // Indicate sending


        // --- AI API Integration ---
        // REPLACE 'YOUR_API_KEY' BELOW WITH YOUR ACTUAL GEMINI API KEY
        const apiKey = 'AIzaSyB36_BdtiIFaB8q-315DWa-JOj5svq2Woc';
        // This is the correct endpoint for the gemini-2.0-flash model
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;


        // The structure of the request body for the Gemini API
        const apiRequestBody = {
            // Gemini API uses a 'contents' array with 'parts'
            contents: [{
                parts: [{
                    text: userText
                }]
            }]
            // You might add generation config, safety settings, etc. here
            // See Gemini API documentation for details
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Gemini API uses the API key in the URL query parameter,
                    // so an Authorization header is typically not needed here.
                },
                body: JSON.stringify(apiRequestBody)
            });

            if (!response.ok) {
                // Handle API errors
                console.error('API Error:', response.status, response.statusText);
                const errorData = await response.json();
                console.error('API Error Details:', errorData);
                addMessage(`Sorry, there was an error from the AI: ${errorData.error.message || response.statusText}`, 'ai'); // Display specific error if available
            } else {
                const responseData = await response.json();
                // Extract the AI's response text from the responseData
                // For Gemini's generateContent, the text is typically in responseData.candidates[0].content.parts[0].text
                const aiResponseText = responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts[0] && responseData.candidates[0].content.parts[0].text
                                       ? responseData.candidates[0].content.parts[0].text
                                       : "Sorry, I couldn't generate a response."; // Fallback message

                addMessage(aiResponseText, 'ai');
                // Optionally store conversation history
                // storeMessage({ text: userText, sender: 'user' });
                // storeMessage({ text: aiResponseText, sender: 'ai' });
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            addMessage("An error occurred while trying to connect to the AI.", 'ai');
        } finally {
            // Re-enable input and button
            userInput.disabled = false;
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="ph-fill ph-paper-plane-tilt"></i> Send';
            userInput.focus(); // Put focus back on the input field
        }
    }

    // Allow sending message by pressing Enter key in the textarea
    userInput.addEventListener('keypress', function(event) {
        // Check if the key pressed was Enter (key code 13) and Shift key was NOT pressed
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default Enter behavior (new line)
            sendMessage(); // Send the message
        }
        // If Shift + Enter is pressed, allow new line (default behavior)
    });


    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

    // --- Optional: Conversation History Management ---
    // You might want to store and retrieve conversation history
    // using localStorage or Firebase later.

    // function getConversationHistory() {
    //     // Retrieve history from storage
    //     // Format it as required by your AI API
    // }

    // function storeMessage(message) {
    //     // Add message to history and save to storage
    // }


    // --- Initial Load ---
    // Optionally load previous conversation history here
    // loadConversationHistory();
});
