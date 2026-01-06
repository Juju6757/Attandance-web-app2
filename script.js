// Attendance Management System JavaScript

// Global variables
let students = [];
let attendance = {};
let currentTab = 'students';
let isAuthenticated = false;

// Default admin credentials (for backward compatibility)
const DEFAULT_ADMIN = {
    username: 'teacher',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'Teacher',
    email: 'demo@college.edu',
    department: 'Administration',
    role: 'Admin',
    employeeId: 'ADM001',
    registeredDate: new Date().toISOString()
};

// User Management Functions
function loadUsers() {
    const storedUsers = localStorage.getItem('attendanceUsers');
    if (storedUsers) {
        return JSON.parse(storedUsers);
    } else {
        // Initialize with default admin user
        const defaultUsers = [DEFAULT_ADMIN];
        localStorage.setItem('attendanceUsers', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
}

// Simple encryption/decryption for stored passwords (basic obfuscation)
function encryptPassword(password) {
    // Simple base64 encoding with a shift cipher for basic obfuscation
    return btoa(password.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 3)).join(''));
}

function decryptPassword(encryptedPassword) {
    try {
        return atob(encryptedPassword).split('').map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('');
    } catch (e) {
        return ''; // Return empty string if decryption fails
    }
}

// Recent Logins Management Functions
function loadRecentLogins() {
    const storedLogins = localStorage.getItem('attendanceRecentLogins');
    return storedLogins ? JSON.parse(storedLogins) : [];
}

function saveRecentLogins(recentLogins) {
    // Keep only the last 5 logins
    const limitedLogins = recentLogins.slice(-5);
    localStorage.setItem('attendanceRecentLogins', JSON.stringify(limitedLogins));
}

function addToRecentLogins(username) {
    const recentLogins = loadRecentLogins();
    
    // Remove existing entry for this username to avoid duplicates
    const filteredLogins = recentLogins.filter(login => login.username !== username);
    
    // Add new login at the end (most recent) without password
    filteredLogins.push({
        username: username,
        loginDate: new Date().toISOString()
    });
    
    saveRecentLogins(filteredLogins);
    updateRecentLoginsDropdown();
}

function updateRecentLoginsDropdown() {
    const recentLogins = loadRecentLogins();
    const dropdown = document.getElementById('recentLogins');
    const recentLoginsGroup = document.getElementById('recentLoginsGroup');
    
    if (!dropdown || !recentLoginsGroup) return;
    
    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Select a recent username...</option>';
    
    if (recentLogins.length === 0) {
        recentLoginsGroup.style.display = 'none';
        return;
    }
    
    // Show the dropdown group
    recentLoginsGroup.style.display = 'block';
    
    // Add options for recent logins (reverse to show most recent first)
    recentLogins.reverse().forEach((login, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = login.username;
        dropdown.appendChild(option);
    });
}

function fillLoginFromRecent() {
    const dropdown = document.getElementById('recentLogins');
    const selectedIndex = dropdown.value;
    
    if (selectedIndex === '') return;
    
    const recentLogins = loadRecentLogins();
    const reversedLogins = recentLogins.reverse();
    const selectedLogin = reversedLogins[selectedIndex];
    
    if (selectedLogin) {
        document.getElementById('loginUsername').value = selectedLogin.username;
        document.getElementById('loginPassword').value = ''; // Clear password field
        document.getElementById('loginPassword').focus(); // Focus on password field
    }
}

function clearRecentLogins() {
    if (confirm('Are you sure you want to clear all recent username history?')) {
        localStorage.removeItem('attendanceRecentLogins');
        updateRecentLoginsDropdown();
        showAlert('Recent username history cleared', 'info');
    }
}

function saveUsers(users) {
    localStorage.setItem('attendanceUsers', JSON.stringify(users));
}

function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Forgot Password Management
let forgotPasswordData = {
    email: null,
    otp: null,
    otpExpiry: null,
    otpTimer: null,
    resendTimer: null
};

// Form toggle functions
function showAuthForm(mode) {
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const otpVerificationForm = document.getElementById('otpVerificationForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const demoInfo = document.getElementById('demoInfo');
    
    // Hide all forms
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');
    forgotPasswordForm.classList.remove('active');
    otpVerificationForm.classList.remove('active');
    resetPasswordForm.classList.remove('active');
    
    if (mode === 'login') {
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
        loginForm.classList.add('active');
        demoInfo.style.display = 'block';
    } else if (mode === 'register') {
        loginToggle.classList.remove('active');
        registerToggle.classList.add('active');
        registerForm.classList.add('active');
        demoInfo.style.display = 'none';
    } else if (mode === 'forgot') {
        loginToggle.classList.remove('active');
        registerToggle.classList.remove('active');
        forgotPasswordForm.classList.add('active');
        demoInfo.style.display = 'none';
    } else if (mode === 'otp') {
        loginToggle.classList.remove('active');
        registerToggle.classList.remove('active');
        otpVerificationForm.classList.add('active');
        demoInfo.style.display = 'none';
    } else if (mode === 'reset') {
        loginToggle.classList.remove('active');
        registerToggle.classList.remove('active');
        resetPasswordForm.classList.add('active');
        demoInfo.style.display = 'none';
    }
}

function showForgotPasswordForm() {
    showAuthForm('forgot');
}

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',  // Replace with your EmailJS Service ID
    templateId: 'YOUR_TEMPLATE_ID', // Replace with your EmailJS Template ID
    publicKey: 'YOUR_PUBLIC_KEY'    // Replace with your EmailJS Public Key
};

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function initializeEmailJS() {
    // Initialize EmailJS with your public key
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        return true;
    }
    return false;
}

