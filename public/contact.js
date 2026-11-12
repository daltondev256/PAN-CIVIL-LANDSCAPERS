document.addEventListener('DOMContentLoaded', () => {
    const year = document.getElementById('current-year-footer');
    if (year) year.textContent = new Date().getFullYear();

    const form = document.getElementById('pancivilContactForm');
    const feedback = document.getElementById('formFeedback');
    if (!form || !feedback) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const payload = {
            name: document.getElementById('clientName').value.trim(),
            email: document.getElementById('clientEmail').value.trim(),
            phone: document.getElementById('clientPhone').value.trim(),
            service: document.getElementById('serviceSelect').value,
            message: document.getElementById('clientMessage').value.trim()
        };
        if (!payload.name || !payload.email || !payload.message) {
            show('Please complete your name, email and message.', 'error');
            return;
        }
        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.textContent = 'Sending…';
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: payload.name,
                    email: payload.email,
                    phone: payload.phone,
                    message: `Service: ${payload.service}\n\n${payload.message}`
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Unable to send your request.');
            show('Thank you. Your inquiry has been received.', 'success');
            form.reset();
        } catch (error) {
            show(error.message, 'error');
        } finally {
            submit.disabled = false;
            submit.textContent = 'Submit Request';
        }
    });

    function show(message, type) {
        feedback.textContent = message;
        feedback.className = `form-alert alert-${type}`;
        feedback.style.display = 'block';
    }
});
