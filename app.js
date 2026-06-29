// ==========================================================================
// painX Fully Featured Social & Conversational AI Engine
// ==========================================================================

const state = {
    currentUser: { username: "GuestUser", followers: 142, following: 89 },
    isFollowingCreator: false,
    creatorFollowers: 890432,
    likes: 12300,
    isLiked: false,
    activeChatTarget: null,
    chats: {
        "pain_x_ai": [
            { sender: "ai", text: "Welcome to pain X! I am your custom AI assistant built by pain to support his fans. Ask me anything!" }
        ]
    },
    availableUsers: ["pain X AI", "Alpha_Rider", "Shadow_X", "NeonVibes", "Lil_Pain_Fan"]
};

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // Nav Bar Controllers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            if (target === 'inbox') {
                renderInboxList();
                openScreen('inboxScreen');
            }
            if (target === 'profile') openProfile('pain X AI', true);
            if (target === 'home') closeAllScreens();
            if (target === 'discover') {
                renderDiscoverList();
                openScreen('discoverScreen');
            }
        });
    });

    // Enter Key Event for Chat
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    document.getElementById('commentBtn').addEventListener('click', () => openScreen('commentScreen'));
}

function openScreen(screenId) {
    document.getElementById(screenId).classList.add('open');
}

function closeScreen(screenId) {
    document.getElementById(screenId).classList.remove('open');
}

function closeAllScreens() {
    document.querySelectorAll('.slide-screen').forEach(s => s.classList.remove('open'));
}

function renderInboxList() {
    const list = document.getElementById('inboxList');
    list.innerHTML = `
        <button class="group-btn" onclick="openScreen('createGroupModal')">+ Create Group Chat</button>
        <div class="inbox-item" onclick="startChat('pain X AI', true)">
            <div class="inbox-meta">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=painXAI">
                <div>
                    <h4>pain X AI <i class="fas fa-check-circle verified-badge"></i></h4>
                    <p style="color: #fe2c55; font-size: 12px;">Active Now</p>
                </div>
            </div>
        </div>
    `;
    
    // Add other active conversations dynamically
    Object.keys(state.chats).forEach(chatId => {
        if (chatId !== 'pain_x_ai') {
            const messages = state.chats[chatId];
            const lastMsg = messages[messages.length - 1]?.text || "Tap to chat";
            const displayTitle = chatId.charAt(0).toUpperCase() + chatId.slice(1);
            
            const item = document.createElement('div');
            item.className = "inbox-item";
            item.onclick = () => startChat(displayTitle, false);
            item.innerHTML = `
                <div class="inbox-meta">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${chatId}">
                    <div>
                        <h4>${displayTitle}</h4>
                        <p style="color: #888; font-size: 12px;">${lastMsg}</p>
                    </div>
                </div>
            `;
            list.appendChild(item);
        }
    });
}

