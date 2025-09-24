// forum.js - Updated with modal logic

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize Supabase Client ---
    // (This uses the 'supabaseClient' variable from supabaseClient.js)

    // --- Get HTML Elements ---
    const postsList = document.getElementById('posts-list');
    const newPostForm = document.getElementById('new-post-form');
    const postStatus = document.getElementById('post-status');

    // Modal elements
    const postModal = document.getElementById('post-modal');
    const closeModalButton = document.getElementById('close-modal');
    const modalPostContent = document.getElementById('modal-post-content');
    const modalRepliesList = document.getElementById('modal-replies-list');
    const modalReplyForm = document.getElementById('modal-reply-form');
    const modalReplyStatus = document.getElementById('modal-reply-status');

    // --- Function to Fetch and Display Posts ---
    async function fetchPosts() {
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
            postsList.innerHTML = '';
            for (const post of data) {
                const postElement = document.createElement('div');
                postElement.classList.add('post-item');
                postElement.dataset.id = post.id; // Store the ID on the element
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 150)}...</p>
                    <span>Posted on: ${new Date(post.created_at).toLocaleDateDateString()}</span>
                `;
                postsList.appendChild(postElement);
            }
        } else {
            postsList.innerHTML = '<p>No posts yet. Be the first to share!</p>';
        }
    }
    
    // --- Function to Open and Populate the Modal ---
    async function openPostModal(postId) {
        // Show loading state
        modalPostContent.innerHTML = '<p>Loading post...</p>';
        modalRepliesList.innerHTML = '';
        postModal.classList.add('show');
        
        // Fetch the main post
        const { data: postData, error: postError } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();
        
        if (postError) {
            modalPostContent.innerHTML = '<h2>Error loading post.</h2>';
            return;
        }

        modalPostContent.innerHTML = `
            <h1>${postData.title}</h1>
            <p class="post-meta">Posted on: ${new Date(postData.created_at).toLocaleDateString()}</p>
            <div class="post-content">${postData.content.replace(/\n/g, '<br>')}</div>
        `;

        // Fetch the replies
        fetchReplies(postId);
        
        // Handle reply form submission
        modalReplyForm.onsubmit = async (event) => {
            event.preventDefault();
            const replyContent = document.getElementById('modal-reply-content').value;
            const { data: { user } } = await supabaseClient.auth.getUser();

            const { error: replyError } = await supabaseClient
                .from('replies')
                .insert([{ content: replyContent, user_id: user.id, post_id: postId }]);
            
            if (replyError) {
                modalReplyStatus.textContent = `Error: ${replyError.message}`;
            } else {
                modalReplyForm.reset();
                modalReplyStatus.textContent = '';
                fetchReplies(postId); // Refresh replies
            }
        };
    }

    // --- Function to Fetch Replies for the Modal ---
    async function fetchReplies(postId) {
        const { data, error } = await supabaseClient
            .from('replies')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        modalRepliesList.innerHTML = ''; // Clear previous replies
        if (data) {
            for (const reply of data) {
                const replyElement = document.createElement('div');
                replyElement.classList.add('reply-item');
                replyElement.innerHTML = `<p>${reply.content}</p><span class="reply-meta">Replied on: ${new Date(reply.created_at).toLocaleDateString()}</span>`;
                modalRepliesList.appendChild(replyElement);
            }
        }
    }

    // --- Event Listeners ---
    // Listen for clicks on the list of posts
    postsList.addEventListener('click', (event) => {
        const postItem = event.target.closest('.post-item');
        if (postItem) {
            const postId = postItem.dataset.id;
            openPostModal(postId);
        }
    });

    // Close modal
    closeModalButton.addEventListener('click', () => {
        postModal.classList.remove('show');
    });

    // Close modal if clicking on the overlay
    postModal.addEventListener('click', (event) => {
        if (event.target === postModal) {
            postModal.classList.remove('show');
        }
    });

    // Handle new post form submission (this stays the same)
    if (newPostForm) {
        newPostForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            // ... (Your existing new post submission logic) ...
        });
    }

    // --- Initial Load ---
    fetchPosts();
});