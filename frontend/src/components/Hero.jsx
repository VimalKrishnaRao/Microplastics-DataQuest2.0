import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";


function Hero() {
    const [sizeInput, setSizeInput] = useState("");
    const [toxicityInput, setToxicityInput] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:5000/api/message")
            .then(res => setMessage(res.data.message))
            .catch(err => console.error(err));
    }, []);

    // inside handleSubmit
    const handleSubmit = async () => {
        if (sizeInput === "" || toxicityInput === "") {
            alert("Please enter a value for both Size and Toxicity.");
            return;
        }
        setLoading(true);
        setResult(null);

        try {
            const response = await axios.post("http://localhost:5000/api/predict_simple", {
                wavelength: parseFloat(sizeInput),
                percentT: parseFloat(toxicityInput),
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || "Something went wrong.";
            setResult({ error: errorMsg });
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

            <div className="input-section">
                <div className="manual-form">
                    <div className="form-group">
                        <label>Wavelength</label>
                        <input
                            type="number"
                            value={sizeInput}
                            onChange={(e) => setSizeInput(e.target.value)}
                            placeholder="Enter Size value"
                        />
                    </div>
                    <div className="form-group">
                        <label>Transmittance(%T)</label>
                        <input
                            type="number"
                            value={toxicityInput}
                            onChange={(e) => setToxicityInput(e.target.value)}
                            placeholder="Enter Toxicity value"
                        />
                    </div>
                </div>
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
