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
  Loader2
} from 'lucide-react';
import { processVoiceCommand, speakText, stopSpeaking, SUPPORTED_COMMANDS } from '../../services/commandHandler';
import {
  isRecordingSupported,
  getGnaniStatus,
  startRecording,
  transcribeWithGnani,
  speakWithGnani,
  stopGnaniSpeech
} from '../../services/gnaniVoice';
import { useAuth } from '../../context/AuthContext';

const MAX_RECORDING_MS = 25000; // Gnani Prisma accepts clips up to 30 seconds

export default function VoiceAssistantPanel() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('browser'); // 'browser' | 'gnani'
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputCommand, setInputCommand] = useState('');
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true); // browser speech recognition
  const [gnaniConfigured, setGnaniConfigured] = useState(null); // null = not checked yet

  const recognitionRef = useRef(null);
  const recordingRef = useRef(null);
  const autoStopRef = useRef(null);
  const executeCommandRef = useRef(null);

  const recordingSupported = isRecordingSupported();

  // Always call the latest version of the handler (avoids stale profile / mute values)
  executeCommandRef.current = executeCommand;

  // Browser Web Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
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
        executeCommandRef.current(text);
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // nothing to abort
        }
      }
    };
  }, []);

  // Stop everything when the component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopGnaniSpeech();
      clearTimeout(autoStopRef.current);
      if (recordingRef.current) recordingRef.current.cancel();
    };
  }, []);

  // Ask the server whether Gnani is configured (never returns the key)
  useEffect(() => {
    if (mode !== 'gnani' || !isOpen) return undefined;
    let cancelled = false;
    getGnaniStatus().then((s) => {
      if (!cancelled) setGnaniConfigured(s.configured);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, isOpen]);

  function stopAllSpeech() {
    stopSpeaking();
    stopGnaniSpeech();
    setIsSpeaking(false);
  }

  function cancelAllListening() {
    clearTimeout(autoStopRef.current);
    if (recordingRef.current) {
      recordingRef.current.cancel();
      recordingRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // nothing to abort
      }
    }
    setIsListening(false);
  }

  // Unified execution for BOTH spoken and typed commands
  async function executeCommand(commandText) {
    if (!commandText || !commandText.trim()) return;
    setErrorMessage('');
    setTranscript(commandText);

    const result = await processVoiceCommand(commandText, { navigate, profile });
    setAssistantResponse(result.responseText);

    if (isMuted) return;

    setIsSpeaking(true);
    if (mode === 'gnani') {
      try {
        await speakWithGnani(result.responseText, () => setIsSpeaking(false));
      } catch (err) {
        setIsSpeaking(false);
        setErrorMessage(`${err.message} The reply is shown as text.`);
      }
    } else {
      speakText(result.responseText, false, () => setIsSpeaking(false));
    }
  }

  function switchMode(next) {
    if (next === mode) return;
    cancelAllListening();
    stopAllSpeech();
    setErrorMessage('');
    setMode(next);
  }

  function closePanel() {
    cancelAllListening();
    stopAllSpeech();
    setIsOpen(false);
  }

  // --- Gnani recording flow ---
  async function finishGnaniRecording() {
    const rec = recordingRef.current;
    if (!rec) return;
    recordingRef.current = null;
    clearTimeout(autoStopRef.current);
    setIsListening(false);
    setIsTranscribing(true);
    try {
      const wav = await rec.stop();
      const text = await transcribeWithGnani(wav);
      if (!text) {
        setErrorMessage('No speech detected. Please try again or type your command below.');
        return;
      }
      await executeCommandRef.current(text);
    } catch (err) {
      setErrorMessage(err.message || 'Gnani speech recognition failed. You can still type your command.');
    } finally {
      setIsTranscribing(false);
    }
  }

  async function toggleGnaniRecording() {
    if (recordingRef.current) {
      await finishGnaniRecording();
      return;
    }
    if (gnaniConfigured === false) {
      setErrorMessage('Gnani voice is not set up on the server yet. Browser mode and typed commands still work.');
      return;
    }
    if (!recordingSupported) {
      setErrorMessage('This browser cannot record audio. Please type your command.');
      return;
    }

    stopAllSpeech();
    setErrorMessage('');
    setTranscript('');
    try {
      recordingRef.current = await startRecording();
      setIsListening(true);
      autoStopRef.current = setTimeout(() => finishGnaniRecording(), MAX_RECORDING_MS);
    } catch (err) {
      recordingRef.current = null;
      setIsListening(false);
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
        setErrorMessage('Microphone access denied. Click the camera/microphone icon in your address bar, select "Allow", then try again.');
      } else {
        setErrorMessage('Could not start the microphone. You can still type your command.');
      }
    }
  }

  // --- Browser recognition flow ---
  function toggleBrowserListening() {
    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Switch to Gnani AI mode or type your command.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopAllSpeech();
      setErrorMessage('');
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  }

  function toggleListening() {
    if (isTranscribing) return;
    if (mode === 'gnani') {
      toggleGnaniRecording();
    } else {
      toggleBrowserListening();
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    const cmd = inputCommand;
    setInputCommand('');
    executeCommand(cmd);
  }

  // Honest notices about the selected engine
  let modeNotice = '';
  if (mode === 'browser' && !isSupported) {
    modeNotice = 'Speech recognition is not supported in this browser. Switch to Gnani AI mode, or type your commands below.';
  } else if (mode === 'gnani' && gnaniConfigured === false) {
    modeNotice = 'Gnani voice is not set up on the server yet. Add GNANI_API_KEY to server/.env and restart the backend. Browser mode and typed commands still work.';
  } else if (mode === 'gnani' && !recordingSupported) {
    modeNotice = 'This browser cannot record audio for Gnani. Please type your commands.';
  }

  const micDisabled =
    isTranscribing ||
    (mode === 'browser' ? !isSupported : gnaniConfigured === false || !recordingSupported);

  const micTitle = isListening
    ? mode === 'gnani'
      ? 'Recording... click to stop and send'
      : 'Listening... click to stop'
    : mode === 'gnani'
      ? 'Click to record a command (Gnani AI)'
      : 'Click to speak command';

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* 1. COLLAPSED LAUNCHER BUTTON */}
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
                <p className="text-[10px] text-ice-400 font-medium">
                  {mode === 'gnani' ? 'Gnani AI Voice & Typed Commands' : 'Browser Voice & Typed Commands'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isSpeaking && (
                <button
                  onClick={stopAllSpeech}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-xs flex items-center gap-1"
                  title="Stop audio speech"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-400" />
                </button>
              )}

              <button
                onClick={() => {
                  if (!isMuted) stopAllSpeech();
                  setIsMuted(!isMuted);
                }}
                className={`p-1.5 rounded-lg transition ${isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-ice-400 hover:bg-navy-800'
                  }`}
                title={isMuted ? 'Unmute speech output' : 'Mute speech output'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={closePanel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                aria-label="Close assistant panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice engine switch */}
          <div
            className="px-4 py-2 border-b border-navy-800/60 bg-navy-950/40 flex items-center gap-2"
            role="group"
            aria-label="Voice engine"
          >
            <span className="text-[10px] text-slate-500">Voice engine</span>
            <div className="flex rounded-lg overflow-hidden border border-navy-700">
              <button
                type="button"
                aria-pressed={mode === 'browser'}
                onClick={() => switchMode('browser')}
                className={`px-2.5 py-1 text-[10px] font-semibold transition ${mode === 'browser' ? 'bg-ice-500 text-navy-950' : 'bg-navy-800/80 text-slate-400 hover:text-white'
                  }`}
              >
                Browser
              </button>
              <button
                type="button"
                aria-pressed={mode === 'gnani'}
                onClick={() => switchMode('gnani')}
                className={`px-2.5 py-1 text-[10px] font-semibold transition ${mode === 'gnani' ? 'bg-ice-500 text-navy-950' : 'bg-navy-800/80 text-slate-400 hover:text-white'
                  }`}
              >
                Gnani AI
              </button>
            </div>
            <span className="ml-auto text-[10px] text-slate-500">
              {mode === 'gnani' ? 'Gnani Prisma + Timbre' : 'Web Speech API'}
            </span>
          </div>

          {/* Conversation & Display Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs max-h-64 scrollbar-thin">
            {modeNotice && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{modeNotice}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {isTranscribing && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transcribing with Gnani Prisma...</span>
              </div>
            )}

            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-ice-500 text-navy-950 px-3.5 py-2 rounded-2xl rounded-tr-sm font-medium shadow-md">
                  "{transcript}"
                </div>
              </div>
            )}

            {assistantResponse ? (
              <div className="flex justify-start">
                <div className="max-w-[90%] bg-navy-800/90 border border-navy-700/80 text-slate-100 p-3 rounded-2xl rounded-tl-sm whitespace-pre-line leading-relaxed shadow-lg">
                  {assistantResponse}
                </div>
              </div>
            ) : (
              !isTranscribing && (
                <div className="text-center py-6 text-slate-500 space-y-2">
                  <p>Press the microphone or type any command.</p>
                  <p className="text-[11px] text-slate-600">e.g. "Add a project called Logo Design"</p>
                </div>
              )
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
            <button
              onClick={toggleListening}
              disabled={micDisabled}
              className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                : !micDisabled
                  ? 'bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold shadow-md shadow-ice-500/20'
                  : 'bg-navy-800 text-slate-600 cursor-not-allowed'
                }`}
              title={micTitle}
              aria-label={micTitle}
            >
              {isTranscribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <form onSubmit={handleFormSubmit} className="flex-1 flex items-center gap-1.5">
              <input
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                placeholder={
                  isListening ? (mode === 'gnani' ? 'Recording...' : 'Listening...') : 'Type command here...'
                }
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