async function sendOTPEmail(email, otp, userName) {
    // Check if EmailJS is configured
    if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY' || 
        EMAILJS_CONFIG.serviceId === 'YOUR_SERVICE_ID' || 
        EMAILJS_CONFIG.templateId === 'YOUR_TEMPLATE_ID') {
        
        console.warn('EmailJS is not configured. Please set up your EmailJS credentials.');
        console.log('%c📧 Email Configuration Required', 'font-size: 16px; font-weight: bold; color: #f56565;');
        console.log('To enable real email sending:');
        console.log('1. Go to https://www.emailjs.com/');
        console.log('2. Create a free account');
        console.log('3. Set up an email service');
        console.log('4. Create an email template with variables: to_email, to_name, otp_code');
        console.log('5. Update EMAILJS_CONFIG in script.js with your credentials');
        
        // Fallback to demo mode
        console.log(`%c📧 OTP (Demo Mode)`, 'font-size: 16px; font-weight: bold; color: #667eea;');
        console.log(`To: ${email}`);
        console.log(`Your OTP code is: ${otp}`);
        console.log(`This code will expire in 5 minutes.`);
        
        alert(`🔐 EMAIL SERVICE NOT CONFIGURED\n\nYour OTP code is: ${otp}\n\nTo enable real email sending, please configure EmailJS.\nCheck the browser console for instructions.\n\nThe code will expire in 5 minutes.`);
        return true;
    }
    
    try {
        // Prepare email parameters
        const templateParams = {
            to_email: email,
            to_name: userName || 'User',
            otp_code: otp,
            expiry_time: '5 minutes'
        };
        
        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        console.log('Email sent successfully:', response);
        return true;
        
    } catch (error) {
        console.error('Failed to send email:', error);
        showAlert('Failed to send OTP email. Please try again later.', 'error');
        return false;
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    const users = loadUsers();
    
    // Check if email exists
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showAlert('No account found with this email address.', 'error');
        return;
    }
    
    // Generate OTP
    const otp = generateOTP();
    forgotPasswordData.email = email;
    forgotPasswordData.otp = otp;
    forgotPasswordData.otpExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Send OTP email
    const userName = `${user.firstName} ${user.lastName}`;
    const emailSent = await sendOTPEmail(email, otp, userName);
    
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
    
    if (!emailSent) {
        return; // Email sending failed, error already shown
    }
    
    // Clear form and show OTP verification
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('otpEmailDisplay').textContent = email;
    showAuthForm('otp');
    
    // Start OTP expiry timer
    startOTPTimer();
    startResendTimer();
    
    showAlert('OTP has been sent to your email address. Please check your inbox.', 'success');
}

function startOTPTimer() {
    clearInterval(forgotPasswordData.otpTimer);
    
    const updateTimer = () => {
        const now = Date.now();
        const timeLeft = forgotPasswordData.otpExpiry - now;
        
        if (timeLeft <= 0) {
            clearInterval(forgotPasswordData.otpTimer);
            document.getElementById('otpCountdown').textContent = '0:00';
            showAlert('OTP has expired. Please request a new one.', 'error');
            cancelPasswordReset();
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        document.getElementById('otpCountdown').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    updateTimer();
    forgotPasswordData.otpTimer = setInterval(updateTimer, 1000);
}

function startResendTimer() {
    const resendBtn = document.getElementById('resendOtpBtn');
    const resendTimerSpan = document.getElementById('resendTimer');
    let countdown = 60;
    
    resendBtn.disabled = true;
    
    clearInterval(forgotPasswordData.resendTimer);
    
    forgotPasswordData.resendTimer = setInterval(() => {
        countdown--;
        resendTimerSpan.textContent = `(${countdown}s)`;
        
        if (countdown <= 0) {
            clearInterval(forgotPasswordData.resendTimer);
            resendBtn.disabled = false;
            resendTimerSpan.textContent = '';
        }
    }, 1000);
}

async function resendOTP() {
    if (!forgotPasswordData.email) {
        showAlert('Session expired. Please start over.', 'error');
        cancelPasswordReset();
        return;
    }
    
    // Generate new OTP
    const otp = generateOTP();
    forgotPasswordData.otp = otp;
    forgotPasswordData.otpExpiry = Date.now() + (5 * 60 * 1000);
    
    // Show loading state
    const resendBtn = document.getElementById('resendOtpBtn');
    const originalBtnText = resendBtn.innerHTML;
    resendBtn.disabled = true;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Get user info
    const users = loadUsers();
    const user = users.find(u => u.email === forgotPasswordData.email);
    const userName = user ? `${user.firstName} ${user.lastName}` : 'User';
    
    // Send email
    const emailSent = await sendOTPEmail(forgotPasswordData.email, otp, userName);
    
    // Restore button state
    resendBtn.innerHTML = originalBtnText;
    
    if (!emailSent) {
        resendBtn.disabled = false;
        return; // Email sending failed, error already shown
    }
    
    // Restart timers
    startOTPTimer();
    startResendTimer();
    
    // Clear OTP input
    document.getElementById('otpCode').value = '';
    
    showAlert('A new OTP has been sent to your email.', 'success');
}

function handleOTPVerification(event) {
    event.preventDefault();
    
    const enteredOTP = document.getElementById('otpCode').value.trim();
    
    // Check if OTP is expired
    if (Date.now() > forgotPasswordData.otpExpiry) {
        showAlert('OTP has expired. Please request a new one.', 'error');
        cancelPasswordReset();
        return;
    }
    
    // Verify OTP
    if (enteredOTP !== forgotPasswordData.otp) {
        showAlert('Invalid OTP. Please check and try again.', 'error');
        return;
    }
    
    // OTP verified successfully
    clearInterval(forgotPasswordData.otpTimer);
    clearInterval(forgotPasswordData.resendTimer);
    
    // Clear form and show reset password form
    document.getElementById('otpVerificationForm').reset();
    showAuthForm('reset');
    
    showAlert('OTP verified successfully! Please set your new password.', 'success');
}

function handleResetPassword(event) {
    event.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validate passwords
    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showAlert('Passwords do not match. Please check and try again.', 'error');
        return;
    }
    
    // Update user password
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.email === forgotPasswordData.email);
    
    if (userIndex === -1) {
        showAlert('User not found. Please try again.', 'error');
        cancelPasswordReset();
        return;
    }
    
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    // Clear form and reset data
    document.getElementById('resetPasswordForm').reset();
    forgotPasswordData = {
        email: null,
        otp: null,
        otpExpiry: null,
        otpTimer: null,
        resendTimer: null
    };
    
    // Show login form
    showAuthForm('login');
    
    showAlert('Password reset successfully! You can now login with your new password.', 'success');
}

