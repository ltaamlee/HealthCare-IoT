const admin = require("firebase-admin");

const serviceAccount = require("D:/IOT/PROJECT FINAL/HealthCare-IoT/health-care-iot-1b260-firebase-adminsdk-fbsvc-2a71d27a8b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createAdminAccount(email, password) {
  try {
    const user = await admin.auth().createUser({ email, password });
    console.log(`Đã tạo user: ${user.email} (UID: ${user.uid})`);

    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    console.log("Đã gán quyền admin cho tài khoản này.");
  } catch (err) {
    console.error("Lỗi:", err.message);
  }
}

createAdminAccount("healthcare@gmail.com", "IoT23172025");
