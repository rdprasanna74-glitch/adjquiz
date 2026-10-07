# Servlet & Java Quiz Application

## Stack
- HTML5
- Bootstrap 5.3.3
- Vanilla JavaScript
- sessionStorage
- Firebase project configuration included in `js/firebase-config.js`

## Default Admin
- Username: `admin`
- Password: `admin123`

The admin account is automatically created in `sessionStorage` on first load.

## Admin features
- Login/authentication
- Create students
- Delete students
- Create exams
- Edit exam questions and answer options
- Delete exams
- View student results

## Student features
- Login using credentials created by admin
- View available exams
- Take quizzes
- 20 default Servlet + Java questions
- Previous/Next navigation
- Progress bar
- Automatic scoring
- Attempt history

## Run
1. Extract the ZIP.
2. Open `index.html` in a browser.
3. Login with `admin / admin123`.
4. Create student accounts and exams.

## Important
This version uses `sessionStorage`, so data is browser-session based and is not a secure production authentication system. The supplied Firebase configuration is preserved in `js/firebase-config.js` for integration. For production, use Firebase Authentication and Firestore Security Rules (or a secure backend) rather than storing passwords in browser storage.