function cancelPasswordReset() {
    // Clear timers
    clearInterval(forgotPasswordData.otpTimer);
    clearInterval(forgotPasswordData.resendTimer);
    
    // Reset data
    forgotPasswordData = {
        email: null,
        otp: null,
        otpExpiry: null,
        otpTimer: null,
        resendTimer: null
    };
    
    // Clear forms
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('otpVerificationForm').reset();
    document.getElementById('resetPasswordForm').reset();
    
    // Show login form
    showAuthForm('login');
}

// Profile Picture Management
let profilePictureData = null;

function initializeProfilePictureUpload() {
    const profilePicInput = document.getElementById('profilePicture');
    const profilePicPreview = document.getElementById('profilePicPreview');
    const removeProfilePicBtn = document.getElementById('removeProfilePic');
    
    if (!profilePicInput || !profilePicPreview || !removeProfilePicBtn) return;
    
    // Handle file selection
    profilePicInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showAlert('Please select a valid image file.', 'error');
                profilePicInput.value = '';
                return;
            }
            
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showAlert('Image size should be less than 2MB.', 'error');
                profilePicInput.value = '';
                return;
            }
            
            // Read and preview the image
            const reader = new FileReader();
            reader.onload = function(event) {
                profilePictureData = event.target.result;
                displayProfilePicture(profilePictureData, profilePicPreview);
                removeProfilePicBtn.style.display = 'inline-flex';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Handle remove button
    removeProfilePicBtn.addEventListener('click', function() {
        profilePictureData = null;
        profilePicInput.value = '';
        resetProfilePicture(profilePicPreview);
        removeProfilePicBtn.style.display = 'none';
    });
}

function displayProfilePicture(imageData, previewElement) {
    previewElement.innerHTML = `<img src="${imageData}" alt="Profile Picture">`;
}

function resetProfilePicture(previewElement) {
    previewElement.innerHTML = '<i class="fas fa-user-circle"></i>';
}

function updateUserProfilePicture(user) {
    const userProfilePic = document.getElementById('userProfilePic');
    if (!userProfilePic) return;
    
    if (user && user.profilePicture) {
        userProfilePic.innerHTML = `<img src="${user.profilePicture}" alt="${user.firstName} ${user.lastName}">`;
    } else {
        userProfilePic.innerHTML = '<i class="fas fa-user-circle"></i>';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme first
    initializeTheme();
    
    // Initialize recent logins dropdown
    updateRecentLoginsDropdown();
    
    // Initialize profile picture upload
    initializeProfilePictureUpload();
    
    // Update login theme toggle button
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeToggleButton(currentTheme);
    
    checkAuthentication();
    
    // Set up form listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
    document.getElementById('otpVerificationForm').addEventListener('submit', handleOTPVerification);
    document.getElementById('resetPasswordForm').addEventListener('submit', handleResetPassword);
    
    // Initialize app if authenticated
    if (isAuthenticated) {
        initializeApp();
    }
});

