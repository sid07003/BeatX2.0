import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../SCSS/Login.scss';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isNotification, setIsNotification] = useState(false);
    const [notification, setNotification] = useState('');
    const [isError, setIsError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
    
        const loginData = {
            email: email,
            password: password
        };
    
        try {
            const response = await fetch('https://beat-x2-0.vercel.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData),
                credentials: 'include'
            });
    
            if (response.status === 400 || response.status === 401) {
                setNotification('Invalid Credentials');
                setIsError(true);
                setIsNotification(true);
                setTimeout(() => setIsNotification(false), 2000);
                return;
            }
    
            if (!response.ok) {
                setNotification('Login failed. Please try again.');
                setIsError(true);
                setIsNotification(true);
                setTimeout(() => setIsNotification(false), 2000);
                return;
            }
    
            const result = await response.json();
            setIsError(false);
            setEmail('');
            setPassword('');
            navigate('/');
        } catch (error) {
            console.error('Network error:', error);
            setNotification('Network error. Please try again.');
            setIsError(true);
            setIsNotification(true);
            setTimeout(() => setIsNotification(false), 2000);
        }
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
            {console.log("isNotification: ", isNotification)}
            {console.log("isError: ", isError)}
            {console.log("notification: ",notification)}
            {console.log(isNotification ? (isError ? "error" : "success") : "noError")}
            <div id="notification" className={isNotification ? (isError ? "error" : "success") : "noError"}>
                {notification}
            </div>
        </div>
    );
}
