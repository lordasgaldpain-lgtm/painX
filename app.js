document.addEventListener("DOMContentLoaded", () => {
    // UI Selectors
    const authModal = document.getElementById("authModal");
    const closeAuthBtn = document.getElementById("closeAuthBtn");
    const tabLoginBtn = document.getElementById("tabLoginBtn");
    const tabSignupBtn = document.getElementById("tabSignupBtn");
    const signupFields = document.getElementById("signupFields");
    const authForm = document.getElementById("authForm");
    const authSubmitBtn = document.getElementById("authSubmitBtn");
    const adminPanelTab = document.getElementById("adminPanelTab");
    const adminDashboardView = document.getElementById("adminDashboardView");
    const closeAdminBtn = document.getElementById("closeAdminBtn");
    const adminUserList = document.getElementById("adminUserList");

    // Inputs
    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");
    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");

    // Nav Links
    const navProfile = document.getElementById("navProfile");
    const navInbox = document.getElementById("navInbox");

    let isSignUpMode = false;
    let currentUserProfile = null;

    // View triggers
    const openAuth = () => { authModal.style.display = "flex"; };
    const closeAuth = () => { authModal.style.display = "none"; };

    navProfile.addEventListener("click", openAuth);
    navInbox.addEventListener("click", openAuth);
    closeAuthBtn.addEventListener("click", closeAuth);

    adminPanelTab.addEventListener("click", () => { adminDashboardView.style.display = "flex"; loadUsersForAdmin(); });
    closeAdminBtn.addEventListener("click", () => { adminDashboardView.style.display = "none"; });

    // Forms layout swap
    tabSignupBtn.addEventListener("click", () => {
        isSignUpMode = true;
        tabLoginBtn.classList.remove("active");
        tabSignupBtn.classList.add("active");
        signupFields.style.display = "block";
        authSubmitBtn.innerText = "Sign Up";
    });

    tabLoginBtn.addEventListener("click", () => {
        isSignUpMode = false;
        tabSignupBtn.classList.remove("active");
        tabLoginBtn.classList.add("active");
        signupFields.style.display = "none";
        authSubmitBtn.innerText = "Log In";
    });

    // Handle authentication and auto check for Admin account
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (isSignUpMode) {
            auth.createUserWithEmailAndPassword(email, password)
                .then(cred => {
                    return db.collection("users").doc(cred.user.uid).set({
                        firstName: firstNameInput.value.trim(),
                        lastName: lastNameInput.value.trim(),
                        email: email,
                        isVerified: false,
                        isAdmin: email.toLowerCase() === "admin@painx.com", // First designated admin criteria
                        uid: cred.user.uid
                    });
                })
                .then(() => { alert("Welcome to pain X!"); closeAuth(); authForm.reset(); })
                .catch(err => alert(err.message));
        } else {
            auth.signInWithEmailAndPassword(email, password)
                .then(cred => { checkUserRole(cred.user.uid); closeAuth(); authForm.reset(); })
                .catch(err => alert(err.message));
        }
    });

    function checkUserRole(uid) {
        db.collection("users").doc(uid).get().then(doc => {
            if(doc.exists) {
                currentUserProfile = doc.data();
                if(currentUserProfile.isAdmin) {
                    adminPanelTab.style.display = "inline-block"; // Show admin control tab link
                    alert("Admin clearance granted. Management portal unlocked.");
                }
            }
        });
    }

    // Dynamic Database retrieval for Admin Management Portal
    function loadUsersForAdmin() {
        adminUserList.innerHTML = "<p class='loading-text'>Syncing database records...</p>";
        db.collection("users").get().then(snapshot => {
            adminUserList.innerHTML = "";
            snapshot.forEach(doc => {
                const data = doc.data();
                if(data.isAdmin) return; // Skip showing self on control panel

                const card = document.createElement("div");
                card.className = "user-card-item";
                card.innerHTML = `
                    <div class="user-meta-info">
                        <h4>${data.firstName} ${data.lastName}</h4>
                        <p>${data.email}</p>
                    </div>
                    <button class="verify-toggle-btn ${data.isVerified ? 'verified' : 'unverified'}" data-id="${data.uid}">
                        ${data.isVerified ? '<i class="fas fa-check-circle"></i> Verified' : 'Grant Badge'}
                    </button>
                `;
                adminUserList.appendChild(card);
            });

            // Add events to verification buttons
            document.querySelectorAll(".verify-toggle-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const targetUid = e.target.getAttribute("data-id") || e.target.parentElement.getAttribute("data-id");
                    toggleUserVerification(targetUid);
                });
            });
        });
    }

    function toggleUserVerification(uid) {
        const userRef = db.collection("users").doc(uid);
        userRef.get().then(doc => {
            if(doc.exists) {
                const nextState = !doc.data().isVerified;
                userRef.update({ isVerified: nextState }).then(() => {
                    loadUsersForAdmin(); // Refresh panel layout display parameters instantly
                });
            }
        });
    }
});
