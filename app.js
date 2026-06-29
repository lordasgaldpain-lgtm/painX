// ==========================================================================
// pain X Subfolder Path Safe-Engine Core 
// ==========================================================================

const db = {
    getUsers: () => {
        let stored = JSON.parse(localStorage.getItem('painx_users'));
        if (!stored) {
            stored = [
                { id: "u_admin", first: "Lord", last: "Pain", email: "admin@painx.com", pass: "123", verified: true, following: 46, followers: 11300, likes: 195800, isFollowing: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
                { id: "pain_x_ai", first: "pain X", last: "AI", email: "ai@painx.com", pass: "system", verified: true, following: 0, followers: 999, likes: 8888, isFollowing: false, specialAi: true },
                { id: "u_alex", first: "Alex", last: "Rider", email: "alex@test.com", pass: "123", verified: false, following: 12, followers: 450, likes: 2300, isFollowing: false, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
                { id: "u_sarah", first: "Sarah", last: "Kona", email: "sarah@test.com", pass: "123", verified: true, following: 95, followers: 17900, likes: 491900, isFollowing: false, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" }
            ];
            localStorage.setItem('painx_users', JSON.stringify(stored));
        }
        return stored;
    },
    saveUsers: (users) => localStorage.setItem('painx_users', JSON.stringify(users)),
    getPosts: () => {
        let stored = JSON.parse(localStorage.getItem('painx_posts'));
        if (!stored) {
            stored = [
                { id: "p1", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000", caption: "Welcome to pain X! Master system running flawlessly online.", author: "Lord Pain", authorId: "u_admin" },
                { id: "p2", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000", caption: "Live updates working dynamically now.", author: "Sarah Kona", authorId: "u_sarah" }
            ];
            localStorage.setItem('painx_posts', JSON.stringify(stored));
        }
        return stored;
    },
    savePosts: (posts) => localStorage.setItem('painx_posts', JSON.stringify(posts))
};

const state = {
    sessionUser: JSON.parse(localStorage.getItem('painx_session')) || null,
    isLoginMode: true,
    activeChatTarget: null,
    chats: {
        "pain_x_ai": [{ sender: "ai", text: "System fully online. Master verification terminals activated." }]
    }
};

// Safe lifecycle startup sequence to ensure DOM elements render fully on GitHub Pages
document.addEventListener("DOMContentLoaded", () => {
    try {
        renderFeed();
    } catch (e) {
        console.log("Safe startup hook caught: ", e);
    }
});

function switchTab(tab, element) {
    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    if (tab === 'home') {
        closeAllScreens();
        renderFeed();
        return;
    }
    
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
    const target = document.getElementById(id);
    if(target) target.classList.add('open');
}

function closeScreen(id) {
    const target = document.getElementById(id);
    if(target) target.classList.remove('open');
}

function closeAllScreens() {
    document.querySelectorAll('.slide-screen').forEach(s => s.classList.remove('open'));
}

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
        if (!found) { alert("Invalid email or password."); return; }
        state.sessionUser = found;
    } else {
        const first = document.getElementById('regFirst').value.trim();
        const last = document.getElementById('regLast').value.trim();
        if (!first || !last || !email || !password) { alert("Please complete registration parameters."); return; }
        
        const targetNew = { id: "u_" + Date.now(), first, last, email, pass: password, verified: false, following: 0, followers: 0, likes: 0, isFollowing: false, avatar: "" };
        users.push(targetNew);
        db.saveUsers(users);
        state.sessionUser = targetNew;
    }
    localStorage.setItem('painx_session', JSON.stringify(state.sessionUser));
    closeAllScreens();
    renderFeed();
}

function executeLogout() {
    state.sessionUser = null;
    localStorage.removeItem('painx_session');
    const items = document.querySelectorAll('.nav-item');
    if(items.length > 0) {
        items.forEach(el => el.classList.remove('active'));
        items[0].classList.add('active');
    }
    closeAllScreens();
    renderFeed();
}

function getStickerAvatarHTML(user) {
    if (user.specialAi || user.id === 'pain_x_ai') {
        return `<div class="sticker-avatar ai-p">P</div>`;
    }
    if (user.avatar) {
        return `<div class="sticker-avatar"><img src="${user.avatar}" alt="user"></div>`;
    }
    const initial = user.first ? user.first.charAt(0).toUpperCase() : 'X';
    return `<div class="sticker-avatar" style="color: #ffcc00; font-weight:700; background:#16161a; font-size:18px;">${initial}</div>`;
}

function renderFeed() {
    const container = document.getElementById('feedContainer');
    if(!container) return;
    
    const posts = db.getPosts();
    const users = db.getUsers();
    container.innerHTML = '';
    
    posts.forEach(p => {
        const authorObj = users.find(u => u.id === p.authorId) || { verified: false };
        const card = document.createElement('div');
        card.className = "video-card";
        card.innerHTML = `
            <div class="media-placeholder" style="background-image: url('${p.url}');"></div>
            <div class="top-nav">
                <span>Following</span>
                <span class="active">For You</span>
            </div>
            <div class="video-info">
                <h3 onclick="viewUserProfile('${p.authorId}')" style="cursor:pointer; display:inline-flex;">@${p.author.toLowerCase().replace(/\s+/g, '')} ${authorObj.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}</h3>
                <p>${p.caption}</p>
            </div>
            <div class="side-buttons">
                <div class="action-btn" onclick="switchTab('inbox')"><i class="fas fa-heart" style="color: #ff3b30;"></i><span>1.2K</span></div>
                <div class="action-btn" onclick="switchTab('inbox')"><i class="fas fa-comment-dots"></i><span>42</span></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderInboxList() {
    const container = document.getElementById('dynamicInboxItems');
    if(!container) return;
    container.innerHTML = '';
    
    const users = db.getUsers();
    users.forEach(u => {
        if(state.sessionUser && u.id === state.sessionUser.id) return;
        const item = document.createElement('div');
        item.className = "inbox-item";
        item.innerHTML = `
            <div class="inbox-meta" onclick="openChatWindow('${u.first} ${u.last}', ${u.specialAi || false}, '${u.id}')">
                ${getStickerAvatarHTML(u)}
                <div>
                    <h4>${u.first} ${u.last} ${u.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}</h4>
                    <p class="status-sub">Tap to chat with user</p>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderDiscover() {
    const list = document.getElementById('discoverUsersList');
    if(!list) return;
    list.innerHTML = '';
    const users = db.getUsers();
    
    users.forEach(u => {
        if(state.sessionUser && u.id === state.sessionUser.id) return;
        const row = document.createElement('div');
        row.className = "inbox-item";
        row.innerHTML = `
            <div class="inbox-meta" onclick="viewUserProfile('${u.id}')">
                ${getStickerAvatarHTML(u)}
                <div>
                    <h4>${u.first} ${u.last} ${u.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}</h4>
                    <p class="status-sub">@${u.first.toLowerCase()}${u.last.toLowerCase()}</p>
                </div>
            </div>
            <button class="tiktok-follow-btn ${u.isFollowing ? 'following' : ''}" onclick="event.stopPropagation(); toggleFollowCreator('${u.id}', this)">
                ${u.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
        `;
        list.appendChild(row);
    });
}

function toggleFollowCreator(userId, elementBtn) {
    const users = db.getUsers();
    const targetUser = users.find(u => u.id === userId);
    if(!targetUser) return;

    targetUser.isFollowing = !targetUser.isFollowing;
    if(targetUser.isFollowing) {
        targetUser.followers += 1;
        if(elementBtn) { elementBtn.classList.add('following'); elementBtn.innerText = "Unfollow"; }
    } else {
        targetUser.followers = Math.max(0, targetUser.followers - 1);
        if(elementBtn) { elementBtn.classList.remove('following'); elementBtn.innerText = "Follow"; }
    }
    db.saveUsers(users);
    
    const counter = document.getElementById('targetFollowerCountSpan');
    if(counter) counter.innerText = formatNumber(targetUser.followers);
}

function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}

function viewUserProfile(userId) {
    const users = db.getUsers();
    const targetUser = users.find(u => u.id === userId);
    if(!targetUser) return;

    document.getElementById('userProfileTopName').innerText = `@${targetUser.first.toLowerCase()}${targetUser.last.toLowerCase()}`;
    const targetContainer = document.getElementById('userProfileViewBody');
    if(!targetContainer) return;
    
    targetContainer.innerHTML = `
        <div style="text-align:center; padding-top:20px;">
            <div style="display:inline-block; margin-bottom:15px;">
                ${getStickerAvatarHTML(targetUser)}
            </div>
            <h2 style="font-size:20px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:5px;">
                ${targetUser.first} ${targetUser.last} 
                ${targetUser.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
            </h2>
            <p style="color:#8a8a8f; font-size:14px; margin-bottom:20px;">@${targetUser.first.toLowerCase()}${targetUser.last.toLowerCase()}</p>
            
            <div style="display:flex; justify-content:center; align-items:center; gap:35px; margin-bottom:25px; border-top:1px solid #1c1c1e; border-bottom:1px solid #1c1c1e; padding:15px 0;">
                <div style="text-align:center;">
                    <span style="font-size:18px; font-weight:700; display:block; color:#fff;">${targetUser.following}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Following</span>
                </div>
                <div style="text-align:center;">
                    <span id="targetFollowerCountSpan" style="font-size:18px; font-weight:700; display:block; color:#ffcc00;">${formatNumber(targetUser.followers)}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Followers</span>
                </div>
                <div style="text-align:center;">
                    <span style="font-size:18px; font-weight:700; display:block; color:#fff;">${formatNumber(targetUser.likes)}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Likes</span>
                </div>
            </div>
            <button id="profileViewFollowActionTrigger" class="primary-action-btn" style="max-width:200px; margin:0 auto; background-color: ${targetUser.isFollowing ? '#1c1c1e' : '#ff3b30'}; border: 1px solid #333;" onclick="toggleFollowFromProfileCard('${targetUser.id}')">
                ${targetUser.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
        </div>
    `;
    openScreen('userProfileViewScreen');
}

function toggleFollowFromProfileCard(userId) {
    const btn = document.getElementById('profileViewFollowActionTrigger');
    toggleFollowCreator(userId, null);
    const users = db.getUsers();
    const targetUser = users.find(u => u.id === userId);
    if(targetUser && btn) {
        btn.innerText = targetUser.isFollowing ? 'Unfollow' : 'Follow';
        btn.style.backgroundColor = targetUser.isFollowing ? '#1c1c1e' : '#ff3b30';
    }
}

function renderProfileView() {
    const target = document.getElementById('profileViewBody');
    if(!target) return;
    
    const u = state.sessionUser;
    const users = db.getUsers();
    const currentLiveUser = users.find(user => user.id === u.id) || u;

    document.getElementById('profileTopName').innerText = `${currentLiveUser.first} ${currentLiveUser.last}`;
    target.innerHTML = `
        <div style="text-align:center; padding-top:20px;">
            <div style="display:inline-block; margin-bottom:15px;">
                ${getStickerAvatarHTML(currentLiveUser)}
            </div>
            <h2 style="font-size:20px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:5px;">
                ${currentLiveUser.first} ${currentLiveUser.last} 
                ${currentLiveUser.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
            </h2>
            <p style="color:#8a8a8f; font-size:14px; margin-bottom:20px;">@${currentLiveUser.first.toLowerCase()}${currentLiveUser.last.toLowerCase()}</p>
            
            <div style="display:flex; justify-content:center; align-items:center; gap:35px; margin-bottom:25px; border-top:1px solid #1c1c1e; border-bottom:1px solid #1c1c1e; padding:15px 0;">
                <div style="text-align:center;">
                    <span style="font-size:18px; font-weight:700; display:block; color:#fff;">${currentLiveUser.following}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Following</span>
                </div>
                <div style="text-align:center;">
                    <span style="font-size:18px; font-weight:700; display:block; color:#ffcc00;">${formatNumber(currentLiveUser.followers)}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Followers</span>
                </div>
                <div style="text-align:center;">
                    <span style="font-size:18px; font-weight:700; display:block; color:#fff;">${formatNumber(currentLiveUser.likes)}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Likes</span>
                </div>
            </div>
            <button class="primary-action-btn" style="background:#1c1c1e; max-width:240px; margin:0 auto;" onclick="executeLogout()">Log Out</button>
        </div>
    `;
}

function submitNewPost() {
    const url = document.getElementById('postImageUrl').value.trim();
    const caption = document.getElementById('postCaption').value.trim();
    if(!url || !caption) { alert("Fields cannot be empty."); return; }
    
    const posts = db.getPosts();
    posts.unshift({
        id: "p_" + Date.now(),
        url: url,
        caption: caption,
        author: `${state.sessionUser.first} ${state.sessionUser.last}`,
        authorId: state.sessionUser.id
    });
    db.savePosts(posts);
    
    document.getElementById('postImageUrl').value = '';
    document.getElementById('postCaption').value = '';
    closeScreen('uploadScreen');
    renderFeed();
}

function openChatWindow(name, isAi, userId = null) {
    state.activeChatTarget = { name, isAi, userId };
    document.getElementById('chatHeaderTitle').innerHTML = `${name} ${isAi ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}`;
    
    const chatId = isAi ? "pain_x_ai" : "chat_" + userId;
    if (!state.chats[chatId]) state.chats[chatId] = [];
    
    renderActiveMessages();
    openScreen('chatScreen');
}

function renderActiveMessages() {
    const box = document.getElementById('chatMessages');
    if(!box) return;
    const chatId = state.activeChatTarget.isAi ? "pain_x_ai" : "chat_" + state.activeChatTarget.userId;
    box.innerHTML = '';
    
    (state.chats[chatId] || []).forEach(m => {
        const el = document.createElement('div');
        el.className = `msg ${m.sender === 'user' ? 'outgoing' : 'incoming'}`;
        el.innerText = m.text;
        box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const val = input ? input.value.trim() : "";
    if(!val) return;
    
    const chatId = state.activeChatTarget.isAi ? "pain_x_ai" : "chat_" + state.activeChatTarget.userId;
    state.chats[chatId].push({ sender: "user", text: val });
    input.value = '';
    renderActiveMessages();
}

function executeGroupCreation() {
    const name = document.getElementById('groupNameInput').value.trim();
    if(!name) return;
    
    const container = document.getElementById('dynamicInboxItems');
    if(!container) return;
    
    const div = document.createElement('div');
    div.className = "inbox-item";
    div.innerHTML = `
        <div class="inbox-meta" onclick="openChatWindow('${name}', false, 'group_${Date.now()}')">
            <div class="sticker-avatar" style="border-color: #4cd964; color: #4cd964; font-weight:700;">G</div>
            <div>
                <h4>${name} <span style="font-size:11px; color:#ffcc00; margin-left:5px;">[Group]</span></h4>
                <p class="status-sub">Channel online</p>
            </div>
        </div>
    `;
    container.insertBefore(div, container.firstChild);
    document.getElementById('groupNameInput').value = '';
    closeScreen('createGroupModal');
}

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
        alert("Incorrect key.");
    }
    document.getElementById('adminGateKey').value = '';
}

function renderAdminUserManagementList() {
    const container = document.getElementById('adminUserDashboardList');
    if(!container) return;
    container.innerHTML = '';
    const users = db.getUsers();
    
    users.forEach(u => {
        const row = document.createElement('div');
        row.className = "admin-row";
        row.innerHTML = `
            <div>
                <p style="font-weight:600; color:#fff;">${u.first} ${u.last}</p>
                <p style="color
