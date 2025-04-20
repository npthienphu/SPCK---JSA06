export const TMDB_API_KEY = "9b7c3ede447b14c5e0e9d33a137ddac9";

addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    if (window.scrollY === 0) {
      navbar.classList.remove("navbar-background-visible");
    } else {
      navbar.classList.add("navbar-background-visible");
    }
  }
});

// Kiểm tra tình trạng người dùng để hiển thị giỏ hàng và user hiện tại.
window.handleSignOut = () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("cart");
  location.reload();
};

window.signIn = () => {};

//// Nếu người dùng đăng đăng nhập.
if (localStorage.getItem("currentUser")) {
  document.querySelector("#avatar-action-container").innerHTML += /*html*/ `
    <div tabindex="0" class="avatar-action">
      <img src="${`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        JSON.parse(localStorage.getItem("currentUser")).username
      )}`}" />
      <div class="popup">
        <button class="action-button" onclick="handleSignOut()">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span> Logout</span>
        </button>
      </div>
    </div>
  `;
} else {
  document.querySelector("#avatar-action-container").innerHTML += /*html*/ `
    <a style="font-size: 25px" href="./login.html">
      <i class="fa-solid fa-right-to-bracket"></i>
    </a>
  `;
}


///// Lập trình giao diện hiển thị chatbot.
document.body.innerHTML += /*html*/ `
  <button class="chatbot-toggler">
    <span class="material-symbols-rounded">mode_comment</span>
    <span class="material-symbols-outlined">close</span>
  </button>
  <div class="chatbot">
    <header>
      <h2>Chatbot</h2>
      <span class="close-btn material-symbols-outlined">close</span>
    </header>
    <ul class="chatbox">
      <li class="chat incoming">
        <span class="material-symbols-outlined">smart_toy</span>
        <p>Hi there 👋<br />How can I help you today?</p>
      </li>
    </ul>
    <div class="chat-input">
      <textarea
        placeholder="Enter a message..."
        spellcheck="false"
        required
      ></textarea>
      <span id="send-btn" class="material-symbols-rounded">send</span>
    </div>
  </div>

  <!-- Google tag (gtag.js) -->
  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id=G-VNJX66Z0YF"
  ></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-VNJX66Z0YF");
  </script>
`;

const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const API_KEY = ""; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; // return chat <li> element
};

const generateResponse = (chatElement) => {
  // const API_URL = "https://api.openai.com/v1/chat/completions";
  const API_URL =
    "https://openai-proxy.napdev.workers.dev?url=https://api.openai.com/v1/chat/completions";
  const messageElement = chatElement.querySelector("p");

  // Define the properties and message for the API request
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    }),
  };

  // Send POST request to API, get response and set the reponse as paragraph text
  fetch(API_URL, requestOptions)
    .then((res) => res.json())
    .then((data) => {
      messageElement.textContent = data.choices[0].message.content.trim();
    })
    .catch(() => {
      messageElement.classList.add("error");
      messageElement.textContent =
        "Oops! Something went wrong. Please try again.";
    })
    .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};

const handleChat = () => {
  userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
  if (!userMessage) return;

  // Clear the input textarea and set its height to default
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Display "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener("input", () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed without Shift key and the window
  // width is greater than 800px, handle the chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);
chatbotToggler.addEventListener("click", () =>
  document.body.classList.toggle("show-chatbot")
);

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.jikan.moe/v4',
  TIMEOUT: 10000,
  CACHE_DURATION: 3600000, // 1 hour in milliseconds
  RATE_LIMIT: 2, // requests per second
};

// Theme Configuration
export const THEME_CONFIG = {
  PRIMARY_COLOR: '#ff4d4d',
  SECONDARY_COLOR: '#6c5ce7',
  DARK_BG: '#1a1a1a',
  DARK_LIGHT_BG: '#2d2d2d',
  LIGHT_TEXT: '#ffffff',
  GRAY_TEXT: '#808080',
};

// Anime Categories
export const ANIME_CATEGORIES = {
  TRENDING: 'trending',
  POPULAR: 'popular',
  UPCOMING: 'upcoming',
  TOP_RATED: 'top_rated',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'animehub_user_preferences',
  WATCH_HISTORY: 'animehub_watch_history',
  FAVORITES: 'animehub_favorites',
};

// Default User Preferences
export const DEFAULT_PREFERENCES = {
  theme: 'dark',
  language: 'en',
  autoplay: false,
  quality: '720p',
  notifications: true,
};

// Animation Durations
export const ANIMATION_DURATIONS = {
  FADE_IN: 300,
  FADE_OUT: 300,
  SLIDE_IN: 400,
  SLIDE_OUT: 400,
};

// Error Messages
export const ERROR_MESSAGES = {
  API_ERROR: 'Failed to fetch data from the server. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  NOT_FOUND: 'The requested content could not be found.',
  UNAUTHORIZED: 'You need to be logged in to access this feature.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  FAVORITE_ADDED: 'Added to favorites successfully.',
  FAVORITE_REMOVED: 'Removed from favorites successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// User Authentication
export const AUTH_CONFIG = {
  LOGIN_URL: './login.html',
  LOGOUT_URL: './index.html',
  AVATAR_API: 'https://api.dicebear.com/7.x/initials/svg',
};

// Chatbot Configuration
export const CHATBOT_CONFIG = {
  ENABLED: false, // Disable chatbot temporarily
  API_URL: 'https://openai-proxy.napdev.workers.dev',
  MODEL: 'gpt-3.5-turbo',
};
