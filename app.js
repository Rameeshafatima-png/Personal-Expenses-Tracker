// =========================================================
// ExpenseFlow — Personal Expense Tracker
// Firebase v12 Cloud Firestore Integration
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const expensesCollection = collection(db, "expenses");

// DOM Elements
const expenseForm = document.getElementById("expenseForm");
const expenseTitle = document.getElementById("expenseTitle");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const addExpenseBtnText = document.getElementById("addExpenseBtnText");

const expenseTableBody = document.getElementById("expenseTableBody");
const totalExpenses = document.getElementById("totalExpenses");
const totalAmount = document.getElementById("totalAmount");
const recordCount = document.getElementById("recordCount");
const topCategoryDisplay = document.getElementById("topCategoryDisplay");
const topCategorySubtext = document.getElementById("topCategorySubtext");

const emptyState = document.getElementById("emptyState");
const tableContainer = document.getElementById("tableContainer");
const loadingState = document.getElementById("loadingState");
const todayDate = document.getElementById("todayDate");
const categoryIcon = document.getElementById("categoryIcon");

const searchExpense = document.getElementById("searchExpense");
const categoryFilterBar = document.getElementById("categoryFilterBar");

const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");
const toastClose = document.getElementById("toastClose");

// Category Emojis & Colors Map
const categoryMeta = {
    Food: { emoji: "🍔", label: "Food" },
    Travel: { emoji: "✈️", label: "Travel" },
    Shopping: { emoji: "🛍️", label: "Shopping" },
    Bills: { emoji: "⚡", label: "Bills" },
    Other: { emoji: "📦", label: "Other" }
};

// State
let allExpenses = [];
let currentCategoryFilter = "All";
let currentSearchQuery = "";
let toastTimer = null;

// Initialize Date Defaults
function initDate() {
    const today = new Date();
    const localIsoDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];

    expenseDate.value = localIsoDate;

    todayDate.textContent = today.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}
initDate();

// Category Selector Icon update
expenseCategory.addEventListener("change", () => {
    const meta = categoryMeta[expenseCategory.value];
    if (meta && categoryIcon) {
        categoryIcon.textContent = meta.emoji;
    }
});

// Quick Amount Buttons (+10, +25, +50, +100)
document.querySelectorAll(".quick-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        const addVal = parseFloat(chip.dataset.val || "0");
        const current = parseFloat(expenseAmount.value || "0");
        expenseAmount.value = (current + addVal).toFixed(2);
        expenseAmount.focus();
    });
});

// Category Filter Buttons
if (categoryFilterBar) {
    categoryFilterBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;

        categoryFilterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        currentCategoryFilter = btn.dataset.filter || "All";
        applyFiltersAndRender();
    });
}

// Search Filter
if (searchExpense) {
    searchExpense.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        applyFiltersAndRender();
    });
}

// Toast System
function showToast(title, message, type = "success") {
    toastTitle.textContent = title;
    toastMessage.textContent = message;

    if (type === "error") {
        toast.classList.add("toast-error");
        toastIcon.textContent = "!";
    } else {
        toast.classList.remove("toast-error");
        toastIcon.textContent = "✓";
    }

    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

if (toastClose) {
    toastClose.addEventListener("click", () => {
        toast.classList.remove("show");
    });
}

// Currency Formatter
function formatAmount(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    }).format(amount);
}

// Date Formatter
function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// HTML Escape to prevent XSS
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Add Expense Form Handler
expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = expenseTitle.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    // Validation
    if (!title) {
        showToast("Missing Title", "Please provide a name for the expense.", "error");
        expenseTitle.focus();
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        showToast("Invalid Amount", "Please enter a valid amount greater than $0.00.", "error");
        expenseAmount.focus();
        return;
    }

    if (!category) {
        showToast("Missing Category", "Please choose an expense category.", "error");
        expenseCategory.focus();
        return;
    }

    if (!date) {
        showToast("Missing Date", "Please select the expense date.", "error");
        expenseDate.focus();
        return;
    }

    // Set Loading on Button
    addExpenseBtn.disabled = true;
    if (addExpenseBtnText) addExpenseBtnText.textContent = "Saving...";

    try {
        await addDoc(expensesCollection, {
            title: title,
            amount: amount,
            category: category,
            date: date,
            createdAt: serverTimestamp()
        });

        // Reset form
        expenseForm.reset();
        initDate();
        if (categoryIcon) categoryIcon.textContent = "📁";

        showToast("Expense Recorded", `Saved "${title}" (${formatAmount(amount)}) to Firestore.`);
    } catch (error) {
        console.error("Error adding expense:", error);
        showToast("Error Saving", "Could not sync with Firestore. Please try again.", "error");
    } finally {
        addExpenseBtn.disabled = false;
        if (addExpenseBtnText) addExpenseBtnText.textContent = "Add Expense";
    }
});

