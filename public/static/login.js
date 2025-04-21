import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBKLtIDvC1cit3bxQvpVU4TkrsJVO67OFA",
    authDomain: "health-care-iot-1b260.firebaseapp.com",
    databaseURL: "https://health-care-iot-1b260-default-rtdb.firebaseio.com",
    projectId: "health-care-iot-1b260",
    storageBucket: "health-care-iot-1b260.appspot.com",
    messagingSenderId: "62331061840",
    appId: "1:62331061840:web:dca9e1513510938ef7b355",
    measurementId: "G-9HMZFPDN7Z"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("submit");

    btn.addEventListener("click", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return user.getIdTokenResult();
            })
            .then((idTokenResult) => {
                const role = idTokenResult.claims.role;
                if (role === "admin") {
                    alert("✅ Admin login succeeded!");
                    window.location.href = "/page/admin.html";
                } else {
                    alert("👤 User login succeeded!");
                    window.location.href = "/page/dashboard.html";
                }
            })
            .catch((error) => {
                alert("Login : " + error.message);
                console.error("Login Error:", error);
            });
    });
});
