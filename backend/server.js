const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const { parse } = require("csv-parse/sync"); // <<< Use the new synchronous parser

const app = express();
const PORT = 5000;
const PYTHON_API_URL = "http://localhost:5001/predict";

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from Express backend" });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;

    try {
        // 1. Read the entire file into a buffer first
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // 2. Manually clean the raw text data
        //    - Remove the BOM character (\uFEFF) from the start
        //    - Standardize line endings by replacing Windows-style (\r\n) with Unix-style (\n)
        const cleanContent = fileContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');

        // 3. Parse the clean string into an array of objects
        let results = parse(cleanContent, {
            columns: true,
            skip_empty_lines: true
        });

        // Handle "single-column CSV" case
        if (Object.keys(results[0]).length === 1) {
            const firstKey = Object.keys(results[0])[0];

            // Split headers and values by comma
            const headers = firstKey.split(",");
            const values = results[0][firstKey].split(",");

            results = [Object.fromEntries(headers.map((h, i) => [h.trim(), values[i].trim()]))];
        }

        // 4. Cleanup the temporary file
        fs.unlinkSync(filePath);

        // 5. Perform validation on the parsed results
        if (results.length === 0) {
            return res.status(400).json({ error: "CSV file is empty or invalid." });
        }

        // Expected columns (100 wavelengths by default)
        const expectedColumns = Array.from({ length: 100 }, (_, i) => `wave_${i}`);

        // Normalize received headers (lowercased, trimmed)
        const receivedColumns = Object.keys(results[0]).map(c => c.trim().toLowerCase());

        // 6. Build formatted data by aligning whatever features are present
        const sensorData = results[0];
        const formattedData = {};

        for (const col of expectedColumns) {
            const match = receivedColumns.find(rc => rc === col.toLowerCase());
            if (match) {
                const rawValue = sensorData[Object.keys(sensorData).find(k => k.trim().toLowerCase() === match)];
                const value = parseFloat(rawValue);
                formattedData[col] = isNaN(value) ? 0.0 : value; // fallback to 0 if bad number
            } else {
                formattedData[col] = 0.0; // missing → 0.0
            }
        }

        // 7. Send to Python and return the response
        console.log("Sending to Python API:", formattedData);
        const response = await axios.post(PYTHON_API_URL, formattedData);
        return res.json(response.data);

    } catch (error) {
        // Cleanup the file even if an error occurs
        fs.unlinkSync(filePath);
        console.error("An error occurred:", error.message);
        return res.status(500).json({ error: "Failed to process the uploaded file." });
    }
});

app.get("/api/metric", async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5001/metrics");
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching metrics:", error.message);
        res.status(500).json({ error: "Failed to fetch metrics" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});