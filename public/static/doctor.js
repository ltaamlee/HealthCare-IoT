import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, remove, onValue, get, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
const auth = getAuth();

// Action in main dashboard
document.addEventListener("DOMContentLoaded", function () {
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
     
    // ========== Logout ==========

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


    // ========== search bar ==========
    const input_patient = document.getElementById("search-patient");
    const patientBody = document.getElementById("patient-table-body");
    const noResultPatientRow = document.getElementById("no-patient-result");

    function searchTable(inputElement, tableBody, noResultRow, columnIndices) {
        const filter = inputElement.value.toLowerCase();
        const rows = tableBody.getElementsByTagName("tr");

        let found = false;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const columns = row.getElementsByTagName("td");

            let match = false;
            columnIndices.forEach(index => {
                const cellContent = columns[index]?.textContent.toLowerCase() || "";
                if (cellContent.includes(filter)) {
                    match = true;
                }
            });

            if (match) {
                row.style.display = "";
                found = true;
            } else {
                row.style.display = "none";
            }
        }

        noResultRow.style.display = found ? "none" : "";
    }

    input_patient.addEventListener("keyup", function () {
        searchTable(input_patient, patientBody, noResultPatientRow, [1, 2]);
    });

    // Add patient to table from form register
    // ========== Amitted Date ==========

    function formatCreationDate(creationTime) {
        const date = new Date(creationTime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        return `${day}-${month}-${year}`; 
    }
    function displayPatients(patients) {
        patientBody.innerHTML = '';
        let no = 1;
        for (const id in patients) {
            const p = patients[id];
            const creationTime = p.createdAt;
            console.log("Ngày tạo:", p.createdAt);

            addPatientRow(no++, id, p.name, p.dob, p.gender, creationTime);
        }
        noResultPatientRow.style.display = no === 1 ? '' : 'none';
    }

    function addPatientRow(no, id, name, dob, gender, creationTime) {
        const admittedDate = formatCreationDate(creationTime);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${no}</td>
            <td>${id}</td>
            <td>${name}</td>
            <td>${dob}</td>
            <td>${gender}</td>
            <td>${admittedDate}</td>
            <td>
            <button onclick="detailPatient(this)">Detail</button>
            <button onclick="sendPatient(this)">Send Message</button>
            </td>
        `;
        patientBody.appendChild(row);
        noResultPatientRow.style.display = "none";

        
    }
    // ========== Load Patient to web ==========
    function loadPatients() {
        get(ref(db, 'patients/')).then((snapshot) => {
            if (snapshot.exists()) displayPatients(snapshot.val());
        }).catch((error) => console.error("❌ Lỗi lấy dữ liệu bệnh nhân:", error));
    }
    loadPatients();

    const send_btn = document.getElementById("send_noti");
    send_btn.addEventListener("click", () => {
        // const patientId = sendBtn.getAttribute("data-patient-id");
        const notiText = document.getElementById("noti").value;

        if (!notiText.trim()) {
            alert("Vui lòng nhập nội dung thông báo!.");
            return;
        }
    });

    // Close a notification
    const note_btn = document.getElementById("close_noti");
    note_btn?.addEventListener("click", () => {
        const panel = document.getElementById("sendNotificationPanel");
        panel.classList.add("hidden");
        const navContent = document.querySelector(".nav_content");
        navContent.classList.remove("active");
    });


});

window.detailPatient = function detailPatient(button) {
    const row = button.closest("tr");
    const patientId = row.cells[1].textContent;
    if (patientId){
        window.location.href = `/page/dashboard.html?id=${patientId}`;    }
}

window.sendPatient = function sendPatient(button) {
    const navContent = document.querySelector(".nav_content");
    navContent.classList.add("active");

    document.getElementById("sendNotificationPanel").classList.remove("hidden");
    document.getElementById("received").classList.add("hidden");

    document.getElementById("sendNotificationPanel").scrollIntoView({ behavior: "smooth" });
}