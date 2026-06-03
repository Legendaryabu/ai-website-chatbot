// Global execution trackers
let welcomeDisplayed = false;

// Helper to generate current device time string (e.g., "10:42 AM")
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // true 12-hour transformation
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

// FEATURE: Active Chat Display Visibility Toggle
function toggleChat() {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.classList.toggle("hidden");
    
    // Automatically close the tooltip notice popup once widget expands
    closeTooltip();

    if (!chatContainer.classList.contains("hidden")) {
        document.getElementById("message").focus();
        // FEATURE: Asynchronous Proactive Local Welcome Message
        displayWelcomeMessage();
    }
}

// Triggered fallback to dismiss notification tooltips
function closeTooltip() {
    const tooltip = document.getElementById("launcher-tooltip");
    if (tooltip) {
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
    }
}

// Render local non-token welcome string
function displayWelcomeMessage() {
    if (welcomeDisplayed) return; // Prevent duplicates
    
    const chatBox = document.getElementById("chat-box");
    const welcomeHTML = `
        <div class="message-wrapper bot-wrapper">
            <div class="message bot">Hello! Thanks for visiting us today. How can I help you?</div>
            <div class="timestamp">${getCurrentTime()}</div>
        </div>
    `;
    chatBox.innerHTML += welcomeHTML;
    welcomeDisplayed = true;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Core Async Delivery Handling Routine
async function sendMessage() {
    const inputField = document.getElementById("message");
    const chatBox = document.getElementById("chat-box");
    const msg = inputField.value.trim();

    if (!msg) return;

    // 1. Append User Message Bubble along with Timestamp
    const userHTML = `
        <div class="message-wrapper user-wrapper">
            <div class="message user">${msg}</div>
            <div class="timestamp">${getCurrentTime()}</div>
        </div>
    `;
    chatBox.innerHTML += userHTML;
    
    // Clear input field fields instantly
    inputField.value = "";
    inputField.focus();
    chatBox.scrollTop = chatBox.scrollHeight;

    // 2. FEATURE: Visual Bouncing Dot Typing Indicator Block
    const loadingId = "loading-" + Date.now();
    const typingIndicatorHTML = `
        <div class="message-wrapper bot-wrapper" id="${loadingId}">
            <div class="message bot">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    chatBox.innerHTML += typingIndicatorHTML;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // Post asynchronous string logs to backend PHP processors
        let response = await fetch("chat.php", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });

        let data = await response.json();

        // Destruct the typing status indicator bubble element
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        // 3. Append Bot Response Bubble alongside Real-Time Timestamp
        const botHTML = `
            <div class="message-wrapper bot-wrapper">
                <div class="message bot">${data.reply}</div>
                <div class="timestamp">${getCurrentTime()}</div>
            </div>
        `;
        chatBox.innerHTML += botHTML;

    } catch (error) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();
        
        chatBox.innerHTML += `
            <div class="message-wrapper bot-wrapper">
                <div class="message bot" style="color: #c0392b;">Connection error. Please try again.</div>
            </div>
        `;
    }

    // Anchor bottom tracking scroll views
    chatBox.scrollTop = chatBox.scrollHeight;
}

// FEATURE: Delayed Tooltip Greeting Pop up initialization (3 Second delay)
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const tooltip = document.getElementById("launcher-tooltip");
        const chatContainer = document.getElementById("chat-container");
        // Only fire if the chat window is still hidden
        if (chatContainer && chatContainer.classList.contains("hidden") && tooltip) {
            tooltip.style.opacity = "1";
            tooltip.style.visibility = "visible";
        }
    }, 3000);
});