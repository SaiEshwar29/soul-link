// booking.js
document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const formStatus = document.getElementById('form-status');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            formStatus.textContent = 'Booking your appointment...';
            formStatus.style.color = 'blue';

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
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
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
    }
});