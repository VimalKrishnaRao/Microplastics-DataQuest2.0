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
        // We only care about file input for this project
        if (inputType !== "csv" || !fileInput) {
            alert("Please select the CSV input type and choose a file.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", fileInput);

            // This is the only endpoint you need to call
            const response = await axios.post("http://localhost:5000/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setResult(response.data);

        } catch (err) {
            console.error(err);
            setResult({ error: "Something went wrong during prediction." });
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
                Clean and Green Technology 🌱 - Harnessing Innovation for a Sustainable Future
            </motion.p>

            {/* Input Section */}
            <div className="input-section">

                <div className="input-toggle">
                    <button
                        className={inputType === "csv" ? "active" : ""}
                        onClick={() => setInputType("csv")}
                    >
                        CSV
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

                    {/* Prediction */}
                    {result.prediction && (
                        <p><strong>Prediction:</strong> {result.prediction}</p>
                    )}

                    {/* Confidence */}
                    {result.confidence !== undefined && (
                        <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
                    )}

                    {/* Reliability */}
                    {result.reliability !== undefined && (
                        <p><strong>Reliability Score:</strong> {(result.reliability * 100).toFixed(0)}%</p>
                    )}

                    {/* Warnings */}
                    {result.warnings && result.warnings.length > 0 && (
                        <div className="warnings">
                            <strong>Warnings:</strong>
                            <ul>
                                {result.warnings.map((w, i) => (
                                    <li key={i} style={{ color: "orange" }}>{w}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Fallback for errors */}
                    {result.error && (
                        <p style={{ color: "red" }}><strong>Error:</strong> {result.error}</p>
                    )}
                </div>
            )}
            <motion.button
                className="hero-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading} 
            >
                {loading ? "Processing..." : "Submit"}
            </motion.button>

        </section>
    );
};

export default Hero;
