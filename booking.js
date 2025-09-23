// In booking.js
bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 
    formStatus.textContent = 'Booking your appointment...';
    formStatus.style.color = 'blue';

    // Get the user's complete session, which includes the access token
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        formStatus.textContent = 'Error: You must be logged in to book.';
        formStatus.style.color = 'red';
        return;
    }
    
    const studentId = document.getElementById('student-id').value;
    const counsellorName = document.getElementById('counsellor').value;
    const appointmentTime = document.getElementById('appointment-time').value;
    
    try {
        const response = await fetch('/api/book-appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // This is the crucial new line that proves who the user is
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                // We no longer need to send user_id, the server will get it from the token
                student_id: studentId,
                counsellor_name: counsellorName,
                appointment_time: appointmentTime
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'An unknown error occurred.');
        }

        formStatus.textContent = 'Success! Your appointment is booked.';
        formStatus.style.color = 'green';
        bookingForm.reset();

    } catch (error) {
        console.error('Booking Error:', error);
        formStatus.textContent = `Error: An error occurred. ${error.message}`;
        formStatus.style.color = 'red';
    }
});