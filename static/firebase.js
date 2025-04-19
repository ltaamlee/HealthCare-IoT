const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    appId: "YOUR_APP_ID"
  };

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
  import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const loginBtn = document.getElementById("login-btn");
  const userInfo = document.getElementById("email");

  loginBtn.onclick = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      userInfo.innerText = `Chào ${user.displayName} (${user.email})`;
      console.log("User info:", user);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đăng nhập thất bại!");
    }
  };