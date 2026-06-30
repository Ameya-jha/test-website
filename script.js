document.addEventListener("DOMContentLoaded", () => {
    const ipElement = document.getElementById('ip');

    // Fetch public IP address from a secure, fast API
    fetch('https://api.ipify.org?format=json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response failure');
            }
            return response.json();
        })
        .then(data => {
            // Update UI with the retrieved IP
            ipElement.innerText = data.ip;
            ipElement.classList.remove('loading');
        })
        .catch(error => {
            // Graceful fallback UI in case of ad-blockers or API downtime
            ipElement.innerText = "Unavailable";
            ipElement.style.color = "#cb2431"; // Warning Red
            ipElement.classList.remove('loading');
            console.error('Failed to retrieve IP:', error);
        });
});
