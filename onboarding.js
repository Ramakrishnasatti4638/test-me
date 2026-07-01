const API_BASE_URL = 'http://localhost:3000';

let currentStep = 1;
const totalSteps = 4;

const formData = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    username: '',
    password: '',
    confirmPassword: '',
    newsletter: false,
    notifications: false,
    darkMode: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateButtons();
    loadFormData();
    
    // Add input listeners to save data
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            saveFormData(input);
        });
    });
});

function saveFormData(input) {
    const { id, type, checked, value } = input;
    
    if (type === 'checkbox') {
        formData[id] = checked;
    } else {
        formData[id] = value;
    }
}

function loadFormData() {
    Object.keys(formData).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = formData[key];
            } else {
                input.value = formData[key];
            }
        }
    });
}

function validateStep(step) {
    clearErrors();
    let isValid = true;

    if (step === 1) {
        // Validate Personal Info
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const dateOfBirth = document.getElementById('dateOfBirth').value;

        if (!firstName) {
            showError('firstName', 'First name is required');
            isValid = false;
        } else if (firstName.length < 2) {
            showError('firstName', 'First name must be at least 2 characters');
            isValid = false;
        }

        if (!lastName) {
            showError('lastName', 'Last name is required');
            isValid = false;
        } else if (lastName.length < 2) {
            showError('lastName', 'Last name must be at least 2 characters');
            isValid = false;
        }

        if (!dateOfBirth) {
            showError('dateOfBirth', 'Date of birth is required');
            isValid = false;
        } else {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            const age = today.getFullYear() - birthDate.getFullYear();
            
            if (age < 13 || (age === 13 && today < new Date(birthDate.setFullYear(birthDate.getFullYear() + 13)))) {
                showError('dateOfBirth', 'You must be at least 13 years old');
                isValid = false;
            }
        }
    }

    if (step === 2) {
        // Validate Account Setup
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username) {
            showError('username', 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            showError('username', 'Username must be at least 3 characters');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError('username', 'Username can only contain letters, numbers, and underscores');
            isValid = false;
        }

        if (!password) {
            showError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            isValid = false;
        }

        if (!confirmPassword) {
            showError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
    }

    return isValid;
}

function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`${fieldId}-error`);
    
    if (input) input.classList.add('error');
    if (errorSpan) errorSpan.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(span => {
        span.textContent = '';
    });
    document.querySelectorAll('input.error').forEach(input => {
        input.classList.remove('error');
    });
}

function nextStep() {
    if (currentStep < totalSteps) {
        if (validateStep(currentStep)) {
            if (currentStep === totalSteps - 1) {
                // Moving to review step, populate review data
                populateReview();
            }
            
            currentStep++;
            updateStep();
            updateButtons();
        }
    } else {
        // Submit form
        submitForm();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
        updateButtons();
        clearErrors();
    }
}

function editStep(step) {
    currentStep = step;
    updateStep();
    updateButtons();
}

function updateStep() {
    // Update step content visibility
    document.querySelectorAll('.step-content').forEach((content, index) => {
        content.classList.toggle('active', index + 1 === currentStep);
    });

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.toggle('active', stepNum === currentStep);
        step.classList.toggle('completed', stepNum < currentStep);
    });

    // Update progress lines
    document.querySelectorAll('.progress-line').forEach((line, index) => {
        line.classList.toggle('completed', index + 1 < currentStep);
    });
}

function updateButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === totalSteps) {
        nextBtn.textContent = 'Submit';
    } else {
        nextBtn.textContent = 'Next';
    }
}

function populateReview() {
    // Personal Info
    document.getElementById('review-firstName').textContent = formData.firstName || '-';
    document.getElementById('review-lastName').textContent = formData.lastName || '-';
    document.getElementById('review-dateOfBirth').textContent = formData.dateOfBirth || '-';

    // Account Setup
    document.getElementById('review-username').textContent = formData.username || '-';

    // Preferences
    document.getElementById('review-newsletter').textContent = formData.newsletter ? 'Enabled' : 'Disabled';
    document.getElementById('review-notifications').textContent = formData.notifications ? 'Enabled' : 'Disabled';
    document.getElementById('review-darkMode').textContent = formData.darkMode ? 'Enabled' : 'Disabled';
}

async function submitForm() {
    const submitMessage = document.getElementById('submit-message');
    const nextBtn = document.getElementById('nextBtn');
    
    nextBtn.disabled = true;
    nextBtn.textContent = 'Submitting...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/onboarding/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                username: formData.username,
                password: formData.password,
                newsletter: formData.newsletter,
                notifications: formData.notifications,
                darkMode: formData.darkMode
            })
        });

        const data = await response.json();

        if (response.ok) {
            submitMessage.className = 'submit-message success';
            submitMessage.textContent = '✓ Onboarding completed successfully! Welcome aboard!';
            nextBtn.textContent = 'Completed';
            
            // Reset form after 2 seconds
            setTimeout(() => {
                resetForm();
            }, 3000);
        } else {
            submitMessage.className = 'submit-message error';
            submitMessage.textContent = `Error: ${data.error || 'Failed to submit'}`;
            nextBtn.disabled = false;
            nextBtn.textContent = 'Submit';
        }
    } catch (error) {
        submitMessage.className = 'submit-message error';
        submitMessage.textContent = `Error: Unable to connect to server. Please try again.`;
        nextBtn.disabled = false;
        nextBtn.textContent = 'Submit';
    }
}

function resetForm() {
    currentStep = 1;
    
    // Reset form data
    Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'boolean') {
            formData[key] = false;
        } else {
            formData[key] = '';
        }
    });
    
    // Clear all inputs
    document.querySelectorAll('input').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Clear submit message
    document.getElementById('submit-message').textContent = '';
    
    updateStep();
    updateButtons();
}
