import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../SCSS/Signup.scss';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isNotification, setIsNotification] = useState(false);
  const [notification, setNotification] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);


  const handleSignup = (e) => {
    e.preventDefault();

    const data = {
      "email": email,
      "password": password,
      "confirmPassword": confirmPassword
    }

    setEmail("");
    setPassword("");
    setConfirmPassword("");

    fetch("http://localhost:3001/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (response.status === 400) {
          setNotification("Passwords don't match");
          setIsError(true);
          setIsNotification(true);
          setTimeout(() => {
            setIsNotification(false);
          }, 2000);
        }
        else if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(result => {
        setNotification("Account created successfully");
        setIsError(false);
        setIsNotification(true);
        setTimeout(() => {
          setIsNotification(false);
        }, 2000);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  };

  return (
    <div className="container">
      <div className="signup-form">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ position: "relative" }}>
            <input
              type={showPassword1 ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className={`fa-regular ${showPassword1 ? "fa-eye" : "fa-eye-slash"}`} id="showPassword" onClick={() => setShowPassword1(!showPassword1)}></i>
          </div>
          <div className="form-group" style={{ position: "relative" }}>
            <input
              type={showPassword2 ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <i className={`fa-regular ${showPassword2 ? "fa-eye" : "fa-eye-slash"}`} id="showPassword" onClick={() => setShowPassword2(!showPassword2)}></i>
          </div>
          <button type="submit">Sign Up</button>
          <Link to={"/Login"} id="create_new_account" type="submit">Back To Login</Link>
        </form>
      </div>
      <div id="notification" className={isNotification ? (isError ? "error" : "success") : "noError"}>
        {notification}
      </div>
    </div>
  );
}
