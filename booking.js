// booking.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initialize Supabase Client ---
    const SUPABASE_URL = 'https://qvocyxwvlazbvpdsppsa.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b2N5eHd2bGF6YnZwZHNwcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDkzNDgsImV4cCI6MjA3Mzc4NTM0OH0.8EoOG5KMG4HYX4j2jrNOQnlJFzHJwfdAYF1D3Rj7dds';
    
    // This check can be removed if you are certain the main supabase library is loaded first
    if (typeof supabase === 'undefined') { 
        console.error('Supabase library not loaded!');
        return;
    }
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- 2. Get Form Elements ---
    const bookingForm = document.getElementById('booking-form');
    const formStatus = document.getElementById('form-status');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            formStatus.textContent = 'Booking your appointment...';
            formStatus.style.color = 'blue';

            // --- 3. Get the Logged-In User ---
            const { data: { user } } = await supabaseClient.auth.getUser();

            if (!user) {
                formStatus.textContent = 'Error: You must be logged in to book.';
                formStatus.style.color = 'red';
                return;
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
                        user_id: user.id,
                        student_id: studentId,
                        counsellor_name: counsellorName,
                        appointment_time: appointmentTime
                    }),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'An unknown error occurred.');
                }

                // --- 6. Show a success message ---
                formStatus.textContent = 'Success! Your appointment is booked.';
                formStatus.style.color = 'green';
                bookingForm.reset();

            } catch (error) {
                // --- 7. Show an error message ---
                console.error('Booking Error:', error);
                formStatus.textContent = `Error: An error occurred. ${error.message}`;
                formStatus.style.color = 'red';
            }
        });
    }
});