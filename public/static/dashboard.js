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
      console.log(userId);
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

      listenToRealtimeData(userId);

      // setInterval(() => {
      //   const heartRate = Math.floor(Math.random() * (100 - 60 + 1) + 60);
      //   const tempRate = (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1);
      //   const spo2Rate = Math.floor(Math.random() * (100 - 90 + 1) + 90);
      //   const activityRate = Math.random() > 0.5 ? "yes" : "no";
  
      //   updateRecord(userId, heartRate, tempRate, spo2Rate, activityRate);
      // }, 10000);
  

    } else {
      console.warn("⚠️ No user is logged in.");
      greetingText.textContent = "Hello, Guest!";
    }

  });
 
  // ==================== Log Out ====================
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
            showPopup("");
            setTimeout(() => {
                window.location.href = "/page/home.html";
            }, 2000);
        })
        .catch((error) => {
            console.error("Lỗi khi đăng xuất:", error);
            showPopup("Lỗi đăng xuất: " + error.message);
        });
  });


  // =================== Load Data from Esp ==================
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
  
  // ========== Data in firebase ==========

  const thresholds = {
    heartRate: { min: 60, max: 100 },    
    tempRate: { min: 36.5, max: 37.5 },  
    spo2Rate: { min: 95 },               
  };

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
    document.getElementById("activity").innerText = activityRate === "yes" ? "Falled" : "Normal";

    updateCardStyles(data);

    function sendDoctorNotification(doctorId, message) {
      const notiId = Date.now(); 
      const notiRef = ref(db, `notifications/${doctorId}/${notiId}`);
      set(notiRef, {
        message: message,
        timestamp: notiId,
        read: false
      }).then(() => {
        console.log("📨 Gửi cảnh báo đến bác sĩ thành công.");
      }).catch((err) => {
        console.error("❌ Lỗi gửi cảnh báo:", err);
      });
    }
  }
  
  
  // setInterval(() => {
  //   const heartRate = Math.floor(Math.random() * (100 - 60 + 1) + 60); // Nhịp tim ngẫu nhiên từ 60 đến 100 bpm
  //   const tempRate = (Math.random() * (37.5 - 36.5) + 36.5).toFixed(1); // Nhiệt độ ngẫu nhiên từ 36.5°C đến 37.5°C
  //   const spo2Rate = Math.floor(Math.random() * (100 - 90 + 1) + 90); // SPO2 ngẫu nhiên từ 90% đến 100%
  //   const activityRate = Math.random() > 0.5 ? "yes" : "no"; // Hoạt động ngẫu nhiên
  
  //   updateRecord(userId, heartRate, tempRate, spo2Rate, activityRate);
  // }, 5000);

  // =========================================

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

  // const userId = "testUserId";
  // listenToRealtimeData(userId);
    
  let chartData = {
    labels: [], 
    heart: [],
    temp: [],
    spo2: [],
    activity: []
  };
  
  let chartHeart, chartTemp, chartSpO2, chartActivity;
  function createCharts() {
    const ctxHeart = document.getElementById("chart-heart").getContext("2d");
    const ctxTemp = document.getElementById("chart-temp").getContext("2d");
    const ctxSpO2 = document.getElementById("chart-spo2").getContext("2d");
    const ctxActivity = document.getElementById("chart-activity").getContext("2d");
  
    chartHeart = new Chart(ctxHeart, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Heart Rate (bpm)',
          data: chartData.heart,
          borderColor: 'red',
          fill: false
        }]
      }
    });
  
    chartTemp = new Chart(ctxTemp, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: chartData.temp,
          borderColor: 'orange',
          fill: false
        }]
      }
    });
  
    chartSpO2 = new Chart(ctxSpO2, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'SPO2 (%)',
          data: chartData.spo2,
          borderColor: 'blue',
          fill: false
        }]
      }
    });
  
    chartActivity = new Chart(ctxActivity, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Activity',
          data: chartData.activity,
          borderColor: 'green',
          fill: false
        }]
      }
    });
  }
  

  function updateCharts(data) {
    const now = new Date().toLocaleTimeString();
    chartData.labels.push(now);
    chartData.heart.push(data["heart-rate"].value);
    chartData.temp.push(data["temp-rate"].value);
    chartData.spo2.push(data["spo2-rate"].value);
    chartData.activity.push(data["activity-rate"].value === "yes" ? 1 : 0);
  

    if (chartData.labels.length > 10) {
      chartData.labels.shift();
      chartData.heart.shift();
      chartData.temp.shift();
      chartData.spo2.shift();
      chartData.activity.shift();
    }
  
    chartHeart.update();
    chartTemp.update();
    chartSpO2.update();
    chartActivity.update();
  }


  function updateCardStyles(data) {
    const heartRate = data["heart-rate"].value;
    const tempRate = data["temp-rate"].value;
    const spo2Rate = data["spo2-rate"].value;
    const activityRate = data["activity-rate"].value;
  
    const heartCard = document.querySelector(".heart-card");
    const tempCard = document.querySelector(".temp-card");
    const spo2Card = document.querySelector(".spo2-card");
    const actCard = document.querySelector(".act-card");
  
    if (heartCard) {
      if (heartRate > 120 || heartRate < 50){
        heartCard.classList.add("danger");
        sendDoctorNotification(userData.id_doctor, `🚨 Nhịp tim bất thường: ${heartRate} bpm`);
      }
      else heartCard.classList.remove("danger");
    }
  
    if (tempCard) {
      if (tempRate < 36.0 || tempRate > 37.8){
        tempCard.classList.add("danger");
        sendDoctorNotification(userData.id_doctor, `🚨 Nhiệt độ bất thường: ${tempRate} C`);
      }
      else tempCard.classList.remove("danger");
    }
  
    if (spo2Card) {
      if (spo2Rate < 90){
        spo2Card.classList.add("danger");
        sendDoctorNotification(userData.id_doctor, `🚨 Nồng độ oxy bất thường: ${spo2Rate} C`);
      } 
      else spo2Card.classList.remove("danger");
    }
  
    if (actCard) {
      if (activityRate === "yes"){
        actCard.classList.add("danger");
        sendDoctorNotification(userData.id_doctor, `🚨 Nghi ngờ té ngã: ${activityRate} C`);
      }
      else actCard.classList.remove("danger");
    }
  }

  createCharts();
  window.addEventListener("beforeunload", () => {
    const recordRef = ref(db, `records/${userId}`);
    off(recordRef);
  });

 
  window.markAsRead = function (notiId) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const notiRef = ref(db, `notifications/${user.uid}/${notiId}/read`);
        set(notiRef, true)
          .then(() => {
            console.log("🔵 Đã đánh dấu là đã đọc:", notiId);
          })
          .catch((err) => {
            console.error("❌ Lỗi đánh dấu đã đọc:", err);
          });
      }
    });
  };
  
  const toggleBtn = document.getElementById("toggle-noti-btn");
  const notiList = document.getElementById("notification-list");
  const badge = document.getElementById("noti-badge");
  
  toggleBtn.addEventListener("click", () => {
    notiList.classList.toggle("show");
  
    const unreadItems = notiList.querySelectorAll("button:not(.read-tag)").length;
    if (!notiList.classList.contains("show") && unreadItems > 0) {
      badge.style.display = "inline-block";
      badge.innerText = unreadItems;
    } else {
      badge.style.display = "none";
    }
  });
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const notiRef = ref(db, `notifications/${user.uid}`);
      
      // change
      onValue(notiRef, (snapshot) => {
        const notifications = snapshot.val();
        notiList.innerHTML = "";
        let unreadCount = 0;
  
        if (notifications) {

          const notiArray = Object.entries(notifications).map(([notiId, noti]) => ({ notiId, ...noti }));
  
          notiArray.forEach(({ notiId, message, timestamp, read }) => {
            const item = document.createElement("li");
            item.classList.add("slide-in");
            item.innerHTML = `
              <span>${message}</span><br/>
              <small>${new Date(timestamp).toLocaleString()}</small><br/>
              ${read ? '<span class="read-tag">Readed</span>' : '<button onclick="markAsRead(\'' + notiId + '\')">Marked</button>'}
            `;
            if (!read) unreadCount++;
  
            notiList.insertBefore(item, notiList.firstChild);
          });
  
          // Show badge 
          if (unreadCount > 0) {
            badge.style.display = "inline-block";
            badge.innerText = unreadCount;
          } else {
            badge.style.display = "none";
          }
          
  
        } else {
          notiList.innerHTML = "<li>Không có thông báo nào</li>";
          badge.style.display = "none";
        }
      });
    }
  });

});


