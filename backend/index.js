import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());

// Serve static audio files
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

// API endpoint to send sound list
app.get("/api/sounds", (req, res) => {
  const sounds = [
    {
      id: "rain",
      name: "Rain",
      icon: "🌧️",
      description: "Gentle rainfall sounds",
      url: "http://localhost:5000/sounds/rain.mp3",
    },
    {
      id: "ocean",
      name: "Ocean Waves",
      icon: "🌊",
      description: "Peaceful ocean waves",
      url: "http://localhost:5000/sounds/ocean.mp3",
    },
    {
      id: "forest",
      name: "Forest",
      icon: "🌲",
      description: "Birds and nature sounds",
      url: "http://localhost:5000/sounds/forest.mp3",
    },
  ];
  res.json(sounds);
});

app.listen(PORT, () => console.log(`🎧 Server running on http://localhost:${PORT}`));
app.get("/", (req, res) => {
  res.send("🎧 Mental Health API is running...");
});
