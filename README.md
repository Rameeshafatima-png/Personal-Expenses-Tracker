# ExpenseFlow — Personal Expense Tracker

A modern, responsive web application to record, manage, and monitor daily expenses in real time using **Firebase Cloud Firestore** and **Firebase Hosting**.

---

## 🚀 Live Demo & Deployment

- **Live Deployed URL:** [https://personal-expense-tracker-14334.web.app](https://personal-expense-tracker-14334.web.app)
- **Alternative URL:** [https://personal-expense-tracker-14334.firebaseapp.com](https://personal-expense-tracker-14334.firebaseapp.com)

---

## 📋 Features Implemented (Assignment Checklist)

| Requirement | Implementation Status | Details |
|---|---|---|
| **Expense Title** | ✅ Implemented | Required text input with placeholder and validation |
| **Amount** | ✅ Implemented | Numeric input with currency formatting and positive-value validation |
| **Category** | ✅ Implemented | Dropdown with `Food`, `Travel`, `Shopping`, `Bills`, and `Other` |
| **Date** | ✅ Implemented | Native date picker defaulting to current date |
| **Add Expense Button** | ✅ Implemented | Submits and asynchronously writes document to Firestore |
| **Firebase Firestore Storage** | ✅ Implemented | Saves to `expenses` collection with `serverTimestamp()` |
| **Expense Table Display** | ✅ Implemented | Real-time listener (`onSnapshot`) renders expenses dynamically |
| **Delete Button** | ✅ Implemented | Interactive delete action with confirmation dialog & `deleteDoc` |
| **Total Number of Expenses** | ✅ Implemented | Real-time counter displayed in top metrics card |
| **Total Amount Spent** | ✅ Implemented | Real-time sum calculation formatted in USD ($) |
| **Live Deployment** | ✅ Deployed | Deployed to production on Firebase Hosting with HTTPS |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Modern Vanilla CSS (CSS Variables, Flexbox/Grid, Dark & Glassmorphism Aesthetics)
- **Application Logic:** Vanilla JavaScript (ES Modules)
- **Database:** Firebase Cloud Firestore (v12 SDK)
- **Hosting:** Firebase Hosting with custom domain SSL

---

## 📁 Project Structure

```text
Personal_expense_tracker/
├── index.html           # Core HTML structure & semantic layout
├── style.css            # Responsive styles, design system, and animations
├── app.js               # Application logic, Firestore listeners & handlers
├── firebase-config.js   # Firebase web SDK configuration
├── firestore.rules      # Cloud Firestore security rules
├── firebase.json        # Firebase Hosting & Firestore deployment configuration
├── .firebaserc          # Active Firebase project reference
└── README.md            # Project documentation & submission guide
```

---

## 📤 Pushing to GitHub (Submission Step)

To submit your GitHub repository link, run the following commands in your terminal inside this folder:

```bash
# 1. Initialize git repository (if not already initialized)
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "feat: complete personal expense tracker with Firebase Firestore"

# 4. Rename default branch to main
git branch -M main

# 5. Link your GitHub remote repository (replace with your repository URL)
git remote add origin https://github.com/<your-username>/personal-expense-tracker.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📝 Submission Checklist

- [x] **Live Deployed URL:** `https://personal-expense-tracker-14334.web.app`
- [ ] **GitHub Repository Link:** `https://github.com/<your-username>/personal-expense-tracker`
- [x] **Working Application Screenshot:** Included in the project documentation and submission artifacts.
