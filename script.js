const ACCESS_KEY = "admin123_change_me"; // Set your password here

// Systematic mock collection tracking past records
let trackedLogins = [
    { time: "2026-06-30, 11:15:22 AM", ip: "157.45.22.101" },
    { time: "2026-06-30, 10:42:05 AM", ip: "192.168.1.1" }
];

document.addEventListener("DOMContentLoaded", () => {
    const ipElement = document.getElementById('ip');
    const adminBtn = document.getElementById('admin-btn');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const submitPassBtn = document.getElementById('submit-pass-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const loginError = document.getElementById('login-error');
    
    const mainView = document.getElementById('main-view');
    const adminView = document.getElementById('admin-view');
    const backBtn = document.getElementById('back-btn');
    const logsTbody = document.getElementById('logs-tbody');

    // Fetch and dynamically log user IP address
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            ipElement.innerText = data.ip;
            ipElement.classList.remove('loading');
            logCurrentVisit(data.ip);
        })
        .catch(() => {
            ipElement.innerText = "Unavailable";
            ipElement.classList.remove('loading');
        });

    function logCurrentVisit(ipAddress) {
        const time = new Date().toLocaleString();
        // Insert new systematic login at the beginning of the logging structure
        trackedLogins.unshift({ time, ip: ipAddress });
    }

    function buildSystematicDashboard() {
        logsTbody.innerHTML = '';
        trackedLogins.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${entry.time}</td><td><code>${entry.ip}</code></td>`;
            logsTbody.appendChild(row);
        });
    }

    // View Switching Mechanics
    adminBtn.addEventListener('click', () => {
        passwordModal.classList.remove('hidden');
        passwordInput.focus();
    });

    cancelBtn.addEventListener('click', () => {
        passwordModal.classList.add('hidden');
        passwordInput.value = '';
        loginError.classList.add('hidden');
    });

    const verifyCredentials = () => {
        if (passwordInput.value === ACCESS_KEY) {
            passwordModal.classList.add('hidden');
            mainView.classList.add('hidden');
            adminBtn.classList.add('hidden'); // Hide entry button while inside console
            adminView.classList.remove('hidden');
            passwordInput.value = '';
            loginError.classList.add('hidden');
            buildSystematicDashboard();
        } else {
            loginError.classList.remove('hidden');
            passwordInput.value = '';
        }
    };

    submitPassBtn.addEventListener('click', verifyCredentials);
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') verifyCredentials(); });

    backBtn.addEventListener('click', () => {
        adminView.classList.add('hidden');
        mainView.classList.remove('hidden');
        adminBtn.classList.remove('hidden');
    });
});
