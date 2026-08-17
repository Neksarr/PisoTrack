PisoTrack Desktop

Included pages:
login.html
index.html
transactions.html
reports.html
settings.html
users.html
auth-action.html

This version uses the same Firebase project and the same Firestore appData/default document pattern as the uploaded Android app.

Transactions are stored as a JSON string under:
transactions_<safe_email>

Run with VS Code Live Server for testing in Chrome.

Firebase email action setup:
After deploying the site, open Firebase Console > Authentication > Templates,
customize the action URL for email verification, password reset, and email
change actions to the deployed auth-action.html URL. Also add the deployed
website domain under Authentication > Settings > Authorized domains.

Google and Apple sign-in are visual placeholders for now.
