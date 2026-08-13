import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Volume2, VolumeX, CheckCircle, Circle, Trash2, CloudRain, Coffee, Leaf, Trophy } from 'lucide-react';
import './App.css';

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Pluie', icon: <CloudRain size={18} />, url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Rain_sounds_on_window.ogg' },
  { id: 'cafe', name: 'Café', icon: <Coffee size={18} />, url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Coffee_shop_ambience.ogg' },
  { id: 'nature', name: 'Nature', icon: <Leaf size={18} />, url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Bird_song_in_spring.ogg' }
];

function App() {
  // Timer State
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timerLabel, setTimerLabel] = useState('Session');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // New Features State
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [activeAmbient, setActiveAmbient] = useState(null);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const ambientAudioRef = useRef(null);

  // Formatting time MM:SS
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      // Play ambient sound if active
      if (activeAmbient && ambientAudioRef.current) {
        ambientAudioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
      }

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
              setCompletedPomodoros(p => p + 1);
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
      if (ambientAudioRef.current) ambientAudioRef.current.pause();
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timerLabel, breakLength, sessionLength, soundEnabled, activeAmbient]);

  // Handle ambient sound change
  useEffect(() => {
    if (ambientAudioRef.current) {
      if (activeAmbient && isRunning) {
        ambientAudioRef.current.play().catch(e => console.log("Audio play error", e));
      } else {
        ambientAudioRef.current.pause();
      }
    }
  }, [activeAmbient, isRunning]);

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setBreakLength(5);
    setSessionLength(25);
    setTimerLabel('Session');
    setTimeLeft(25 * 60);
    setActiveAmbient(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
    }
  };

  const handleStartStop = () => setIsRunning(!isRunning);

  const adjustTime = (type, direction) => {
    if (isRunning) return;
    if (type === 'break') {
      const newLen = direction === 'inc' ? breakLength + 1 : breakLength - 1;
      if (newLen > 0 && newLen <= 60) setBreakLength(newLen);
    } else {
      const newLen = direction === 'inc' ? sessionLength + 1 : sessionLength - 1;
      if (newLen > 0 && newLen <= 60) {
        setSessionLength(newLen);
        if (timerLabel === 'Session') setTimeLeft(newLen * 60);
      }
    }
  };

  const getTimerColor = () => {
    if (timeLeft < 60) return 'var(--color-warning)';
    if (timerLabel === 'Pause') return 'var(--color-break)';
    return 'var(--color-session)';
  };

  // Calculate SVG Circle Progress
  const totalSeconds = timerLabel === 'Session' ? sessionLength * 60 : breakLength * 60;
  const progressPercentage = (timeLeft / totalSeconds) * 100;
  const circleRadius = 120;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

  // Task Management
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="app-container">
      
      {/* Left Panel: Tasks & Stats */}
      <div className="side-panel left-panel glass-panel animate-slide-right">
        <div className="stats-box">
          <Trophy className="stats-icon" />
          <div className="stats-info">
            <h3>Objectif Quotidien</h3>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.min((completedPomodoros / 4) * 100, 100)}%` }}
              ></div>
            </div>
            <p>{completedPomodoros} / 4 Pomodoros terminés</p>
          </div>
        </div>

        <div className="tasks-box">
          <h3>Mes Tâches</h3>
          <form onSubmit={handleAddTask} className="add-task-form">
            <input 
              type="text" 
              placeholder="Que vas-tu faire ?" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button type="submit"><Plus size={18} /></button>
          </form>
          
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
                <button className="task-toggle" onClick={() => toggleTask(task.id)}>
                  {task.done ? <CheckCircle size={20} className="check-icon" /> : <Circle size={20} />}
                </button>
                <span className="task-text">{task.text}</span>
                <button className="task-delete" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
            {tasks.length === 0 && <p className="empty-tasks">Aucune tâche pour le moment. Ajoute-en une !</p>}
          </ul>
        </div>
      </div>

      {/* Main Panel: Pomodoro Timer */}
      <div className="pomodoro-card glass-panel animate-fade-in">
        <div className="header">
          <h1>Pomodoro 2.0</h1>
          <button 
            className="sound-toggle" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute alarm" : "Enable alarm"}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        <div className="lengths-container">
          <div className="length-control">
            <h3 id="break-label">Pause</h3>
            <div className="controls">
              <button id="break-decrement" onClick={() => adjustTime('break', 'dec')} disabled={isRunning}><Minus size={20} /></button>
              <span id="break-length" className="digital-clock">{breakLength}</span>
              <button id="break-increment" onClick={() => adjustTime('break', 'inc')} disabled={isRunning}><Plus size={20} /></button>
            </div>
          </div>
          <div className="length-control">
            <h3 id="session-label">Session</h3>
            <div className="controls">
              <button id="session-decrement" onClick={() => adjustTime('session', 'dec')} disabled={isRunning}><Minus size={20} /></button>
              <span id="session-length" className="digital-clock">{sessionLength}</span>
              <button id="session-increment" onClick={() => adjustTime('session', 'inc')} disabled={isRunning}><Plus size={20} /></button>
            </div>
          </div>
        </div>

        {/* Circular Timer Display */}
        <div className="timer-wrapper">
          <svg className="progress-ring" width="260" height="260">
            <circle
              className="progress-ring-bg"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
              fill="transparent"
              r={circleRadius}
              cx="130"
              cy="130"
            />
            <circle
              className="progress-ring-circle"
              stroke={getTimerColor()}
              strokeWidth="8"
              fill="transparent"
              r={circleRadius}
              cx="130"
              cy="130"
              style={{
                strokeDasharray: circleCircumference,
                strokeDashoffset: strokeDashoffset,
                filter: `drop-shadow(0 0 10px ${getTimerColor()})`
              }}
            />
          </svg>
          <div className="timer-display-content">
            <h2 id="timer-label" style={{ color: getTimerColor() }}>{timerLabel}</h2>
            <div id="time-left" className="digital-clock" style={{ color: getTimerColor() }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <button id="start_stop" className={`action-btn ${isRunning ? 'running' : ''}`} onClick={handleStartStop}>
            {isRunning ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button id="reset" className="action-btn reset" onClick={handleReset}>
            <RotateCcw size={28} />
          </button>
        </div>
      </div>

      {/* Right Panel: Ambiance */}
      <div className="side-panel right-panel glass-panel animate-slide-left">
        <h3>Ambiance Sonore</h3>
        <p className="panel-desc">Sons relaxants pour la concentration</p>
        
        <div className="ambient-grid">
          {AMBIENT_SOUNDS.map(sound => (
            <button 
              key={sound.id}
              className={`ambient-btn ${activeAmbient === sound.id ? 'active' : ''}`}
              onClick={() => setActiveAmbient(activeAmbient === sound.id ? null : sound.id)}
            >
              <div className="ambient-icon">{sound.icon}</div>
              <span>{sound.name}</span>
            </button>
          ))}
        </div>
        
        {/* Audio Elements */}
        {activeAmbient && (
          <audio 
            ref={ambientAudioRef} 
            src={AMBIENT_SOUNDS.find(s => s.id === activeAmbient)?.url} 
            loop 
          />
        )}
      </div>

      <audio id="beep" ref={audioRef} src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" />
    </div>
  );
}

export default App;
