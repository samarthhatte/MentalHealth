import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Sparkles, Download } from "lucide-react";
import jsPDF from "jspdf";

export const EmotionAssistant = () => {
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedMood, setDetectedMood] = useState("neutral");
  const [confidence, setConfidence] = useState(0);
  const [userReason, setUserReason] = useState("");
  const [reason, setReason] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [aiMessage, setAiMessage] = useState("");

  useEffect(() => {
    const savedMood = localStorage.getItem("lastMood");
    const savedReason = localStorage.getItem("lastReason");
    if (savedMood) {
      setDetectedMood(savedMood);
      setReason(savedReason || "");
    }
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
      } catch {
        setError("⚠️ Model loading failed. Please check /models folder.");
      }
    };
    loadModels();
  }, []);

  const detectEmotion = async () => {
    if (!modelsLoaded || !webcamRef.current) return;
    const video = webcamRef.current.video;
    if (!video) return;

    try {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections && detections.expressions) {
        const [mood, value] = Object.entries(detections.expressions).reduce(
          (a, b) => (a[1] > b[1] ? a : b)
        );
        setDetectedMood(mood);
        setConfidence(Number((value * 100).toFixed(1)));
        setCameraActive(false);
      } else {
        setDetectedMood("No face detected");
      }
    } catch {
      setError("Error detecting emotion.");
    }
  };

  const getReason = (mood: string, reasonText: string) => {
    const base: Record<string, string> = {
      happy: "You're radiating positivity — keep that energy alive!",
      sad: "It’s okay to feel low sometimes. Take a pause and breathe.",
      angry: "Your emotions show passion — channel it into productivity.",
      fearful: "Courage means acting even when afraid — you’re strong.",
      neutral: "Steady minds achieve success — stay balanced.",
      disgusted: "Discomfort can guide growth — refocus on your goals.",
      surprised: "New experiences bring growth — keep exploring!",
    };
    return `${base[mood] || "You seem thoughtful."} ${
      reasonText ? `Reason: ${reasonText}.` : ""
    }`;
  };

  // 🧠 Improved suggestions with extra study/music/motivation links
  const getSuggestions = (mood: string) => {
    const base = [
      {
        title: "📚 Pomodoro Study Timer",
        link: "https://pomofocus.io/",
        desc: "Stay focused with short productive sprints.",
      },
      {
        title: "🧘 Calm App",
        link: "https://www.calm.com/",
        desc: "Relax with mindfulness exercises and guided meditations.",
      },
      {
        title: "🧠 Journal Your Thoughts",
        link: "https://penzu.com/",
        desc: "Track your emotional journey with reflections.",
      },
    ];

    switch (mood) {
      case "happy":
        base.push(
          {
            title: "🎵 Uplifting Playlist",
            link: "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC",
            desc: "Keep your vibe alive with happy tunes.",
          },
          {
            title: "💻 Build a Fun Coding Project",
            link: "https://www.frontendmentor.io/challenges",
            desc: "Use your good mood to create something cool.",
          },
          {
            title: "💬 Share Positivity",
            link: "https://www.instagram.com/explore/tags/happiness/",
            desc: "Spread joy to others around you.",
          }
        );
        break;

      case "sad":
        base.push(
          {
            title: "🎧 Healing Music",
            link: "https://open.spotify.com/playlist/37i9dQZF1DWVV27DiNWxkR",
            desc: "Soothing melodies to lift your spirit.",
          },
          {
            title: "💬 Peer Support Chat",
            link: "https://www.7cups.com/",
            desc: "Talk safely and share what’s on your mind.",
          },
          {
            title: "🌈 Gratitude Practice",
            link: "https://www.youtube.com/watch?v=WWloIAQpMcQ",
            desc: "List three things that made you smile today.",
          }
        );
        break;

      case "angry":
        base.push(
          {
            title: "🥊 Stress-Relief Workout",
            link: "https://www.youtube.com/watch?v=ML1nYxXvU6A",
            desc: "Burn energy, not bridges — channel it positively.",
          },
          {
            title: "🎵 Chill Coding Playlist",
            link: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            desc: "Lo-fi beats for calm coding flow.",
          },
          {
            title: "🧩 Solve a Coding Puzzle",
            link: "https://leetcode.com/problemset/all/",
            desc: "Redirect your focus into logical problem-solving.",
          }
        );
        break;

      case "fearful":
        base.push(
          {
            title: "🌬 Deep Breathing Guide",
            link: "https://www.youtube.com/watch?v=86m4RC_ADEY",
            desc: "Ease anxiety with mindful breathing.",
          },
          {
            title: "💪 Confidence Boost Talk",
            link: "https://www.youtube.com/watch?v=AB2yIbZbT7w",
            desc: "Motivational video to overcome fear.",
          },
          {
            title: "🧩 Try a Creative Challenge",
            link: "https://sketch.io/sketchpad/",
            desc: "Draw, doodle, or design something new.",
          }
        );
        break;
    case "surprised":
  base.push(
    {
      title: "✨ Curiosity Boost Playlist",
      link: "https://www.youtube.com/watch?v=DWcJFNfaw9c",
      desc: "Keep exploring — surprise sparks creativity.",
    },
    {
      title: "🧠 Learn a New Fact",
      link: "https://www.khanacademy.org/",
      desc: "Turn surprise into learning momentum.",
    }
  );
  break;

case "disgusted":
  base.push(
    {
      title: "🧼 Organize Your Space",
      link: "https://www.youtube.com/watch?v=lFcSrYw-ARY",
      desc: "Decluttering your desk resets your mood.",
    },
    {
      title: "🌸 Try Aromatherapy",
      link: "https://www.healthline.com/health/aromatherapy",
      desc: "Use pleasant scents to refresh your mind.",
    }
  );
  break;


      default:
        base.push(
          {
            title: "🎵 Focus Lo-Fi Playlist",
            link: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            desc: "Stay calm and study effectively.",
          },
          {
            title: "💤 Sleep Sounds",
            link: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
            desc: "Rest well with ocean wave sounds.",
          },
          {
            title: "📖 Learn a New Skill",
            link: "https://www.codecademy.com/",
            desc: "Keep your mind active with new concepts.",
          }
        );
        break;
    }
    return base;
  };

  const handleGenerate = () => {
    const mood = detectedMood;
    const reasonText = getReason(mood, userReason);
    const ideas = getSuggestions(mood);
    setReason(reasonText);
    setSuggestions(ideas);
    setAiMessage("Here’s what you can do next to stay balanced 💚");

    localStorage.setItem("lastMood", mood);
    localStorage.setItem("lastReason", reasonText);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Student Mood Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Mood: ${detectedMood}`, 20, 40);
    doc.text(`Confidence: ${confidence}%`, 20, 50);
    doc.text(`Reason: ${userReason || "Not provided"}`, 20, 60);
    doc.text("AI Insight:", 20, 80);
    doc.text(reason, 20, 90);
    doc.text("Recommended Activities:", 20, 110);

    suggestions.forEach((s, i) => {
      doc.text(`${i + 1}. ${s.title} - ${s.link}`, 20, 120 + i * 10);
    });

    doc.save("Mood_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row items-center justify-center p-8 gap-10">
      {/* Left */}
      <div className="w-full lg:w-1/3 bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2 text-indigo-400">
          <Brain /> Student Emotion & Wellness Assistant
        </h2>

        <div className="rounded-2xl overflow-hidden w-64 h-48 bg-gray-800 border border-indigo-500 mx-auto flex items-center justify-center">
          {cameraActive ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ width: 250, height: 200, facingMode: "user" }}
            />
          ) : (
            <p className="text-gray-400 italic">Camera is off</p>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-5">
          {!cameraActive && (
            <button
              onClick={() => setCameraActive(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Turn On Camera
            </button>
          )}
          {cameraActive && (
            <button
              onClick={detectEmotion}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} /> Detect Emotion
            </button>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="w-full lg:w-2/3 bg-gray-950 border border-gray-800 rounded-3xl p-8">
        <h3 className="text-lg text-gray-300 mb-3">
          Detected Mood:{" "}
          <span className="text-indigo-300 font-semibold capitalize">
            {detectedMood}
          </span>{" "}
          ({confidence}%)
        </h3>

        <input
          type="text"
          placeholder="Why do you feel this way?"
          value={userReason}
          onChange={(e) => setUserReason(e.target.value)}
          className="w-full px-4 py-2 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white"
        />

        <button
          onClick={handleGenerate}
          className="px-6 py-2 mb-6 bg-green-600 hover:bg-green-700 rounded-xl shadow-lg"
        >
          Generate Personalized Wellness Plan
        </button>

        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border border-gray-800 rounded-xl p-6 mb-6 shadow-md">
          <h3 className="text-xl font-semibold text-indigo-300 mb-2 flex items-center gap-2">
            <Sparkles /> Emotional Insight 
          </h3>
          <p className="text-gray-200 leading-relaxed">{reason}</p>
          {aiMessage && (
            <p className="mt-3 text-green-300 font-medium italic">
              💬 {aiMessage}
            </p>
          )}
        </div>

        <h3 className="text-green-400 font-semibold text-xl mb-3">
          Recommended Wellness Activities 
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((s, i) => (
            <motion.a
              key={i}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-green-400 hover:shadow-green-400/30 p-4 rounded-xl transition-all duration-300"
            >
              <p className="font-semibold text-green-300">{s.title}</p>
              <p className="text-gray-400 text-sm mt-1">{s.desc}</p>
            </motion.a>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={downloadPDF}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2"
          >
            <Download size={18} /> Download My Mood Report as PDF
          </button>
        </div>
      </div>
    </div>
  );
};
