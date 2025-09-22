// script.js - Main script for your website

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initialize Supabase Client ---
    const SUPABASE_URL = 'https://qvocyxwvlazbvpdsppsa.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b2N5eHd2bGF6YnZwZHNwcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDkzNDgsImV4cCI6MjA3Mzc4NTM0OH0.8EoOG5KMG4HYX4j2jrNOQnlJFzHJwfdAYF1D3Rj7dds';
    
    if (typeof supabase === 'undefined') {
        console.error('Supabase library is not loaded!');
        return;
    }
    
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- 2. Handle User Login State (Lock/Unlock Features) ---
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

            const redirectToAuth = () => { window.location.href = '/auth.html'; };
            if (mentorBlock) mentorBlock.addEventListener('click', redirectToAuth);
            if (chatbotBlock) chatbotBlock.addEventListener('click', redirectToAuth);

            if (navRightGroup) {
                navRightGroup.innerHTML = '<a href="auth.html"><button class="nav-button">Login</button></a>';
            }
        }
    }
    handleAuthStateChange();

    // --- 3. Navbar Dropdown Logic ---
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (menuToggle && dropdownMenu) {
        menuToggle.addEventListener('click', (event) => {
            dropdownMenu.classList.toggle('show');
            event.stopPropagation();
        });
        document.addEventListener('click', (event) => {
            if (dropdownMenu.classList.contains('show') && !menuToggle.contains(event.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // --- 4. Mentor & Chatbot Modal/Window Logic ---
    // Mentor Block
    const mentorBlock = document.getElementById('mentorBlock');
    const fullscreenMentor = document.getElementById('fullscreenMentor');
    const closeMentorButton = document.getElementById('closeMentor');
    if (mentorBlock && fullscreenMentor && closeMentorButton) {
        mentorBlock.addEventListener('click', () => {
            if (!mentorBlock.classList.contains('locked')) {
                fullscreenMentor.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
        closeMentorButton.addEventListener('click', () => {
            fullscreenMentor.classList.remove('show');
            document.body.style.overflow = 'auto';
        });
    }

    // Chatbot Block
    const chatbotBlock = document.getElementById('chatbotBlock');
    const closeChatButton = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    if (chatbotBlock && closeChatButton) {
        chatbotBlock.addEventListener('click', () => {
            if (!chatbotBlock.classList.contains('locked')) {
                chatbotBlock.classList.add('expanded');
                document.body.style.overflow = 'hidden';
            }
        });
        closeChatButton.addEventListener('click', (event) => {
            event.stopPropagation();
            chatbotBlock.classList.remove('expanded');
            document.body.style.overflow = 'auto';
        });
    }

    // --- 5. Chatbot Send Message Logic ---
    let chatHistory = [];
    const sendMessage = async () => {
        if (!chatInput) return;
        const messageText = chatInput.value.trim();
        if (messageText === "") return;
        
        const sentMessageDiv = document.createElement('div');
        sentMessageDiv.classList.add('message', 'sent');
        sentMessageDiv.textContent = messageText;
        chatMessages.appendChild(sentMessageDiv);
        
        chatHistory.push({ role: "user", parts: [{ text: messageText }] });
        const currentMessage = chatInput.value;
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentMessage, history: chatHistory }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const botResponse = data.response;
            
            const botResponseDiv = document.createElement('div');
            botResponseDiv.classList.add('message', 'received');
            botResponseDiv.textContent = botResponse;
            chatMessages.appendChild(botResponseDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            chatHistory.push({ role: "model", parts: [{ text: botResponse }] });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    if (sendMessageButton) sendMessageButton.addEventListener('click', sendMessage);
    if (chatInput) chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessage();
    });

    // --- 6. Auth Page Logic (Login/Signup Forms & Tabs) ---
    // (This part of the script runs on auth.html)
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const formStatus = document.getElementById('form-status');
    const showLoginBtn = document.getElementById('show-login');
    const showSignupBtn = document.getElementById('show-signup');
    if (signupForm) { /* ... auth form logic ... */ }
    if (loginForm) { /* ... auth form logic ... */ }
    if (showLoginBtn) { /* ... tab logic ... */ }
});