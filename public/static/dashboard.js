import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
 import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
 import { getDatabase, ref, get, set, onValue, off} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
 
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
 
  // ========== Greeting by Current Time and Name ==========
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
 
  // ========== Log Out ==========
  const popup = document.getElementById("custom-popup");
  const close_btn = document.getElementById("close-btn");
  const popup_message = document.getElementById("popup-message");

  function showPopup(message) {
    popup_message.textContent = message; 
    popup.style.display = "flex"; 
  }

  close_btn.addEventListener("click", () => {
      popup.style.display = "none"; 
  });

  window.addEventListener("click", (event) => {
    if (event.target === popup) {
        popup.style.display = "none";
    }
  });

  const logout_btn = document.getElementById("logout");
  logout_btn?.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            showPopup("Logout!");
            setTimeout(() => {
                window.location.href = "/page/home.html";
            }, 2000);
        })
        .catch((error) => {
            console.error("Lỗi khi đăng xuất:", error);
            showPopup("Lỗi đăng xuất: " + error.message);
        });
  });


  // ========= Load Data from Esp ========
  // Function to update the Firebase record with new data


  function updateRecord(userId, heartRate, tempRate, spo2Rate, activityRate) {
    const recordRef = ref(db, `records/${userId}`);
    const timestamp = Date.now();
    
    const data = {
      "heart-rate": {
        timestamp: timestamp,
        value: heartRate
      },
      "temp-rate": {
        timestamp: timestamp,
        value: tempRate
      },
      "spo2-rate": {
        timestamp: timestamp,
        value: spo2Rate
      },
      "activity-rate": {
        timestamp: timestamp,
        value: activityRate
      }
    };
    
    set(recordRef, data)
      .then(() => {
        console.log("✅ Record updated (overwrite mode).");
      })
      .catch((error) => {
        console.error("❌ Error updating record:", error);
      });
  }
  
  // Data in firebase
  function updateCardValues(data) {
    // Update Heart
    const heartRate = data["heart-rate"].value;
    document.getElementById("bpm").innerText = heartRate + " bpm";
  
    // Update Temperature
    const tempRate = data["temp-rate"].value;
    document.getElementById("temp").innerText = tempRate + " °C";
  
    // Update SPO2
    const spo2Rate = data["spo2-rate"].value;
    document.getElementById("spo2").innerText = spo2Rate + " %";
  
    // Update Activity
    const activityRate = data["activity-rate"].value;
    document.getElementById("activity").innerText = activityRate === "yes" ? "Nghi ngờ té" : "Bình thường";
  }
  
  function listenToRealtimeData(userId) {
    const recordRef = ref(db, `records/${userId}`);
    
    onValue(recordRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        updateCardValues(data); 
        updateCharts(data); 
      }
    });
  }
  
  // setInterval(() => {
  //   const heartRate = Math.floor(Math.random() * (100 - 60 + 1) + 60); // Nhịp tim ngẫu nhiên từ 60 đến 100 bpm
  //   const tempRate = (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1); // Nhiệt độ ngẫu nhiên từ 36.5°C đến 37.5°C
  //   const spo2Rate = Math.floor(Math.random() * (100 - 90 + 1) + 90); // SPO2 ngẫu nhiên từ 90% đến 100%
  //   const activityRate = Math.random() > 0.5 ? "yes" : "no"; // Hoạt động ngẫu nhiên
  
  //   updateRecord(userId, heartRate, tempRate, spo2Rate, activityRate);
  // }, 5000);
  
  const userId = "testPatientId";
  listenToRealtimeData(userId);

  window.addEventListener("beforeunload", () => {
    const recordRef = ref(db, `records/${userId}`);
    off(recordRef);
  });
});


