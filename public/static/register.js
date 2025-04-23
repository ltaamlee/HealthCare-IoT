import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
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


// ========= Connect with Firebase =========

const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);
const auth = getAuth(app);


// ========== Add Patient ==========

//   patients/
//    |___id_user
//    |___username
//    |___email
//    |___password
//    |___phone
//    |___dob
//    |___gender
//    |___height
//    |___weight
//    |___admitted_date
//    |___id_doctor
//    |___role : patient

function writePatientData(userId, name, email, password, phone, dob, gender, height, weight, admittedate) {
    const dbRef = ref(db, 'patients/' + userId);
    set(dbRef, {
    name: name,
    email: email,
    phone: phone,
    password: password,
    dob: dob,
    gender: gender,
    height: height,
    weight: weight,
    createdAt: Date.now(),
    role: "patient"
    })
    .then(() => {
    console.log("✅ Patient data saved.");
    }).catch((error) => {
    console.error("❌ Error saving patient data:", error);
    });
}

//   doctors/
//    |___id_doctor
//    |___username
//    |___email
//    |___password
//    |___phone
//    |___role : doctor

function writeDoctorData(userId, name, email, password, phone) {
const dbRef = ref(db, 'doctors/' + userId);
set(dbRef, {
    name: name,
    email: email,
    password: password,
    phone: phone,
    role: "doctor"
}).then(() => {
    console.log("✅ Doctor data saved.");
}).catch((error) => {
    console.error("❌ Error saving doctor data:", error);
});
}

// example data of patient and doctor
const userId = "testPatientId";
const name = "Test Patient";
const email = "testpatient@example.com";
const password = "111111";
const dob = "04/12/2005";
const phone ="0949323963";
const gender ="Female";
const height = 170;
const weight = 50;
const admittedate = "20/04/2025";

writePatientData(userId, name, email, password, phone, dob, gender, height, weight, admittedate);

const dId = "testDoctorId";
const dname = "Test Doctor";
const dpassword = "123456789";
const demail = "testdoctor@example.com";
const dphone = "094785236";

writeDoctorData(dId, dname, demail, dpassword, dphone);

// ====================================================================== //
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const btn = document.getElementById("submit");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var username = document.getElementById("username").value;
        var phone = document.getElementById("phone").value;
        var dob = document.getElementById("dob").value;
        var gender = document.getElementById("gender").value;
        var height = document.getElementById("height").value;
        var weight = document.getElementById("weight").value;
        if (!username || !email || !password || !phone || !dob || !gender || !height || !weight) {
        alert("Please fill out all the fields."); 
        e.preventDefault();
    }

        // ========== Create Account with email, password and insert to Firebase ==========
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                writePatientData(user.uid, username, email, password, phone, dob, gender, height, weight, admittedate);
                alert("Register success!");
                window.location.href = "/public/page/login.html";
            })
            .catch((error) => {
                alert("Error: " + error.message);
                console.error("Registration error:", error);
            });
        });

});