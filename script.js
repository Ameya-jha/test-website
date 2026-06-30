const ACCESS_KEY = "1234"; // Set your password here

// REPLACE THESE with your own free credentials from a service like jsonbin.io or your own backend API
// For a quick zero-setup test, this code demonstrates how network requests sync data:
const API_URL = "https://api.jsonbin.io/v3/qs/6a43604ef5f4af5e2945c500";
const API_MASTER_KEY = "$2a$10$lPB.nJiq6s9VfBAeHO/DD.rhW2r.uWnjDmMN83dtp/ZQAdJ5JbClm";

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

    // 1. Fetch current user's IP
    fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => {
            ipElement.innerText = data.ip;
            ipElement.classList.remove('loading');
            saveIPToCloudDatabase(data.ip);
        })
        .catch(() => {
            ipElement.innerText = "Unavailable";
            ipElement.classList.remove('loading');
        });

    // 2. SEND the IP to a real central cloud database
    function saveIPToCloudDatabase(ipAddress) {
        const time = new Date().toLocaleString();
        const newLog = { time, ip: ipAddress };

        // First, fetch existing logs from the cloud database, append the new one, and save it back
        if(API_URL.includes("YOUR_BIN_ID_HERE")) {
            console.log("Database not configured yet. Saving locally instead.");
            return;
        }

        fetch(API_URL, {
            method: 'GET',
            headers: { 'X-Master-Key': API_MASTER_KEY }
        })
        .then(res => res.json())
        .then(result => {
            let currentLogs = result.record.logs || [];
            currentLogs.unshift(newLog); // Add new login to the top

            // Put the updated list back into the cloud storage
            return fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_MASTER_KEY
                },
                body: JSON.stringify({ logs: currentLogs })
            });
        })
        .catch(err => console.error("Cloud saving error:", err));
    }

    // 3. FETCH all logs from the cloud database to show in the Admin Console
    function buildSystematicDashboard() {
        logsTbody.innerHTML = '<tr><td colspan="2" class="loading-logs">Syncing with secure cloud database...</td></tr>';
        
        if(API_URL.includes("YOUR_BIN_ID_HERE")) {
            logsTbody.innerHTML = '<tr><td colspan="2" class="error-msg">Please configure your API_URL database keys in script.js to see other devices!</td></tr>';
            return;
        }

        fetch(API_URL, {
            method: 'GET',
            headers: { 'X-Master-Key': API_MASTER_KEY }
        })
        .then(res => res.json())
        .then(result => {
            const cloudLogs = result.record.logs || [];
            logsTbody.innerHTML = '';
            
            if(cloudLogs.length === 0) {
                logsTbody.innerHTML = '<tr><td colspan="2" class="loading-logs">No records found.</td></tr>';
                return;
            }

            cloudLogs.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${entry.time}</td><td><code>${entry.ip}</code></td>`;
                logsTbody.appendChild(row);
            });
        })
        .catch(() => {
            logsTbody.innerHTML = '<tr><td colspan="2" class="error-msg">Error pulling data from cloud database.</td></tr>';
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
            adminBtn.classList.add('hidden');
            adminView.classList.remove('hidden');
            passwordInput.value = '';
            loginError.classList.add('hidden');
            buildSystematicDashboard(); // Triggers the remote database pull
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
