// forum.js - Logic for the peer support forum

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Supabase Client
    const SUPABASE_URL = 'https://qvocyxwvlazbvpdsppsa.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b2N5eHd2bGF6YnZwZHNwcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDkzNDgsImV4cCI6MjA3Mzc4NTM0OH0.8EoOG5KMG4HYX4j2jrNOQnlJFzHJwfdAYF1D3Rj7dds';
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 2. Get HTML Elements
    const postsList = document.getElementById('posts-list');
    const newPostForm = document.getElementById('new-post-form');
    const postStatus = document.getElementById('post-status');

    // --- Function to Fetch and Display Posts ---
    async function fetchPosts() {
        // Fetch posts from the database, newest first
        const { data, error } = await supabaseClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            postsList.innerHTML = '<p>Could not fetch posts at this time.</p>';
            return;
        }

        if (data && data.length > 0) {
            postsList.innerHTML = ''; // Clear loading message
            for (const post of data) {
                const postElement = document.createElement('div');
                postElement.classList.add('post-item');
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 150)}...</p>
                    <span>Posted on: ${new Date(post.created_at).toLocaleDateString()}</span>
                `;
                postsList.appendChild(postElement);
            }
        } else {
            postsList.innerHTML = '<p>No posts yet. Be the first to share!</p>';
        }
    }

    // --- Function to Handle New Post Submission ---
    if (newPostForm) {
        newPostForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            postStatus.textContent = 'Submitting...';

            // Get the current user
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) {
                postStatus.textContent = 'You must be logged in to post.';
                return;
            }

            // Get form data
            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;

            // Insert new post into the database
            const { error } = await supabaseClient
                .from('posts')
                .insert([{ title, content, user_id: user.id }]);
            
            if (error) {
                console.error('Error creating post:', error);
                postStatus.textContent = `Error: ${error.message}`;
            } else {
                postStatus.textContent = 'Post created successfully!';
                newPostForm.reset();
                fetchPosts(); // Refresh the posts list
            }
        });
    }

    // Initial load of posts
    fetchPosts();
});