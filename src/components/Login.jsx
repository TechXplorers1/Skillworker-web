import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, child } from "firebase/database";
import { auth, database } from "../firebase";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAccount = () => navigate("/signup");
  const handleForgotPassword = () => navigate("/forgot-password");
  const handleBack = () => navigate("/");
  const togglePassword = () => setShowPassword(!showPassword);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S/.test(email)) newErrors.email = "Email address is invalid.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // OPTIMIZED: This only fetches the SINGLE user node, not the whole DB.
      // This is efficient and correct.
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${user.uid}`));

      let userRole = "user";
      if (snapshot.exists()) {
        const userData = snapshot.val();
        userRole = userData.role;
      }

      localStorage.setItem("userRole", userRole);
      localStorage.setItem("isLoggedIn", "true");

      setSuccessMessage("Login successful!");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      setErrorMessage("Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  const css = `
    .login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #f0f7ff, #faf5ff); font-family: 'Segoe UI', Tahoma, sans-serif; overflow: hidden; margin: 0; }
    .login-box { background: #fff; padding: 30px 40px; border-radius: 15px; width: 500px; height: auto; max-width: 90%; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05); text-align: center; position: relative; box-sizing: border-box; }
    .back-arrow { position: absolute; top: 15px; left: 15px; font-size: 24px; font-weight: bold; cursor: pointer; color: #333; }
    .logo-section { margin-top: 20px; }
    .logo-icon-path { height: 40px; }
    .welcome-text { font-size: 18px; margin: 10px 0 4px; font-weight: 500; }
    .signin-text { font-size: 14px; color: #666; margin-bottom: 25px; }
    .login-form { text-align: left; }
    .login-form label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; }
    .input-with-icon { position: relative; display: flex; align-items: center; margin-bottom: 18px; }
    .field-icon { position: absolute; left: 12px; font-size: 18px; color: #666; }
    .input-with-icon input { width: 100%; padding: 12px 40px 12px 36px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; }
    .eye-icon { position: absolute; right: 12px; font-size: 18px; color: #666; cursor: pointer; display: flex; align-items: center; }
    .error-message { color: #e74c3c; font-size: 12px; margin-top: -10px; margin-bottom: 10px; text-align: left; }
    .success-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(46, 204, 113, 0.95); color: white; padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); z-index: 1000; animation: fadeIn 0.5s ease-out; display: flex; align-items: center; justify-content: center; }
    .popup-content { display: flex; align-items: center; gap: 15px; }
    .popup-icon { font-size: 28px; }
    .success-popup p { margin: 0; font-size: 16px; }
    @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -60%); } to { opacity: 1; transform: translate(-50%, -50%); } }
    .forgot-link { display: block; text-align: right; font-size: 13px; color: #4a6eff; margin-bottom: 20px; text-decoration: none; cursor: pointer; }
    .create-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #6a6fff, #b66fff); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-bottom: 25px; }
    .divider { height: 1px; background: #eee; margin-bottom: 20px; }
    .signup-inline { display: flex; justify-content: center; align-items: center; gap: 8px; }
    .no-account-text { font-size: 14px; margin: 0; }
    .create-account-link { background: none; border: none; color: #4a6eff; font-size: 15px; font-weight: 600; cursor: pointer; }
    .input-error { border-color: #e74c3c; }
  `;

  const AiOutlineMail = () => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 110.8V792H136V270.8l-27.6-21.5 39.3-50.5 42.8 33.3h643.1l42.8-33.3 39.3 50.5-27.7 21.5zM832 240H192v102.4l320 248.2 320-248.2V240zm-320 328.2L136 324.7v429.1h752V324.7L512 568.2z"></path></svg>);
  const AiOutlineLock = () => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M832 464h-68V240c0-137-111-248-248-248S268 103 268 240v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-101.6 82.4-184 184-184s184 82.4 184 184v224H332V240zm460 600H232V528h560v312zM512 652c-13.3 0-24 10.7-24 24v72c0 13.3 10.7 24 24 24s24-10.7 24-24v-72c0-13.3-10.7-24-24-24z"></path></svg>);
  const AiOutlineEye = () => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 0 0 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3a60.3 60.3 0 0 0 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C228.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.4 684.2 673.3 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"></path></svg>);
  const AiOutlineEyeInvisible = () => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M508.1 425.9C500.8 422.3 492.2 420 482 420c-70.7 0-128 57.3-128 128 0 10.2.6 20.3 2.9 30.1l-44.3 44.3C306.1 596.5 284 559.1 284 512c0-119.3 133.5-216.5 328-216.5 36.8 0 71.9 5.2 104.9 14.5l-45.6 45.6c-2.4-.4-4.8-.7-7.2-.9-3.3-.2-6.6-.2-10-.2-64.8 0-121.2 24.9-163 66.4zM942.2 486.2C847.4 286.5 704.1 186 512 186c-48.5 0-95.1 8.2-139.3 23.2l62.8 62.8C474.1 267.3 512 258 512 258c161.3 0 279.4 81.8 362.7 254-.1.1-.1.2-.2.3-1.6 3.1-3.3 6.1-5 9.1l-51.5 89.2-22.1-22.1c15-28.7 25.4-59.5 30.6-91.5a60.3 60.3 0 0 0 0-51.5zm-59.4 126.3l-34.4-34.4c-4.1 6.1-8.5 12-13.1 17.6-67.6 83.2-171.6 132.8-283.3 132.8-70.1 0-136.2-18.7-194.2-53.5l-43.2 43.2c61.1 41.1 131.2 65.5 204.4 71.2A32 32 0 0 0 512 838c192.2 0 335.4-100.5 430.2-300.3a59.4 59.4 0 0 0-59.4-51.8zM315.6 315.6l45.4 45.4C333.1 398.8 314 452.6 314 512c0 29.8 6.4 58.1 18.2 84.1l-43.7 43.7C275.4 607.7 264 561.6 264 512c0-127.3 147-224.5 352-224.5 43.5 0 85.5 6.7 125.3 18.8l-45.4 45.4C664.1 333.1 610.3 314 552 314c-29.8 0-58.1 6.4-84.1 18.2z"></path></svg>);

  return (
    <>
      <style>{css}</style>
      <div className="login-container">
        <div className="login-box">
          <div className="back-arrow" onClick={handleBack}>&#8592;</div>
          <div className="logo-section">
            <div className="logo-icon-path"></div>
            <p className="welcome-text">Welcome back</p>
            <p className="signin-text">Sign in to access your account</p>
          </div>

          {successMessage && <div className="success-popup"><div className="popup-content"><span className="popup-icon">&#10003;</span><p>{successMessage}</p></div></div>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <div className="field-icon"><AiOutlineMail /></div>
              <input type="text" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? "input-error" : ""} />
            </div>
            {errors.email && <p className="error-message">{errors.email}</p>}

            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <div className="field-icon"><AiOutlineLock /></div>
              <input type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className={errors.password ? "input-error" : ""} />
              <span className="eye-icon" onClick={togglePassword}>{showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}</span>
            </div>
            {errors.password && <p className="error-message">{errors.password}</p>}

            <p className="forgot-link" onClick={handleForgotPassword}>Forgot your password?</p>
            <button type="submit" className="create-btn" disabled={isLoading}>{isLoading ? "Signing In..." : "Sign In"}</button>
          </form>
          <div className="divider"></div>
          <div className="signup-inline">
            <p className="no-account-text">Don't have an account?</p>
            <p className="create-account-link" onClick={handleCreateAccount}>Create Account</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;