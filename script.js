// --- CONFIGURATION SETUP ---
const ADMIN_PASSWORD = "admin123_change_me"; // Admin panel key
const API_URL = "https://api.jsonbin.io/v3/b/6a43604ef5f4af5e2945c500"; // Your updated bin URL
const API_MASTER_KEY = "$2a$10$lPB.nJiq6s9VfBAeHO/DD.rhW2r.uWnjDmMN83dtp/ZQAdJ5JbClm"; // Paste your secret key wrapper string here

document.addEventListener("DOMContentLoaded", () => {
    // Game State Variables
    let score = 0;
    let autoChargers = 0;
    let upgradeCost = 10;
    let gameLoopInterval = null;

    // DOM Target DOM Elements
    const tosModal = document.getElementById('tos-modal');
    const acceptBtn = document.getElementById('accept-btn');
    const declineBtn = document.getElementById('decline-btn');
    
    const mainView = document.getElementById('main-view');
    const scoreDisplay = document.getElementById('score');
    const clickBtn = document.getElementById('click-btn');
    const upgradeBtn = document.getElementById('upgrade-btn');

    const adminBtn = document.getElementById('admin-btn');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const submitPassBtn = document.getElementById('submit-pass-btn');
    const cancelPassBtn = document.getElementById('cancel-pass-btn');
    const loginError = document.getElementById('login-error');

    const adminView = document.getElementById('admin-view');
    const exitAdminBtn = document.getElementById('exit-admin-btn');
    const logsTbody = document.getElementById('logs-tbody');

    // --- STEP 1: INITIALIZE DATA CONSENT HANDLING ---
    acceptBtn.addEventListener('click', () => {
        // Remove tracking lock UI filters
        tosModal.classList.add('hidden');
        mainView.classList.remove('app-locked');
        
        // Execute operational routines AFTER explicit approval
        initializeSystemTelemetry();
        runGameEngine();
    });

    declineBtn.addEventListener('click', () => {
        // Redirection or exit fallback strategy
        window.location.href = "https://github.com";
    });

    // --- STEP 2: RUN GAME ENGINE LOGIC ---
    function runGameEngine() {
        clickBtn.addEventListener("click", () => {
            score++;
            updateGameUI();
        });

        upgradeBtn.addEventListener("click", () => {
            if (score >= upgradeCost) {
                score -= upgradeCost;
                autoChargers++;
                upgradeCost = Math.floor(upgradeCost * 1.5);
                updateGameUI();
            }
        });

        gameLoopInterval = setInterval(() => {
            if (autoChargers > 0) {
                score += autoChargers;
                updateGameUI();
            }
        }, 1000);
    }

    function updateGameUI() {
        scoreDisplay.innerText = score;
        upgradeBtn.innerText = `Buy Auto-Charger (Cost: ${upgradeCost})`;
        upgradeBtn.disabled = score < upgradeCost;
    }

    // --- STEP 3: SYSTEM AUDITING TELEMETRY ---
    function initializeSystemTelemetry() {
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => {
                saveLogToCloud(data.ip);
            })
            .catch(err => console.error("Telemetry failed:", err));
    }

    function saveLogToCloud(detectedIP) {
        if(API_MASTER_KEY.includes("YOUR_ACTUAL_KEY_HERE")) return;

        fetch(API_URL, {
            method: 'GET',
            headers: { 'X-Master-Key': API_MASTER_KEY, 'X-Bin-Meta': 'false' }
        })
        .then(res => res.json())
        .then(data => {
            let currentLogs = data.logs || [];
            currentLogs.unshift({ time: new Date().toLocaleString(), ip: detectedIP });

            return fetch(API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_MASTER_KEY },
                body: JSON.stringify({ logs: currentLogs })
            });
        })
        .catch(err => console.error("Database tracking fault:", err));
    }

    function fetchDatabaseAudit() {
        logsTbody.innerHTML = '<tr><td colspan="2" class="loading-logs">Syncing cloud logs...</td></tr>';
        
        if(API_MASTER_KEY.includes("YOUR_ACTUAL_KEY_HERE")) {
            logsTbody.innerHTML = '<tr><td colspan="2" class="error-msg">Error: API_MASTER_KEY not updated.</td></tr>';
            return;
        }

        fetch(API_URL, {
            method: 'GET',
            headers: { 'X-Master-Key': API_MASTER_KEY, 'X-Bin-Meta': 'false' }
        })
        .then(res => res.json())
        .then(data => {
            const logs = data.logs || [];
            logsTbody.innerHTML = '';
            
            if(logs.length === 0) {
                logsTbody.innerHTML = '<tr><td colspan="2" class="loading-logs">Empty register records.</td></tr>';
                return;
            }

            logs.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${item.time}</td><td><code>${item.ip}</code></td>`;
                logsTbody.appendChild(row);
            });
        })
        .catch(() => {
            logsTbody.innerHTML = '<tr><td colspan="2" class="error-msg">Error parsing remote cloud matrix.</td></tr>';
        });
    }

    // --- STEP 4: PANEL INTERFACE ROUTING CONTROL ---
    adminBtn.addEventListener('click', () => {
        passwordModal.classList.remove('hidden');
        passwordInput.focus();
    });

    cancelPassBtn.addEventListener('click', () => {
        passwordModal.classList.add('hidden');
        passwordInput.value = '';
        loginError.classList.add('hidden');
    });

    const triggerAuthentication = () => {
        if (passwordInput.value === ADMIN_PASSWORD) {
            passwordModal.classList.add('hidden');
            mainView.classList.add('hidden');
            adminBtn.classList.add('hidden');
            adminView.classList.remove('hidden');
            passwordInput.value = '';
            loginError.classList.add('hidden');
            fetchDatabaseAudit();
        } else {
            loginError.classList.remove('hidden');
            passwordInput.value = '';
        }
    };

    submitPassBtn.addEventListener('click', triggerAuthentication);
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') triggerAuthentication(); });

    exitAdminBtn.addEventListener('click', () => {
        adminView.classList.add('hidden');
        mainView.classList.remove('hidden');
        adminBtn.classList.remove('hidden');
    });
});
