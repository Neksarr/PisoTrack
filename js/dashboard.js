import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"; import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"; import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
      const firebaseConfig = {
        apiKey: "AIzaSyBv2m_ciaohvHg7xCqkSWeTM_TfiphzMqw",
        authDomain: "pisotrack-e61d6.firebaseapp.com",
        projectId: "pisotrack-e61d6",
        storageBucket: "pisotrack-e61d6.firebasestorage.app",
        messagingSenderId: "492013865042",
        appId: "1:492013865042:web:e0ccf6e2bee76aab32f78b"
      };

      const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);
      function safeEmailKey(email) { return String(email || "guest").replaceAll("@", "_at_").replaceAll(".", "_dot_").replaceAll("+", "_plus_") }
      function transactionKey(email) { return "transactions_" + safeEmailKey(email) }
      function normalizeTransactions(raw) { if (Array.isArray(raw)) return raw; if (typeof raw === "string") { try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch (e) { return [] } } return [] }
      function money(v, currency = "PHP", rate = 56.5) { if (currency === "USD") return "$" + (Number(v || 0) / rate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); return "₱" + Number(v || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }
      async function getAppData(user) { const ref = doc(db, "users", user.uid, "appData", "default"), snap = await getDoc(ref); return { ref, data: snap.exists() ? snap.data() : {} } }
      async function getTransactions(user) { const { data } = await getAppData(user); return normalizeTransactions(data[transactionKey(user.email)] ?? data[transactionKey(data.currentEmail)] ?? data.transactions) }
      async function saveTransactions(user, list) { const ref = doc(db, "users", user.uid, "appData", "default"); await setDoc(ref, { currentEmail: user.email, email: user.email, [transactionKey(user.email)]: JSON.stringify(list), updatedAt: Date.now() }, { merge: true }) }
      async function getSettings(user) { const { data } = await getAppData(user); return { currency: data.currency || "PHP", notifications: data.notifications !== false, dark: data.dark === true, phpPerUsd: typeof data.phpPerUsdNumber === "number" ? data.phpPerUsdNumber : 56.5 } }
      async function saveSettings(user, values) { const ref = doc(db, "users", user.uid, "appData", "default"); await setDoc(ref, { ...values, currentEmail: user.email, email: user.email, updatedAt: Date.now() }, { merge: true }) }
      function applyDark(v) { document.documentElement.classList.toggle("dark", !!v); if (document.body) document.body.classList.toggle("dark", !!v) }
      function fmtDate(ms) { return new Date(Number(ms)).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) }
      function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])) }
      function phtDateValue(date = new Date()) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(date) }
      function phtTimestamp(dateValue) { return new Date(dateValue + "T12:00:00+08:00").getTime() }
      function maximumTransactionDate() { return phtDateValue(new Date(Date.now() + 86400000)) }

      const incomeCategories = ["Salary", "Allowance", "Business", "Freelance", "Bonus", "Gift", "Scholarship", "Investment", "Refund", "Other Income"];
      const expenseCategories = ["Food", "Transportation", "School", "Bills", "Shopping", "Entertainment", "Health", "Rent", "Utilities", "Internet / Load", "Personal Care", "Family", "Pet Expenses", "Debt / Loan", "Other Expense"];
      const modal = document.getElementById("transactionModal"), form = document.getElementById("transactionForm");
      const categorySelect = document.getElementById("txCategory"), otherField = document.getElementById("otherCategoryField");
      const titleInput = document.getElementById("txTitle"), otherCategoryInput = document.getElementById("txOtherCategory");
      const amountInput = document.getElementById("txAmount"), dateInput = document.getElementById("txDate");
      const modalTitle = document.getElementById("transactionModalTitle"), messageBox = document.getElementById("formMessage");
      const saveButton = document.getElementById("saveTransaction"), incomeButton = document.getElementById("addIncome"), expenseButton = document.getElementById("addExpense");
      const cancelButton = document.getElementById("cancelTransaction");
      const userNameElement = document.getElementById("userName"), balanceElement = document.getElementById("balance");
      const incomeElement = document.getElementById("income"), expenseElement = document.getElementById("expense");
      const listElement = document.getElementById("list"), statusElement = document.getElementById("status");
      let currentUser, settings, transactions = [], transactionType = "income";

      function finishDashboardLoading() {
        [balanceElement, incomeElement, expenseElement].forEach(element => element.classList.remove("skeleton", "skeleton-amount"));
        listElement.setAttribute("aria-busy", "false");
      }

      function renderDashboard() {
        let inc = 0, exp = 0;
        transactions.forEach(t => t.type === "income" ? inc += Number(t.amount || 0) : exp += Number(t.amount || 0));
        incomeElement.textContent = money(inc, settings.currency, settings.phpPerUsd);
        expenseElement.textContent = money(exp, settings.currency, settings.phpPerUsd);
        balanceElement.textContent = money(inc - exp, settings.currency, settings.phpPerUsd);
        const recent = transactions.slice(-5).reverse();
        listElement.innerHTML = recent.length ? recent.map(t => `<div class="transaction"><span>${esc(t.title || t.category || "Transaction")}</span><span>${t.type === "income" ? "+" : "-"}${money(t.amount, settings.currency, settings.phpPerUsd)}</span></div>`).join("") : '<div class="empty">No transactions yet.</div>';
        finishDashboardLoading();
      }

      function openTransactionModal(type) {
        transactionType = type;
        const categories = type === "income" ? incomeCategories : expenseCategories;
        modalTitle.textContent = type === "income" ? "Add Income" : "Add Expense";
        categorySelect.innerHTML = categories.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join("");
        form.reset();
        dateInput.value = phtDateValue();
        otherField.classList.add("field-hidden");
        otherCategoryInput.required = false;
        messageBox.classList.remove("show");
        modal.classList.add("open");
        titleInput.focus();
      }

      function closeTransactionModal() { modal.classList.remove("open") }
      function toggleOtherCategory() {
        const needsOther = categorySelect.value === "Other Income" || categorySelect.value === "Other Expense";
        otherField.classList.toggle("field-hidden", !needsOther);
        otherCategoryInput.required = needsOther;
        if (!needsOther) otherCategoryInput.value = "";
      }

      incomeButton.onclick = () => openTransactionModal("income");
      expenseButton.onclick = () => openTransactionModal("expense");
      cancelButton.onclick = closeTransactionModal;
      categorySelect.onchange = toggleOtherCategory;
      modal.onclick = event => { if (event.target === modal) closeTransactionModal() };
      document.addEventListener("keydown", event => { if (event.key === "Escape") closeTransactionModal() });

      form.onsubmit = async event => {
        event.preventDefault();
        if (!currentUser || !settings) {
          messageBox.textContent = "Your account is still loading. Please try again in a moment.";
          messageBox.classList.add("show");
          return;
        }
        const amount = Number(amountInput.value), isOther = categorySelect.value.startsWith("Other ");
        const category = isOther ? otherCategoryInput.value.trim() : categorySelect.value;
        if (!titleInput.value.trim() || !category || !amount || amount <= 0 || !dateInput.value) {
          messageBox.textContent = "Please complete all fields with a valid amount.";
          messageBox.classList.add("show");
          return;
        }
        if (dateInput.value > maximumTransactionDate()) {
          messageBox.textContent = "This date is not valid because that day has not arrived yet. You may only select up to one day ahead.";
          messageBox.classList.add("show");
          return;
        }
        saveButton.disabled = true;
        try {
          const phpAmount = settings.currency === "USD" ? amount * settings.phpPerUsd : amount;
          transactions.push({ title: titleInput.value.trim(), category, amount: phpAmount, type: transactionType, time: phtTimestamp(dateInput.value) });
          await saveTransactions(currentUser, transactions);
          renderDashboard();
          closeTransactionModal();
        } catch (error) {
          transactions.pop();
          messageBox.textContent = "Could not save the transaction. Please try again.";
          messageBox.classList.add("show");
        } finally { saveButton.disabled = false }
      };

      onAuthStateChanged(auth, async user => {
        if (!user) return location.href = "login.html";
        if (!user.emailVerified) { await signOut(auth); return location.href = "login.html" }
        try {
          currentUser = user;
          userNameElement.textContent = user.displayName || user.email;
          settings = await getSettings(user);
          localStorage.setItem("pisotrackDark", String(settings.dark));
          applyDark(settings.dark);
          transactions = await getTransactions(user);
          renderDashboard();
        } catch (error) {
          console.error(error);
          statusElement.textContent = "Could not load dashboard data. Please refresh and try again.";
          listElement.innerHTML = '<div class="empty">Unable to load transactions.</div>';
          finishDashboardLoading();
        }
      });
