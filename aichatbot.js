document.addEventListener('DOMContentLoaded', () => {
  const chatWindow = document.getElementById('chat-window');
  const chatHeader = document.querySelector('.chat-header');
  const closeButton = document.getElementById('chat-close-btn');
  const chatInput = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');
  const chatForm = document.getElementById('chat-form');
  const sendButton = document.getElementById('chat-send-btn');
  if (!chatWindow || !chatHeader || !chatInput || !chatBody) return;

  const knowledge = [
    { words: ['quote', 'price', 'cost', 'estimate'], answer: "You can request a free estimate on our <a href='contact.html'>Get a Quote</a> page." },
    { words: ['lawn', 'mow', 'cutting', 'maintenance'], answer: 'We offer weekly and bi-weekly lawn maintenance for residential and commercial spaces.' },
    { words: ['hardscape', 'patio', 'walkway', 'construction'], answer: 'Our hardscape services include custom patios, retaining walls, paths and stone construction.' },
    { words: ['plant', 'tree', 'garden', 'flowers'], answer: 'We provide seasonal planting and garden care suited to local conditions.' },
    { words: ['contact', 'phone', 'email', 'reach'], answer: "Visit our <a href='contact.html'>Contact page</a> to reach our team." }
  ];

  function appendMessage(message, sender, trustedHtml = false) {
    const item = document.createElement('div');
    item.className = 'chat-message ' + sender;
    if (trustedHtml) item.innerHTML = message;
    else item.textContent = message;
    chatBody.appendChild(item);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function reply(message) {
    const text = message.toLowerCase();
    const found = knowledge.find(entry => entry.words.some(word => text.includes(word)));
    const answer = found ? found.answer : "Thanks for your message. Please send your project details through our <a href='contact.html'>Contact page</a>.";
    window.setTimeout(() => appendMessage(answer, 'bot', true), 350);
  }

  function sendMessage(message = chatInput.value) {
    const value = String(message || '').trim();
    if (!value) return;
    appendMessage(value, 'user');
    chatInput.value = '';
    reply(value);
  }

  if (chatForm) chatForm.addEventListener('submit', event => {
    event.preventDefault();
    sendMessage();
  });
  if (sendButton && !chatForm) sendButton.addEventListener('click', () => sendMessage());
  chatHeader.addEventListener('click', () => {
    chatWindow.classList.toggle('minimized');
    if (closeButton) closeButton.textContent = chatWindow.classList.contains('minimized') ? '+' : '×';
  });
  if (closeButton) closeButton.addEventListener('click', event => event.stopPropagation());
  window.sendQuickReply = sendMessage;
});