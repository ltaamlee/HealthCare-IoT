import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, remove, onValue, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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

// Action in main dashboard
document.addEventListener("DOMContentLoaded", function () {

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

    const auth = getAuth();
    const logout_btn = document.getElementById("logout");
    logout_btn?.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                showPopup("Logout!");
                setTimeout(() => {
                    window.location.href = "/public/page/home.html";
                }, 2000);
            })
            .catch((error) => {
                console.error("Lỗi khi đăng xuất:", error);
                showPopup("Lỗi đăng xuất: " + error.message);
            });
    });


    // ========== Total ==========

    function countPatientsFromDB() {
        const patientsRef = ref(db, 'patients/');
        
        get(patientsRef).then((snapshot) => {
          if (snapshot.exists()) {
            const patients = snapshot.val();
            const patientCount = Object.keys(patients).length;
            console.log(`Số lượng bệnh nhân: ${patientCount}`);

            document.getElementById('total-patients').innerText = patientCount;
          } else {
            document.getElementById('total-patients').innerText = 0;
          }
        }).catch((error) => {
          console.error("❌ Error:", error);
          document.getElementById('total-patients').innerText = 0;
        });
      }
      

      function countDoctorsFromDB() {
        const doctorsRef = ref(db, 'doctors/');
        
        get(doctorsRef).then((snapshot) => {
          if (snapshot.exists()) {
            const doctors = snapshot.val();
            const doctorCount = Object.keys(doctors).length;
            console.log(`Số lượng bác sĩ: ${doctorCount}`);

            document.getElementById('total-doctors').innerText = doctorCount;
          } else {
            document.getElementById('total-doctors').innerText = 0;
          }
        }).catch((error) => {
          console.error("❌ Error:", error);
          document.getElementById('total-doctors').innerText = 0;
        });
      }
      
      countPatientsFromDB();
      countDoctorsFromDB();
    

    // ========== search bar ==========
    const input_patient = document.getElementById("search-patient");
    const patientBody = document.getElementById("patient-table-body");
    const noResultPatientRow = document.getElementById("no-patient-result");

    const input_doctor = document.getElementById("search-doctor");
    const doctorBody = document.getElementById("doctor-table-body");
    const noResultDoctorRow = document.getElementById("no-doctor-result");

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

    input_doctor.addEventListener("keyup", function () {
        searchTable(input_doctor, doctorBody, noResultDoctorRow, [1, 2, 3]);
    });

    // ========== import CSV ==========
    const file_input = document.getElementById("csvFile");
    const import_btn = document.getElementById("import-btn");
    const status = document.getElementById("status");

    import_btn?.addEventListener('click', () => file_input.click());

    file_input?.addEventListener('change', async () => {
        const file = file_input.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                const data = results.data;
                let success = 0, fail = 0;

                for (let row of data) {
                    const id = row.id;
                    if (id && row.name && row.email && row.phone && row.password) {
                        const exists = await checkDoctorIdExists(id);
                        if (exists) {
                            fail++;
                            status.innerHTML += `❌ ID bác sĩ ${id} đã tồn tại.<br>`;
                        } else {
                            try {
                                await addDoctorToFirebase(id, row.name, row.email, row.phone, row.password);
                                success++;
                                status.innerHTML = `✅ Đã thêm ${success} bác sĩ`;
                            } catch (err) {
                                console.error("❌ Lỗi khi thêm bác sĩ:", err);
                                fail++;
                                status.innerHTML += `<br>❌ Lỗi khi thêm bác sĩ ${id}`;
                            }
                        }
                    }
                }

                if (fail > 0) {
                    status.innerHTML += `<br>❌ Có ${fail} dòng bị lỗi.`;
                }
            }
        });
    });

    async function checkDoctorIdExists(id) {
        const doctorRef = ref(db, "doctors/" + id);
        const snapshot = await get(doctorRef);
        return snapshot.exists();
    }

    // Add patient to table from form register
    // ========== Amitted Date ==========

    function formatCreationDate(creationTime) {
        const date = new Date(creationTime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        return `${day}-${month}-${year}`; 
    }

    // function maskPassword(password) {
    //     if (!password) return "";
    //     if (password.length <= 2) return "*".repeat(password.length);
    //     return password.slice(0, 2) + "*".repeat(password.length - 2);
    // }   

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
            <button onclick="editPatient(this)">Edit</button>
            <button onclick="deletePatient(this)">Delete</button>
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

    function addDoctorRow(no, id, name, phone, email) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${no}</td>
            <td>${id}</td>
            <td>${name}</td>
            <td>${phone}</td>
            <td>${email}</td>
            <td>
                <button onclick="editDoctor(this)">Edit</button>
                <button onclick="deleteDoctor(this)">Delete</button>
            </td>`;
        doctorBody.appendChild(row);
        noResultDoctorRow.style.display = "none";
    }

    loadPatients();

    // ========== Add account in Firebase ==========
    async function addDoctorToFirebase(id, name, email, phone, password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await set(ref(db, "doctors/" + id), {
            name, email, phone, password,
            uid: user.uid,
            role: "doctor"
        });
        console.log("✅ Bác sĩ đã được thêm!");
    }

    // ========== Load Doctor to web ==========
    function loadDoctors() {
        onValue(ref(db, "doctors"), (snapshot) => {
            doctorBody.innerHTML = "";
            let no = 1;
            const data = snapshot.val();
            if (!data) {
                noResultDoctorRow.style.display = "";
                return;
            }
            for (const id in data) {
                const d = data[id];
                addDoctorRow(no++, id, d.name, d.phone, d.email);
            }
        });
    }

    loadDoctors();
      
});

// Delete patient
window.deletePatient = async function (btn) {
    const row = btn.closest("tr");
    const patientId = row.cells[1].textContent;

    console.log(`${patientId}`);
    if (confirm(`Delete doctor ID: ${patientId}?`)) {
        const patientRef = ref(db, "patients/" + patientId);
        const snapshot = await get(patientRef);

        if (!snapshot.exists()) {
            alert("❌ Không tìm thấy bác sĩ này.");
            return;
        }

        const patientData = snapshot.val();
        const uid = patientId;

        try {
            // Gọi server để xóa user từ Firebase Authentication
            const response = await fetch(`http://localhost:3000/delete-patient/${uid}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Lỗi không xác định.');
            }

            // Sau khi server xoá auth thành công, xoá Realtime Database
            await remove(patientRef);
            row.remove();
            alert(`✅ Bác sĩ với ID ${patientId} đã được xóa.`);

        } catch (error) {
            console.error("❌ Lỗi khi xóa:", error);
            alert("Lỗi khi xóa: " + error.message);
        }
    }

    updateTotals();
};

// Edit doctor
window.editDoctor = function (btn) {
    const row = btn.closest("tr");
    alert(`Edit: ${row.cells[2].textContent}`);
};

// Delete doctor
window.deleteDoctor = async function (btn) {
    const row = btn.closest("tr");
    const doctorId = row.cells[1].textContent;

    if (confirm(`Delete doctor ID: ${doctorId}?`)) {
        const doctorRef = ref(db, "doctors/" + doctorId);
        const snapshot = await get(doctorRef);

        if (!snapshot.exists()) {
            alert("❌ Không tìm thấy bác sĩ này.");
            return;
        }

        const doctorData = snapshot.val();
        const uid = doctorData.uid;

        try {
            // Gọi server để xóa user từ Firebase Authentication
            const response = await fetch(`http://localhost:3000/delete-doctor/${uid}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Lỗi không xác định.');
            }

            // Sau khi server xoá auth thành công, xoá Realtime Database
            await remove(doctorRef);
            row.remove();
            alert(`✅ Bác sĩ với ID ${doctorId} đã được xóa.`);

        } catch (error) {
            console.error("❌ Lỗi khi xóa:", error);
            alert("Lỗi khi xóa: " + error.message);
        }
    }
    updateTotals();
};
