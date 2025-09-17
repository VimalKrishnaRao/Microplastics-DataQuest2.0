const express = require("express");
const cors = require("cors");
const multer = require("multer");


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Routes
app.get("/api/message", (req, res) => {
    res.json({ message: "Hello from Express backend" });
});

// text input route
app.post("/api/text", (req, res) => {
    const { text } = req.body;
    // later you’ll send text → Flask ML model
    res.json({ received: text, prediction: "This is a dummy prediction" });
});

// image upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
    // req.file contains file info
    // later I’ll forward file → Flask ML model
    res.json({
        filename: req.file.originalname,
        status: "File received successfully",
        prediction: "Dummy result: Microplastics detected"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
