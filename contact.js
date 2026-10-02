document.addEventListener('DOMContentLoaded', function() {
    
    // Dynamic Copyright Footer Year Setup
    const yearElement = document.getElementById('current-year-contact');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Interactive Form Submit Interceptor Validation
    const formElement = document.getElementById('pancivilContactForm');
    const alertBox = document.getElementById('formFeedback');

    if (formElement) {
        formElement.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Clear previous message states
            alertBox.style.display = 'none';
            alertBox.className = 'form-alert';

            // Grab Form field parameters
            const name = document.getElementById('clientName').value.trim();
            const email = document.getElementById('clientEmail').value.trim();
            const message = document.getElementById('clientMessage').value.trim();

            // Explicit validation rules execution
            if (!name || !email || !message) {
                alertBox.textContent = 'Error: Please fill out all required fields marked with an asterisk (*).';
                alertBox.classList.add('alert-error');
                alertBox.style.display = 'block';
                return;
            }

            if (!validateEmailAddress(email)) {
                alertBox.textContent = 'Error: Please provide a valid email format setup.';
                alertBox.classList.add('alert-error');
                alertBox.style.display = 'block';
                return;
            }

            // Successful Processing Execution Mock
            alertBox.textContent = 'Success! Your landscaping inquiry has been transmitted. We will reply shortly.';
            alertBox.classList.add('alert-success');
            alertBox.style.display = 'block';
            
            // Clear active fields
            formElement.reset();
        });
    }

    // Helper regex engine to analyze address fields
    function validateEmailAddress(targetEmail) {
        const standardPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return standardPattern.test(targetEmail);
    }
});
// Auto Update Legal Footer Copyright Node 
const footerYearNode = document.getElementById('current-year-footer');
if (footerYearNode) {
    footerYearNode.textContent = new Date().getFullYear();
}
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("pancivilContactForm");
    const feedbackDiv = document.getElementById("formFeedback");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Collect form data
            const formData = {
                client_name: document.getElementById("clientName").value.trim(),
                client_email: document.getElementById("clientEmail").value.trim(),
                client_phone: document.getElementById("clientPhone").value.trim(),
                service_profile: document.getElementById("serviceSelect").value,
                client_message: document.getElementById("clientMessage").value.trim()
            };

            // Basic validation
            if (!formData.client_name || !formData.client_email || !formData.client_message) {
                showFeedback("Please fill out all required fields.", "error");
                return;
            }

            try {
                // Example using Supabase Client SDK
                // const { data, error } = await supabase.from('contact_submissions').insert([formData]);
                // if (error) throw error;

                // Simulated Fetch Request to a backend API (Alternative)
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error('Failed to submit message.');

                showFeedback("Thank you! Your message has been sent successfully.", "success");
                contactForm.reset();
            } catch (err) {
                console.error(err);
                showFeedback("An error occurred. Please try again later.", "error");
            }
        });
    }

    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `form-alert ${type}`;
        feedbackDiv.style.display = 'block';
    }
});
