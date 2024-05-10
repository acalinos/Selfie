import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
    // codice javascript
    const [fullname, setFullname] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [number, setNumber] = useState(0)

    const navigate = useNavigate()

    const handleSignUp = async () => {
        try {
            if (username === "" || password === "") {
                alert("Please fill all the mandatory fields.")
            }
            const response = await axios.post("http://localhost:3000/registrazione", {
                fullname, username, password, number
            })
            if (response.data === "success") {
                sessionStorage.setItem("username", username)
                // navigate(`/home/${username}`)
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
        
        <div>
            <h1 style={divStyle}>Selfie</h1>
            <form>
                <p style={divStyle}>
                    <label for="username">Your details:</label>
                    <br />
                    <br />
                    <input id="fullname" name="fullname" required="" type="text" placeholder="Your full name" onChange={(e) => setFullname(e.target.value)}/>
                    <br />
                    <br />
                    <input id="username" name="username" required="" type="text" placeholder="Choose a username" onChange={(e) => setUsername(e.target.value)}/>
                    <br />
                    <br />
                    <input id="password" name="password" required="" type="password" placeholder="Choose a password" onChange={(e) => setPassword(e.target.value)}/>
                    <br />
                    <br />
                    <input id="telephone" name="telephone" type="number" placeholder="Your phone number (optional)" onChange={(e) => setNumber(e.target.value)}/>
                    <br />
                    <br />
                    <br />
                    <Link to="/login"> Login </Link>
                    <input type="submit" value="Sign up" onClick={handleSignUp}/>
                    </p>
            </form>
        </div>

    )
}

export default SignUp;