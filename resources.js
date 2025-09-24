// resources.js with language filter support

document.addEventListener('DOMContentLoaded', () => {
    // Use existing global client if available; otherwise create one
    let client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;
    if (!client && typeof supabase !== 'undefined') {
        const { createClient } = supabase;
        const SUPABASE_URL = 'https://qvocyxwvlazbvpdsppsa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b2N5eHd2bGF6YnZwZHNwcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDkzNDgsImV4cCI6MjA3Mzc4NTM0OH0.8EoOG5KMG4HYX4j2jrNOQnlJFzHJwfdAYF1D3Rj7dds';
        client = createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    if (!client) {
        console.error('Supabase client not available. Ensure the CDN is loaded before resources.js');
        return;
    }

    const resourceGrid = document.getElementById('resource-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    async function loadResources(language = 'all') {
        resourceGrid.innerHTML = `<p>Loading resources...</p>`;

        let query = client.from('resources').select('*');
        if (language !== 'all') {
            query = query.eq('language', language);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching resources:', error);
            resourceGrid.innerHTML = `<p>Sorry, we couldn't load the resources at this time.</p>`;
            return;
        }

        if (data && data.length > 0) {
            resourceGrid.innerHTML = '';
            for (const resource of data) {
                const resourceCard = document.createElement('div');
                resourceCard.classList.add('resource-card');
                resourceCard.innerHTML = `
                    <span class="resource-type">${resource.type}</span>
                    <h3>${resource.title}</h3>
                    <p>${resource.description}</p>
                    <a href="${resource.link}" target="_blank" class="resource-link">View Resource</a>
                `;
                resourceGrid.appendChild(resourceCard);
            }
        } else {
            resourceGrid.innerHTML = `<p>No resources found for the selected language.</p>`;
        }
    }

    if (filterButtons && filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const selectedLanguage = button.dataset.language;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                loadResources(selectedLanguage);
            });
        });
    }

    loadResources();
});