// ==========================================================================
// painX Core Platform JavaScript Engine
// ==========================================================================

// Global App State Data
const state = {
    currentUser: { username: "GuestUser", followers: 142, following: 89 },
    isFollowingCreator: false,
    creatorFollowers: 890432,
    likes: 12300,
    isLiked: false,
    activeChatTarget: null,
    chats: {
        "pain_x_ai": [
            { sender: "ai", text: "Welcome to pain X. I am pain X AI assistant. Ask me anything!" }
        ]
    }
};

// DOM Elements Initialization
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // Setup Navigation Handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            if (target === 'inbox') openScreen('inboxScreen');
            if (target === 'profile') openProfile('pain X AI', true);
            if (target === 'home') closeAllScreens();
        });
    });

    // Handle Comment System Taps
    document.getElementById('commentBtn').addEventListener('click', () => openScreen('commentScreen'));
    
    // Handle Like Interaction
    document.getElementById('likeBtn').addEventListener('click', () => {
        state.isLiked = !state.isLiked;
        const countSpan = document.querySelector('#likeBtn span');
        if (state.isLiked) {
            state.likes++;
            document.getElementById('likeBtn').classList.add('liked');
        } else {
            state.likes--;
            document.getElementById('likeBtn').classList.remove('liked');
        }
        countSpan.innerText = formatCount(state.likes);
    });
}

// Slide-Up Windows Screen Controllers
function openScreen(screenId) {
    document.getElementById(screenId).classList.add('open');
}

function closeScreen(screenId) {
    document.getElementById(screenId).classList.remove('open');
}

function closeAllScreens() {
    document.querySelectorAll('.slide-screen').forEach(s => s.classList.remove('open'));
}

// Follower / Unfollower Count Adjustments
function toggleFollow(btn) {
    state.isFollowingCreator = !state.isFollowingCreator;
    const countLabel = document.getElementById('followerCount');
    
    if (state.isFollowingCreator) {
        state.creatorFollowers++;
        btn.innerText = "Following";
        btn.classList.add('following');
        if(document.getElementById('subFollowBtn')) document.getElementById('subFollowBtn').style.display = 'none';
    } else {
        state.creatorFollowers--;
        btn.innerText = "Follow";
        btn.classList.remove('following');
        if(document.getElementById('subFollowBtn')) document.getElementById('subFollowBtn').style.display = 'flex';
    }
    if (countLabel) countLabel.innerText = formatCount(state.creatorFollowers);
}

// User Profile Rendering Engine
function openProfile(username, isAI = false) {
    const body = document.getElementById('profileBody');
    let followBtnHTML = isAI ? '' : `<button class="group-btn" onclick="toggleFollow(this)">Follow</button>`;
    
    body.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${username}" style="width:90px; height:90px; border-radius:50%; border:3px solid #fe2c55; margin-bottom:15px;">
            <h2>${username} ${isAI ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}</h2>
            <p style="color:#888; margin-bottom:15px;">@${username.toLowerCase().replace(/\s+/g, '')}</p>
            
            <div style="display:flex; justify-content:center; gap:30px; margin-bottom:20px;">
                <div><h3>${isAI ? '1.5M' : state.currentUser.following}</h3><p style="color:#888;font-size:12px;">Following</p></div>
                <div><h3 id="followerCount">${isAI ? '9.8M' : state.currentUser.followers}</h3><p style="color:#888;font-size:12px;">Followers</p></div>
                <div><h3>99.2M</h3><p style="color:#888;font-size:12px;">Likes</p></div>
            </div>
            ${followBtnHTML}
            <button class="group-btn" style="background:transparent; border:1px solid #2d1b4e;" onclick="startChat('${username}', ${isAI})">Message</button>
        </div>
    `;
    openScreen('profileScreen');
}

// Open Chat Frame & Load Messaging Data
function startChat(username, isAI = false) {
    state.activeChatTarget = { username, isAI };
    document.getElementById('chatTitle').innerHTML = `${username} ${isAI ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}`;
    
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

// Message Processing Engine & Core AI Rules
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    const chatId = state.activeChatTarget.isAI ? "pain_x_ai" : state.activeChatTarget.username.toLowerCase().replace(/\s+/g, '');
    
    // Push Outgoing User Message
    state.chats[chatId].push({ sender: "user", text: text });
    input.value = '';
    renderMessages();
    
    // Check if targetting the verified AI profile
    if (state.activeChatTarget.isAI) {
        setTimeout(() => {
            let aiReply = "I am processing your query. How can I assist you on painX?";
            const cleanText = text.toLowerCase();
            
            // Core Identity Instruction Rule
            if (cleanText.includes("who created you") || cleanText.includes("creator") || cleanText.includes("your developer")) {
                aiReply = "pain created me to assist his fans.";
            } else if (cleanText.includes("hello") || cleanText.includes("hi ")) {
                aiReply = "Hello! I am pain X AI. Ask me any question, and I'll answer it completely!";
            } else {
                aiReply = `You asked: "${text}". I am your on-platform assistant. pain created me to provide complete, updated answers directly inside your chat frame!`;
            }
            
            state.chats[chatId].push({ sender: "ai", text: aiReply });
            renderMessages();
        }, 800);
    }
}

// Group Chat Architecture Builder
function createGroupChat() {
    const groupName = prompt("Enter Group Chat Name:");
    if (!groupName) return;
    
    const inboxList = document.getElementById('inboxList');
    const newGroup = document.createElement('div');
    newGroup.className = "inbox-item";
    newGroup.onclick = () => startChat(groupName, false);
    newGroup.innerHTML = `
        <div class="inbox-meta">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${groupName}">
            <div>
                <h4>${groupName} (Group)</h4>
                <p style="color:#888; font-size:12px;">Tap to send a group message</p>
            </div>
        </div>
    `;
    inboxList.insertBefore(newGroup, inboxList.firstChild);
}

// Comment Posting Engine
function postComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if(!text) return;
    
    const container = document.getElementById('commentsContainer');
    const row = document.createElement('div');
    row.className = "comment-row";
    row.innerHTML = `
        <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Guest">
        <div class="comment-text-box">
            <h4>@guestuser</h4>
            <p>${text}</p>
        </div>
    `;
    container.appendChild(row);
    input.value = '';
    
    // Update Comment Counters Onscreen
    const countSpan = document.querySelector('#commentBtn span');
    let currentCount = parseInt(countSpan.innerText) || 0;
    countSpan.innerText = currentCount + 1;
}

// Utility Counter Formatter
function formatCount(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}
