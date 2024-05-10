import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    // codice javascript
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:3000/accesso", { username, password })
            if (response.data === "success") {
                sessionStorage.setItem("username", username)
                // navigate(`/home/${username}`)
            }
            else if (response.data === "failure") {
                alert("Username or password are incorrect.")
            }
        }
        catch (e) {
            console.log(e)
        }
    }

    const divStyle = {
        textAlign: 'center',
    };

    return (

        <div className="login">
            <h1 style={divStyle}>Selfie</h1>
            <form>
                <p style={divStyle}>
                    <label for="username"> Your login details:</label>
                    <br />
                    <br />
                    <input id="username" name="username" required="" type="text" placeholder="Your username" onChange={(e) => setUsername(e.target.value)} />
                    <br />
                    <br />
                    <input id="password" name="password" required="" type="password" placeholder="Your password" onChange={(e) => setPassword(e.target.value)} />
                    <br />
                    <br />
                    <br />
                    <Link to="/signup"> Sign up </Link>
                    <input type="submit" value="Login" onClick={handleLogin} />
                </p>
            </form>
        </div>

    )
};

export default Login;