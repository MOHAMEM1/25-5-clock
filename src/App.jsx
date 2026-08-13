import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Volume2, VolumeX } from 'lucide-react';
import './App.css';

function App() {
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timerLabel, setTimerLabel] = useState('Session');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Formatting time MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 0) {
            // Play sound
            if (soundEnabled && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
            
            // Switch mode
            if (timerLabel === 'Session') {
              setTimerLabel('Pause');
              return breakLength * 60;
            } else {
              setTimerLabel('Session');
              return sessionLength * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timerLabel, breakLength, sessionLength, soundEnabled]);

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setBreakLength(5);
    setSessionLength(25);
    setTimerLabel('Session');
    setTimeLeft(25 * 60);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const incrementBreak = () => {
    if (breakLength < 60 && !isRunning) setBreakLength(prev => prev + 1);
  };

  const decrementBreak = () => {
    if (breakLength > 1 && !isRunning) setBreakLength(prev => prev - 1);
  };

  const incrementSession = () => {
    if (sessionLength < 60 && !isRunning) {
      setSessionLength(prev => prev + 1);
      if (timerLabel === 'Session') setTimeLeft((sessionLength + 1) * 60);
    }
  };

  const decrementSession = () => {
    if (sessionLength > 1 && !isRunning) {
      setSessionLength(prev => prev - 1);
      if (timerLabel === 'Session') setTimeLeft((sessionLength - 1) * 60);
    }
  };

  const getTimerColor = () => {
    if (timeLeft < 60) return 'var(--color-warning)';
    if (timerLabel === 'Pause') return 'var(--color-break)';
    return 'var(--color-session)';
  };

  const getGlowColor = () => {
    if (timeLeft < 60) return 'var(--color-warning-glow)';
    if (timerLabel === 'Pause') return 'var(--color-break-glow)';
    return 'var(--color-session-glow)';
  };

  return (
    <div className="app-container">
      <div className="pomodoro-card glass-panel">
        
        <div className="header">
          <h1>Pomodoro Timer</h1>
          <button 
            className="sound-toggle" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute alarm" : "Enable alarm"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        <div className="lengths-container">
          {/* Break Length Control */}
          <div className="length-control">
            <h3 id="break-label">Durée de la Pause</h3>
            <div className="controls">
              <button id="break-decrement" onClick={decrementBreak} disabled={isRunning}>
                <Minus size={20} />
              </button>
              <span id="break-length" className="digital-clock">{breakLength}</span>
              <button id="break-increment" onClick={incrementBreak} disabled={isRunning}>
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Session Length Control */}
          <div className="length-control">
            <h3 id="session-label">Durée de la Session</h3>
            <div className="controls">
              <button id="session-decrement" onClick={decrementSession} disabled={isRunning}>
                <Minus size={20} />
              </button>
              <span id="session-length" className="digital-clock">{sessionLength}</span>
              <button id="session-increment" onClick={incrementSession} disabled={isRunning}>
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="timer-wrapper" style={{ boxShadow: `0 0 30px ${getGlowColor()}` }}>
          <div className="timer-display" style={{ borderColor: getTimerColor() }}>
            <h2 id="timer-label" style={{ color: getTimerColor() }}>
              {timerLabel}
            </h2>
            <div id="time-left" className="digital-clock" style={{ color: getTimerColor() }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <button 
            id="start_stop" 
            className={`action-btn ${isRunning ? 'running' : ''}`}
            onClick={handleStartStop}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button id="reset" className="action-btn reset" onClick={handleReset}>
            <RotateCcw size={28} />
          </button>
        </div>

      </div>

      <audio
        id="beep"
        ref={audioRef}
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
      />
    </div>
  );
}

export default App;
