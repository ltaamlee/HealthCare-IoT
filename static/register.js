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

function writePatientData(userId, name, email, phone, dob, gender, height, weight) {
    const dbRef = ref(db, 'patients/' + userId);
    set(dbRef, {
      name: name,
      email: email,
      phone: phone,
      dob: dob,
      gender: gender,
      height: height,
      weight: weight,
      role: "patient"
    })
    .then(() => {
      console.log("✅ Patient data saved.");
    }).catch((error) => {
      console.error("❌ Error saving patient data:", error);
    });
}

function writeDoctorData(userId, name, email, phone) {
  const dbRef = ref(db, 'doctors/' + userId);
  set(dbRef, {
      name: name,
      email: email,
      phone: phone,
      role: "doctor"
  }).then(() => {
      console.log("✅ Doctor data saved.");
  }).catch((error) => {
      console.error("❌ Error saving doctor data:", error);
  });
}

const userId = "testUserId";
const name = "Test User";
const email = "test@example.com";
const dob = "04/12/2005";
const phone ="0949323963";
const gender ="Female";
const height = 170;
const weight = 50;

writePatientData(userId, name, email, phone, dob, gender, height, weight);

const dId = "testDoctorId";
const dname = "Test Doctor";
const demail = "test@example.com";
const dphone = "094785236";

writeDoctorData(dId, dname, demail, dphone);

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("submit");

    btn.addEventListener("click", (e) => {
        e.preventDefault();

        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var username = document.getElementById("username").value;
        var phone = document.getElementById("phone").value;
        var dob = document.getElementById("dob").value;
        var gender = document.getElementById("gender").value;
        var height = document.getElementById("height").value;
        var weight = document.getElementById("weight").value;
  
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                writePatientData(user.uid, username, email, phone, dob, gender, height, weight);

                alert("Register success!");
                window.location.href = "/page/login.html";
            })
            .catch((error) => {
                alert("Error: " + error.message);
                console.error("Registration error:", error);
            });
    });
});
