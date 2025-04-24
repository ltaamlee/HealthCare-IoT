import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKLtIDvC1cit3bxQvpVU4TkrsJVO67OFA",
  authDomain: "health-care-iot-1b260.firebaseapp.com",
  databaseURL: "https://health-care-iot-1b260-default-rtdb.firebaseio.com",
  projectId: "health-care-iot-1b260",
  storageBucket: "health-care-iot-1b260.appspot.com",
  messagingSenderId: "62331061840",
  appId: "1:62331061840:web:dca9e1513510938ef7b355"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);

let selectedPatientId = null;

window.sendPatient = (button) => {
  const row = button.closest("tr");
  selectedPatientId = row.cells[1].textContent;
  document.querySelector(".nav_content").classList.add("active");
  document.getElementById("sendNotificationPanel").classList.remove("hidden");
  document.getElementById("received").classList.add("hidden");
  document.getElementById("sendNotificationPanel").scrollIntoView({ behavior: "smooth" });
};

window.detailPatient = (button) => {
  const row = button.closest("tr");
  const patientId = row.cells[1].textContent;
  if (patientId) window.location.href = `/page/dashboard.html?id=${patientId}`;
};

window.markAsRead = (notiId) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const notiRef = ref(db, `notifications/${user.uid}/${notiId}/read`);
      set(notiRef, true).then(() => {
        console.log("🔵 Đánh dấu đã đọc:", notiId);
      });
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const nameElement = document.getElementById("name");
  const notiList = document.getElementById("notification-list");
  const badge = document.getElementById("noti-badge");
  const input_patient = document.getElementById("search-patient");
  const patientBody = document.getElementById("patient-table-body");
  const noResultPatientRow = document.getElementById("no-patient-result");
  const send_btn = document.getElementById("send_noti");

  function showPopup(message) {
    document.getElementById("popup-message").textContent = message;
    document.getElementById("custom-popup").style.display = "flex";
  }

  document.getElementById("close-btn").addEventListener("click", () => {
    document.getElementById("custom-popup").style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === document.getElementById("custom-popup")) {
      document.getElementById("custom-popup").style.display = "none";
    }
  });

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "☀️ Good Morning";
    if (hour >= 12 && hour < 18) return "🌤️ Good Afternoon";
    return "🌙 Good Evening";
  }

  function findDoctorByUID(uid, callback) {
    const doctorRef = ref(db, "doctors/");
    get(doctorRef).then(snapshot => {
      if (snapshot.exists()) {
        const doctors = snapshot.val();
        for (const key in doctors) {
          if (doctors[key].uid === uid) {
            callback(doctors[key]);
            return;
          }
        }
        callback(null);
      } else callback(null);
    }).catch(err => {
      console.error("❌ Lỗi UID bác sĩ:", err);
      callback(null);
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const doctorId = user.uid;

      // ✅ Hiển thị chào mừng
      findDoctorByUID(doctorId, (doctor) => {
        nameElement.textContent = `${getGreeting()}, ${doctor?.name || "Doctor"}!`;
      });

      // ✅ Load thông báo
      const notiRef = ref(db, `notifications/${doctorId}`);
      onValue(notiRef, (snapshot) => {
        const notifications = snapshot.val();
        notiList.innerHTML = "";
        let unreadCount = 0;

        if (notifications) {
          const entries = Object.entries(notifications).map(([id, noti]) => ({ notiId: id, ...noti }));
          entries.sort((a, b) => b.timestamp - a.timestamp);
          entries.forEach(({ notiId, message, timestamp, read }) => {
            const item = document.createElement("li");
            item.innerHTML = `
              <span>${message}</span><br/>
              <small>${new Date(timestamp).toLocaleString()}</small><br/>
              ${read ? '<span class="read-tag">Readed</span>' : `<button onclick="markAsRead('${notiId}')">Marked</button>`}
            `;
            notiList.appendChild(item);
            if (!read) unreadCount++;
          });
        } else {
          notiList.innerHTML = "<li>Không có thông báo nào</li>";
        }

        badge.style.display = unreadCount > 0 ? "inline-block" : "none";
        badge.innerText = unreadCount;
      });

      // ✅ Load bệnh nhân
      loadPatients();

      // ✅ Gửi thông báo
      send_btn.addEventListener("click", () => {
        const notiText = document.getElementById("noti").value.trim();
        if (!notiText || !selectedPatientId) {
          alert("Vui lòng chọn bệnh nhân và nhập nội dung!");
          return;
        }

        const notiRef = push(ref(db, `notifications/${selectedPatientId}`));
        set(notiRef, {
          message: notiText,
          sender: doctorId,
          timestamp: Date.now(),
          read: false
        }).then(() => {
          alert("✅ Gửi thông báo thành công!");
          document.getElementById("noti").value = "";
          document.getElementById("sendNotificationPanel").classList.add("hidden");
          document.querySelector(".nav_content").classList.remove("active");
        }).catch((err) => {
          console.error("❌ Gửi lỗi:", err);
          alert("❌ Gửi thất bại.");
        });
      });
    }
  });

  document.getElementById("logout")?.addEventListener("click", () => {
    signOut(auth).then(() => {
      showPopup("");
      setTimeout(() => window.location.href = "/page/home.html", 2000);
    }).catch((err) => {
      console.error("❌ Lỗi đăng xuất:", err);
      showPopup("Lỗi đăng xuất: " + err.message);
    });
  });

  document.getElementById("close_noti")?.addEventListener("click", () => {
    document.getElementById("sendNotificationPanel").classList.add("hidden");
    document.querySelector(".nav_content").classList.remove("active");
  });

  // ========= Search bar =========
  input_patient.addEventListener("keyup", () => {
    searchTable(input_patient, patientBody, noResultPatientRow, [1, 2]);
  });

  function searchTable(inputElement, tableBody, noResultRow, columnIndices) {
    const filter = inputElement.value.toLowerCase();
    const rows = tableBody.getElementsByTagName("tr");
    let found = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const columns = row.getElementsByTagName("td");
      let match = columnIndices.some(index => columns[index]?.textContent.toLowerCase().includes(filter));
      row.style.display = match ? "" : "none";
      if (match) found = true;
    }

    noResultRow.style.display = found ? "none" : "";
  }

  function formatDate(timestamp) {
    const d = new Date(timestamp);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  }

  function loadPatients() {
    get(ref(db, 'patients/')).then(snapshot => {
      if (snapshot.exists()) {
        const patients = snapshot.val();
        patientBody.innerHTML = "";
        let no = 1;
        for (const id in patients) {
          const p = patients[id];
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${no++}</td>
            <td>${id}</td>
            <td>${p.name}</td>
            <td>${p.dob}</td>
            <td>${p.gender}</td>
            <td>${formatDate(p.createdAt)}</td>
            <td>
              <button onclick="detailPatient(this)">Detail</button>
              <button onclick="sendPatient(this)">Send Message</button>
            </td>
          `;
          patientBody.appendChild(tr);
        }
      }
    }).catch(err => {
      console.error("❌ Lỗi load bệnh nhân:", err);
    });
  }
});