// Delete Expense Handler
async function deleteExpense(expenseId, title = "this expense") {
    const confirmed = confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, "expenses", expenseId));
        showToast("Expense Removed", `"${title}" has been deleted.`);
    } catch (error) {
        console.error("Error deleting expense:", error);
        showToast("Delete Failed", "Unable to remove expense from Firestore.", "error");
    }
}

// Expose deleteExpense to window for onclick handlers
window.deleteExpense = deleteExpense;

// Filter and Render Logic
function applyFiltersAndRender() {
    let filtered = allExpenses;

    if (currentCategoryFilter !== "All") {
        filtered = filtered.filter((exp) => exp.category === currentCategoryFilter);
    }

    if (currentSearchQuery) {
        filtered = filtered.filter((exp) =>
            (exp.title || "").toLowerCase().includes(currentSearchQuery) ||
            (exp.category || "").toLowerCase().includes(currentSearchQuery)
        );
    }

    renderTableRows(filtered);
}

// Update Top KPI Cards & Summary
function updateSummaries(expenses) {
    const totalCount = expenses.length;
    const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    totalExpenses.textContent = totalCount;
    totalAmount.textContent = formatAmount(totalSpent);
    recordCount.textContent = `${totalCount} ${totalCount === 1 ? "record" : "records"}`;

    // Calculate Top Category
    if (totalCount === 0) {
        topCategoryDisplay.textContent = "None";
        topCategorySubtext.textContent = "No expenses recorded";
    } else {
        const categoryTotals = {};
        expenses.forEach((item) => {
            const cat = item.category || "Other";
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(item.amount || 0);
        });

        let topCat = "None";
        let maxVal = -1;
        for (const [cat, val] of Object.entries(categoryTotals)) {
            if (val > maxVal) {
                maxVal = val;
                topCat = cat;
            }
        }

        const meta = categoryMeta[topCat] || { emoji: "📁" };
        topCategoryDisplay.textContent = `${meta.emoji} ${topCat}`;
        topCategorySubtext.textContent = `${formatAmount(maxVal)} total spent`;
    }
}

// Render Table Rows
function renderTableRows(expenses) {
    expenseTableBody.innerHTML = "";

    if (expenses.length === 0) {
        emptyState.style.display = "flex";
        tableContainer.style.display = "none";
        return;
    }

    emptyState.style.display = "none";
    tableContainer.style.display = "block";

    expenses.forEach((expense) => {
        const row = document.createElement("tr");
        const meta = categoryMeta[expense.category] || { emoji: "📁", label: expense.category || "Other" };

        row.innerHTML = `
            <td>
                <div class="expense-title-cell">
                    <span class="expense-category-dot">${meta.emoji}</span>
                    <span class="expense-title-text">${escapeHtml(expense.title)}</span>
                </div>
            </td>
            <td>
                <span class="category-badge category-${escapeHtml(expense.category)}">
                    ${meta.emoji} ${escapeHtml(expense.category)}
                </span>
            </td>
            <td>
                <span class="date-text">${formatDate(expense.date)}</span>
            </td>
            <td>
                <span class="expense-amount-val">${formatAmount(Number(expense.amount || 0))}</span>
            </td>
            <td class="text-right">
                <button
                    class="btn-delete"
                    type="button"
                    onclick="deleteExpense('${expense.id}', '${escapeHtml(expense.title).replace(/'/g, "\\'")}')"
                    title="Delete expense"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Delete</span>
                </button>
            </td>
        `;

        expenseTableBody.appendChild(row);
    });
}

// Listen for Realtime Firestore Changes
function listenToExpenses() {
    loadingState.style.display = "flex";
    emptyState.style.display = "none";
    tableContainer.style.display = "none";

    const expensesQuery = query(expensesCollection, orderBy("date", "desc"));

    onSnapshot(
        expensesQuery,
        (snapshot) => {
            loadingState.style.display = "none";

            allExpenses = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            }));

            updateSummaries(allExpenses);
            applyFiltersAndRender();
        },
        (error) => {
            console.error("Firestore listener error:", error);
            loadingState.style.display = "none";
            showToast("Sync Error", "Could not fetch data. Check Firestore rules.", "error");
        }
    );
}

// Start Realtime Sync
listenToExpenses();