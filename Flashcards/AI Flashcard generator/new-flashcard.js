  const topicInput = document.getElementById('topicInput');
        const generateButton = document.getElementById('generateButton');
        const generateButtonText = document.getElementById('generateButtonText');
        const generateButtonSpinner = document.getElementById('generateButtonSpinner');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const flashcardsContainer = document.getElementById('flashcardsContainer');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const messageBoxContainer = document.getElementById('messageBoxContainer');
        const noFlashcardsMessage = document.getElementById('noFlashcardsMessage');
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        const cardColorClasses = [
            'bg-gradient-to-br from-[var(--card-color-1-start)] to-[var(--card-color-1-end)]',
            'bg-gradient-to-br from-[var(--card-color-2-start)] to-[var(--card-color-2-end)]',
            'bg-gradient-to-br from-[var(--card-color-3-start)] to-[var(--card-color-3-end)]',
            'bg-gradient-to-br from-[var(--card-color-4-start)] to-[var(--card-color-4-end)]',
            'bg-gradient-to-br from-[var(--card-color-5-start)] to-[var(--card-color-5-end)]',
            'bg-gradient-to-br from-[var(--card-color-6-start)] to-[var(--card-color-6-end)]',
            'bg-gradient-to-br from-[var(--card-color-7-start)] to-[var(--card-color-7-end)]',
        ];

        function showMessage(message, type = 'info') {
            messageBoxContainer.innerHTML = ''; // Clear previous messages
            const messageDiv = document.createElement('div');
            messageDiv.className = `message-box ${type}`;
            
            const iconClass = type === 'error' ? 'ph-warning-circle' : 'ph-info';
            const titleText = type === 'error' ? 'Error' : 'Information';

            messageDiv.innerHTML = `
                <div class="message-box-content">
                    <i class="ph ${iconClass} ph-icon"></i>
                    <div class="flex-1">
                        <p class="message-title">${titleText}</p>
                        <p class="message-text">${message}</p>
                    </div>
                    <button class="message-dismiss"><i class="ph ph-x ph-lg"></i></button>
                </div>
            `;
            messageBoxContainer.appendChild(messageDiv);
            messageDiv.querySelector('.message-dismiss').addEventListener('click', () => {
                messageDiv.remove();
            });

            setTimeout(() => {
                messageDiv.remove();
            }, 5000); // Auto-dismiss after 5 seconds
        }

        function speakText(text, lang = 'en-US') {
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;
                speechSynthesis.speak(utterance);
            } else {
                showMessage("Sorry, your browser doesn't support text-to-speech.", "error");
            }
        }

        function createFlashcardElement(card, index) {
            const cardColor = cardColorClasses[index % cardColorClasses.length];

            const cardContainer = document.createElement('div');
            cardContainer.className = 'flashcard-container';

            const cardDiv = document.createElement('div');
            cardDiv.className = 'flashcard';
            cardDiv.addEventListener('click', () => cardDiv.classList.toggle('is-flipped'));

            const frontFace = document.createElement('div');
            frontFace.className = `flashcard-face flashcard-front ${cardColor}`;
            frontFace.innerHTML = `
                <button class="speaker-button" aria-label="Speak question"><i class="ph ph-speaker-simple-high"></i></button>
                <h3 class="text-xl md:text-2xl font-semibold mb-2">Question:</h3>
                <p class="text-base md:text-lg">${card.question}</p>
            `;
            frontFace.querySelector('.speaker-button').addEventListener('click', (e) => {
                e.stopPropagation();
                speakText(card.question);
            });

            const backFace = document.createElement('div');
            backFace.className = 'flashcard-face flashcard-back';
            backFace.innerHTML = `
                <button class="speaker-button" aria-label="Speak answer"><i class="ph ph-speaker-simple-high"></i></button>
                <h3 class="text-xl md:text-2xl font-semibold mb-2">Answer:</h3>
                <p class="text-base md:text-lg">${card.answer}</p>
            `;
            backFace.querySelector('.speaker-button').addEventListener('click', (e) => {
                e.stopPropagation();
                speakText(card.answer);
            });

            cardDiv.appendChild(frontFace);
            cardDiv.appendChild(backFace);
            cardContainer.appendChild(cardDiv);
            return cardContainer;
        }

        async function handleGenerateFlashcards() {
            const topic = topicInput.value.trim();
            if (!topic) {
                showMessage("Please enter a topic to generate flashcards.", "error");
                return;
            }

            generateButton.disabled = true;
            generateButtonText.classList.add('hidden');
            generateButtonSpinner.classList.remove('hidden');
            loadingIndicator.classList.remove('hidden');
            flashcardsContainer.innerHTML = ''; // Clear previous flashcards
            noFlashcardsMessage.classList.add('hidden');


            const prompt = `Generate 20 flashcards on the topic: "${topic}".
Each flashcard must have a concise 'question' and a concise 'answer'.
The questions should be thought-provoking and cover key aspects of the topic.
The answers should be informative and directly address the questions.
Provide the output as a valid JSON array of objects, where each object has a 'question' (string) and 'answer' (string) key.
Example: [{"question": "What is photosynthesis?", "answer": "The process by which green plants use sunlight, water, and carbon dioxide to create their own food."}]`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                question: { type: "STRING" },
                                answer: { type: "STRING" }
                            },
                            required: ["question", "answer"]
                        }
                    }
                }
            };
            
            const userApiKey = apiKeyInput.value.trim();
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userApiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("API Error:", errorData);
                    throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const rawJson = result.candidates[0].content.parts[0].text;
                    try {
                        const parsedFlashcards = JSON.parse(rawJson);
                        if (Array.isArray(parsedFlashcards) && parsedFlashcards.every(fc => fc.question && fc.answer)) {
                            parsedFlashcards.slice(0, 20).forEach((card, index) => {
                                const cardElement = createFlashcardElement(card, index);
                                flashcardsContainer.appendChild(cardElement);
                            });
                            if(parsedFlashcards.length === 0) {
                                noFlashcardsMessage.classList.remove('hidden');
                                noFlashcardsMessage.querySelector('p').textContent = `No flashcards could be generated for "${topic}". Try a different topic or be more specific.`;
                            }
                        } else {
                            throw new Error("Generated data is not in the expected flashcard format.");
                        }
                    } catch (e) {
                        console.error("JSON Parsing Error:", e, "Raw JSON:", rawJson);
                        throw new Error("Failed to parse flashcard data from AI. The format might be incorrect. Check console for details.");
                    }
                } else {
                    console.error("Unexpected API response structure:", result);
                    throw new Error("No flashcard content received from AI. The response might be empty or malformed.");
                }
            } catch (err) {
                console.error("Error generating flashcards:", err);
                showMessage(err.message || "An unknown error occurred while generating flashcards.", "error");
                noFlashcardsMessage.classList.remove('hidden');
                noFlashcardsMessage.querySelector('p').textContent = `Could not generate flashcards for "${topic}". ${err.message}`;
            } finally {
                generateButton.disabled = false;
                generateButtonText.classList.remove('hidden');
                generateButtonSpinner.classList.add('hidden');
                loadingIndicator.classList.add('hidden');
                if (flashcardsContainer.children.length === 0 && !document.querySelector('.message-box.error')) {
                     noFlashcardsMessage.classList.remove('hidden');
                     noFlashcardsMessage.querySelector('p').textContent = `No flashcards were generated for "${topic}". Try again or use a different topic.`;
                }
            }
        }

        generateButton.addEventListener('click', handleGenerateFlashcards);
        topicInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleGenerateFlashcards();
            }
        });

        // Initial state for no flashcards message
        noFlashcardsMessage.classList.remove('hidden');
