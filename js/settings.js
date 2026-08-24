
      import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
      import {
        getAuth,
        onAuthStateChanged,
        signOut,
      } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
      import {
        getFirestore,
        doc,
        getDoc,
        setDoc,
      } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
      const firebaseConfig = {
        apiKey: "AIzaSyBv2m_ciaohvHg7xCqkSWeTM_TfiphzMqw",
        authDomain: "pisotrack-e61d6.firebaseapp.com",
        projectId: "pisotrack-e61d6",
        storageBucket: "pisotrack-e61d6.firebasestorage.app",
        messagingSenderId: "492013865042",
        appId: "1:492013865042:web:e0ccf6e2bee76aab32f78b",
      };

      const app = initializeApp(firebaseConfig),
        auth = getAuth(app),
        db = getFirestore(app);
      function safeEmailKey(email) {
        return String(email || "guest")
          .replaceAll("@", "_at_")
          .replaceAll(".", "_dot_")
          .replaceAll("+", "_plus_");
      }
      function transactionKey(email) {
        return "transactions_" + safeEmailKey(email);
      }
      function normalizeTransactions(raw) {
        if (Array.isArray(raw)) return raw;
        if (typeof raw === "string") {
          try {
            const p = JSON.parse(raw);
            return Array.isArray(p) ? p : [];
          } catch (e) {
            return [];
          }
        }
        return [];
      }
      function money(v, currency = "PHP", rate = 56.5) {
        if (currency === "USD")
          return (
            "$" +
            (Number(v || 0) / rate).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          );
        return (
          "₱" +
          Number(v || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
        );
      }
      async function getAppData(user) {
        const ref = doc(db, "users", user.uid, "appData", "default"),
          snap = await getDoc(ref);
        return { ref, data: snap.exists() ? snap.data() : {} };
      }
      async function getTransactions(user) {
        const { data } = await getAppData(user);
        return normalizeTransactions(
          data[transactionKey(user.email)] ?? data.transactions,
        );
      }
      async function saveTransactions(user, list) {
        const ref = doc(db, "users", user.uid, "appData", "default");
        await setDoc(
          ref,
          {
            currentEmail: user.email,
            email: user.email,
            [transactionKey(user.email)]: JSON.stringify(list),
            updatedAt: Date.now(),
          },
          { merge: true },
        );
      }
      async function getSettings(user) {
        const { data } = await getAppData(user);
        return {
          currency: data.currency || "PHP",
          dark: data.dark === true,
          phpPerUsd:
            typeof data.phpPerUsdNumber === "number"
              ? data.phpPerUsdNumber
              : 56.5,
        };
      }
      async function saveSettings(user, values) {
        const ref = doc(db, "users", user.uid, "appData", "default");
        await setDoc(
          ref,
          {
            ...values,
            currentEmail: user.email,
            email: user.email,
            updatedAt: Date.now(),
          },
          { merge: true },
        );
      }
      function applyDark(v) {
        document.documentElement.classList.toggle("dark", !!v);
        if (document.body) document.body.classList.toggle("dark", !!v);
      }
      function fmtDate(ms) {
        return new Date(Number(ms)).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      }
      function esc(s) {
        return String(s ?? "").replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[c],
        );
      }

      let user, s;
      function paint() {
        currency.value = s.currency;
        darkMode.classList.toggle("on", s.dark);
        applyDark(s.dark);
      }
      currency.onchange = async () => {
        s.currency = currency.value;
        await saveSettings(user, { currency: s.currency });
      };
      darkMode.onclick = async () => {
        s.dark = !s.dark;
        localStorage.setItem("pisotrackDark", String(s.dark));
        paint();
        await saveSettings(user, { dark: s.dark });
      };
      about.onclick = () => aboutModal.classList.add("open");
      closeAbout.onclick = () => aboutModal.classList.remove("open");
      logout.onclick = async () => {
        if (!await window.pisoTrackConfirm({ title: "Log Out?", message: "Are you sure you want to log out?", confirmText: "Log Out" })) return;
        await signOut(auth);
        location.href = "login.html";
      };
      onAuthStateChanged(auth, async (u) => {
        if (!u) return (location.href = "login.html");
        if (!u.emailVerified) {
          await signOut(auth);
          return (location.href = "login.html");
        }
        user = u;
        userName.textContent = u.displayName || u.email;
        try {
          s = await getSettings(u);
          localStorage.setItem("pisotrackDark", String(s.dark));
          applyDark(s.dark);
        } catch (error) {
          console.error(error);
          s = { currency: "PHP", notifications: true, dark: document.documentElement.classList.contains("dark"), phpPerUsd: 56.5 };
        }
        paint();
        syncStatus.textContent = "Data saves automatically";
      });
    