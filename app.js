// ==========================================================================
// pain X Local Storage Mock Database Engine & Smart AI Simulation
// ==========================================================================

const db = {
    getUsers: () => JSON.parse(localStorage.getItem('painx_users')) || [
        { id: "u1", first: "Alex", last: "Rider", email: "alex@test.com", pass: "123", verified: false },
        { id: "u2", first: "Sarah", last: "Kona", email: "sarah@test.com", pass: "123", verified: true }
    ],
    saveUsers: (users) => localStorage.setItem('painx_users', JSON.stringify(users)),
    getPosts: () => JSON.parse(localStorage.getItem('painx_posts')) || [
        { id: "p1", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000", caption: "Welcome to pain X! Setup your account now.", author: "pain X AI", isAi: true }
    ],
    savePosts: (posts) => localStorage.setItem('painx_posts', JSON.stringify(posts))
};

const state = {
    sessionUser: JSON.parse(localStorage.getItem('painx_session')) || null,
    isLoginMode: false,
    activeChatTarget: null,
    chats: {
        "pain_x_ai": [
            { sender: "ai", text: "Welcome to pain X! I am your custom AI assistant built by pain to support his fans. Ask me anything!" }
        ]
    }
};

document.addEventListener("DOMContentLoaded", () => {
    renderFeed();
    if(state.sessionUser) {
        syncUIWithSession();
    }
});

// Navigation Controller Interceptor
function switchTab(tab) {
    if (tab === 'home') {
        closeAllScreens();
        return;
    }
    
    // Strict Verification Wall Protection
    if (!state.sessionUser) {
        triggerAuthWall();
        return;
    }

    if (tab === 'inbox') {
        renderInboxList();
        openScreen('inboxScreen');
    } else if (tab === 'discover') {
        renderDiscover();
        openScreen('discoverScreen');
    } else if (tab === 'upload') {
        openScreen('uploadScreen');
    } else if (tab === 'profile') {
        renderProfileView();
        openScreen('profileScreen');
    }
}

function triggerAuthWall() {
    openScreen('authScreen');
}

function openScreen(id) {
    document.getElementById(id).classList.add('open');
}

function closeScreen(id) {
    document.getElementById(id).classList.remove('open');
}

function closeAllScreens() {
    document.querySelectorAll('.slide-screen').forEach(s => s.classList.remove('open'));
}

// Authentication Logic Handlers
function toggleAuthMode() {
    state.isLoginMode = !state.isLoginMode;
    document.getElementById('authTitle').innerText = state.isLoginMode ? "Log In" : "Create Account";
    document.getElementById('authSubmitBtn').innerText = state.isLoginMode ? "Sign In" : "Sign Up";
    document.getElementById('nameFields').style.display = state.isLoginMode ? "none" : "flex";
    document.getElementById('authToggle').innerText = state.isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Log In";
}

function handleAuthSubmit() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const users = db.getUsers();

    if (state.isLoginMode) {
        const found = users.find(u => u.email === email && u.pass === password);
        if (!found) { alert("Invalid email or password credential profile."); return; }
        state.sessionUser = found;
    } else {
        const first = document.getElementById('regFirst').value.trim();
        const last = document.getElementById('regLast').value.trim();
        if (!first || !last || !email || !password) { alert("Fill in registration fields completely."); return; }
        
        const targetNew = { id: "u_" + Date.now(), first, last, email, pass: password, verified: false };
        users.push(targetNew);
        db.saveUsers(users);
        state.sessionUser = targetNew;
    }
    localStorage.setItem('painx_session', JSON.stringify(state.sessionUser));
    syncUIWithSession();
    closeScreen('authScreen');
}

function syncUIWithSession() {
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
    if(!state.isLoginMode) {
        document.getElementById('regFirst').value = '';
        document.getElementById('regLast').value = '';
    }
}

function executeLogout() {
    state.sessionUser = null;
    localStorage.removeItem('painx_session');
    closeAllScreens();
    window.location.reload();
}

