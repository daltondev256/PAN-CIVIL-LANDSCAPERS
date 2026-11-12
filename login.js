document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const feedback = document.getElementById('loginFeedback');
  const button = document.getElementById('loginButton');
  const password = document.getElementById('password');

  document.getElementById('togglePassword').addEventListener('click', event => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    event.currentTarget.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    event.currentTarget.innerHTML = visible ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  });

  fetch('/api/auth/me', { credentials: 'same-origin' })
    .then(response => response.ok ? window.location.replace('dashboard.html') : null)
    .catch(() => {});

  form.addEventListener('submit', async event => {
    event.preventDefault();
    feedback.hidden = true;
    button.disabled = true;
    button.textContent = 'Signing in…';
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('email').value.trim(),
          password: password.value
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sign in failed.');
      window.location.replace('dashboard.html');
    } catch (error) {
      feedback.textContent = error.message || 'Unable to sign in. Please try again.';
      feedback.hidden = false;
      password.value = '';
      password.focus();
    } finally {
      button.disabled = false;
      button.textContent = 'Sign in securely';
    }
  });
});
