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
  const isHidden = chatWrapper.classList.contains("hidden");
  chatWrapper.classList.toggle("hidden", !isHidden);
  chatWrapper.style.display = isHidden ? "flex" : "none"; // Show or hide wrapper
  chatStartContainer.style.display = isHidden ? "block" : "none"; // Show welcome section
  chatInterface.style.display = isHidden ? "none" : "none"; // Reset chat interface visibility
});

// Transition from Welcome Section to Chat Interface
chatStartButton.addEventListener("click", () => {
  chatStartContainer.style.display = "none"; // Hide welcome section
  chatInterface.style.display = "flex"; // Show chat interface
});

// Close Chatbot
chatCloseButton.addEventListener("click", () => {
  chatWrapper.classList.add("hidden");
  chatWrapper.style.display = "none"; // Hide wrapper
  chatStartContainer.style.display = "none"; // Hide welcome section
  chatInterface.style.display = "none"; // Hide chat interface
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

// Send message and handle user input
sendButton.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (message) {
    appendMessage("user", message);
    userInput.value = ""; // Clear input field

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    try {
      const response = await sendToBackend(message);
      removeTypingIndicator(typingIndicator);
      appendMessage("bot", response.response);
    } catch (error) {
      removeTypingIndicator(typingIndicator);
      appendMessage(
        "bot",
        "Oops! Something went wrong. Please check your connection and try again."
      );
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
  const BACKEND_URL = "http://ibs.lunox.dev/chatbot/";

  try {
    // Debug the CSRF token
    const csrfToken = getCookie("csrftoken");
    console.log(`Using CSRF token: ${csrfToken}`);

    const response = await fetch("http://ibs.lunox.dev/chatbot/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"), // Include CSRF token
      },
      body: JSON.stringify({ message }),
      credentials: "include", // Ensure cookies are included
    });
    
    if (!response.ok) {
      console.error("Backend response error:", await response.text());
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error communicating with the backend:", error);
    throw error;
  }
}

// Function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        console.log(`CSRF token fetched: ${cookieValue}`); // Debugging log
        return cookieValue;
      }
    }
  }
  console.warn("CSRF token not found."); // Debugging log
  return cookieValue;
}
