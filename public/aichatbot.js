document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.getElementById("chat-window");
    const chatCloseBtn = document.getElementById("chat-close-btn");
    const chatHeader = document.querySelector(".chat-header");
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatBody = document.getElementById("chat-body");

    const botKnowledge = [
        { keywords: ["quote", "price", "cost", "estimate"], response: "You can request a free estimate directly on our <a href='contact.html' style='color:#2E7D32; font-weight:bold;'>Get A Quote</a> page!" },
        { keywords: ["lawn", "mow", "cutting", "maintenance"], response: "We offer weekly and bi-weekly premium lawn maintenance schedules for residential and commercial spaces." },
        { keywords: ["hardscape", "patio", "walkway", "construction"], response: "Our hardscape services include custom patios, retaining walls, paths, and structural stone builds." },
        { keywords: ["plant", "tree", "garden", "flowers"], response: "We provide vibrant seasonal planting matched with eco-friendly local soil and weather conditions." },
        { keywords: ["contact", "phone", "email", "reach"], response: "Feel free to visit our <a href='contact.html' style='color:#2E7D32; font-weight:bold;'>Contact Page</a> to reach our team." }
    ];

    // Minimize or expand chat window when clicking the header bar
    chatHeader.addEventListener("click", () => {
        chatWindow.classList.toggle("minimized");
        chatCloseBtn.innerHTML = chatWindow.classList.contains("minimized") ? "&#43;" : "&times;";
    });

    // Send Message Logic
    const handleSend = () => {
        const text = chatInput.value.trim();
        if (text !== "") {
            appendMessage(text, "user");
            chatInput.value = "";
            generateBotResponse(text);
        }
    };

    chatSendBtn.addEventListener("click", handleSend);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSend();
    });

    function appendMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", sender);
        msgDiv.innerHTML = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function generateBotResponse(userInput) {
        const lowerInput = userInput.toLowerCase();
        let match = "Thank you for reaching out! For specific questions, feel free to submit a request on our <a href='contact.html' style='color:#2E7D32; font-weight:bold;'>Contact Page</a>.";

        for (const item of botKnowledge) {
            if (item.keywords.some(keyword => lowerInput.includes(keyword))) {
                match = item.response;
                break;
            }
        }

        setTimeout(() => {
            appendMessage(match, "bot");
        }, 400);
    }

    window.sendQuickReply = function(text) {
        appendMessage(text, "user");
        generateBotResponse(text);
    };
});