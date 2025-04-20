import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBKLtIDvC1cit3bxQvpVU4TkrsJVO67OFA",
    authDomain: "health-care-iot-1b260.firebaseapp.com",
    databaseURL: "https://health-care-iot-1b260-default-rtdb.firebaseio.com",
    projectId: "health-care-iot-1b260",
    storageBucket: "health-care-iot-1b260.firebasestorage.app",
    messagingSenderId: "62331061840",
    appId: "1:62331061840:web:dca9e1513510938ef7b355",
    measurementId: "G-9HMZFPDN7Z"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
    console.log("JS loaded");

    const btn = document.getElementById("submit");
    console.log("Found button:", btn);

    btn.addEventListener("click", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        alert("Email: ${email}, Password: ${password}"); 

        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                alert("Login success!");
                console.log("User:", user);
                window.location.href = "/page/dashboard.html"; 
            })
            .catch((error) => {
                alert("Error: " + error.message);
                console.error(error);
            });
    });
});
