document.addEventListener('DOMContentLoaded', () => {
  const chatWindow = document.getElementById('chat-window');
  const chatHeader = document.querySelector('.chat-header');
  const closeButton = document.getElementById('chat-close-btn');
  const chatInput = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');
  const chatForm = document.getElementById('chat-form');
  const sendButton = document.getElementById('chat-send-btn');
  if (!chatWindow || !chatHeader || !chatInput || !chatBody || !chatForm || !sendButton) return;

  const history = [];
  let busy = false;

  function appendMessage(message, sender) {
    const item = document.createElement('div');
    item.className = 'chat-message ' + sender;
    item.textContent = message;
    chatBody.appendChild(item);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function setMinimized(minimized) {
    chatWindow.classList.toggle('minimized', minimized);
    if (closeButton) {
      closeButton.textContent = minimized ? '+' : '×';
      closeButton.setAttribute('aria-label', minimized ? 'Expand chat' : 'Minimize chat');
    }
  }

  async function sendMessage(message = chatInput.value) {
    const value = String(message || '').trim();
    if (!value || busy) return;
    appendMessage(value, 'user');
    history.push({ role: 'user', content: value.slice(0, 1500) });
    chatInput.value = '';
    busy = true;
    sendButton.disabled = true;
    sendButton.setAttribute('aria-busy', 'true');
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'The assistant is temporarily unavailable. Please contact our team.');
      }
      const reply = typeof data.reply === 'string' ? data.reply.trim() : '';
      if (!reply) throw new Error('The assistant returned an empty response. Please try again.');
      appendMessage(reply, 'bot');
      history.push({ role: 'assistant', content: reply.slice(0, 1500) });
    } catch (error) {
      appendMessage(error.message || 'I could not connect just now. Please use the Contact page or call our team.', 'bot');
      history.pop();
    } finally {
      busy = false;
      sendButton.disabled = false;
      sendButton.removeAttribute('aria-busy');
      sendButton.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i>';
      chatInput.focus();
    }
  }

  chatForm.addEventListener('submit', event => {
    event.preventDefault();
    sendMessage();
  });
  chatHeader.addEventListener('click', () => setMinimized(!chatWindow.classList.contains('minimized')));
  if (closeButton) closeButton.addEventListener('click', event => {
    event.stopPropagation();
    setMinimized(!chatWindow.classList.contains('minimized'));
  });
  window.sendQuickReply = sendMessage;
});