// Check if user is already authenticated
function checkAuthentication() {
    const storedAuth = localStorage.getItem('teacherAuthenticated');
    if (storedAuth === 'true') {
        isAuthenticated = true;
        showMainApp();
        initializeApp();
    } else {
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

// Show main application
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        isAuthenticated = true;
        localStorage.setItem('teacherAuthenticated', 'true');
        setCurrentUser(user);
        
        // Save to recent logins (username only)
        addToRecentLogins(username);
        
        showMainApp();
        initializeApp();
        
        // Clear login form
        document.getElementById('loginForm').reset();
        
        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${user.firstName} ${user.lastName}`;
        }
        
        showAlert(`Login successful! Welcome back, ${user.firstName}.`, 'success');
    } else {
        showAlert('Invalid username or password. Please try again.', 'error');
    }
}

// Handle registration form submission
function handleRegister(event) {
    event.preventDefault();
    console.log('Registration form submitted');
    
    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        department: document.getElementById('department').value,
        role: document.getElementById('role').value,
        username: document.getElementById('registerUsername').value.trim(),
        employeeId: document.getElementById('employeeId').value.trim(),
        password: document.getElementById('registerPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    console.log('Form data:', formData);
    
    // Validation
    if (!validateRegistrationForm(formData)) {
        return;
    }
    
    const users = loadUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === formData.username)) {
        showAlert('Username already exists. Please choose a different username.', 'error');
        return;
    }
    
    // Check if employee ID already exists
    if (users.find(u => u.employeeId === formData.employeeId)) {
        showAlert('Employee ID already exists. Please check and try again.', 'error');
        return;
    }
    
    // Check if email already exists
    if (users.find(u => u.email === formData.email)) {
        showAlert('Email already registered. Please use a different email.', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        role: formData.role,
        employeeId: formData.employeeId,
        profilePicture: profilePictureData || null,
        registeredDate: new Date().toISOString()
    };
    
    // Add user to database
    users.push(newUser);
    saveUsers(users);
    
    // Clear registration form
    document.getElementById('registerForm').reset();
    
    // Reset profile picture
    profilePictureData = null;
    const profilePicPreview = document.getElementById('profilePicPreview');
    const removeProfilePicBtn = document.getElementById('removeProfilePic');
    if (profilePicPreview) resetProfilePicture(profilePicPreview);
    if (removeProfilePicBtn) removeProfilePicBtn.style.display = 'none';
    
    // Switch to login form
    showAuthForm('login');
    
    showAlert(`Registration successful! Welcome to the team, ${newUser.firstName}. You can now login.`, 'success');
}

// Validate registration form
function validateRegistrationForm(data) {
    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'department', 'role', 'username', 'employeeId', 'password', 'confirmPassword'];
    
    for (let field of requiredFields) {
        if (!data[field]) {
            showAlert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return false;
        }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showAlert('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Validate password length
    if (data.password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'error');
        return false;
    }
    
    // Check password confirmation
    if (data.password !== data.confirmPassword) {
        showAlert('Passwords do not match. Please check and try again.', 'error');
        return false;
    }
    
    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(data.username)) {
        showAlert('Username can only contain letters, numbers, and underscores.', 'error');
        return false;
    }
    
    // Check username length
    if (data.username.length < 3) {
        showAlert('Username must be at least 3 characters long.', 'error');
        return false;
    }
    
    return true;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        isAuthenticated = false;
        localStorage.removeItem('teacherAuthenticated');
        localStorage.removeItem('currentUser');
        showLoginScreen();
        
        // Reset any form data
        document.getElementById('studentForm').reset();
        document.getElementById('editStudentForm').reset();
        
        // Reset to login form
        showAuthForm('login');
    }
}

// Theme Management Functions
function initializeTheme() {
    const savedTheme = localStorage.getItem('attendanceAppTheme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('attendanceAppTheme', theme);
    updateThemeToggleButton(theme);
}

function toggleTheme(event) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Get the button that was clicked to determine transition origin
    let clickX = window.innerWidth / 2;
    let clickY = window.innerHeight / 2;
    
    if (event && event.target) {
        const button = event.target.closest('button');
        if (button) {
            const rect = button.getBoundingClientRect();
            clickX = rect.left + rect.width / 2;
            clickY = rect.top + rect.height / 2;
        }
    }
    
    // Start the transition animation
    startThemeTransition(clickX, clickY, newTheme);
}

function startThemeTransition(x, y, newTheme) {
    const transitionEl = document.getElementById('themeTransition');
    if (!transitionEl) {
        // Fallback if transition element doesn't exist
        setTheme(newTheme);
        return;
    }
    
    // Set the transition origin point
    const xPercent = (x / window.innerWidth) * 100;
    const yPercent = (y / window.innerHeight) * 100;
    
    transitionEl.style.setProperty('--transition-x', xPercent + '%');
    transitionEl.style.setProperty('--transition-y', yPercent + '%');
    
    // Update the transition background to match the new theme
    if (newTheme === 'dark') {
        transitionEl.style.background = 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)';
    } else {
        transitionEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    // Start the animation first
    requestAnimationFrame(() => {
        transitionEl.classList.add('active');
        
        // Change theme right after animation starts for seamless reveal
        requestAnimationFrame(() => {
            setTheme(newTheme);
        });
    });
    
    // Clean up the animation after it completes
    setTimeout(() => {
        transitionEl.classList.remove('active');
    }, 600);
}

function updateThemeToggleButton(theme) {
    // Update main app theme toggle button
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
        const icon = toggleButton.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            toggleButton.title = 'Switch to Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            toggleButton.title = 'Switch to Dark Mode';
        }
    }
    
    // Update login page theme toggle button
    const loginToggleButton = document.getElementById('loginThemeToggle');
    if (loginToggleButton) {
        const icon = loginToggleButton.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            loginToggleButton.title = 'Switch to Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            loginToggleButton.title = 'Switch to Dark Mode';
        }
    }
}

// Student ID Generation Functions
function populateYearDropdown(selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;
    
    // Clear existing options except the first one
    selectElement.innerHTML = '<option value="">Select Year</option>';
    
    // Add years from 2024 to 2100
    for (let year = 2024; year <= 2100; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        selectElement.appendChild(option);
    }
}

function generateStudentId(stream, year, rollNumber) {
    if (!stream || !year || !rollNumber) {
        return '';
    }
    
    // Format year as last 3 digits (e.g., 2024 -> 024)
    const yearSuffix = year.toString().slice(-3);
    
    // Format roll number as 3 digits with leading zeros
    const formattedRoll = rollNumber.toString().padStart(3, '0');
    
    // Combine: STREAM + YEAR + "-" + ROLL
    return `${stream}${yearSuffix}-${formattedRoll}`;
}

function updateIdPreview(previewElementId, stream, year, rollNumber) {
    const previewElement = document.getElementById(previewElementId);
    if (!previewElement) return;
    
    const generatedId = generateStudentId(stream, year, rollNumber);
    
    if (generatedId) {
        previewElement.textContent = generatedId;
        previewElement.classList.remove('empty');
    } else {
        previewElement.textContent = 'Select options to preview ID';
        previewElement.classList.add('empty');
    }
}

function setupIdBuilder(streamId, yearId, rollId, previewId) {
    const streamSelect = document.getElementById(streamId);
    const yearSelect = document.getElementById(yearId);
    const rollInput = document.getElementById(rollId);
    
    // Populate year dropdown
    populateYearDropdown(yearId);
    
    // Add event listeners for real-time preview
    const updatePreview = () => {
        const stream = streamSelect?.value || '';
        const year = yearSelect?.value || '';
        const roll = rollInput?.value || '';
        updateIdPreview(previewId, stream, year, roll);
    };
    
    if (streamSelect) streamSelect.addEventListener('change', updatePreview);
    if (yearSelect) yearSelect.addEventListener('change', updatePreview);
    if (rollInput) rollInput.addEventListener('input', updatePreview);
    
    // Initial preview update
    updatePreview();
}

function parseStudentId(studentId) {
    // Parse ID format: STREAM + YYY + "-" + RRR
    // Example: BCA024-059
    const match = studentId.match(/^([A-Z]+)(\d{3})-(\d{3})$/);
    
    if (match) {
        const [, stream, yearSuffix, rollNumber] = match;
        // Convert year suffix back to full year (024 -> 2024)
        const year = `20${yearSuffix}`;
        
        return {
            stream: stream,
            year: year,
            rollNumber: parseInt(rollNumber, 10)
        };
    }
    
    return null;
}

// Function to populate stream dropdowns based on user access
function populateAccessibleStreamDropdowns() {
    const accessibleStreams = getAccessibleStreams();
    const streamSelects = ['studentStream', 'editStudentStream'];
    
    streamSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            // Clear existing options except the first one
            select.innerHTML = '<option value="">Select Stream</option>';
            
            // Add accessible streams
            accessibleStreams.forEach(stream => {
                const option = document.createElement('option');
                option.value = stream;
                option.textContent = stream;
                select.appendChild(option);
            });
            
            // If only one stream is accessible, auto-select it
            if (accessibleStreams.length === 1) {
                select.value = accessibleStreams[0];
                select.disabled = true; // Disable dropdown if only one option
            } else {
                select.disabled = false;
            }
        }
    });
}

// Initialize the main application
function initializeApp() {
    loadData();
    updateCurrentDate();
    setTodayAsDefault();
    
    // Populate stream dropdowns based on user access
    populateAccessibleStreamDropdowns();
    
    displayStudents();
    updateReportStudentSelect();
    
    // Update welcome message and profile picture with current user
    const currentUser = getCurrentUser();
    if (currentUser) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${currentUser.firstName} ${currentUser.lastName}`;
        }
        updateUserProfilePicture(currentUser);
    }
    
    // Update theme toggle button after main app loads
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Setup ID builders for both forms
    setupIdBuilder('studentStream', 'studentYear', 'rollNumber', 'previewId');
    setupIdBuilder('editStudentStream', 'editStudentYear', 'editRollNumber', 'editPreviewId');
    
    // Set up event listeners
    document.getElementById('studentForm').addEventListener('submit', addStudent);
    document.getElementById('editStudentForm').addEventListener('submit', editStudent);
    document.getElementById('attendanceDate').addEventListener('change', loadAttendanceForDate);
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('editModal');
        if (event.target == modal) {
            closeEditModal();
        }
    }
}

