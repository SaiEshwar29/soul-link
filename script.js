// script.js - Main script for your website

// --- 1. Initialize Supabase Client ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Paste your Project URL here
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Paste your anon public Project API Key here

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


// Wait for the page to load before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- 2. Handle User Login State (Lock/Unlock Features) ---
    async function handleAuthStateChange() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        const mentorBlock = document.getElementById('mentorBlock');
        const chatbotBlock = document.getElementById('chatbotBlock');
        const navRightGroup = document.querySelector('.nav-right-group');

        if (session) {
            // --- USER IS LOGGED IN ---
            // 1. Unlock feature blocks
            if (mentorBlock) mentorBlock.classList.remove('locked');
            if (chatbotBlock) chatbotBlock.classList.remove('locked');
            
            // 2. Change "Login" button to a "Logout" button in the navbar
            if (navRightGroup) {
                navRightGroup.innerHTML = '<button id="logout-button" class="nav-button">Logout</button>';
                
                // Add click event for the new logout button
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.addEventListener('click', async () => {
                        await supabaseClient.auth.signOut();
                        window.location.reload(); // Reload the page to lock features
                    });
                }
            }

        } else {
            // --- USER IS LOGGED OUT ---
            // 1. Lock feature blocks (this is the default state in the HTML)
            if (mentorBlock) mentorBlock.classList.add('locked');
            if (chatbotBlock) chatbotBlock.classList.add('locked');

            // 2. Make locked blocks redirect to the login page on click
            const redirectToAuth = () => { window.location.href = '/auth.html'; };
            if (mentorBlock) mentorBlock.addEventListener('click', redirectToAuth);
            if (chatbotBlock) chatbotBlock.addEventListener('click', redirectToAuth);

            // 3. Ensure the "Login" button is shown in the navbar
            if (navRightGroup) {
                navRightGroup.innerHTML = '<a href="auth.html"><button class="nav-button">Login</button></a>';
            }
        }
    }
    // Run the auth check when the page loads
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
    // This code still handles opening the windows, but only if they are unlocked
    
    // Mentor Block
    const mentorBlock = document.getElementById('mentorBlock');
    const fullscreenMentor = document.getElementById('fullscreenMentor');
    const closeMentorButton = document.getElementById('closeMentor');
    if (mentorBlock && fullscreenMentor && closeMentorButton) {
        mentorBlock.addEventListener('click', () => {
            // Only open if NOT locked
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

    // Chatbot
    const chatbotBlock = document.getElementById('chatbotBlock');
    const closeChatButton = document.getElementById('closeChat');
    if (chatbotBlock && closeChatButton) {
        chatbotBlock.addEventListener('click', () => {
            // Only open if NOT locked
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
    
    // Note: The sendMessage logic for the chatbot is now in its own part of the code
    // This is just for opening/closing the window
});