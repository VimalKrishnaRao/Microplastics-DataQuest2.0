const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const { parse } = require("csv-parse/sync");

const app = express();
const PORT = 5000;
const PYTHON_API_URL = "http://localhost:5001/predict";

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Simple check route
app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from Express backend" });
});

// ---- CSV Upload route (if I still need file upload) ----
app.post("/api/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;

    try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const cleanContent = fileContent.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");

        // Parse CSV into JSON
        let results = parse(cleanContent, {
            columns: true,
            skip_empty_lines: true
        });

        // Cleanup temp file
        fs.unlinkSync(filePath);

        if (results.length === 0) {
            return res.status(400).json({ error: "CSV file is empty or invalid." });
        }

        // Extract only two required fields
        const row = results[0];
        const formattedData = {
            "Wave length ": parseFloat(row["Wave length "]) || 0.0,
            "%T": parseFloat(row["%T"]) || 0.0
        };

        console.log("Sending to Python API:", formattedData);
        const response = await axios.post(PYTHON_API_URL, formattedData);
        return res.json(response.data);

    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error("An error occurred:", error.message);
        return res.status(500).json({ error: "Failed to process the uploaded file." });
    }
});

// ---- Direct JSON API (frontend can call this without file upload) ----
app.post("/api/predict_simple", async (req, res) => {
    try {
        const { wavelength, percentT } = req.body;
        const formattedData = {
            "Wave length ": parseFloat(wavelength) || 0,
            "%T": parseFloat(percentT) || 0
        };

        console.log("Forwarding to Flask:", formattedData);

        const response = await axios.post(PYTHON_API_URL, formattedData);
        res.json(response.data);
    } catch (error) {
        console.error("Error forwarding to Flask:", error.message);
        res.status(500).json({ error: "Prediction failed" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
