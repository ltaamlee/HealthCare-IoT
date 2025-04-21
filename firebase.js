const admin = require('firebase-admin');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { db, admin } = require("D:/IOT/PROJECT FINAL/HealthCare-IoT/createAdmin");


const app = express();
app.use(cors());
app.use(bodyParser.json());

// ========== C Doctor ==========
app.post("/api/doctors", async (req, res) => {
    const { id, name, email, phone, password } = req.body;

    try {
        const user = await admin.auth().createUser({ email, password });
        await db.ref(`doctors/${id}`).set({ name, email, phone, password, uid: user.uid });
        await db.ref(`users/${user.uid}`).set({ id, name, email, role: "doctor" });
        res.status(201).json({ message: "Doctor created", id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== U Doctor ==========
app.put("/api/doctors/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        await db.ref(`doctors/${id}`).update(data);
        res.json({ message: "Doctor updated", id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== D Doctor ==========
app.delete("/api/doctors/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const snap = await db.ref(`doctors/${id}`).once("value");
        const doctor = snap.val();
        if (doctor?.uid) {
            await admin.auth().deleteUser(doctor.uid);
            await db.ref(`users/${doctor.uid}`).remove();
        }
        await db.ref(`doctors/${id}`).remove();
        res.json({ message: "Doctor deleted", id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// ========== C Patient ==========
app.post("/api/patients", async (req, res) => {
    const { id, name, dob, gender, admittedDate } = req.body;
    try {
        await db.ref(`patients/${id}`).set({ name, dob, gender, admittedDate });
        res.status(201).json({ message: "Patient created", id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== U Patient ==========

app.put("/api/patients/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        await db.ref(`patients/${id}`).update(data);
        res.json({ message: "Patient updated", id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== D Patient ==========

app.delete("/api/patients/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.ref(`patients/${id}`).remove();
        res.json({ message: "Patient deleted", id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
