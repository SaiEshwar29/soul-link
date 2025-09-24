// auth-guard.js
// This script's only job is to protect a page from non-logged-in users.

(async () => {
    // This check waits for the Supabase client to be ready
    // It's important for pages where this might be the first script to run.
    while (typeof supabaseClient === 'undefined') {
        await new Promise(res => setTimeout(res, 50));
    }
    
    // Get the current user's session from Supabase
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    // If there is no active session (meaning the user is not logged in),
    // immediately redirect them to the login page.
    if (!session) {
        window.location.href = '/auth.html';
    }
})();