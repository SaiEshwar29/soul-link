// 1. Add your Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Paste your Project URL here
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Paste your anon public Project API Key here

// 2. Initialize the Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Get the container where we will display the resources
const resourceGrid = document.getElementById('resource-grid');

// 4. Create a function to fetch and display the resources
async function loadResources() {
    // 5. Fetch the data from the 'resources' table
    const { data, error } = await supabase
        .from('resources')
        .select('*');

    // 6. Handle any errors
    if (error) {
        console.error('Error fetching resources:', error);
        resourceGrid.innerHTML = `<p>Sorry, we couldn't load the resources at this time.</p>`;
        return;
    }

    // 7. If we have data, display it
    if (data) {
        // Clear the "Loading..." message
        resourceGrid.innerHTML = '';

        // Loop through each resource and create an HTML card for it
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
    }
}

// 8. Call the function to run it when the page loads
loadResources();