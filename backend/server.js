import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve MP3 files
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

// Health / test route
app.get("/", (req, res) => {
  res.send("🎧 Mental Health API is running. Use /sounds/<filename>.mp3");
});

// Dynamic sound list (PRODUCTION SAFE)
app.get("/api/sounds", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const sounds = [
    { id: "rain", name: "Rain", url: `${baseUrl}/sounds/rain.mp3` },
    { id: "ocean", name: "Ocean Waves", url: `${baseUrl}/sounds/ocean.mp3` },
    { id: "forest", name: "Forest", url: `${baseUrl}/sounds/forest.mp3` },
    { id: "fireplace", name: "Fireplace", url: `${baseUrl}/sounds/fireplace.mp3` },
    { id: "whitenoise", name: "White Noise", url: `${baseUrl}/sounds/whitenoise.mp3` },
    { id: "cafe", name: "Coffee Shop", url: `${baseUrl}/sounds/cafe.mp3` },
  ];

  res.json(sounds);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});