// Rendering UI Lists
function renderFeed() {
    const container = document.getElementById('feedContainer');
    const posts = db.getPosts();
    container.innerHTML = '';
    
    posts.forEach(p => {
        const card = document.createElement('div');
        card.className = "video-card";
        card.innerHTML = `
            <div class="media-placeholder" style="background-image: url('${p.url}');"></div>
            <div class="top-nav">
                <span>Following</span>
                <span class="active">For You</span>
            </div>
            <div class="video-info">
                <h3>${p.author} ${p.isAi || p.verified ? '<div class="verified-wrapper"><i class="fas fa-check-circle verified-badge"></i><span class="tooltip-text">This account is verified</span></div>' : ''}</h3>
                <p>${p.caption}</p>
            </div>
            <div class="side-buttons">
                <div class="action-btn" onclick="switchTab('inbox')"><i class="fas fa-heart"></i><span>9.1K</span></div>
                <div class="action-btn" onclick="switchTab('inbox')"><i class="fas fa-comment-dots"></i><span>184</span></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderInboxList() {
    const container = document.getElementById('dynamicInboxItems');
    container.innerHTML = '';
    const users = db.getUsers().filter(u => u.id !== state.sessionUser.id);
    
    users.forEach(u => {
        const item = document.createElement('div');
        item.className = "inbox-item";
        item.onclick = () => openChatWindow(`${u.first} ${u.last}`, false, u.id);
        item.innerHTML = `
            <div class="inbox-meta">
                <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}">
                <div>
                    <h4>${u.first} ${u.last} ${u.verified ? '<div class="verified-wrapper"><i class="fas fa-check-circle verified-badge"></i><span class="tooltip-text">This account is verified</span></div>' : ''}</h4>
                    <p class="status-sub">Tap to chat room...</p>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderDiscover() {
    const list = document.getElementById('discoverUsersList');
    list.innerHTML = '<h3>Find Profiles</h3>';
    const users = db.getUsers();
    
    users.forEach(u => {
        const row = document.createElement('div');
        row.className = "inbox-item";
        row.innerHTML = `
            <div class="inbox-meta">
                <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}">
                <div>
                    <h4>${u.first} ${u.last} ${u.verified ? '<div class="verified-wrapper"><i class="fas fa-check-circle verified-badge"></i><span class="tooltip-text">This account is verified</span></div>' : ''}</h4>
                    <p class="status-sub">@${u.first.toLowerCase()}${u.last.toLowerCase()}</p>
                </div>
            </div>
        `;
        list.appendChild(row);
    });
}

function renderProfileView() {
    const target = document.getElementById('profileViewBody');
    const u = state.sessionUser;
    
    // Check if user currently has verification flag active
    const freshestUserData = db.getUsers().find(user => user.id === u.id);
    if(freshestUserData) {
        u.verified = freshestUserData.verified;
    }

    document.getElementById('profileTopName').innerText = `${u.first} ${u.last}`;
    target.innerHTML = `
        <div style="text-align:center; padding-top:20px;">
            <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}" style="width:90px; height:90px; border-radius:50%; border:2px solid #fe2c55; margin-bottom:15px;">
            <h2>${u.first} ${u.last} ${u.verified ? '<div class="verified-wrapper"><i class="fas fa-check-circle verified-badge"></i><span class="tooltip-text">This account is verified</span></div>' : ''}</h2>
            <p style="color:#666; margin-bottom:20px;">@${u.first.toLowerCase()}${u.last.toLowerCase()}</p>
            <button class="primary-action-btn" style="background:#1c1c1e; max-width:200px; margin:0 auto;" onclick="executeLogout()">Log Out</button>
        </div>
    `;
}

// Media Posting Form Submit Logic
function submitNewPost() {
    const url = document.getElementById('postImageUrl').value.trim();
    const caption = document.getElementById('postCaption').value.trim();
    if(!url || !caption) { alert("Please input an image URL and caption."); return; }
    
    const posts = db.getPosts();
    posts.unshift({
        id: "p_" + Date.now(),
        url: url,
        caption: caption,
        author: `${state.sessionUser.first} ${state.sessionUser.last}`,
        verified: state.sessionUser.verified
    });
    db.savePosts(posts);
    
    document.getElementById('postImageUrl').value = '';
    document.getElementById('postCaption').value = '';
    closeScreen('uploadScreen');
    renderFeed();
}

// Conversational Messaging Mechanics
function openChatWindow(name, isAi, userId = null) {
    state.activeChatTarget = { name, isAi, userId };
    document.getElementById('chatHeaderTitle').innerHTML = `${name} ${isAi ? '<div class="verified-wrapper"><i class="fas fa-check-circle verified-badge"></i><span class="tooltip-text">This account is verified</span></div>' : ''}`;
    
    const chatId = isAi ? "pain_x_ai" : "chat_" + userId;
    if (!state.chats[chatId]) state.chats[chatId] = [];
    
    renderActiveMessages();
    openScreen('chatScreen');
}

function renderActiveMessages() {
    const box = document.getElementById('chatMessages');
    const chatId = state.activeChatTarget.isAi ? "pain_x_ai" : "chat_" + state.activeChatTarget.userId;
    box.innerHTML = '';
    
    const contextList = state.chats[chatId] || [];
    contextList.forEach(m => {
        const el = document.createElement('div');
        el.className = `msg ${m.sender === 'user' ? 'outgoing' : 'incoming'}`;
        el.innerText = m.text;
        box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const val = input.value.trim();
    if(!val) return;
    
    const chatId = state.activeChatTarget.isAi ? "pain_x_ai" : "chat_" + state.activeChatTarget.userId;
    state.chats[chatId].push({ sender: "user", text: val });
    input.value = '';
    renderActiveMessages();
    
    if (state.activeChatTarget.isAi) {
        setTimeout(() => {
            let reply = "";
            const query = val.toLowerCase();
            
            if (query.includes("who created you") || query.includes("creator") || query.includes("your developer")) {
                reply = "pain created me to assist his fans.";
            } else {
                // Client-Side Simulated Real Intelligence Inference Framework
                reply = mockSmartInferenceEngine(val);
            }
            
            state.chats[chatId].push({ sender: "ai", text: reply });
            renderActiveMessages();
        }, 750);
    }
}

// Client-Side Conversational Intelligence Parser Strategy
function mockSmartInferenceEngine(prompt) {
    const query = prompt.toLowerCase();
    
    if (query.includes("naruto")) {
        return "Naruto is a masterpiece anime franchise centering on Naruto Uzumaki, a shinobi who seeks recognition from his village and dreams of becoming the Hokage. It contains iconic groups like the Akatsuki, led by Pain.";
    }
    if (query.includes("pain")) {
        return "Pain is the legendary figurehead leader of the Akatsuki. He possesses the Rinnegan eyes and seeks to bring peace to the shinobi world through profound understanding.";
    }
    if (query.includes("itachi")) {
        return "Itachi Uchiha is a legendary rogue shinobi from Konoha, known for his elite visual genjutsu prowess, sacrificing his life to safeguard his brother Sasuke and the village from the shadows.";
    }
    if (query.includes("hello") || query.includes("hi")) {
        return "Hello there! I am fully initialized and ready. What technical concepts or Naruto legacy lore can I explain for you today?";
    }
    if (query.includes("code") || query.includes("html") || query.includes("javascript")) {
        return "I can write and parse frontend mechanics flawlessly. Let me know what function scopes or flexbox layouts you want to build on your next screen setup!";
    }
    
    // Dynamic Intelligent Construct Assembly Component
    const contextualVocabulary = [
        "That poses an interesting query. Analyzing the parameters, it intersects with the architecture pain established for this exact app node.",
        "A fascinating question! I'm tracking that request perfectly. Let me know if you want me to expand on that specific subject further.",
        "Completely verified. My system logic parses your intent smoothly. pain designed me to possess deep analytical context."
    ];
    return contextualVocabulary[Math.floor(Math.random() * contextualVocabulary.length)];
}

function executeGroupCreation() {
    const name = document.getElementById('groupNameInput').value.trim();
    if(!name) return;
    
    const container = document.getElementById('dynamicInboxItems');
    const div = document.createElement('div');
    div.className = "inbox-item";
    div.onclick = () => openChatWindow(name, false, "group_" + Date.now());
    div.innerHTML = `
        <div class="inbox-meta">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${name}">
            <div>
                <h4>${name} (Group Channel)</h4>
                <p class="status-sub">Channel ready. Tap to enter group chat</p>
            </div>
        </div>
    `;
    container.insertBefore(div, container.firstChild);
    document.getElementById('groupNameInput').value = '';
    closeScreen('createGroupModal');
}

// Administrative Engine Terminal Controls
function openAdminDashboardGate() {
    openScreen('adminGateScreen');
}

function verifyAdminGateKey() {
    const key = document.getElementById('adminGateKey').value;
    if(key === 'pain') {
        closeScreen('adminGateScreen');
        renderAdminUserManagementList();
        openScreen('adminDashboardScreen');
    } else {
        alert("Unauthorized signature. Access denied.");
    }
    document.getElementById('adminGateKey').value = '';
}

function renderAdminUserManagementList() {
    const container = document.getElementById('adminUserDashboardList');
    container.innerHTML = '';
    const users = db.getUsers();
    
    users.forEach(u => {
        const row = document.createElement('div');
        row.className = "admin-row";
        row.innerHTML = `
            <div>
                <p style="font-weight:600;">${u.first} ${u.last}</p>
                <p style="color:#666; font-size:12px;">${u.email}</p>
            </div>
            <button style="padding:6px 12px; font-size:12px; background:${u.verified ? '#111' : '#fe2c55'}; color:white; border:1px solid #333; border-radius:4px; cursor:pointer;" onclick="toggleUserVerificationStatus('${u.id}')">
                ${u.verified ? 'Revoke Badge' : 'Grant Verified Badge'}
            </button>
        `;
        container.appendChild(row);
    });
}

function toggleUserVerificationStatus(userId) {
    const users = db.getUsers();
    const found = users.find(u => u.id === userId);
    if(found) {
        found.verified = !found.verified;
        db.saveUsers(users);
        
        // Live memory update if altering active session status
        if(state.sessionUser && state.sessionUser.id === userId) {
            state.sessionUser.verified = found.verified;
            localStorage.setItem('painx_session', JSON.stringify(state.sessionUser));
        }
        
        renderAdminUserManagementList();
        renderFeed();
    }
                                            }
        
