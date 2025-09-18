document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('booking-form');
    const formStatus = document.getElementById('form-status');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Stop the form from reloading the page

            // Show a "booking..." message
            formStatus.textContent = 'Booking your appointment...';
            formStatus.style.color = 'blue';

            // 1. Get the values from the form
            const studentId = document.getElementById('student-id').value;
            const counsellorName = document.getElementById('counsellor').value;
            const appointmentTime = document.getElementById('appointment-time').value;
            
            try {
                // 2. Send the data to your secure backend function
                const response = await fetch('/api/book-appointment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
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

                // 3. Show a success message
                formStatus.textContent = 'Success! Your appointment is booked.';
                formStatus.style.color = 'green';
                bookingForm.reset(); // Clear the form

            } catch (error) {
                // 4. Show an error message
                console.error('Booking Error:', error);
                formStatus.textContent = `Error: ${error.message}`;
                formStatus.style.color = 'red';
            }
        });
    }
});