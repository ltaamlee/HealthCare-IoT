import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

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
const auth = getAuth();
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const greetingText = document.getElementById("name");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;
      const dbRef = ref(db, 'patients/' + userId);

      get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const name = userData.name || "User";
          const now = new Date();
          const hour = now.getHours();
          let greeting = "Hello";

          if (hour >= 5 && hour < 12) {
            greeting = "☀️ Good Morning";
          } else if (hour >= 12 && hour < 18) {
            greeting = "🌤️ Good Afternoon";
          } else {
            greeting = "🌙 Good Evening";
          }

          if (greetingText) {
            greetingText.textContent = `${greeting}, ${name}!`;
          }
        } else {
          console.error("❌ No data found for this user.");
        }
      }).catch((error) => {
        console.error("❌ Error getting user data:", error);
      });
    } else {
      console.warn("⚠️ No user is logged in.");
      greetingText.textContent = "Hello, Guest!";
    }
  });

  const logout_btn = document.getElementById("logout");
  logout_btn?.addEventListener("click", () => {
      signOut(auth)
          .then(() => {
              showPopup();
              setTimeout(() => {
                  window.location.href = "/page/home.html";
              }, 2000);
          })
          .catch((error) => {
              console.error("Lỗi khi đăng xuất:", error);
              showPopup("Lỗi đăng xuất: " + error.message);
          });
  });

});
  
