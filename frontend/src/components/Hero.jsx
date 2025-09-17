import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";


function Hero() {
    const [message, setMessage] = useState("");
    const [inputType, setInputType] = useState("");
    const [textInput, setTextInput] = useState("");
    const [fileInput, setFileInput] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:5000/api/message")
            .then(res => setMessage(res.data.message))
            .catch(err => console.error(err));
    }, []);

    // inside handleSubmit
    const handleSubmit = async () => {
        if (!inputType) {
            alert("Please select an input type");
            return;
        }

        setLoading(true);
        try {
            let response;

            if (inputType === "text") {
                response = await axios.post("http://localhost:5000/api/text", {
                    text: textInput,
                });
            } else if (inputType === "csv" || inputType === "image") {
                const formData = new FormData();
                formData.append("file", fileInput);
                response = await axios.post("http://localhost:5000/api/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            setResult(response.data); // API response
        } catch (err) {
            console.error(err);
            setResult({ error: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };


    return (
        <section className="hero">
            <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                MicroPlastics Detection
            </motion.h1>

            <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
            >
                Clean and Green Technology 🌱 — Harnessing Innovation for a Sustainable Future
            </motion.p>

            {/* Input Section */}
            <div className="input-section">

                {/* Toggle Buttons instead of dropdown */}
                <div className="input-toggle">
                    <button
                        className={inputType === "text" ? "active" : ""}
                        onClick={() => setInputType("text")}
                    >
                        Text
                    </button>
                    <button
                        className={inputType === "csv" ? "active" : ""}
                        onClick={() => setInputType("csv")}
                    >
                        CSV
                    </button>
                    <button
                        className={inputType === "image" ? "active" : ""}
                        onClick={() => setInputType("image")}
                    >
                        Image
                    </button>
                </div>

                {/* Conditional Inputs */}
                {inputType === "text" && (
                    <textarea
                        placeholder="Enter your text here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                    />
                )}

                {(inputType === "csv" || inputType === "image") && (
                    <input
                        type="file"
                        accept={inputType === "csv" ? ".csv" : "image/*"}
                        onChange={(e) => setFileInput(e.target.files[0])}
                    />
                )}
            </div>
            
            {/* Result Box */}
            {result && (
                <div className="result-box">
                    <h3>Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}


            <motion.button
                className="hero-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}  // disable while processing
            >
                {loading ? "Processing..." : "Submit"}
            </motion.button>
        </section>
    );
};

export default Hero;
