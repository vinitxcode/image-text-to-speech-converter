import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import './App.css';
import { Play, Square, Upload, Save, Mic } from 'lucide-react'; // Icons

const App = () => {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1); // Speed
  const [pitch, setPitch] = useState(1); // Realism tweak
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Ready');

  // 1. Load Voices
  useEffect(() => {
    const loadVoices = () => {
      const availVoices = window.speechSynthesis.getVoices();
      setVoices(availVoices);
      // Auto-select a Google/Natural voice if available
      const defaultVoice = availVoices.find(v => v.name.includes('Google') || v.lang.includes('hi'));
      setSelectedVoice(defaultVoice || availVoices[0]);
    };
    
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // 2. Image to Text Logic
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      setStatus('Scanning Image... 📷');
      Tesseract.recognize(file, 'eng+hin', { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
          setText(text);
          setStatus('Text Extracted! ✅');
          setIsProcessing(false);
        });
    }
  };

  // 3. Speech Logic
  const handleSpeak = () => {
    if (!text) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate; // Speed control
    utterance.pitch = pitch; // Pitch control
    
    window.speechSynthesis.speak(utterance);
    setStatus('Reading... 🔊');
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setStatus('Stopped 🛑');
  };

  // 4. Save to Database (MERN Feature)
  const saveStory = async () => {
    try {
      await axios.post('http://localhost:5000/api/save', { title: "My Story", content: text });
      alert('Story saved to database!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <h1>AI Voice Reader 🎧</h1>
      
      {/* Accessibility Status for Blind Users */}
      <p aria-live="polite" style={{ textAlign: 'center', color: '#94a3b8' }}>{status}</p>

      {/* Input Section */}
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text here or upload an image..."
        aria-label="Text Input Area"
      />

      {/* Settings Panel */}
      <div className="controls">
        {/* Voice Select */}
        <select 
          onChange={(e) => setSelectedVoice(voices[e.target.value])}
          style={{ padding: '10px', borderRadius: '8px', background: '#334155', color: 'white' }}
          aria-label="Select Voice"
        >
          {voices.map((voice, index) => (
            <option key={index} value={index}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>

        {/* Sliders for Realism */}
        <div className="slider-group">
          <label>Speed: {rate}x</label>
          <input 
            type="range" min="0.5" max="2" step="0.1" 
            value={rate} onChange={(e) => setRate(e.target.value)} 
            aria-label="Adjust Speed"
          />
        </div>
        
        <div className="slider-group">
          <label>Pitch: {pitch}</label>
          <input 
            type="range" min="0.5" max="2" step="0.1" 
            value={pitch} onChange={(e) => setPitch(e.target.value)} 
            aria-label="Adjust Pitch"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
        <button className="btn-accent" onClick={() => document.getElementById('fileUpload').click()}>
          <Upload size={18} /> Upload Image
        </button>
        <input type="file" id="fileUpload" hidden accept="image/*" onChange={handleImageUpload} />
        
        <button className="btn-primary" onClick={saveStory}>
          <Save size={18} /> Save Story
        </button>

        <button className="btn-primary" onClick={handleSpeak} style={{ background: '#22c55e' }}>
          <Play size={18} /> Play Audio
        </button>
        
        <button className="btn-danger" onClick={handleStop}>
          <Square size={18} /> Stop
        </button>
      </div>

    </div>
  );
};

export default App;