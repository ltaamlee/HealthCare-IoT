import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, remove, onValue, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
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

// Action in main dashboard
document.addEventListener("DOMContentLoaded", function () {
    const input_patient = document.getElementById("search-patient");
    const patientBody = document.getElementById("patient-table-body");
    const noResultPatientRow = document.getElementById("no-patient-result");

    const input_doctor = document.getElementById("search-doctor");
    const doctorBody = document.getElementById("doctor-table-body");
    const noResultDoctorRow = document.getElementById("no-doctor-result");

    // search function
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

    // import CSV file
    const file_input = document.getElementById("csvFile");
    const import_btn = document.getElementById("import-btn");
    const status = document.getElementById("status");

    import_btn.addEventListener('click', () => {
        file_input.click();
    });

    file_input.addEventListener('change', async () => {
        const file = file_input.files[0];
        if (!file) {
            status.innerHTML = "❌ Không có tệp nào được chọn.";
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                const data = results.data;
                let success = 0, fail = 0;

                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    const id = row.id;

                    if (id && row.name && row.email && row.phone && row.password) {
                        console.log(`ID: ${id}, Name: ${row.name}, Email: ${row.email}, Phone: ${row.phone}`);

                        const exists = await checkDoctorIdExists(id);
                        console.log(`Checking if doctor ID ${id} exists: ${exists}`);
                        if (exists) {
                            fail++;
                            status.innerHTML = `❌ ID bác sĩ ${id} đã tồn tại. Không thể thêm.`;
                            console.log(`❌ ID bác sĩ ${id} đã tồn tại.`);
                        } else {
                            try {
                                // Create user account in Firebase Authentication
                                const auth = getAuth();
                                await createUserWithEmailAndPassword(auth, row.email, row.password);

                                // Insert doctor data into Firebase Realtime Database
                                const refDoc = ref(db, "doctors/" + id);
                                await set(refDoc, {
                                    name: row.name,
                                    email: row.email,
                                    password: row.password,
                                    phone: row.phone,
                                    role: "doctor"
                                });

                                success++;
                                status.innerHTML = `✅ Đã import ${success} bác sĩ`;
                                console.log(`✅ Đã import bác sĩ ${id}`);
                            } catch (err) {
                                console.error("❌ Lỗi:", err);
                                fail++;
                                console.log(`❌ Lỗi khi thêm bác sĩ ${id}`);
                            }
                        }
                    } else {
                        fail++;
                        console.log(`❌ Dòng dữ liệu không hợp lệ: ${JSON.stringify(row)}`);
                    }
                }

                if (fail > 0) {
                    status.innerHTML += `<br>❌ Có ${fail} dòng bị lỗi.`;
                }
            },
            error: function (err) {
                console.error("❌ Lỗi khi phân tích tệp CSV:", err);
                status.innerHTML = "❌ Lỗi khi phân tích tệp CSV.";
            }
        });
    });
    
    async function checkDoctorIdExists(id) {
        const doctorRef = ref(db, "doctors/" + id);
        const snapshot = await get(doctorRef);
        console.log(`ID ${id} exists: ${snapshot.exists()}`);
        return snapshot.exists(); 
    }

    // add doctor to table
    function addDoctorRow(no, id, name, phone, email) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${no}</td>
            <td>${id}</td>
            <td>${name}</td>
            <td>${phone}</td>
            <td>${password}</td>
            <td>${email}</td>
            <td>
                <button onclick="editDoctor(this)">Edit</button>
                <button onclick="deleteDoctor(this)">Delete</button>
            </td>
        `;
        doctorBody.appendChild(row);
        noResultDoctorRow.style.display = "none";
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
    }

    // Fetch doctors and display them on the table
    function loadDoctors() {
        const doctorsRef = ref(db, "doctors");

        onValue(doctorsRef, (snapshot) => {
            doctorBody.innerHTML = "";
            const data = snapshot.val();

            if (!data) {
                noResultDoctorRow.style.display = "";
                return;
            }

            let no = 1;
            for (const id in data) {
                const doctor = data[id];
                addDoctorRow(no++, id, doctor.name, doctor.phone, doctor.email);
            }
        });
    }

    loadDoctors();
});

// Edit doctor
window.editDoctor = function (btn) {
    const row = btn.closest("tr");
    alert("Edit: " + row.cells[2].textContent);
};

// Delete doctor
window.deleteDoctor = function (btn) {
    const row = btn.closest("tr");
    const doctorId = row.cells[1].textContent;

    if (confirm("Delete this doctor?")) {
        remove(ref(db, "doctors/" + doctorId)).then(() => {
            row.remove();
            alert("Deleted!");
            console.log("Bác sĩ ${doctorId} đã bị xóa.");
        }).catch((err) => {
            console.error("Error:", err);
        });
    }
};
