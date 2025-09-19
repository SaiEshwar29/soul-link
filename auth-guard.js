// auth-guard.js - Protects pages from non-logged-in users

const SUPABASE_URL = 'https://qvocyxwvlazbvpdsppsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b2N5eHd2bGF6YnZwZHNwcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDkzNDgsImV4cCI6MjA3Mzc4NTM0OH0.8EoOG5KMG4HYX4j2jrNOQnlJFzHJwfdAYF1D3Rj7dds';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    // If there is no active session, redirect to the login page
    if (!session) {
        window.location.href = '/auth.html';
    }
}

// Run the check as soon as the script loads
checkAuth();