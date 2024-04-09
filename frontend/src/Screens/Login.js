import React, { useState,useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../SCSS/Login.scss';
import { context_music } from "../App.js";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isNotification, setIsNotification] = useState(false);
    const [notification, setNotification] = useState('');
    const [isError, setIsError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        const loginData = {
            "email": email,
            "password": password
        }

        setEmail("");
        setPassword("");

        fetch("http://localhost:3001/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData),
            withCredentials: true,
            credentials: 'include'
        })
            .then(response => {
                if (response.status === 400) {
                    setNotification("Invalid Credentials");
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
                setIsError(false);
                navigate("/");
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    };

    return (
        <div className="container">
            <div className="login-form">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
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
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i className={`fa-regular ${showPassword ? "fa-eye" : "fa-eye-slash"}`} id="showPassword" onClick={() => setShowPassword(!showPassword)}></i>
                    </div>
                    <button type="submit">Login</button>
                    <Link to={"/Signup"} id="create_new_account">Create New Account</Link>
                </form>
            </div>
            <div id="notification" className={isNotification ? (isError ? "error" : "success") : "noError"}>
                {notification}
            </div>
        </div>
    );
}
