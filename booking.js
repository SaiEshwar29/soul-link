document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initialize Supabase Client ---
    const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Paste your Project URL here
    const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Paste your anon public Project API Key here
    
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- 2. Get Form Elements ---
    const bookingForm = document.getElementById('booking-form');
    const formStatus = document.getElementById('form-status');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Stop the form from reloading the page

            formStatus.textContent = 'Booking your appointment...';
            formStatus.style.color = 'blue';

            // --- 3. Get the Logged-In User ---
            const { data: { user } } = await supabaseClient.auth.getUser();

            // Check if a user is actually logged in
            if (!user) {
                formStatus.textContent = 'Error: You must be logged in to book.';
                formStatus.style.color = 'red';
                return; // Stop the function if no user is found
            }
            
            // --- 4. Get the rest of the form values ---
            const studentId = document.getElementById('student-id').value;
            const counsellorName = document.getElementById('counsellor').value;
            const appointmentTime = document.getElementById('appointment-time').value;
            
            try {
                // --- 5. Send all data to your secure backend function ---
                const response = await fetch('/api/book-appointment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: user.id, // Send the secure user ID
                        student_id: studentId,
                        counsellor_name: counsellorName,
                        appointment_time: appointmentTime
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    // Throw an error to be caught by the catch block
                    throw new Error(result.message || 'An unknown error occurred.');
                }

                // --- 6. Show a success message ---
                formStatus.textContent = 'Success! Your appointment is booked.';
                formStatus.style.color = 'green';
                bookingForm.reset(); // Clear the form

            } catch (error) {
                // --- 7. Show an error message ---
                console.error('Booking Error:', error);
                formStatus.textContent = `Error: ${error.message}`;
                formStatus.style.color = 'red';
            }
        });
    }
});