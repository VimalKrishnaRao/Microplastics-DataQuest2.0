import { useEffect, useState } from "react";
import axios from "axios";

function Hero() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/api/message")
            .then(res => setMessage(res.data.message))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Frontend (Vite + React)</h1>
            <p>Backend says: {message}</p>
        </div>
    );
}

export default Hero;
