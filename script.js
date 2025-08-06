// Paste the Web App URL you copied from Google Apps Script here.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyueWgtHEEPsNEjyMI7wn5FxvqCH-hGYnIpTiuuG_UKt-2hYpE3uR-ajhZP877lBDu-Vw/exec"; 

const form = document.getElementById('registrationForm');
const submitButton = document.getElementById('submitButton');
const statusMessage = document.getElementById('statusMessage');
const membersListDiv = document.getElementById('membersList');

// --- 1. HANDLE FORM SUBMISSION ---
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    
    // Disable button to prevent multiple submissions
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'no-cors' // IMPORTANT: This is required for this method
                       // but it means we don't get a direct success/error response
                       // from the fetch itself. We'll handle this optimistically.
    })
    .then(() => {
        // Since 'no-cors' mode doesn't give a response, we assume success
        statusMessage.textContent = 'Registration successful! Thank you.';
        statusMessage.style.color = 'var(--success-color)';
        form.reset(); // Clear the form
        
        // Refresh the member list to show the new entry immediately
        fetchMembers(); 
    })
    .catch(error => {
        // This catch block might not be triggered in 'no-cors' mode,
        // but it's good practice to have it.
        statusMessage.textContent = 'An error occurred. Please try again.';
        statusMessage.style.color = 'var(--error-color)';
        console.error('Error:', error);
    })
    .finally(() => {
        // Re-enable the button after a short delay
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Register Now';
        }, 2000);
    });
});

// --- 2. FETCH AND DISPLAY MEMBERS ---
function fetchMembers() {
    membersListDiv.innerHTML = '<p class="loading">Refreshing members list...</p>';

    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            membersListDiv.innerHTML = ''; // Clear the loading message
            if (data.length === 0) {
                membersListDiv.innerHTML = '<p>No members have registered yet.</p>';
                return;
            }

            // Create a card for each member
            data.forEach(member => {
                const card = document.createElement('div');
                card.className = 'member-card';
                card.innerHTML = `
                    <h3>${member.Name || 'N/A'}</h3>
                    <p><strong>Email:</strong> ${member.Email || 'N/A'}</p>
                    <p><strong>Country:</strong> ${member.Country || 'N/A'}</p>
                    <p><strong>Registered:</strong> ${member.Timestamp || 'N/A'}</p>
                `;
                membersListDiv.appendChild(card);
            });
        })
        .catch(error => {
            membersListDiv.innerHTML = '<p class="loading">Could not load members. Please try refreshing the page.</p>';
            console.error('Error fetching members:', error);
        });
}

// --- 3. INITIAL LOAD ---
// Fetch the members as soon as the page loads
document.addEventListener('DOMContentLoaded', fetchMembers);