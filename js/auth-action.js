
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getAuth,
    applyActionCode,
    checkActionCode,
    verifyPasswordResetCode,
    confirmPasswordReset
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBv2m_ciaohvHg7xCqkSWeTM_TfiphzMqw",
    authDomain: "pisotrack-e61d6.firebaseapp.com",
    projectId: "pisotrack-e61d6",
    storageBucket: "pisotrack-e61d6.firebasestorage.app",
    messagingSenderId: "492013865042",
    appId: "1:492013865042:web:e0ccf6e2bee76aab32f78b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const actionCode = params.get("oobCode");

const title = document.getElementById("title");
const description = document.getElementById("description");
const statusBox = document.getElementById("statusBox");
const loadingSpinner = document.getElementById("loadingSpinner");
const actionIcon = document.getElementById("actionIcon");
const loginButton = document.getElementById("loginButton");
const resetForm = document.getElementById("resetForm");
const newPassword = document.getElementById("newPassword");
const confirmNewPassword = document.getElementById("confirmNewPassword");
const updatePasswordButton = document.getElementById("updatePasswordButton");

function showResult(type, heading, message, icon = "✓") {
    loadingSpinner.hidden = true;
    actionIcon.hidden = false;
    actionIcon.textContent = type === "success" ? "✓" : icon;

    title.textContent = heading;
    description.textContent = message;
    loginButton.hidden = false;
    resetForm.hidden = true;

    if (type) {
        statusBox.className = "status-box show " + type;

        if (type === "success") {
            statusBox.textContent = "You can safely return to PisoTrack.";
        } else {
            statusBox.textContent =
                "If this link has expired, request a new one from PisoTrack.";
        }
    }
}

async function handleVerifyEmail() {
    try {
        await applyActionCode(auth, actionCode);

        showResult(
            "success",
            "Email Verified!",
            "Your email address has been verified successfully. You can now sign in to your PisoTrack account.",
            "✓"
        );
    } catch (error) {
        showResult(
            "error",
            "Verification Failed",
            "This verification link is invalid, expired, or has already been used.",
            "!"
        );
    }
}

async function handleRecoverEmail() {
    try {
        await checkActionCode(auth, actionCode);
        await applyActionCode(auth, actionCode);

        showResult(
            "success",
            "Email Restored",
            "Your previous email address has been restored successfully.",
            "✓"
        );
    } catch (error) {
        showResult(
            "error",
            "Recovery Failed",
            "This email recovery link is invalid or has expired.",
            "!"
        );
    }
}

async function handleResetPassword() {
    try {
        await verifyPasswordResetCode(auth, actionCode);

        showResult(
            "success",
            "Reset Link Verified",
            "Your password reset request is valid. Continue with the password reset page configured for PisoTrack.",
            "✓"
        );
    } catch (error) {
        showResult(
            "error",
            "Reset Link Invalid",
            "This password reset link is invalid or has expired.",
            "!"
        );
    }
}

async function handleResetPasswordForm() {
    try {
        await verifyPasswordResetCode(auth, actionCode);
        loadingSpinner.hidden = true;
        actionIcon.hidden = false;
        actionIcon.textContent = "✓";
        title.textContent = "Reset Password";
        description.textContent = "Enter and confirm your new password for your PisoTrack account.";
        statusBox.className = "status-box";
        loginButton.hidden = true;
        resetForm.hidden = false;
        newPassword.focus();
    } catch (error) {
        showResult("error", "Reset Link Invalid", "This password reset link is invalid or has expired.", "!");
    }
}

resetForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (newPassword.value.length < 8) {
        statusBox.textContent = "Password must be at least 8 characters.";
        statusBox.className = "status-box show error";
        return;
    }
    if (newPassword.value !== confirmNewPassword.value) {
        statusBox.textContent = "Passwords do not match.";
        statusBox.className = "status-box show error";
        return;
    }
    updatePasswordButton.disabled = true;
    try {
        await confirmPasswordReset(auth, actionCode, newPassword.value);
        showResult("success", "Password Updated", "Your password has been updated successfully. You can now sign in to PisoTrack.", "✓");
    } catch (error) {
        statusBox.textContent = "This reset link is invalid, expired, or has already been used.";
        statusBox.className = "status-box show error";
    } finally {
        updatePasswordButton.disabled = false;
    }
});

async function run() {
    if (!mode || !actionCode) {
        showResult(
            "error",
            "Invalid Request",
            "PisoTrack could not find a valid Firebase account action in this link.",
            "!"
        );
        return;
    }

    if (mode === "verifyEmail") {
        await handleVerifyEmail();
    } else if (mode === "verifyAndChangeEmail") {
        try {
            await applyActionCode(auth, actionCode);
            showResult("success", "Email Updated!", "Your new email address has been verified and applied successfully.", "✓");
        } catch (error) {
            showResult("error", "Email Change Failed", "This email-change link is invalid, expired, or has already been used.", "!");
        }
    } else if (mode === "recoverEmail") {
        await handleRecoverEmail();
    } else if (mode === "resetPassword") {
        await handleResetPasswordForm();
    } else {
        showResult(
            "error",
            "Unsupported Action",
            "This type of Firebase account action is not currently supported by this page.",
            "!"
        );
    }
}

run();
