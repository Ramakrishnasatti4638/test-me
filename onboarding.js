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

// DOM Elements
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateStep(1);
    attachEventListeners();
});

function attachEventListeners() {
    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handleBack);
    submitBtn.addEventListener('click', handleSubmit);

    // Edit buttons in review step
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const step = parseInt(e.target.dataset.step);
            updateStep(step);
        });
    });

    // Real-time validation
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.form.id === 'personalForm') {
                validatePersonalInfo(false);
            } else if (input.form.id === 'accountForm') {
                validateAccountSetup(false);
            }
        });

        input.addEventListener('input', () => {
            const errorSpan = input.parentElement.querySelector('.error-message');
            if (errorSpan && errorSpan.textContent) {
                errorSpan.textContent = '';
                input.classList.remove('error');
            }
        });
    });
}

function handleNext() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        if (currentStep < totalSteps) {
            updateStep(currentStep + 1);
        }
    }
}

function handleBack() {
    if (currentStep > 1) {
        saveCurrentStepData();
        updateStep(currentStep - 1);
    }
}

async function handleSubmit() {
    saveCurrentStepData();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/onboarding/complete`, {
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
            successMessage.style.display = 'block';
            document.querySelector('.wizard-content').style.display = 'none';
            document.querySelector('.wizard-navigation').style.display = 'none';
        } else {
            alert('Error: ' + (data.error || 'Failed to complete onboarding'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Onboarding';
        }
    } catch (error) {
        alert('Error: Failed to connect to server. Please make sure the API is running.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Onboarding';
    }
}

function updateStep(step) {
    currentStep = step;

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((elem, index) => {
        const stepNum = index + 1;
        elem.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            elem.classList.add('completed');
        } else if (stepNum === currentStep) {
            elem.classList.add('active');
        }
    });

    // Update content
    document.querySelectorAll('.step-content').forEach((elem, index) => {
        elem.classList.remove('active');
        if (index + 1 === currentStep) {
            elem.classList.add('active');
        }
    });

    // Update navigation buttons
    backBtn.style.display = currentStep === 1 ? 'none' : 'block';
    
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        populateReview();
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }

    // Populate form fields with saved data
    populateFormFields();
}

function populateFormFields() {
    if (currentStep === 1) {
        document.getElementById('firstName').value = formData.firstName;
        document.getElementById('lastName').value = formData.lastName;
        document.getElementById('dateOfBirth').value = formData.dateOfBirth;
    } else if (currentStep === 2) {
        document.getElementById('username').value = formData.username;
        document.getElementById('password').value = formData.password;
        document.getElementById('confirmPassword').value = formData.confirmPassword;
    } else if (currentStep === 3) {
        document.getElementById('newsletter').checked = formData.newsletter;
        document.getElementById('notifications').checked = formData.notifications;
        document.getElementById('darkMode').checked = formData.darkMode;
    }
}

function saveCurrentStepData() {
    if (currentStep === 1) {
        formData.firstName = document.getElementById('firstName').value.trim();
        formData.lastName = document.getElementById('lastName').value.trim();
        formData.dateOfBirth = document.getElementById('dateOfBirth').value;
    } else if (currentStep === 2) {
        formData.username = document.getElementById('username').value.trim();
        formData.password = document.getElementById('password').value;
        formData.confirmPassword = document.getElementById('confirmPassword').value;
    } else if (currentStep === 3) {
        formData.newsletter = document.getElementById('newsletter').checked;
        formData.notifications = document.getElementById('notifications').checked;
        formData.darkMode = document.getElementById('darkMode').checked;
    }
}

function validateCurrentStep() {
    if (currentStep === 1) {
        return validatePersonalInfo(true);
    } else if (currentStep === 2) {
        return validateAccountSetup(true);
    } else if (currentStep === 3) {
        return true; // Preferences are optional
    }
    return true;
}

function validatePersonalInfo(showErrors) {
    let isValid = true;

    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const dateOfBirth = document.getElementById('dateOfBirth');

    // Validate first name
    if (!firstName.value.trim()) {
        if (showErrors) {
            setError(firstName, 'First name is required');
        }
        isValid = false;
    } else {
        clearError(firstName);
    }

    // Validate last name
    if (!lastName.value.trim()) {
        if (showErrors) {
            setError(lastName, 'Last name is required');
        }
        isValid = false;
    } else {
        clearError(lastName);
    }

    // Validate date of birth
    if (!dateOfBirth.value) {
        if (showErrors) {
            setError(dateOfBirth, 'Date of birth is required');
        }
        isValid = false;
    } else {
        const dob = new Date(dateOfBirth.value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        
        if (age < 13) {
            if (showErrors) {
                setError(dateOfBirth, 'You must be at least 13 years old');
            }
            isValid = false;
        } else if (dob > today) {
            if (showErrors) {
                setError(dateOfBirth, 'Date of birth cannot be in the future');
            }
            isValid = false;
        } else {
            clearError(dateOfBirth);
        }
    }

    return isValid;
}

function validateAccountSetup(showErrors) {
    let isValid = true;

    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // Validate username
    if (!username.value.trim()) {
        if (showErrors) {
            setError(username, 'Username is required');
        }
        isValid = false;
    } else if (username.value.trim().length < 3) {
        if (showErrors) {
            setError(username, 'Username must be at least 3 characters');
        }
        isValid = false;
    } else {
        clearError(username);
    }

    // Validate password
    if (!password.value) {
        if (showErrors) {
            setError(password, 'Password is required');
        }
        isValid = false;
    } else if (password.value.length < 6) {
        if (showErrors) {
            setError(password, 'Password must be at least 6 characters');
        }
        isValid = false;
    } else {
        clearError(password);
    }

    // Validate confirm password
    if (!confirmPassword.value) {
        if (showErrors) {
            setError(confirmPassword, 'Please confirm your password');
        }
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        if (showErrors) {
            setError(confirmPassword, 'Passwords do not match');
        }
        isValid = false;
    } else {
        clearError(confirmPassword);
    }

    return isValid;
}

function setError(input, message) {
    input.classList.add('error');
    const errorSpan = input.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

function clearError(input) {
    input.classList.remove('error');
    const errorSpan = input.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = '';
    }
}

function populateReview() {
    document.getElementById('reviewFirstName').textContent = formData.firstName;
    document.getElementById('reviewLastName').textContent = formData.lastName;
    document.getElementById('reviewDateOfBirth').textContent = formData.dateOfBirth;
    document.getElementById('reviewUsername').textContent = formData.username;
    document.getElementById('reviewNewsletter').textContent = formData.newsletter ? 'Yes' : 'No';
    document.getElementById('reviewNotifications').textContent = formData.notifications ? 'Yes' : 'No';
    document.getElementById('reviewDarkMode').textContent = formData.darkMode ? 'Yes' : 'No';
}
