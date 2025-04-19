import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
  const db = getDatabase(app);
  const auth = getAuth(app);

function writeUserData(userId, name, email) {
    const dbRef = ref(db, 'users/' + userId);
    set(dbRef, {
        username: name,
        email: email
    })
    .then(() => {
        console.log("✅ Data saved to database.");
    }).catch((error) => {
        console.error("❌ Error saving data:", error);
    });
}

const userId = "testUserId";
const name = "Test User";
const email = "test@example.com";

writeUserData(userId, name, email);

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("submit");

    btn.addEventListener("click", (e) => {
        e.preventDefault();

        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var username = document.getElementById("username").value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                writeUserData(user.uid, username, email);
                alert("Register success!");
                window.location.href = "/page/login.html";
            })
            .catch((error) => {
                alert("Error: " + error.message);
                console.error("Registration error:", error);
            });
    });
});