// Load data from localStorage
function loadData() {
    const storedStudents = localStorage.getItem('attendanceStudents');
    const storedAttendance = localStorage.getItem('attendanceData');
    
    if (storedStudents) {
        students = JSON.parse(storedStudents);
    }
    
    if (storedAttendance) {
        attendance = JSON.parse(storedAttendance);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('attendanceStudents', JSON.stringify(students));
    localStorage.setItem('attendanceData', JSON.stringify(attendance));
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// Set today's date as default in attendance date picker
function setTodayAsDefault() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
}

// Tab management
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    currentTab = tabName;
    
    // Load appropriate data based on tab
    if (tabName === 'attendance') {
        loadAttendanceForDate();
    } else if (tabName === 'reports') {
        updateReportStudentSelect();
    }
}

// Student management functions
function addStudent(event) {
    event.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const stream = document.getElementById('studentStream').value;
    const year = document.getElementById('studentYear').value;
    const rollNumber = document.getElementById('rollNumber').value;
    
    // Validate inputs
    if (!name || !stream || !year || !rollNumber) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // Check if user can add students to this stream
    if (!canAccessStream(stream)) {
        showAlert(`You don't have permission to add students to ${stream} stream. Please contact an administrator.`, 'error');
        return;
    }
    
    // Generate student ID
    const studentId = generateStudentId(stream, year, rollNumber);
    
    // Check if student ID already exists
    if (students.find(student => student.id === studentId)) {
        showAlert('Student ID already exists. Please use a different roll number.', 'error');
        return;
    }
    
    // Validate roll number range
    if (rollNumber < 1 || rollNumber > 999) {
        showAlert('Roll number must be between 1 and 999', 'error');
        return;
    }
    
    // Add new student
    const newStudent = {
        id: studentId,
        name: name,
        stream: stream,
        year: year,
        rollNumber: parseInt(rollNumber),
        dateAdded: new Date().toISOString()
    };
    
    students.push(newStudent);
    saveData();
    
    // Clear form
    document.getElementById('studentForm').reset();
    
    // Reset ID preview
    updateIdPreview('previewId', '', '', '');
    
    // Update displays
    displayStudents();
    updateReportStudentSelect();
    
    showAlert(`Student added successfully with ID: ${studentId}`, 'success');
}

