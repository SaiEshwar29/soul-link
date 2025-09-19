// script.js - The ONLY script file you need for site-wide logic

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initialize Supabase Client (Moved Inside) ---
    // This now runs only after the Supabase library is loaded
    const SUPABASE_URL = 'https://qvocyxwvlazbvpdsppsa.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b2N5eHd2bGF6YnZwZHNwcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDkzNDgsImV4cCI6MjA3Mzc4NTM0OH0.8EoOG5KMG4HYX4j2jrNOQnlJFzHJwfdAYF1D3Rj7dds';
    
    // Check if the supabase object exists before trying to use it
    if (typeof supabase === 'undefined') {
        console.error('Supabase library is not loaded!');
        return; // Stop the script if Supabase isn't loaded
    }
    
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- 2. Handle User Login State (Lock/Unlock Features on Homepage) ---
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
    // Only run this auth check if we are on the homepage (where mentorBlock exists)
    if (document.getElementById('mentorBlock')) {
        handleAuthStateChange();
    }


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

    // --- 4. Mentor & Chatbot Modal Logic (for Homepage) ---
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
    // ... (Your other modal/chatbot logic can go here) ...


    // --- 5. Auth Page Logic (Login/Signup Forms & Tabs) ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const formStatus = document.getElementById('form-status');
    const showLoginBtn = document.getElementById('show-login');
    const showSignupBtn = document.getElementById('show-signup');

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            formStatus.textContent = 'Creating account...';
            const email = signupForm.querySelector('#signup-email').value;
            const password = signupForm.querySelector('#signup-password').value;
            const { error } = await supabaseClient.auth.signUp({ email, password });
            if (error) {
                formStatus.textContent = `Error: ${error.message}`;
            } else {
                formStatus.textContent = 'Success! Please check your email for a confirmation link.';
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