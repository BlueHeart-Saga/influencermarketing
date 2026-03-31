import React, { useState, useEffect, useRef } from 'react';
import '../../style/VoiceToTextAI.css'; // Fixed path

const VoiceToTextAI = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    recognitionRef.current.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + event.results[i][0].transcript + ' ');
        }
        // Removed the unused ongoingTranscript variable
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access is not allowed. Please enable microphone permissions in your browser settings.');
      }
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        // If it ended but we're still supposed to be listening, restart
        recognitionRef.current.start();
      }
    };
  }, [language, isListening]);

  const toggleListening = () => {
    if (!isSupported) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const clearText = () => {
    setTranscript('');
  };

  const downloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'transcription.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isSupported) {
    return (
      <div className="voice-to-text-container">
        <div className="voice-to-text-header">
          <h1>Voice-to-Text AI</h1>
          <p>Real-time speech recognition</p>
        </div>
        <div className="browser-support-warning">
          <h2>Browser Not Supported</h2>
          <p>Your browser does not support speech recognition. Please try Chrome, Edge, or Safari.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-to-text-container">
      <div className="voice-to-text-header">
        <h1>Voice-to-Text AI</h1>
        <p>Real-time speech recognition</p>
      </div>

      <div className="voice-to-text-controls">
        <div className="language-selector">
          <label htmlFor="language">Language: </label>
          <select 
            id="language" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isListening}
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="it-IT">Italian</option>
            <option value="pt-BR">Portuguese (Brazil)</option>
            <option value="pt-PT">Portuguese (Portugal)</option>
            <option value="ru-RU">Russian</option>
            <option value="ja-JP">Japanese</option>
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="zh-TW">Chinese (Traditional)</option>
            <option value="ko-KR">Korean</option>
            <option value="ar-SA">Arabic (Saudi Arabia)</option>
            <option value="hi-IN">Hindi</option>
            <option value="bn-BD">Bengali</option>
            <option value="pa-IN">Punjabi</option>
            <option value="ur-PK">Urdu</option>
            <option value="tr-TR">Turkish</option>
            <option value="fa-IR">Persian (Farsi)</option>
            <option value="th-TH">Thai</option>
            <option value="vi-VN">Vietnamese</option>
            <option value="id-ID">Indonesian</option>
            <option value="ms-MY">Malay</option>
            <option value="sw-KE">Swahili</option>
            <option value="ta-IN">Tamil</option>
            <option value="te-IN">Telugu</option>
            <option value="ml-IN">Malayalam</option>
            <option value="kn-IN">Kannada</option>
            <option value="gu-IN">Gujarati</option>
            <option value="mr-IN">Marathi</option>
            <option value="si-LK">Sinhala</option>
            <option value="ne-NP">Nepali</option>
            <option value="am-ET">Amharic</option>
            <option value="zu-ZA">Zulu</option>
            <option value="xh-ZA">Xhosa</option>
            <option value="af-ZA">Afrikaans</option>
            <option value="ha-NG">Hausa</option>
            <option value="yo-NG">Yoruba</option>
            <option value="ig-NG">Igbo</option>
          </select>
        </div>

        <button 
          className={`listen-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          <span className="button-icon">
            {isListening ? '🛑' : '🎤'}
          </span>
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>

        <div className="action-buttons">
          <button 
            className="action-button copy-button"
            onClick={copyToClipboard}
            disabled={!transcript}
          >
            {isCopied ? 'Copied!' : 'Copy Text'}
          </button>
          <button 
            className="action-button clear-button"
            onClick={clearText}
            disabled={!transcript}
          >
            Clear
          </button>
          <button 
            className="action-button download-button"
            onClick={downloadText}
            disabled={!transcript}
          >
            Download
          </button>
        </div>
      </div>

      <div className="transcript-container">
        <div className="transcript-header">
          <h3>Real-time Transcript</h3>
          <span className="recording-indicator">
            {isListening && (
              <>
                <span className="pulse-dot"></span>
                Recording...
              </>
            )}
          </span>
        </div>
        <div className="transcript-text">
          {transcript || (isListening ? 
            'Listening... Speak now and watch your words appear here in real-time.' : 
            'Click "Start Listening" to begin transcribing your speech.')}
        </div>
      </div>

      <div className="usage-tips">
        <h3>Usage Tips</h3>
        <ul>
          <li>Ensure you're in a quiet environment for best accuracy</li>
          <li>Speak clearly and at a moderate pace</li>
          <li>Use a high-quality microphone for better results</li>
          <li>Chrome or Edge browsers typically provide the best accuracy</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceToTextAI;