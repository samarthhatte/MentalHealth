import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ Serve MP3 files properly from the /sounds folder
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

// Test route to confirm backend is running
app.get("/", (req, res) => {
  res.send("🎧 Mental Health API is running... Use /sounds/<filename>.mp3 to access files.");
});

// Optional route for sound list
app.get("/api/sounds", (req, res) => {
  const sounds = [
    { id: "rain", name: "Rain", url: "http://localhost:5000/sounds/rain.mp3" },
    { id: "ocean", name: "Ocean Waves", url: "http://localhost:5000/sounds/ocean.mp3" },
    { id: "forest", name: "Forest", url: "http://localhost:5000/sounds/forest.mp3" },
    { id: "fireplace", name: "Fireplace", url: "http://localhost:5000/sounds/fireplace.mp3" },
    { id: "whitenoise", name: "White Noise", url: "http://localhost:5000/sounds/whitenoise.mp3" },
    { id: "cafe", name: "Coffee Shop", url: "http://localhost:5000/sounds/cafe.mp3" },
  ];
  res.json(sounds);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log(`🎵 Sound files available at: http://localhost:${PORT}/sounds/<filename>.mp3`);
});
