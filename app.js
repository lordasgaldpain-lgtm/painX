// ==========================================================================
// pain X Anti-Copyright Engine & Live Follow Metric Core
// ==========================================================================

const db = {
    getUsers: () => {
        let stored = JSON.parse(localStorage.getItem('painx_users'));
        if (!stored) {
            stored = [
                { id: "u_admin", first: "Lord", last: "Pain", email: "admin@painx.com", pass: "123", verified: true, following: 46, followers: 0, likes: 0, isFollowing: false },
                { id: "pain_x_ai", first: "pain X", last: "AI", email: "ai@painx.com", pass: "system", verified: true, following: 0, followers: 0, likes: 0, isFollowing: false, specialAi: true },
                { id: "u_itachi", first: "Itachi", last: "Uchiha", email: "itachi@painx.com", pass: "123", verified: true, following: 12, followers: 0, likes: 0, isFollowing: false },
                { id: "u_obito", first: "Obito", last: "Uchiha", email: "obito@painx.com", pass: "123", verified: false, following: 5, followers: 0, likes: 0, isFollowing: false }
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
                { id: "p1", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000", caption: "Welcome to pain X! Custom motion system.", author: "pain X AI", authorId: "pain_x_ai", isAi: true }
            ];
            localStorage.setItem('painx_posts', JSON.stringify(stored));
        }
        return stored;
    },
    savePosts: (posts) => localStorage.setItem('painx_posts', JSON.stringify(posts))
};

const state = {
    sessionUser: JSON.parse(localStorage.getItem('painx_session')) || null,
    isLoginMode: false,
    activeChatTarget: null,
    chats: {
        "pain_x_ai": [
            { sender: "ai", text: "Welcome to pain X! I am your custom assistant built by pain. Ask me anything!" }
        ]
    }
};

// Guard initialization loop to avoid freezing UI if elements are loading slowly
window.addEventListener("load", () => {
    try {
        renderFeed();
    } catch (err) {
        console.error("Feed error fallback triggered", err);
    }
});

function switchTab(tab, element) {
    // Update navbar design styling instantly upon tapping
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
    
    // Fallback sync behavior
    if (id === 'userProfileViewScreen') {
        renderDiscover();
    }
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
        if (!first || !last || !email || !password) { alert("Please fill in all registration fields."); return; }
        
        const targetNew = { id: "u_" + Date.now(), first, last, email, pass: password, verified: false, following: 0, followers: 0, likes: 0, isFollowing: false };
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
    
    // Reset navbar indicator back to home
    const navItems = document.querySelectorAll('.nav-item');
    if(navItems.length > 0) {
        navItems.forEach(el => el.classList.remove('active'));
        navItems[0].classList.add('active');
    }
    
    closeAllScreens();
    renderFeed();
}

function getStickerAvatarHTML(user) {
    if (user.specialAi || user.id === 'pain_x_ai') {
        return `<div class="sticker-avatar ai-p">P</div>`;
    }
    const initial = user.first ? user.first.charAt(0).toUpperCase() : 'X';
    return `<div class="sticker-avatar" style="color: #ffcc00; font-weight:700; background:#1a1a1a;">${initial}</div>`;
}

function renderFeed() {
    const container = document.getElementById('feedContainer');
    if(!container) return;
    
    const posts = db.getPosts();
    container.innerHTML = '';
    
    posts.forEach(p => {
        const card = document.createElement('div');
        card.className = "video-card";
        card.innerHTML = `
            <div class="media-placeholder" style="background-image: url('${p.url}'); background-color: #111;"></div>
            <div class="top-nav">
                <span>Following</span>
                <span class="active">For You</span>
            </div>
            <div class="video-info">
                <h3 onclick="viewUserProfile('${p.authorId}')" style="cursor:pointer; display:inline-flex;">@${p.author.toLowerCase().replace(/\s+/g, '')} ${p.isAi || p.authorId === 'pain_x_ai' || p.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}</h3>
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
    const aiUser = users.find(u => u.id === 'pain_x_ai') || { id: "pain_x_ai", first: "pain X", last: "AI", verified: true, specialAi: true };
    
    const aiItem = document.createElement('div');
    aiItem.className = "inbox-item";
    aiItem.innerHTML = `
        <div class="inbox-meta" onclick="openChatWindow('pain X AI', true, 'pain_x_ai')">
            ${getStickerAvatarHTML(aiUser)}
            <div>
                <h4>pain X AI <i class="fas fa-check-circle verified-badge"></i></h4>
                <p class="status-sub" style="color: #4cd964;">Active Now</p>
            </div>
        </div>
    `;
    container.appendChild(aiItem);

    users.forEach(u => {
        if(u.id === 'pain_x_ai' || (state.sessionUser && u.id === state.sessionUser.id)) return;
        const item = document.createElement('div');
        item.className = "inbox-item";
        item.innerHTML = `
            <div class="inbox-meta" onclick="openChatWindow('${u.first} ${u.last}', false, '${u.id}')">
                ${getStickerAvatarHTML(u)}
                <div>
                    <h4>${u.first} ${u.last} ${u.verified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}</h4>
                    <p class="status-sub">Tap to open direct message thread</p>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderDiscover() {
    const list = document.getElementById('discoverUsersList');
    if(!list) return;
    list.innerHTML = '<h3 style="color:#ffcc00; margin-bottom:15px; font-size:14px;">Creator Directory</h3>';
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
            <button class="tiktok-follow-btn ${u.isFollowing ? 'following' : ''}" onclick="toggleFollowCreator('${u.id}', this)">
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
        if(elementBtn) {
            elementBtn.classList.add('following');
            elementBtn.innerText = "Unfollow";
        }
    } else {
        targetUser.followers = Math.max(0, targetUser.followers - 1);
        if(elementBtn) {
            elementBtn.classList.remove('following');
            elementBtn.innerText = "Follow";
        }
    }

    db.saveUsers(users);
    
    const counter = document.getElementById('targetFollowerCountSpan');
    if(counter) {
        counter.innerText = targetUser.followers;
    }
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
            <h2 style="font-size:20px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:5px; color:#fff;">
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
                    <span id="targetFollowerCountSpan" style="font-size:18px; font-weight:700; display:block; color:#ffcc00;">${targetUser.followers}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Followers</span>
                </div>
                <div style="text-align:center;">
                    <span style="font-size:18px; font-weight:700; display:block; color:#fff;">${targetUser.likes}</span>
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
                    <span style="font-size:18px; font-weight:700; display:block; color:#ffcc00;">${currentLiveUser.followers}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Followers</span>
                </div>
                <div style="text-align:center;">
                    <span style="font-size:18px; font-weight:700; display:block; color:#fff;">${currentLiveUser.likes}</span>
                    <span style="font-size:12px; color:#8a8a8f;">Likes</span>
                </div>
            </div>

            <button class="primary-action-btn" style="background:#1c1c1e; color:#fff; font-weight:600; max-width:240px; margin:0 auto; border-radius:4px; border: 1px solid #222;" onclick="executeLogout()">Log Out</button>
        </div>
    `;
}

function submitNewPost() {
    const url = document.getElementById('postImageUrl').value.trim();
    const caption = document.getElementById('postCaption').value.trim();
    if(!url || !caption) { alert("Please complete all input fields."); return; }
    
    const posts = db.getPosts();
    posts.unshift({
        id: "p_" + Date.now(),
        url: url,
        caption: caption,
        author: `${state.sessionUser.first} ${state.sessionUser.last}`,
        authorId: state.sessionUser.id,
        verified: state.sessionUser.verified
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
    if(!input) return;
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
                reply = mockSmartInferenceEngine(val);
            }
            
            state.chats[chatId].push({ sender: "ai", text: reply });
            renderActiveMessages();
        }, 700);
    }
}

function mockSmartInferenceEngine(prompt) {
    const query = prompt.toLowerCase();
    if (query.includes("naruto")) {
        return "Naruto remains a legendary anime masterpiece. It showcases incredible groups like the Akatsuki, whose tactical path was shaped completely by Pain's unmatched vision.";
    }
    if (query.includes("pain")) {
        return "Pain is the legendary leader of the Akatsuki organization, wielding the divine power of the Rinnegan to show the world true order.";
    }
    if (query.includes("itachi")) {
        return "Itachi Uchiha is an elite rogue shinobi from Konoha, sacrificing his legacy to protect the village and his brother Sasuke from the deep shadows.";
    }
    return "Understood completely. My framework is parsing your requests perfectly. pain configured my system to pr
