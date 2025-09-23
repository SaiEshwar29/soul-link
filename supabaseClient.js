// supabaseClient.js
// This file creates the Supabase client one time for your whole site.

const SUPABASE_URL = 'https://qvocyxwvlazbvpdsppsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b2N5eHd2bGF6YnZwZHNwcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDkzNDgsImV4cCI6MjA3Mzc4NTM0OH0.8EoOG5KMG4HYX4j2jrNOQnlJFzHJwfdAYF1D3Rj7dds';

// This checks if the Supabase library has been loaded first
if (typeof supabase === 'undefined') {
    throw new Error('Supabase library is not loaded. Make sure the CDN script tag is included before this script.');
}

const { createClient } = supabase;
// This creates a single, reusable client for all other scripts to use
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);