function displayStudents() {
    const studentsList = document.getElementById('studentsList');
    
    // Get students that the current user can access
    const accessibleStudents = getAccessibleStudents();
    
    if (accessibleStudents.length === 0) {
        const currentUser = getCurrentUser();
        const message = students.length === 0 
            ? 'No students added yet. Add your first student above!'
            : `No students available for your department (${currentUser?.department || 'Unknown'}). Contact an administrator if this is incorrect.`;
        studentsList.innerHTML = `<p class="alert alert-info">${message}</p>`;
        return;
    }
    
    // Group accessible students by stream
    const studentsByStream = {};
    
    accessibleStudents.forEach(student => {
        const stream = student.stream || 'Other';
        if (!studentsByStream[stream]) {
            studentsByStream[stream] = [];
        }
        studentsByStream[stream].push(student);
    });
    
    // Sort streams alphabetically
    const sortedStreams = Object.keys(studentsByStream).sort();
    
    // Generate HTML for each stream group
    let html = '';
    
    sortedStreams.forEach(stream => {
        const streamStudents = studentsByStream[stream];
        
        // Sort students within each stream by name
        streamStudents.sort((a, b) => a.name.localeCompare(b.name));
        
        // Add stream header
        html += `
            <div class="stream-section">
                <h3 class="stream-header">
                    <i class="fas fa-graduation-cap"></i>
                    ${stream} Stream (${streamStudents.length} student${streamStudents.length !== 1 ? 's' : ''})
                </h3>
                <div class="stream-students">
        `;
        
        // Add students for this stream
        streamStudents.forEach(student => {
            const displayInfo = student.stream && student.year ? 
                `<strong>ID:</strong> ${student.id} | <strong>Year:</strong> ${student.year}` :
                `<strong>Student ID:</strong> ${student.id}`;
                
            html += `
                <div class="student-item" data-student-id="${student.id}" data-stream="${stream.toLowerCase()}">
                    <div class="student-info">
                        <h4>${student.name}</h4>
                        <p>${displayInfo}</p>
                    </div>
                    <div class="student-actions">
                        <button class="btn btn-edit" onclick="openEditModal('${student.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    studentsList.innerHTML = html;
    
    // Update stream count in filter buttons
    updateStreamCount();
}

// Global variable to store current stream filter
let currentStreamFilter = 'all';

// Function to get accessible streams based on user role and department
function getAccessibleStreams() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const { role, department } = currentUser;
    
    // Administrator and Staff Member can access all streams
    if (role === 'Admin' || role === 'Staff') {
        return ['BCA', 'BBA', 'PMIR'];
    }
    
    // Teacher, Professor, and HOD can only access their department's stream
    if (role === 'Teacher' || role === 'Professor' || role === 'HOD') {
        // Map departments to streams
        const departmentStreamMap = {
            'BCA': ['BCA'],
            'BBA': ['BBA'],
            'PMIR': ['PMIR'],
            'Administration': [], // Administration staff might not have specific streams
            'Management': [] // Management might not have specific streams
        };
        
        return departmentStreamMap[department] || [];
    }
    
    return [];
}

// Function to check if user can access a specific stream
function canAccessStream(stream) {
    const accessibleStreams = getAccessibleStreams();
    return accessibleStreams.includes(stream);
}

// Function to filter students based on user access rights
function getAccessibleStudents() {
    const accessibleStreams = getAccessibleStreams();
    const currentUser = getCurrentUser();
    
    // Admin and Staff can see all students
    if (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Staff')) {
        return students;
    }
    
    // Filter students based on accessible streams
    return students.filter(student => {
        return accessibleStreams.includes(student.stream);
    });
}

function filterByStream(selectedStream) {
    currentStreamFilter = selectedStream;
    
    // Update active button
    const filterButtons = document.querySelectorAll('.stream-filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.stream === selectedStream) {
            btn.classList.add('active');
        }
    });
    
    // Filter stream sections
    const streamSections = document.querySelectorAll('.stream-section');
    streamSections.forEach(section => {
        if (selectedStream === 'all') {
            section.style.display = 'block';
        } else {
            const sectionStream = section.querySelector('.stream-header').textContent.split(' ')[0];
            if (sectionStream === selectedStream) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        }
    });
    
    // Update stream count display
    updateStreamCount();
    
    // Clear search to avoid conflicts
    document.getElementById('searchStudent').value = '';
}

function updateStreamCount() {
    const filterButtons = document.querySelectorAll('.stream-filter-btn');
    const accessibleStudents = getAccessibleStudents();
    const accessibleStreams = getAccessibleStreams();
    const currentUser = getCurrentUser();
    
    filterButtons.forEach(btn => {
        const streamName = btn.dataset.stream;
        let count = 0;
        let isAccessible = true;
        
        if (streamName === 'all') {
            count = accessibleStudents.length;
            // Show "All" button only if user has access to multiple streams or is admin/staff
            isAccessible = accessibleStreams.length > 1 || (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Staff'));
        } else {
            // Check if user can access this stream
            isAccessible = canAccessStream(streamName);
            count = accessibleStudents.filter(student => student.stream === streamName).length;
        }
        
        // Update button text to include count
        const icon = btn.querySelector('i').outerHTML;
        const streamLabel = streamName === 'all' ? 'All Streams' : streamName;
        btn.innerHTML = `${icon} ${streamLabel} (${count})`;
        
        // Hide/show button based on accessibility
        if (isAccessible && count > 0) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
    
    // Auto-select appropriate filter for restricted users
    const visibleButtons = Array.from(filterButtons).filter(btn => btn.style.display !== 'none');
    if (visibleButtons.length === 1 && currentStreamFilter === 'all') {
        // If only one stream is accessible, auto-select it
        const singleStream = visibleButtons[0].dataset.stream;
        if (singleStream !== 'all') {
            filterByStream(singleStream);
        }
    }
}

function searchStudents() {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
    const studentItems = document.querySelectorAll('.student-item');
    const streamSections = document.querySelectorAll('.stream-section');
    
    // If searching, show all stream sections first
    if (searchTerm !== '') {
        streamSections.forEach(section => {
            section.style.display = 'block';
        });
    }
    
    studentItems.forEach(item => {
        const studentName = item.querySelector('h4').textContent.toLowerCase();
        const studentId = item.dataset.studentId.toLowerCase();
        const stream = item.dataset.stream.toLowerCase();
        
        if (studentName.includes(searchTerm) || studentId.includes(searchTerm) || stream.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Hide/show stream sections based on whether they have visible students
    streamSections.forEach(section => {
        const visibleStudents = section.querySelectorAll('.student-item[style="display: flex;"], .student-item:not([style*="display: none"])');
        if (searchTerm === '' || visibleStudents.length > 0) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    
    // If search is cleared, reapply stream filter
    if (searchTerm === '') {
        filterByStream(currentStreamFilter);
    }
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This will also remove all their attendance records.')) {
        students = students.filter(student => student.id !== studentId);
        
        // Remove attendance records for this student
        Object.keys(attendance).forEach(date => {
            if (attendance[date][studentId]) {
                delete attendance[date][studentId];
            }
        });
        
        saveData();
        displayStudents();
        updateReportStudentSelect();
        
        showAlert('Student deleted successfully', 'success');
    }
}

// Modal functions
function openEditModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    document.getElementById('editStudentOriginalId').value = studentId;
    document.getElementById('editStudentName').value = student.name;
    
    // If student has new format data, use it
    if (student.stream && student.year && student.rollNumber) {
        document.getElementById('editStudentStream').value = student.stream;
        document.getElementById('editStudentYear').value = student.year;
        document.getElementById('editRollNumber').value = student.rollNumber;
    } else {
        // Try to parse old format ID
        const parsed = parseStudentId(student.id);
        if (parsed) {
            document.getElementById('editStudentStream').value = parsed.stream;
            document.getElementById('editStudentYear').value = parsed.year;
            document.getElementById('editRollNumber').value = parsed.rollNumber;
        } else {
            // Reset form for old format that can't be parsed
            document.getElementById('editStudentStream').value = '';
            document.getElementById('editStudentYear').value = '';
            document.getElementById('editRollNumber').value = '';
        }
    }
    
    // Update preview
    const stream = document.getElementById('editStudentStream').value;
    const year = document.getElementById('editStudentYear').value;
    const roll = document.getElementById('editRollNumber').value;
    updateIdPreview('editPreviewId', stream, year, roll);
    
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editStudentForm').reset();
}

function editStudent(event) {
    event.preventDefault();
    
    const originalId = document.getElementById('editStudentOriginalId').value;
    const name = document.getElementById('editStudentName').value.trim();
    const stream = document.getElementById('editStudentStream').value;
    const year = document.getElementById('editStudentYear').value;
    const rollNumber = document.getElementById('editRollNumber').value;
    
    // Validate inputs
    if (!name || !stream || !year || !rollNumber) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // Validate roll number range
    if (rollNumber < 1 || rollNumber > 999) {
        showAlert('Roll number must be between 1 and 999', 'error');
        return;
    }
    
    // Generate new student ID
    const newId = generateStudentId(stream, year, rollNumber);
    
    // Check if new student ID already exists (and is different from original)
    if (newId !== originalId && students.find(student => student.id === newId)) {
        showAlert('Student ID already exists. Please use a different roll number.', 'error');
        return;
    }
    
    // Update student
    const studentIndex = students.findIndex(s => s.id === originalId);
    if (studentIndex !== -1) {
        const oldId = students[studentIndex].id;
        students[studentIndex] = {
            ...students[studentIndex],
            id: newId,
            name: name,
            stream: stream,
            year: year,
            rollNumber: parseInt(rollNumber)
        };
        
        // Update attendance records if ID changed
        if (oldId !== newId) {
            Object.keys(attendance).forEach(date => {
                if (attendance[date][oldId]) {
                    attendance[date][newId] = attendance[date][oldId];
                    delete attendance[date][oldId];
                }
            });
        }
        
        saveData();
        displayStudents();
        updateReportStudentSelect();
        closeEditModal();
        
        showAlert(`Student updated successfully with ID: ${newId}`, 'success');
    }
}

// Attendance functions
function loadAttendanceForDate() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const attendanceList = document.getElementById('attendanceList');
    const accessibleStudents = getAccessibleStudents();
    
    if (accessibleStudents.length === 0) {
        const currentUser = getCurrentUser();
        const message = students.length === 0 
            ? 'No students available. Please add students first.'
            : `No students available for your department (${currentUser?.department || 'Unknown'}). Contact an administrator if this is incorrect.`;
        attendanceList.innerHTML = `<p class="alert alert-info">${message}</p>`;
        return;
    }
    
    if (!selectedDate) {
        attendanceList.innerHTML = '<p class="alert alert-info">Please select a date.</p>';
        return;
    }
    
    // Initialize attendance for the date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    attendanceList.innerHTML = accessibleStudents.map(student => {
        const currentStatus = attendance[selectedDate][student.id] || 'absent';
        return `
            <div class="attendance-item">
                <div class="attendance-info">
                    <h4>${student.name}</h4>
                    <span>Student ID: ${student.id}</span>
                </div>
                <div class="attendance-status">
                    <label class="present-label">
                        <input type="radio" name="attendance_${student.id}" value="present" 
                               ${currentStatus === 'present' ? 'checked' : ''}>
                        Present
                    </label>
                    <label class="absent-label">
                        <input type="radio" name="attendance_${student.id}" value="absent" 
                               ${currentStatus === 'absent' ? 'checked' : ''}>
                        Absent
                    </label>
                </div>
            </div>
        `;
    }).join('');
}

function saveAttendance() {
    const selectedDate = document.getElementById('attendanceDate').value;
    
    if (!selectedDate) {
        showAlert('Please select a date', 'error');
        return;
    }
    
    if (students.length === 0) {
        showAlert('No students to save attendance for', 'error');
        return;
    }
    
    // Initialize attendance for the date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    // Save attendance for each student
    students.forEach(student => {
        const radioButtons = document.getElementsByName(`attendance_${student.id}`);
        const checkedRadio = Array.from(radioButtons).find(radio => radio.checked);
        
        if (checkedRadio) {
            attendance[selectedDate][student.id] = checkedRadio.value;
        } else {
            attendance[selectedDate][student.id] = 'absent'; // Default to absent if not marked
        }
    });
    
    saveData();
    showAlert('Attendance saved successfully', 'success');
}

function markAllPresent() {
    const presentRadios = document.querySelectorAll('input[value="present"]');
    presentRadios.forEach(radio => {
        radio.checked = true;
    });
    showAlert('All students marked as present', 'info');
}

function markAllAbsent() {
    const absentRadios = document.querySelectorAll('input[value="absent"]');
    absentRadios.forEach(radio => {
        radio.checked = true;
    });
    showAlert('All students marked as absent', 'info');
}

// Report functions
function updateReportStudentSelect() {
    const select = document.getElementById('reportStudent');
    const accessibleStudents = getAccessibleStudents();
    
    select.innerHTML = '<option value="">All Students</option>';
    
    accessibleStudents.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.id})`;
        select.appendChild(option);
    });
}

function generateReport() {
    const selectedStudent = document.getElementById('reportStudent').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const reportOutput = document.getElementById('reportOutput');
    
    if (!startDate || !endDate) {
        showAlert('Please select both start and end dates', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showAlert('Start date cannot be after end date', 'error');
        return;
    }
    
    // Generate report data
    const reportData = generateReportData(selectedStudent, startDate, endDate);
    
    if (reportData.length === 0) {
        reportOutput.innerHTML = '<p class="alert alert-info">No attendance data found for the selected criteria.</p>';
        return;
    }
    
    // Create report table
    const table = createReportTable(reportData);
    reportOutput.innerHTML = table;
}

function generateReportData(selectedStudent, startDate, endDate) {
    const reportData = [];
    const accessibleStudents = getAccessibleStudents();
    
    // Get students to include in report
    const studentsToInclude = selectedStudent ? 
        accessibleStudents.filter(s => s.id === selectedStudent) : 
        accessibleStudents;
    
    studentsToInclude.forEach(student => {
        let totalDays = 0;
        let presentDays = 0;
        
        // Iterate through dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            
            if (attendance[dateStr] && attendance[dateStr][student.id]) {
                totalDays++;
                if (attendance[dateStr][student.id] === 'present') {
                    presentDays++;
                }
            }
        }
        
        if (totalDays > 0) {
            const percentage = ((presentDays / totalDays) * 100).toFixed(1);
            reportData.push({
                name: student.name,
                id: student.id,
                totalDays: totalDays,
                presentDays: presentDays,
                absentDays: totalDays - presentDays,
                percentage: percentage
            });
        }
    });
    
    return reportData;
}

function createReportTable(reportData) {
    const tableHeader = `
        <table class="report-table">
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Attendance %</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    const tableRows = reportData.map(data => {
        const percentageClass = getPercentageClass(parseFloat(data.percentage));
        return `
            <tr>
                <td>${data.name}</td>
                <td>${data.id}</td>
                <td>${data.totalDays}</td>
                <td>${data.presentDays}</td>
                <td>${data.absentDays}</td>
                <td>
                    <span class="attendance-percentage ${percentageClass}">
                        ${data.percentage}%
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    const tableFooter = `
            </tbody>
        </table>
    `;
    
    return tableHeader + tableRows + tableFooter;
}

function getPercentageClass(percentage) {
    if (percentage >= 80) return 'percentage-high';
    if (percentage >= 60) return 'percentage-medium';
    return 'percentage-low';
}

function exportReport() {
    const selectedStudent = document.getElementById('reportStudent').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    if (!startDate || !endDate) {
        showAlert('Please generate a report first', 'error');
        return;
    }
    
    const reportData = generateReportData(selectedStudent, startDate, endDate);
    
    if (reportData.length === 0) {
        showAlert('No data to export', 'error');
        return;
    }
    
    // Create CSV content
    const headers = ['Student Name', 'Student ID', 'Total Days', 'Present Days', 'Absent Days', 'Attendance %'];
    const csvContent = [
        headers.join(','),
        ...reportData.map(data => [
            `"${data.name}"`,
            data.id,
            data.totalDays,
            data.presentDays,
            data.absentDays,
            data.percentage
        ].join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('Report exported successfully', 'success');
}

// Utility functions
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Determine where to insert the alert
    let insertTarget = null;
    
    // Check if we're on the login screen
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen && (loginScreen.style.display === 'flex' || loginScreen.style.display === '')) {
        // We're on login screen - insert into login container
        insertTarget = document.querySelector('.login-container');
        console.log('Alert target: login container');
    } else if (mainApp && mainApp.style.display !== 'none') {
        // We're in main app - insert into active tab
        insertTarget = document.querySelector('.tab-content.active');
        console.log('Alert target: active tab');
    }
    
    if (insertTarget) {
        insertTarget.insertBefore(alert, insertTarget.firstChild);
        
        // Auto-remove alert after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    } else {
        // Fallback - just use console.log for debugging
        console.log(`Alert (${type}): ${message}`);
    }
}

// Sample data function (for testing)
function loadSampleData() {
    if (students.length === 0) {
        const sampleStudents = [
            { 
                id: 'BCA024-001', 
                name: 'John Doe', 
                stream: 'BCA', 
                year: '2024', 
                rollNumber: 1,
                dateAdded: new Date().toISOString() 
            },
            { 
                id: 'BBA024-002', 
                name: 'Jane Smith', 
                stream: 'BBA', 
                year: '2024', 
                rollNumber: 2,
                dateAdded: new Date().toISOString() 
            },
            { 
                id: 'PMIR025-003', 
                name: 'Mike Johnson', 
                stream: 'PMIR', 
                year: '2025', 
                rollNumber: 3,
                dateAdded: new Date().toISOString() 
            }
        ];
        
        students = sampleStudents;
        
        // Add some sample attendance data
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            attendance[dateStr] = {};
            sampleStudents.forEach(student => {
                attendance[dateStr][student.id] = Math.random() > 0.3 ? 'present' : 'absent';
            });
        }
        
        saveData();
        displayStudents();
        updateReportStudentSelect();
        showAlert('Sample data loaded successfully', 'success');
    }
}

// Expose functions to global scope for HTML onclick handlers
window.showTab = showTab;
window.searchStudents = searchStudents;
window.deleteStudent = deleteStudent;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.loadAttendanceForDate = loadAttendanceForDate;
window.saveAttendance = saveAttendance;
window.markAllPresent = markAllPresent;
window.markAllAbsent = markAllAbsent;
window.generateReport = generateReport;
window.exportReport = exportReport;
window.loadSampleData = loadSampleData;
window.logout = logout;
window.toggleTheme = toggleTheme;
window.showAuthForm = showAuthForm;
window.fillLoginFromRecent = fillLoginFromRecent;
window.clearRecentLogins = clearRecentLogins;
window.filterByStream = filterByStream;
window.showForgotPasswordForm = showForgotPasswordForm;
window.resendOTP = resendOTP;
window.cancelPasswordReset = cancelPasswordReset;
