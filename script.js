// Wait for the entire page to load before running any script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Navbar Dropdown Logic (for all pages) ---
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', (event) => {
            dropdownMenu.classList.toggle('show');
            event.stopPropagation(); // Stop click from closing menu immediately
        });

        // Close dropdown if clicking anywhere else on the page
        document.addEventListener('click', (event) => {
            if (dropdownMenu.classList.contains('show') && !menuToggle.contains(event.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // --- 2. Mentor Block Logic (for index.html) ---
    const mentorBlock = document.getElementById('mentorBlock');
    const fullscreenMentor = document.getElementById('fullscreenMentor');
    const closeMentorButton = document.getElementById('closeMentor');

    if (mentorBlock && fullscreenMentor && closeMentorButton) {
        // Click the block to open the fullscreen view
        mentorBlock.addEventListener('click', () => {
            fullscreenMentor.classList.add('show');
            document.body.style.overflow = 'hidden'; // Stop page scrolling
        });

        // Click the 'X' to close the fullscreen view
        closeMentorButton.addEventListener('click', () => {
            fullscreenMentor.classList.remove('show');
            document.body.style.overflow = 'auto'; // Re-enable page scrolling
        });
    }

    // --- 3. Chatbot Logic (for index.html) ---
    const chatbotBlock = document.getElementById('chatbotBlock');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatButton = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    if (chatbotBlock && closeChatButton && chatInput && chatMessages) {
        
        // Click the block to expand the chat
        chatbotBlock.addEventListener('click', (event) => {
            // Only expand if it's not already expanded
            if (!chatbotBlock.classList.contains('expanded')) {
                chatbotBlock.classList.add('expanded');
                document.body.style.overflow = 'hidden'; // Stop page scrolling
                chatInput.focus(); // Automatically focus the text input
            }
        });

        // Click the 'X' to close the chat
        closeChatButton.addEventListener('click', (event) => {
            event.stopPropagation(); // IMPORTANT: Stops the click from bubbling up to chatbotBlock
            chatbotBlock.classList.remove('expanded');
            document.body.style.overflow = 'auto'; // Re-enable page scrolling
        });

        // --- Chat Send Message Functionality ---
        // This is inside your "3. Chatbot Logic" block in script.js

        // We need a variable to store the chat history
        let chatHistory = [];

        const sendMessage = async () => { // Make the function "async"
            const messageText = chatInput.value.trim();
            if (messageText === "") return;

            // 1. Add the user's message to the chat UI
            const sentMessageDiv = document.createElement('div');
            sentMessageDiv.classList.add('message', 'sent');
            sentMessageDiv.textContent = messageText;
            chatMessages.appendChild(sentMessageDiv);

            // 2. Add the user's message to our history variable
            chatHistory.push({
              role: "user",
              parts: [{ text: messageText }],
            });

            const currentMessage = chatInput.value; // Store it before clearing
            chatInput.value = ''; // Clear the input field
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                // 3. Send the new message AND the history to your backend
                const response = await fetch('/api/chat', { // This calls your new backend!
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: currentMessage,
                        history: chatHistory, // Send the whole history
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const botResponse = data.response;

                // 4. Add the bot's response to the chat UI
                const botResponseDiv = document.createElement('div');
                botResponseDiv.classList.add('message', 'received');
                botResponseDiv.textContent = botResponse;
                chatMessages.appendChild(botResponseDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // 5. Add the bot's response to our history variable
                chatHistory.push({
                  role: "model",
                  parts: [{ text: botResponse }],
                });

            } catch (error) {
                console.error("Error sending message:", error);
                const errorDiv = document.createElement('div');
                errorDiv.classList.add('message', 'received');
                errorDiv.textContent = "Sorry, I'm having trouble connecting. Please try again.";
                chatMessages.appendChild(errorDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        };

        // These two listeners (click and Enter) stay exactly the same
        sendMessageButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // --- 4. Auth Page Toggle Logic (for auth.html) ---
    const showLoginBtn = document.getElementById('show-login');
    const showSignupBtn = document.getElementById('show-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (showLoginBtn && showSignupBtn && loginForm && signupForm) {
        
        showLoginBtn.addEventListener('click', () => {
            // Show login form
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            
            // Set login button to active
            showLoginBtn.classList.add('active');
            showSignupBtn.classList.remove('active');
        });

        showSignupBtn.addEventListener('click', () => {
            // Show signup form
            loginForm.classList.remove('active');
            signupForm.classList.add('active');

            // Set signup button to active
            showLoginBtn.classList.remove('active');
            showSignupBtn.classList.add('active');
        });

        // Check URL on page load (e.g., auth.html#signup)
        const currentHash = window.location.hash;
        if (currentHash === '#signup') {
            showSignupBtn.click(); // Automatically click the "Sign Up" tab
        } else {
            showLoginBtn.click(); // Default to showing the "Login" tab
        }
    }

});