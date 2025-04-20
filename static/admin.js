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
});

// Action in main dashboard

document.addEventListener("DOMContentLoaded", function () {

    // patient
    const input_patient = document.getElementById("search-patient");
    const patientBody = document.getElementById("patient-table-body");
    const noResultPatientRow = document.getElementById("no-patient-result");
  
    // doctor
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
});