function renderDiscoverList() {
    const container = document.getElementById('discoverContainer');
    container.innerHTML = '<h3>Find People to Chat With</h3>';
    state.availableUsers.forEach(user => {
        const row = document.createElement('div');
        row.className = "inbox-item";
        row.style.marginTop = "10px";
        row.onclick = () => {
            closeScreen('discoverScreen');
            openProfile(user, user === "pain X AI");
        };
        row.innerHTML = `
            <div class="inbox-meta">
                <img src="https://api.dicebear.com/7.x/${user === "pain X AI" ? 'bottts' : 'pixel-art'}/svg?seed=${user}">
                <div>
                    <h4>${user} ${user === "pain X AI" ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}</h4>
                    <p style="color:#888; font-size:12px;">@${user.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

function openProfile(username, isAI = false) {
    const body = document.getElementById('profileBody');
    let followBtnHTML = isAI ? '' : `<button class="group-btn" onclick="toggleFollow(this)">Follow</button>`;
    
    body.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <img src="https://api.dicebear.com/7.x/${isAI ? 'bottts' : 'pixel-art'}/svg?seed=${username}" style="width:90px; height:90px; border-radius:50%; border:3px solid #fe2c55; margin-bottom:15px;">
            <h2 id="profileUsernameTitle" ondblclick="triggerAdminPortal()" style="cursor:pointer; display:block;">${username} ${isAI ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}</h2>
            <p style="color:#888; margin-bottom:15px;">@${username.toLowerCase().replace(/\s+/g, '')}</p>
            
            <div style="display:flex; justify-content:center; gap:30px; margin-bottom:20px;">
                <div><h3>${isAI ? '1.5M' : '89'}</h3><p style="color:#888;font-size:12px;">Following</p></div>
                <div><h3 id="followerCount">${isAI ? '9.8M' : '1.2K'}</h3><p style="color:#888;font-size:12px;">Followers</p></div>
                <div><h3>99.2M</h3><p style="color:#888;font-size:12px;">Likes</p></div>
            </div>
            ${followBtnHTML}
            <button class="group-btn" style="background:transparent; border:1px solid #2d1b4e;" onclick="startChat('${username}', ${isAI})">Message</button>
        </div>
    `;
    openScreen('profileScreen');
}

function startChat(username, isAI = false) {
    state.activeChatTarget = { username, isAI };
    
    // Explicit title update to ensure heading text does not remain hidden or compressed
    const titleContainer = document.getElementById('chatTitle');
    titleContainer.innerHTML = `${username} ${isAI ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}`;
    
    const chatId = isAI ? "pain_x_ai" : username.toLowerCase().replace(/\s+/g, '');
    if (!state.chats[chatId]) state.chats[chatId] = [];
    
    renderMessages();
    openScreen('chatScreen');
}

function renderMessages() {
    const container = document.getElementById('chatMessages');
    const chatId = state.activeChatTarget.isAI ? "pain_x_ai" : state.activeChatTarget.username.toLowerCase().replace(/\s+/g, '');
    container.innerHTML = '';
    
    state.chats[chatId].forEach(m => {
        const div = document.createElement('div');
        div.className = `msg ${m.sender === 'user' ? 'outgoing' : 'incoming'}`;
        div.innerText = m.text;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    const chatId = state.activeChatTarget.isAI ? "pain_x_ai" : state.activeChatTarget.username.toLowerCase().replace(/\s+/g, '');
    
    state.chats[chatId].push({ sender: "user", text: text });
    input.value = '';
    renderMessages();
    
    if (state.activeChatTarget.isAI) {
        setTimeout(() => {
            let aiReply = "";
            const query = text.toLowerCase();
            
            if (query.includes("who created you") || query.includes("creator") || query.includes("your developer")) {
                aiReply = "pain created me to assist his fans.";
            } else if (query.includes("hello") || query.includes("hi")) {
                aiReply = "Hello! I am the pain X AI assistant. How can I help you and all of pain's fans today?";
            } else if (query.includes("help") || query.includes("features")) {
                aiReply = "You can share videos, drop comments, like posts, create group channels, and talk directly with me or your friends right here!";
            } else {
                // Fully conversational response framework simulation without echoing question strings
                const dynamicResponses = [
                    "That's very interesting! As an AI built by pain, I'm here to ensure your app experience is completely optimized.",
                    "Awesome question! Let me check that out for you. Is there anything else you want to know about our upcoming features?",
                    "Got it! pain set up my system parameters to provide custom answers to all platform users instantly.",
                    "I am completely tuned in! Feel free to talk to me about anything happening on the painX feed right now."
                ];
                aiReply = dynamicResponses[Math.floor(Math.random() * dynamicResponses.length)];
            }
            
            state.chats[chatId].push({ sender: "ai", text: aiReply });
            renderMessages();
        }, 650);
    } else {
        // Auto generic echo simulation for normal friend accounts
        setTimeout(() => {
            state.chats[chatId].push({ sender: "friend", text: "Hey! Loved your message. Let's build up a group chat room!" });
            renderMessages();
        }, 1000);
    }
}

function createGroupChatFromModal() {
    const name = document.getElementById('groupNameInput').value.trim();
    if (!name) return;
    
    const inboxList = document.getElementById('inboxList');
    const item = document.createElement('div');
    item.className = "inbox-item";
    item.onclick = () => startChat(name, false);
    item.innerHTML = `
        <div class="inbox-meta">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${name}">
            <div>
                <h4>${name} (Group)</h4>
                <p style="color: #fe2c55; font-size:12px;">New room initialized. Tap to join</p>
            </div>
        </div>
    `;
    inboxList.insertBefore(item, inboxList.childNodes[2]);
    closeScreen('createGroupModal');
    document.getElementById('groupNameInput').value = '';
}

function triggerAdminPortal() {
    openScreen('authOverlayCustom');
}

function submitAdminAuth() {
    const email = document.getElementById('adminEmailField').value.trim();
    if(email === 'admin@painx.com') {
        closeScreen('authOverlayCustom');
        openScreen('adminDashboardCustom');
    } else {
        alert("Invalid Admin Authentication Signature.");
    }
}
