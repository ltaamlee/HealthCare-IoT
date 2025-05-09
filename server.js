const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require('../health-care-iot-1b260-firebase-adminsdk-fbsvc-8ef59f2d69.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

  databaseURL: "https://health-care-iot-1b260-default-rtdb.firebaseio.com"
});


app.delete('/delete-patient/:uid', async (req, res) => {
    const uid = req.params.uid;

    try {
        await admin.auth().deleteUser(uid);
            res.status(200).json({ message: `Deleted ${uid}` });
        } catch (err) {
            console.error("❌ Lỗi khi xoá người dùng:", err);
            res.status(500).json({ error: err.message });
        }
});



app.post('/add-doctor', async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
            phoneNumber: phone
        });

        const uid = userRecord.uid;

        await admin.auth().setCustomUserClaims(uid, { role: 'doctor' });

        await admin.database().ref(`doctors/${uid}`).set({
            uid,
            name,
            email,
            phone,
            role: "doctor"
        });

        res.status(200).json({ message: "✅ Thêm bác sĩ thành công!", uid });
    } catch (err) {
        console.error("❌ Lỗi khi thêm bác sĩ:", err);
        res.status(500).json({ error: err.message });
    }
});


app.delete("/delete-doctor/:uid", async (req, res) => {
    const uid = req.params.uid;
  
    try {
        await admin.auth().deleteUser(uid);
            res.status(200).json({ message: `Deleted ${uid}` });
        } catch (err) {
            console.error("❌ Lỗi khi xoá người dùng:", err);
            res.status(500).json({ error: err.message });
        }
});
  

app.listen(3000, () => console.log("Server is running on port 3000"));
