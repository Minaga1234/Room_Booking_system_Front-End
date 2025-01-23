// DOM Elements
const chatToggleButton = document.getElementById("chat-toggle-button");
const chatWrapper = document.getElementById("chat-wrapper");
const chatGreeting = document.getElementById("chat-widget-greeting");
const chatCloseButton = document.getElementById("chat-close-button");
const chatBody = document.getElementById("chat-body");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatStartContainer = document.getElementById("chat-start-container");
const chatInterface = document.getElementById("chat-interface");
const chatStartButton = document.getElementById("chat-start");

// Show greeting message on load
window.addEventListener("load", () => {
  if (chatGreeting) {
    chatGreeting.style.display = "block";
    setTimeout(() => {
      chatGreeting.style.display = "none";
    }, 5000); // Hide after 5 seconds
  }
});

// Toggle Chatbot visibility
chatToggleButton.addEventListener("click", () => {
  if (chatWrapper.classList.contains("hidden")) {
    chatWrapper.classList.remove("hidden");
    chatWrapper.style.display = "flex"; // Ensure wrapper is visible
    chatStartContainer.style.display = "block"; // Show welcome section
    chatInterface.style.display = "none"; // Ensure chat interface is hidden
  } else {
    chatWrapper.classList.add("hidden");
    chatWrapper.style.display = "none"; // Hide the wrapper
    chatStartContainer.style.display = "none"; // Hide the welcome section
    chatInterface.style.display = "none"; // Ensure chat interface is hidden
  }
});

// Transition from Welcome Section to Chat Interface
chatStartButton.addEventListener("click", () => {
  chatStartContainer.style.display = "none"; // Hide the welcome section
  chatInterface.style.display = "flex"; // Show the chat interface
});

// Close Chatbot
chatCloseButton.addEventListener("click", () => {
  chatWrapper.classList.add("hidden");
  chatWrapper.style.display = "none"; // Hide the wrapper
  chatStartContainer.style.display = "none"; // Hide the welcome section
  chatInterface.style.display = "none"; // Hide the chat interface
});

// Append message to chat body
function appendMessage(sender, message) {
  const messageElement = document.createElement("div");
  messageElement.className = sender === "user" ? "user-message" : "bot-message";
  messageElement.textContent = message;
  chatBody.appendChild(messageElement);
  chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll to the latest message
}

// Show typing indicator
function showTypingIndicator() {
  const typingElement = document.createElement("div");
  typingElement.className = "typing-indicator";
  typingElement.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  chatBody.appendChild(typingElement);
  chatBody.scrollTop = chatBody.scrollHeight;
  return typingElement;
}

// Remove typing indicator
function removeTypingIndicator(element) {
  if (element) {
    chatBody.removeChild(element);
  }
}

// Simulate a bot response
async function simulateBotResponse() {
  const typingIndicator = showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator(typingIndicator);
    appendMessage("bot", "Here’s a response from the bot!");
  }, 2000); // Simulate typing delay
}

// Send message and handle user input
sendButton.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (message) {
    appendMessage("user", message);
    userInput.value = ""; // Clear input field

    // Show typing indicator and simulate bot response
    const typingIndicator = showTypingIndicator();

    try {
      const response = await sendToBackend(message);
      removeTypingIndicator(typingIndicator);
      appendMessage("bot", response.response);
    } catch (error) {
      removeTypingIndicator(typingIndicator);
      appendMessage("bot", "Oops! Something went wrong. Please try again later.");
    }
  }
});

// Enable sending messages with the Enter key
userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendButton.click();
  }
});

// Send a message to the backend and fetch the response
async function sendToBackend(message) {
  const BACKEND_URL = "http://127.0.0.1:8000/chatbot/";

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from backend");
    }

    return await response.json();
  } catch (error) {
    console.error("Error communicating with the backend:", error);
    throw error;
  }
}