import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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

onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
  
      const userRef = ref(db, 'users/' + uid);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const username = data.username; 
  
            const nameEl = document.getElementById("name");
            const now = new Date();
            const hours = now.getHours();
            let greeting = "Good morning";
            if (hours >= 12 && hours < 18) {
                greeting = "Good afternoon";
            } else if (hours >= 18) {
                greeting = "Good evening";
            }
            nameEl.textContent = `${greeting}, ${username}!`; 
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error("Error fetching username:", error);
        });
    } else {
      window.location.href = "/page/login.html";
    }
  });
  
