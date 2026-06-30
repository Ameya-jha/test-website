// configuration setup
const ADMIN_PASSWORD = "admin123_change_me"; // <-- Change your password placeholder here!

// Simulated fallback local database since GitHub has no real server backend
let mockDatabase = [
    { timestamp: new Date(Date.now() - 600000).toLocaleString(), ip: "192.168.1.45" },
    { timestamp: new Date(Date.now() - 300000).toLocaleString(), ip: "103.45.201.12" }
];

document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
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

    // 1. Fetch current visitor's IP address
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            ipElement.innerText = data.ip;
            ipElement.classList.remove('loading');

            // Log current IP address
            saveVisitorIP(data.ip);
        })
        .catch(error => {
            ipElement.innerText = "Unavailable";
            ipElement.classList.remove('loading');
            console.error('IP fetch error:', error);
        });

    // 2. Logic to log/store IP addresses
    function saveVisitorIP(detectedIP) {
        const timestamp = new Date().toLocaleString();
        
        // Push to local temporary array for demonstration
        mockDatabase.unshift({ timestamp, ip: detectedIP });

        /* 
           PRODUCTION LOGGING TIP:
           Because GitHub Pages is a static server, to permanently log these IPs you must 
           send a POST request here to an external endpoint, for example:
           
           fetch('https://your-api-endpoint.com/logs', {
               method: 'POST',
               body: JSON.stringify({ ip: detectedIP })
           });
        */
    }

    // 3. Render Dashboard Tables 
    function renderLogs() {
        logsTbody.innerHTML = '';
        mockDatabase.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${log.timestamp}</td><td><strong>${log.ip}</strong></td>`;
            logsTbody.appendChild(row);
        });
    }

    // 4. Modal Event Handlers
    adminBtn.addEventListener('click', () => {
        passwordModal.classList.remove('hidden');
        passwordInput.focus();
    });

    cancelBtn.addEventListener('click', () => {
        passwordModal.classList.add('hidden');
        passwordInput.value = '';
        loginError.classList.add('hidden');
    });

    submitPassBtn.addEventListener('click', handleAuth);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAuth();
    });

    function handleAuth() {
        if (passwordInput.value === ADMIN_PASSWORD) {
            passwordModal.classList.add('hidden');
            mainView.classList.add('hidden');
            adminView.classList.remove('hidden');
            passwordInput.value = '';
            loginError.classList.add('hidden');
            renderLogs(); // Update visual list
        } else {
            loginError.classList.remove('hidden');
            passwordInput.value = '';
        }
    }

    backBtn.addEventListener('click', () => {
        adminView.classList.add('hidden');
        mainView.classList.remove('hidden');
    });
});
