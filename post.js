// post.js - Logic for the single post page

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize Supabase Client ---
    const SUPABASE_URL = 'https://qvocyxwvlazbvpdsppsa.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b2N5eHd2bGF6YnZwZHNwcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDkzNDgsImV4cCI6MjA3Mzc4NTM0OH0.8EoOG5KMG4HYX4j2jrNOQnlJFzHJwfdAYF1D3Rj7dds';
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- Get HTML Elements ---
    const postContainer = document.getElementById('post-container');
    const repliesList = document.getElementById('replies-list');
    const newReplyForm = document.getElementById('new-reply-form');
    const replyStatus = document.getElementById('reply-status');

    // --- Get the Post ID from the URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // --- Fetch and Display the Main Post ---
    async function fetchPost() {
        const { data, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', postId) // Select the post where the id matches
            .single(); // We only expect one result

        if (error || !data) {
            console.error('Error fetching post:', error);
            postContainer.innerHTML = '<h2>Post not found</h2>';
            return;
        }

        postContainer.innerHTML = `
            <h1>${data.title}</h1>
            <p class="post-meta">Posted on: ${new Date(data.created_at).toLocaleDateString()}</p>
            <div class="post-content">
                ${data.content.replace(/\n/g, '<br>')}
            </div>
        `;
    }

    // --- Fetch and Display Replies ---
    async function fetchReplies() {
        const { data, error } = await supabaseClient
            .from('replies')
            .select('*')
            .eq('post_id', postId) // Select replies where post_id matches
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('Error fetching replies:', error);
            return;
        }

        repliesList.innerHTML = ''; // Clear previous replies
        for (const reply of data) {
            const replyElement = document.createElement('div');
            replyElement.classList.add('reply-item');
            replyElement.innerHTML = `
                <p>${reply.content}</p>
                <span class="reply-meta">Replied on: ${new Date(reply.created_at).toLocaleDateString()}</span>
            `;
            repliesList.appendChild(replyElement);
        }
    }

    // --- Handle New Reply Submission ---
    if (newReplyForm) {
        newReplyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            replyStatus.textContent = 'Submitting...';

            const { data: { user } } = await supabaseClient.auth.getUser();
            const content = document.getElementById('reply-content').value;

            const { error } = await supabaseClient
                .from('replies')
                .insert([{ content, user_id: user.id, post_id: postId }]);

            if (error) {
                replyStatus.textContent = `Error: ${error.message}`;
            } else {
                replyStatus.textContent = '';
                newReplyForm.reset();
                fetchReplies(); // Refresh the replies list
            }
        });
    }

    // --- Initial Load ---
    if (postId) {
        fetchPost();
        fetchReplies();
    } else {
        postContainer.innerHTML = '<h2>Error: No post ID provided.</h2>';
    }
});