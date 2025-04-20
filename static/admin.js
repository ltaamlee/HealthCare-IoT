import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, remove, onValue, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
        if (!file) return;
    
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                const data = results.data;
                let success = 0, fail = 0;
    

                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    const id = row.id;  
    
                    if (id && row.name && row.email && row.phone) {
                        // In ra thông tin bác sĩ sẽ được thêm vào
                        console.log("ID: ${id}, Name: ${row.name}, Email: ${row.email}, Phone: ${row.phone}");
    

                        const exists = await checkDoctorIdExists(id);
                        console.log("Checking if doctor ID ${id} exists: ${exists}");
                        if (exists) {
                            fail++;
                            status.innerHTML = "❌ ID bác sĩ ${id} đã tồn tại. Không thể thêm.";
                            console.log("❌ ID bác sĩ ${id} đã tồn tại.");
                        } else {
                            // insert to firebase db
                            const refDoc = ref(db, "doctors/" + id);
                            set(refDoc, {
                                name: row.name,
                                email: row.email,
                                phone: row.phone,
                                password: row.password,
                                role: "doctor"
                            }).then(() => {
                                success++;
                                status.innerHTML = "✅ Đã import ${success} bác sĩ";
                                console.log("✅ Đã import bác sĩ ${id}");
                            }).catch((err) => {
                                console.error("❌ Lỗi:", err);
                                fail++;
                                console.log("❌ Lỗi khi thêm bác sĩ ${id}");
                            });
                        } 
                    }
                }
    
                if (fail > 0) {
                    status.innerHTML += "<br>❌ Có ${fail} dòng bị lỗi.";
                }
            }
        });
    });
    
    async function checkDoctorIdExists(id) {
        const doctorRef = ref(db, "doctors/" + id);
        const snapshot = await get(doctorRef);
        console.log(`ID ${id} exists: ${snapshot.exists()}`);
        return snapshot.exists(); 
    }

    // add patient to table from form register
    function addPatientRow(no, id, name, dob, gender, admittedDate) {
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
        document.getElementById("patient-table-body").appendChild(row);
    }

    // add doctor to table
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
            </td>
        `;
        doctorBody.appendChild(row);
        noResultDoctorRow.style.display = "none";
    }


    function displayPatients(patients) {
        const patientBody = document.getElementById("patient-table-body"); // Reference to the table body
        const noResultPatientRow = document.getElementById("no-patient-result");
    
        patientBody.innerHTML = ''; 
    
        let no = 1;
        for (const id in patients) {
            const patient = patients[id];
            addPatientRow(no++, id, patient.name, patient.dob, patient.gender, patient.admittedDate);
        }
    
        if (no === 1) {
            noResultPatientRow.style.display = '';
        } else {
            noResultPatientRow.style.display = 'none';
        }
    }

    function loadPatients() {
        const patientsRef = ref(db, 'patients/');
        get(patientsRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
            const patients = snapshot.val();
            displayPatients(patients);
            } else {
            console.log("❌ Không có dữ liệu bệnh nhân");
            }
        })
        .catch((error) => {
            console.error("❌ Lỗi khi lấy dữ liệu bệnh nhân:", error);
        });
    }
    
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

    loadPatients();
    loadDoctors();
});

// Edit doctor
window.editDoctor = function (btn) {
    const row = btn.closest("tr");
    alert("Edit: " + row.cells[2].textContent);
};


// Delete Patient
window.deletePatient = function (btn) {
    const row = btn.closest("tr");
    const patientId = row.cells[1].textContent; 
    deleteUserFromAuthentication(patientId);

    const patientRef = ref(db, 'patients/' + patientId);
    remove(patientRef)
        .then(() => {
            console.log("✅ Đã xóa bệnh nhân khỏi Realtime Database");
            arlet("Deleted!");
        })
        .catch((error) => {
            console.error("❌ Lỗi khi xóa bệnh nhân:", error);
        });
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
