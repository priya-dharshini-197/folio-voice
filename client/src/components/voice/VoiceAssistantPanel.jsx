import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Square,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { processVoiceCommand, speakText, stopSpeaking, SUPPORTED_COMMANDS } from '../../services/commandHandler';
import { useAuth } from '../../context/AuthContext';

export default function VoiceAssistantPanel() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputCommand, setInputCommand] = useState('');
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage('Speech recognition is not supported in this browser. Typed commands are fully available below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        // Execute through the unified handler
        executeCommand(text);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Click the camera/microphone icon in your address bar, select "Allow", then refresh.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please try again or type your command below.');
        } else {
          setErrorMessage(`Voice error: ${event.error}. You can still use the typed input.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setIsSupported(false);
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Unified execution for BOTH spoken and typed commands
  async function executeCommand(commandText) {
    if (!commandText || !commandText.trim()) return;
    setErrorMessage('');
    setTranscript(commandText);

    // Call unified command processor
    const result = await processVoiceCommand(commandText, { navigate, profile });
    setAssistantResponse(result.responseText);

    // Provide spoken audio response if not muted
    if (!isMuted) {
      setIsSpeaking(true);
      speakText(result.responseText, false, () => {
        setIsSpeaking(false);
      });
    }
  }

  function toggleListening() {
    if (!isSupported) {
      setErrorMessage('Voice recognition not supported in this browser. Please type your command.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      setErrorMessage('');
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    const cmd = inputCommand;
    setInputCommand('');
    executeCommand(cmd);
  }

  function handleStopAudio() {
    stopSpeaking();
    setIsSpeaking(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* 1. COLLAPSED LAUNCHER BUTTON (Mobile-friendly, doesn't block screen) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-navy-900/90 hover:bg-navy-850 border border-ice-400/40 text-white shadow-2xl shadow-ice-500/20 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open Voice & Command Assistant"
        >
          <div className="w-7 h-7 rounded-full bg-ice-500/20 border border-ice-400/40 flex items-center justify-center text-ice-300 group-hover:bg-ice-500 group-hover:text-navy-950 transition">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-slate-200">Voice & Commands</span>
          <span className="w-2 h-2 rounded-full bg-ice-400 animate-pulse" />
        </button>
      )}

      {/* 2. EXPANDED ASSISTANT PANEL */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] bg-navy-900/95 border border-ice-400/30 rounded-2xl shadow-2xl shadow-ice-500/15 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-navy-800 flex items-center justify-between bg-navy-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-ice-500 to-sky-300 flex items-center justify-center text-navy-950 font-bold">
                <Sparkles className="w-3.5 h-3.5 fill-navy-950 text-navy-950" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Folio Voice Assistant</h3>
                <p className="text-[10px] text-ice-400 font-medium">Browser Voice & Typed Commands</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Stop audio button */}
              {isSpeaking && (
                <button
                  onClick={handleStopAudio}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-xs flex items-center gap-1"
                  title="Stop audio speech"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-400" />
                </button>
              )}

              {/* Mute/Unmute toggle */}
              <button
                onClick={() => {
                  if (!isMuted) stopSpeaking();
                  setIsMuted(!isMuted);
                }}
                className={`p-1.5 rounded-lg transition ${
                  isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-ice-400 hover:bg-navy-800'
                }`}
                title={isMuted ? 'Unmute speech output' : 'Mute speech output'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Minimize / Close */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                aria-label="Close assistant panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation & Display Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs max-h-64 scrollbar-thin">
            {/* Warning or Error Messages */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* User Transcript */}
            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-ice-500 text-navy-950 px-3.5 py-2 rounded-2xl rounded-tr-sm font-medium shadow-md">
                  "{transcript}"
                </div>
              </div>
            )}

            {/* Assistant Response Box */}
            {assistantResponse ? (
              <div className="flex justify-start">
                <div className="max-w-[90%] bg-navy-800/90 border border-navy-700/80 text-slate-100 p-3 rounded-2xl rounded-tl-sm whitespace-pre-line leading-relaxed shadow-lg">
                  {assistantResponse}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 space-y-2">
                <p>Press the microphone or type any command.</p>
                <p className="text-[11px] text-slate-600">e.g. "Add a project called Logo Design"</p>
              </div>
            )}
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-4 py-2 bg-navy-950/40 border-t border-navy-800/60 overflow-x-auto flex gap-1.5 scrollbar-none">
            {SUPPORTED_COMMANDS.slice(0, 4).map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const cleaned = cmd.replace(/\[Title\]/g, 'Mobile App');
                  executeCommand(cleaned);
                }}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] bg-navy-800/80 hover:bg-ice-500/20 hover:text-ice-300 text-slate-400 border border-navy-700 transition"
              >
                {cmd.replace(/\[Title\]/g, 'Mobile App')}
              </button>
            ))}
          </div>

          {/* Voice Mic + Typed Input Bar */}
          <div className="p-3 bg-navy-950/80 border-t border-navy-800 flex items-center gap-2">
            {/* Microphone Button */}
            <button
              onClick={toggleListening}
              disabled={!isSupported}
              className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : isSupported
                  ? 'bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold shadow-md shadow-ice-500/20'
                  : 'bg-navy-800 text-slate-600 cursor-not-allowed'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Click to speak command'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Typed Input Field (Uses same handler) */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex items-center gap-1.5">
              <input
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type command here...'}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                disabled={!inputCommand.trim()}
                className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-ice-400 disabled:opacity-40 transition flex-shrink-0"
                title="Send command"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

