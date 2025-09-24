// script.js - The ONLY script file you need for site-wide logic


document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initialize Supabase Client ---
    // Prefer shared client from supabaseClient.js; otherwise create a local one (placeholders)
    if (typeof supabaseClient === 'undefined') {
        const SUPABASE_URL = 'YOUR_SUPABASE_URL';
        const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
        if (typeof supabase === 'undefined') {
            console.error('Supabase library is not loaded!');
            return;
        }
        const { createClient } = supabase;
        window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    // In script.js
        
        // --- 7. Google Login Logic (for auth.html) ---
        const googleLoginBtn = document.getElementById('google-login-btn');
        
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', async () => {
                // This one function handles the entire Google login process
                const { error } = await supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + '/checkin.html'
                    }
                });
        
                if (error) {
                    const formStatus = document.getElementById('form-status');
                    formStatus.textContent = `Error: ${error.message}`;
                    formStatus.style.color = 'red';
                }
            });
        }

    // --- 2. Handle User Login State (Sets the visual state) ---
    async function handleAuthStateChange() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        const mentorBlock = document.getElementById('mentorBlock');
        const chatbotBlock = document.getElementById('chatbotBlock');
        const navRightGroup = document.querySelector('.nav-right-group');

        if (session) { // USER IS LOGGED IN
            if (mentorBlock) mentorBlock.classList.remove('locked');
            if (chatbotBlock) chatbotBlock.classList.remove('locked');
            
            if (navRightGroup) {
                navRightGroup.innerHTML = '<button id="logout-button" class="nav-button">Logout</button>';
                document.getElementById('logout-button')?.addEventListener('click', async () => {
                    await supabaseClient.auth.signOut();
                    window.location.reload();
                });
            }
        } else { // USER IS LOGGED OUT
            if (mentorBlock) mentorBlock.classList.add('locked');
            if (chatbotBlock) chatbotBlock.classList.add('locked');

            if (navRightGroup) {
                navRightGroup.innerHTML = '<a href="auth.html"><button class="nav-button">Login</button></a>';
            }
        }
    }
    handleAuthStateChange();

    

    // --- 4. Mentor & Chatbot Click Logic (No Conflicts) ---
    
    // Mentor Block
    const mentorBlock = document.getElementById('mentorBlock');
    if (mentorBlock) {
        mentorBlock.addEventListener('click', () => {
            if (mentorBlock.classList.contains('locked')) {
                // If locked, redirect to login
                window.location.href = '/auth.html';
            } else {
                // If unlocked, redirect to booking page
                window.location.href = '/booking.html';
            }
        });
    }

    // Chatbot Block
    const chatbotBlock = document.getElementById('chatbotBlock');
    const closeChatButton = document.getElementById('closeChat');
    if (chatbotBlock) {
        chatbotBlock.addEventListener('click', () => {
            if (chatbotBlock.classList.contains('locked')) {
                // If locked, redirect to login
                window.location.href = '/auth.html';
            } else {
                // If unlocked, open the chat window
                chatbotBlock.classList.add('expanded');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    if (closeChatButton) {
        closeChatButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (chatbotBlock) {
                chatbotBlock.classList.remove('expanded');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // --- 5. Chatbot Send Message Logic ---
    // (This part stays the same)
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    let chatHistory = [];
	    const sendMessage = async () => {
			if (!chatInput || !chatMessages) return;
			const text = chatInput.value ? chatInput.value.trim() : '';
			if (!text) return;

			// Clear input and render user's message
			chatInput.value = '';
			const userMsg = document.createElement('div');
			userMsg.className = 'message sent';
			userMsg.textContent = text;
			chatMessages.appendChild(userMsg);
			chatMessages.scrollTop = chatMessages.scrollHeight;

			// Track conversation history for the backend
			chatHistory.push({ role: 'user', parts: [{ text }] });

			// Add assistant placeholder
			const placeholder = document.createElement('div');
			placeholder.className = 'message received';
			placeholder.textContent = '...';
			chatMessages.appendChild(placeholder);
			chatMessages.scrollTop = chatMessages.scrollHeight;

			try {
				const res = await fetch('/api/chat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ message: text, history: chatHistory })
				});

				if (!res.ok) {
					throw new Error(`Request failed (${res.status})`);
				}

				const data = await res.json();
				const reply = data.response || 'No response';
				placeholder.textContent = reply;
				chatHistory.push({ role: 'model', parts: [{ text: reply }] });
				chatMessages.scrollTop = chatMessages.scrollHeight;
			} catch (err) {
				placeholder.textContent = `Error: ${err.message}`;
			}
	    };
    if (sendMessageButton) sendMessageButton.addEventListener('click', sendMessage);
    if (chatInput) chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessage();
    });


    // --- 5. Auth Page Logic (Login/Signup Forms & Tabs) ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const formStatus = document.getElementById('form-status');
    const showLoginBtn = document.getElementById('show-login');
    const showSignupBtn = document.getElementById('show-signup');

    // In script.js, replace the existing signupForm block

// In script.js, replace the existing signupForm block

if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formStatus.textContent = 'Creating account...';

        const name = signupForm.querySelector('#signup-name')?.value;
        const email = signupForm.querySelector('#signup-email').value;
        const password = signupForm.querySelector('#signup-password').value;

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { username: name } }
        });

        if (error) {
            formStatus.textContent = `Error: ${error.message}`;
            formStatus.style.color = 'red';
        } else if (data?.user) {
            const createdAt = new Date(data.user.created_at);
            const updatedAt = new Date(data.user.updated_at);
            if (updatedAt.getTime() - createdAt.getTime() > 10000) {
                formStatus.textContent = 'This email is already registered but not yet confirmed. We have resent the confirmation link to your inbox.';
                formStatus.style.color = 'blue';
            } else {
                formStatus.textContent = 'Success! Please check your email for a confirmation link.';
                formStatus.style.color = 'green';
            }
            signupForm.reset();
        }
    });
}


    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            formStatus.textContent = 'Logging in...';
            const email = loginForm.querySelector('#login-email').value;
            const password = loginForm.querySelector('#login-password').value;
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                formStatus.textContent = `Error: ${error.message}`;
                formStatus.style.color = 'red';
            } else {
                window.location.href = '/index.html'; // Redirect on success
            }
        });
    }
    
    // Tab-switching logic
    if (showLoginBtn && showSignupBtn && loginForm && signupForm) {
        showLoginBtn.addEventListener('click', () => {
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            showLoginBtn.classList.add('active');
            showSignupBtn.classList.remove('active');
        });
        showSignupBtn.addEventListener('click', () => {
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
            showLoginBtn.classList.remove('active');
            showSignupBtn.classList.add('active');
        });
        if (window.location.hash === '#signup') {
            showSignupBtn.click();
        } else {
            showLoginBtn.click();
        }
    }
});