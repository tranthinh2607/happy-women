import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  GraduationCap,
  Heart,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Award,
  Bookmark,
  Smile,
  X,
  Gift,
  Music,
  Share2
} from 'lucide-react';

/* =========================================================================
   WEB AUDIO ENGINE (Self-contained Lo-Fi chords + Sound effects)
   Reliable offline, zero external dependencies, works on mobile & desktop
   ========================================================================= */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.bgmTimer = null;
    this.isPlayingBGM = false;
    this.currentChordIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(freq, startTime, duration = 1.2, gainLevel = 0.08) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(680, startTime);
      filter.Q.setValueAtTime(1.5, startTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // Audio fallback
    }
  }

  startBGM() {
    this.init();
    if (!this.ctx) return;
    this.isPlayingBGM = true;

    // Sweet Lo-Fi chord progression: Cmaj9 -> Am9 -> Fmaj7 -> G9sus4
    const chordProgression = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
      [174.61, 220.00, 261.63, 329.63],         // Fmaj7
      [196.00, 261.63, 293.66, 349.23, 440.00]  // G9sus4
    ];

    const playNextChord = () => {
      if (!this.isPlayingBGM || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = chordProgression[this.currentChordIndex];
      this.currentChordIndex = (this.currentChordIndex + 1) % chordProgression.length;

      chord.forEach((freq, idx) => {
        this.playNote(freq, now + idx * 0.16, 2.6, 0.05);
      });

      this.bgmTimer = setTimeout(playNextChord, 2600);
    };

    playNextChord();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playPop() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio fallback
    }
  }

  playChime() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [880, 1318.51].forEach((freq, idx) => {
        this.playNote(freq, now + idx * 0.12, 1.4, 0.07);
      });
    } catch {
      // Audio fallback
    }
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        this.playNote(freq, now + idx * 0.09, 1.3, 0.08);
      });
    } catch {
      // Audio fallback
    }
  }
}

const audioEngine = new SoundEngine();

/* =========================================================================
   CANVAS CONFETTI PRESETS
   ========================================================================= */
const fireRoseConfetti = () => {
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#E11D48', '#FB7185', '#FCE7F3', '#FDA4AF', '#FDE047'],
    shapes: ['circle'],
    ticks: 180,
    gravity: 0.85,
    scalar: 1.1
  });
};

const fireCelebrationConfetti = () => {
  const duration = 1.8 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#E11D48', '#FB7185', '#FDE047', '#FDA4AF', '#FFF1F2']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#E11D48', '#FB7185', '#FDE047', '#FDA4AF', '#FFF1F2']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

/* =========================================================================
   SCENE CONFIGURATION & DURATIONS (in milliseconds)
   Slowed down for a comfortable, enjoyable reading experience
   ========================================================================= */
const SCENE_DURATIONS = {
  1: 0,      // Scene 1: Manual start (waits for user tap)
  2: 11500,  // Scene 2: 11.5s (Oxford Dictionary Card)
  3: 13000,  // Scene 3: 13.0s (Grammar of Oct 20)
  4: 16500,  // Scene 4: 16.5s (Heartfelt Letter - 3 paragraphs)
  5: 0       // Scene 5: Manual end (Reward & Interactive Voucher)
};

/* =========================================================================
   MOTION VARIANTS
   ========================================================================= */
const sceneVariants = {
  initial: (custom) => ({
    opacity: 0,
    scale: 0.94,
    y: 15,
    filter: 'blur(6px)'
  }),
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 18,
      mass: 0.8
    }
  },
  exit: (custom) => {
    if (custom === 1) {
      // Scene 1 exit: Scale up & blur out
      return {
        scale: 1.15,
        opacity: 0,
        filter: 'blur(8px)',
        transition: { duration: 0.8, ease: 'easeInOut' }
      };
    }
    if (custom === 2) {
      // Scene 2 exit: Tilt and turn left like a page flip
      return {
        rotateY: -15,
        x: -120,
        opacity: 0,
        filter: 'blur(4px)',
        transition: { duration: 0.6, ease: 'easeIn' }
      };
    }
    if (custom === 3) {
      // Scene 3 exit: Soft upward slide & fade
      return {
        y: -30,
        scale: 0.96,
        opacity: 0,
        filter: 'blur(4px)',
        transition: { duration: 0.55, ease: 'easeInOut' }
      };
    }
    // Default exit
    return {
      opacity: 0,
      scale: 0.95,
      y: -15,
      filter: 'blur(4px)',
      transition: { duration: 0.45, ease: 'easeOut' }
    };
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.28,
      delayChildren: 0.15
    }
  }
};

const fadeInUpItem = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 140, damping: 16 }
  }
};

/* =========================================================================
   MAIN COMPONENT: APP (CINEMATIC AUTO-PLAY STORY)
   ========================================================================= */
export default function App() {
  // Current active scene: 1 to 5
  const [currentScene, setCurrentScene] = useState(1);
  const [sceneProgress, setSceneProgress] = useState(0); // 0 to 100 for active scene
  const [isPaused, setIsPaused] = useState(false);
  const [isTouchHolding, setIsTouchHolding] = useState(false);

  // Recipient Name Customization (Defaulted to Cô giáo Phương)
  const [recipientName, setRecipientName] = useState('Cô giáo Phương');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('Cô giáo Phương');

  // Music & Audio
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Scene 2 specific: Audio speaker pulse
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);

  // Scene 5 specific: Voucher Claim & Modals
  const [isVoucherClaimed, setIsVoucherClaimed] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Timers for auto-play loop
  const progressStartTimeRef = useRef(null);
  const elapsedBeforePauseRef = useRef(0);
  const animationFrameRef = useRef(null);

  const showToast = useCallback((msg, duration = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  // Music toggle
  const toggleMusic = () => {
    if (isMusicPlaying) {
      audioEngine.stopBGM();
      setIsMusicPlaying(false);
      showToast('Đã tạm dừng nhạc nền 🎵', 2000);
    } else {
      audioEngine.startBGM();
      setIsMusicPlaying(true);
      showToast('Đang phát giai điệu Lo-Fi nhẹ nhàng 🎶', 2500);
    }
  };

  // Move to next scene
  const goToNextScene = useCallback(() => {
    if (currentScene < 5) {
      audioEngine.playPop();
      setCurrentScene((prev) => prev + 1);
      setSceneProgress(0);
      elapsedBeforePauseRef.current = 0;
      progressStartTimeRef.current = null;
    }
  }, [currentScene]);

  // Move to previous scene
  const goToPrevScene = useCallback(() => {
    if (currentScene > 1) {
      audioEngine.playPop();
      setCurrentScene((prev) => prev - 1);
      setSceneProgress(0);
      elapsedBeforePauseRef.current = 0;
      progressStartTimeRef.current = null;
    }
  }, [currentScene]);

  // Restart Story
  const restartStory = useCallback(() => {
    audioEngine.playPop();
    fireRoseConfetti();
    setCurrentScene(2);
    setSceneProgress(0);
    elapsedBeforePauseRef.current = 0;
    progressStartTimeRef.current = null;
    setIsPaused(false);
  }, []);

  /* -------------------------------------------------------------------------
     Auto-play Timer & Progress Engine (Runs 60fps)
     ------------------------------------------------------------------------- */
  useEffect(() => {
    const duration = SCENE_DURATIONS[currentScene];

    // Scene 1 and Scene 5 do not auto-advance
    if (duration === 0) {
      setSceneProgress(0);
      return;
    }

    const shouldPause = isPaused || isTouchHolding;
    let localStartTime = null;

    const tick = (now) => {
      if (shouldPause) {
        progressStartTimeRef.current = null;
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!progressStartTimeRef.current) {
        progressStartTimeRef.current = now;
      }

      const totalElapsed = elapsedBeforePauseRef.current + (now - progressStartTimeRef.current);
      const pct = Math.min(100, (totalElapsed / duration) * 100);
      setSceneProgress(pct);

      if (pct >= 100) {
        elapsedBeforePauseRef.current = 0;
        progressStartTimeRef.current = null;
        goToNextScene();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (progressStartTimeRef.current) {
        elapsedBeforePauseRef.current += (performance.now() - progressStartTimeRef.current);
      }
    };
  }, [currentScene, isPaused, isTouchHolding, goToNextScene]);

  /* -------------------------------------------------------------------------
     Scene-specific effects: Scene 2 TTS & Scene 4 Confetti
     ------------------------------------------------------------------------- */
  useEffect(() => {
    if (currentScene === 2) {
      // Audio cue at 1.8s
      const timer = setTimeout(() => {
        setIsSpeakingAudio(true);
        audioEngine.playChime();
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance('Happy Women\'s Day');
          utterance.lang = 'en-US';
          utterance.rate = 0.88;
          window.speechSynthesis.speak(utterance);
        }
        setTimeout(() => setIsSpeakingAudio(false), 2200);
      }, 1800);
      return () => clearTimeout(timer);
    }

    if (currentScene === 4) {
      // Confetti burst at 10s of letter reading
      const confettiTimer = setTimeout(() => {
        fireRoseConfetti();
      }, 9500);
      return () => clearTimeout(confettiTimer);
    }
  }, [currentScene]);

  /* -------------------------------------------------------------------------
     Touch & Hold handlers for pausing progress
     ------------------------------------------------------------------------- */
  const handlePointerDown = () => {
    setIsTouchHolding(true);
  };

  const handlePointerUp = () => {
    setIsTouchHolding(false);
  };

  // Scene 1 Click: Start Story
  const handleStartStory = () => {
    audioEngine.playPop();
    fireRoseConfetti();
    if (!isMusicPlaying) {
      audioEngine.startBGM();
      setIsMusicPlaying(true);
    }
    setCurrentScene(2);
    setSceneProgress(0);
    elapsedBeforePauseRef.current = 0;
    progressStartTimeRef.current = null;
  };

  // Claim voucher
  const handleClaimVoucher = () => {
    audioEngine.playSuccess();
    fireCelebrationConfetti();
    setIsVoucherClaimed(true);
    setShowVoucherModal(true);

    const confirmationText = `Phương đã nhận chiếc vé mời cafe 20/10 siêu dễ thương này rồi nha! Hôm nào rảnh mình cùng đi nè! ☕✨🌸`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(confirmationText).catch(() => {});
    }
  };

  // Floating heart burst
  const triggerHeartBurst = () => {
    audioEngine.playPop();
    const newHearts = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      left: 30 + Math.random() * 40,
      scale: 0.8 + Math.random() * 0.5,
      delay: i * 0.1
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.slice(6));
    }, 2000);
  };

  // Save customized name
  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setRecipientName(tempName.trim());
      setIsEditingName(false);
      showToast(`Đã lưu tên người nhận: ${tempName.trim()} 🌸`, 2200);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-[100dvh] overflow-hidden select-none bg-gradient-to-br from-[#FFF5F7] via-[#FFFDF9] to-[#FDF2F8] text-[#334155] flex flex-col items-center justify-between p-3 sm:p-5"
    >
      
      {/* =========================================================================
          AMBIENT BACKGROUND (3 FLOATING 3D PASTEL ORBS)
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -25, 0], scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
          className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-pink-300/35 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -35, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut' }}
          className="absolute top-1/2 -right-20 w-84 h-84 rounded-full bg-rose-300/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 25, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute -bottom-20 left-1/4 w-88 h-88 rounded-full bg-amber-200/35 blur-3xl"
        />
      </div>

      {/* Floating Hearts Reaction Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, y: '75vh', x: `${h.left}vw`, scale: h.scale }}
            animate={{ opacity: 0, y: '20vh', x: `${h.left + (Math.random() * 20 - 10)}vw`, scale: h.scale * 1.3 }}
            transition={{ duration: 1.8, ease: 'easeOut', delay: h.delay }}
            className="absolute text-rose-500"
          >
            <Heart className="w-7 h-7 fill-rose-500 drop-shadow-md" />
          </motion.div>
        ))}
      </div>

      {/* =========================================================================
          HEADER: 5-SEGMENT STORY PROGRESS BAR & CONTROLS
          ========================================================================= */}
      <header className="relative z-30 w-full max-w-md mx-auto pt-1 pb-2">
        
        {/* 5-Segment Story Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 px-1 py-1">
          {[1, 2, 3, 4, 5].map((s) => {
            let fillPct = 0;
            if (s < currentScene) fillPct = 100;
            else if (s === currentScene) {
              if (s === 1) fillPct = 0;
              else if (s === 5) fillPct = 100;
              else fillPct = sceneProgress;
            }

            return (
              <div
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  audioEngine.playPop();
                  setCurrentScene(s);
                  setSceneProgress(0);
                  elapsedBeforePauseRef.current = 0;
                  progressStartTimeRef.current = null;
                }}
                className="h-1.5 rounded-full bg-rose-200/50 backdrop-blur-xs overflow-hidden cursor-pointer"
              >
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-75"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Control Bar: Recipient Name, Pause Indicator, Music Toggle */}
        <div className="flex items-center justify-between mt-2 px-1">
          
          {/* Recipient Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTempName(recipientName);
              setIsEditingName(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-rose-200/70 text-xs font-medium text-slate-700 shadow-xs active:scale-95 transition"
            title="Tùy chỉnh tên người nhận"
          >
            <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-serif italic font-semibold">{recipientName}</span>
            <Edit3 className="w-3 h-3 text-slate-400" />
          </button>

          {/* Pause Status Indicator */}
          {(isPaused || isTouchHolding) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-medium flex items-center gap-1 shadow-xs"
            >
              <Pause className="w-2.5 h-2.5 fill-white" />
              <span>Đang giữ để đọc...</span>
            </motion.div>
          )}

          {/* Right Tools: Story Scene Counter & Vinyl Music Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-white/60">
              {currentScene}/5
            </span>

            {/* Music Toggle with Spinning Vinyl Record */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMusic();
              }}
              className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs active:scale-90 ${
                isMusicPlaying
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white ring-2 ring-pink-300'
                  : 'bg-white/80 text-slate-600 border border-rose-200 hover:bg-pink-50'
              }`}
              title={isMusicPlaying ? 'Tạm dừng nhạc Lo-Fi' : 'Phát nhạc Lo-Fi dịu êm'}
            >
              <motion.div
                animate={isMusicPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={isMusicPlaying ? { repeat: Infinity, duration: 4, ease: 'linear' } : { duration: 0.3 }}
                className="flex items-center justify-center"
              >
                {isMusicPlaying ? (
                  <Music className="w-3.5 h-3.5 text-white" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
              </motion.div>
            </button>
          </div>

        </div>
      </header>

      {/* =========================================================================
          MAIN CINEMATIC STAGE: CENTERED CARD LAYOUT
          Wrapped in <AnimatePresence mode="wait"> for seamless scene transitions
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto flex items-center justify-center py-1">
        <AnimatePresence mode="wait" custom={currentScene}>
          
          {/* -------------------------------------------------------------------
              SCENE 1: THE ENVELOPE / SPECIAL LESSON PLAN (Wait for Tap to Start)
              ------------------------------------------------------------------- */}
          {currentScene === 1 && (
            <motion.div
              key="scene-1-lesson-plan"
              custom={1}
              variants={sceneVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#F7EFE5] border-2 border-[#E9DFD0] shadow-2xl shadow-rose-950/10 overflow-hidden">
                
                {/* Book spine & stitched edge decoration */}
                <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-[#D7C7B2] to-[#ECE2D2] border-r border-[#C7B59F]" />
                <div className="absolute top-2 bottom-2 left-4.5 border-l-2 border-dashed border-[#E3D4C1]" />

                {/* Golden Hanging Ribbon Bookmark */}
                <div className="absolute top-0 right-7 z-10 flex flex-col items-center">
                  <div className="w-5 h-11 bg-gradient-to-b from-[#E11D48] to-[#BE185D] shadow-md flex items-end justify-center pb-1">
                    <Bookmark className="w-3 h-3 text-white/90" />
                  </div>
                  <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[7px] border-t-[#BE185D]" />
                </div>

                <div className="pl-4 pr-1 pt-1">
                  
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F4ECE1] border border-[#DFCFC0] text-[10px] font-semibold tracking-wider text-[#8A6D52] uppercase">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Special Curriculum • 20/10
                  </div>

                  {/* Title & Floating Notebook Element */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="mt-4 mb-3"
                  >
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-normal text-[#2D241E] leading-relaxed">
                      Special Lesson Plan:
                      <span className="block text-rose-600 italic font-serif">October 20th</span>
                    </h1>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      Thiết kế riêng tặng cô giáo Phương với muôn vàn sự mến mộ 🌸
                    </p>
                  </motion.div>

                  {/* Recipient Tag Box */}
                  <div className="my-4 p-3.5 rounded-xl bg-white/80 border border-pink-100 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold tracking-wider text-rose-800 uppercase">
                        Prepared for:
                      </span>
                      <p className="font-serif text-base font-bold text-slate-800 leading-normal">
                        {recipientName}
                      </p>
                      <p className="text-[11px] text-slate-500 italic">
                        Cô giáo Tiếng Anh duyên dáng & ngọt ngào nhất 🌸
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Curriculum Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pb-4">
                    <div className="bg-[#FAF3EA] p-2 rounded-lg border border-[#EDE0D0]">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Subject:</span>
                      <span className="font-semibold text-slate-700">Inspiration & Smiles</span>
                    </div>
                    <div className="bg-[#FAF3EA] p-2 rounded-lg border border-[#EDE0D0]">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Level:</span>
                      <span className="font-semibold text-rose-600">C2 Mastery / 9.0 IELTS</span>
                    </div>
                  </div>

                  {/* Start Button with Glowing Pulse */}
                  <div className="pt-2 flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={handleStartStory}
                      className="relative group w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-medium text-xs sm:text-sm shadow-lg shadow-rose-700/30 flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                      <span className="font-medium">Chạm để mở tiết học dành riêng cho Phương ✨</span>
                      
                      {/* Pulsing glow ring */}
                      <span className="absolute -inset-0.5 rounded-2xl border border-rose-300 animate-ping pointer-events-none opacity-40" />
                    </motion.button>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* -------------------------------------------------------------------
              SCENE 2: "WORD OF THE DAY" – OXFORD DICTIONARY CARD (8s Auto-play)
              ------------------------------------------------------------------- */}
          {currentScene === 2 && (
            <motion.div
              key="scene-2-dictionary"
              custom={2}
              variants={sceneVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="rounded-3xl p-5 sm:p-6 bg-white border border-rose-100 shadow-2xl shadow-rose-950/5 relative overflow-hidden"
              >
                
                {/* Dictionary Masthead */}
                <motion.div
                  variants={fadeInUpItem}
                  className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-rose-700 uppercase block">
                        OXFORD SPECIAL EDITION • OCT 20
                      </span>
                      <span className="text-[11px] text-slate-400 font-serif italic">
                        Word of the Day
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-rose-100/70 text-rose-800 px-2 py-0.5 rounded-full">
                    CEFR: C2+
                  </span>
                </motion.div>

                {/* Headword, Part of Speech & Phonetics */}
                <motion.div variants={fadeInUpItem} className="space-y-1 mb-3.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-normal leading-normal">
                      {recipientName}
                    </h2>
                    <span className="text-xs font-serif italic text-rose-600 font-semibold">
                      noun
                    </span>
                  </div>

                  {/* Phonetics & Pulsing Audio Icon */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="flex items-center gap-1 text-slate-600 font-mono text-xs sm:text-sm bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-rose-700 font-bold mr-1 text-[11px] font-sans">UK / US</span>
                      <span>/ə ˈlʌv.li ˈɪŋ.ɡlɪʃ ˈtiː.tʃər/</span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSpeakingAudio
                          ? 'bg-rose-600 text-white scale-110 shadow-md shadow-rose-500/40 ring-2 ring-rose-300'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>

                {/* Definitions (Staggered Reveal) */}
                <div className="space-y-2.5 my-3.5">
                  
                  {/* Definition 1 */}
                  <motion.div
                    variants={fadeInUpItem}
                    className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                          [noun, countable]
                        </span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
                          Người có khả năng biến những cấu trúc ngữ pháp phức tạp nhất trở nên dịu dàng chỉ bằng một nụ cười.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Definition 2 */}
                  <motion.div
                    variants={fadeInUpItem}
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          [adjective, incomparable]
                        </span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
                          Nhân vật chính của ngày 20/10 hôm nay.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                </div>

                {/* Example sentence & Collocations */}
                <motion.div
                  variants={fadeInUpItem}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80"
                >
                  <p className="font-serif italic text-xs text-slate-800">
                    "Phương's radiant smile effortlessly lit up the entire classroom, and definitely... someone's whole day."
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[9px] font-medium bg-white text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                      #cô_giáo_phương
                    </span>
                    <span className="text-[9px] font-medium bg-white text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                      #sweetest
                    </span>
                    <span className="text-[9px] font-medium bg-white text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                      #heart_stealer
                    </span>
                    <span className="text-[9px] font-medium bg-white text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                      #irreplaceable
                    </span>
                  </div>
                </motion.div>

              </motion.div>
            </motion.div>
          )}

          {/* -------------------------------------------------------------------
              SCENE 3: "GRAMMAR OF OCT 20" – PASTEL ACADEMIA NOTE (13.0s Auto-play)
              ------------------------------------------------------------------- */}
          {currentScene === 3 && (
            <motion.div
              key="scene-3-grammar"
              custom={3}
              variants={sceneVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#FFF8F6] border-2 border-[#EADFD0] shadow-2xl shadow-rose-950/10 text-[#334155] relative overflow-hidden">
                
                {/* Delicate Paper Margin Accent */}
                <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-rose-200/60 to-transparent" />

                {/* Header Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 border border-rose-200/90 text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-3"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
                  Quick Grammar Note for Today 📝
                </motion.div>

                {/* Typewriter text line */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="mb-3.5"
                >
                  <p className="text-xs sm:text-sm font-sans text-slate-700 leading-relaxed">
                    Trong Tiếng Anh có <span className="text-rose-700 font-bold font-serif px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 shadow-2xs">12 thì (Tenses)</span>...
                  </p>
                </motion.div>

                {/* Highlighted Formula Card */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.8, type: 'spring', stiffness: 140, damping: 15 }}
                  className="my-3.5 p-4 rounded-2xl bg-white/95 border-2 border-dashed border-rose-200 shadow-xs"
                >
                  <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Special Formula for October 20th:</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold font-serif text-center flex-wrap py-1">
                    <span className="px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-2xs">
                      [ Cô giáo Phương ]
                    </span>
                    <span className="text-rose-400 text-base font-bold">+</span>
                    <span className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs">
                      [ Nụ Cười Xinh ]
                    </span>
                    <span className="text-rose-400 text-base font-bold">=</span>
                    <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-sm font-semibold">
                      [ Cả Ngày Tỏa Sáng ✨ ]
                    </span>
                  </div>
                </motion.div>

                {/* Concluding Remark */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 5.2, duration: 0.7 }}
                  className="mt-3.5 p-3.5 rounded-2xl bg-[#FFF8F6] border border-rose-100 shadow-2xs"
                >
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    ...nhưng dù ở bất kỳ thì nào, chúc cô giáo Phương lúc nào cũng luôn ở trạng thái 
                    <span className="font-serif italic font-bold text-rose-700 text-sm sm:text-base"> "Present Perfect" </span>
                    (Luôn luôn hoàn hảo, đáng yêu và rạng rỡ nhất nhé)!
                  </p>
                </motion.div>

                {/* Teacher's Rubber Stamp */}
                <motion.div
                  initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                  animate={{ scale: 1, opacity: 1, rotate: -6 }}
                  transition={{ delay: 7.6, type: 'spring', stiffness: 180, damping: 12 }}
                  className="mt-3.5 flex items-center justify-between p-2.5 rounded-xl border-2 border-dashed border-red-500 bg-red-50/90 text-red-700 text-xs font-mono shadow-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-red-600" />
                    <span className="font-bold tracking-tight">GRADE: A+ (100/100 EXCELLENT! 💯)</span>
                  </div>
                  <span className="text-red-600 font-handwriting text-lg font-bold">Phương 10/10 điểm ⭐</span>
                </motion.div>

              </div>
            </motion.div>
          )}

          {/* -------------------------------------------------------------------
              SCENE 4: "THE HEARTFELT LETTER" – LÁ THƯ CHÍNH (16.5s Auto-play)
              ------------------------------------------------------------------- */}
          {currentScene === 4 && (
            <motion.div
              key="scene-4-letter"
              custom={4}
              variants={sceneVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <div className="rounded-3xl p-5 sm:p-7 bg-[#FFFDF8] border border-[#ECDCC9] shadow-2xl shadow-rose-950/5 relative overflow-hidden bg-lined-paper">
                
                {/* Red margin line to simulate authentic stationery */}
                <div className="absolute top-0 bottom-0 left-9 w-0.5 bg-rose-300/60 pointer-events-none" />

                <div className="pl-6">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-rose-100 pb-2 mb-3">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      OCTOBER 20TH • AUTUMN NOTE
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      With Admiration ✨
                    </span>
                  </div>

                  {/* Salutation */}
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 mb-2.5">
                    Gửi cô giáo Phương siêu đáng yêu, 🌸
                  </h2>

                  {/* Staggered Paragraphs with relaxed delays */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                    
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      Chúc mừng ngày Phụ nữ Việt Nam 20/10! 🌸 Chúc cô giáo Phương lúc nào cũng giữ trọn nụ cười rạng rỡ như hoa, chất giọng ấm áp truyền cảm và ngọn lửa đam mê với từng trang giáo án.
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 4.0 }}
                    >
                      Dù chúng mình mới có dịp làm quen chưa lâu, nhưng sự ân cần, nhiệt huyết và nét dịu dàng của Phương thực sự để lại trong mình một ấn tượng vô cùng đặc biệt và ngọt ngào.
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 7.5 }}
                    >
                      Chúc Phương của ngày hôm nay có một ngày 20/10 ngập tràn hoa tươi, rộn rã tiếng cười, nhận thật nhiều lời chúc dễ thương từ học trò và luôn là cô giáo hạnh phúc nhất nhé! ✨
                    </motion.p>

                  </div>

                  {/* Sign-off */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 11.0 }}
                    className="mt-4 pt-2 border-t border-rose-100/70 flex flex-col items-end"
                  >
                    <p className="font-serif italic text-xs text-slate-500">
                      From:
                    </p>
                    <p className="font-handwriting text-2xl sm:text-3xl text-rose-700 font-bold mt-1 leading-relaxed">
                      Một 'học viên đặc biệt' đang muốn tìm hiểu thêm về cô giáo Phương nè 😊
                    </p>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          )}

          {/* -------------------------------------------------------------------
              SCENE 5: "AFTER-CLASS REWARD" – E-VOUCHER & FINALE (Stays to interact)
              ------------------------------------------------------------------- */}
          {currentScene === 5 && (
            <motion.div
              key="scene-5-reward"
              custom={5}
              variants={sceneVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full space-y-3.5"
            >
              {/* Golden Ticket / E-Voucher Card with Shimmer */}
              <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] text-slate-800 shadow-2xl border-2 border-amber-400 overflow-hidden">
                
                {/* Shimmer Light Bar animation */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                />

                {/* Ticket punch hole decorations */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFF5F8] border border-amber-300" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FFF5F8] border border-amber-300" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-amber-300/80 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-amber-800" />
                    <span className="font-serif text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      AFTER-CLASS REWARD
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-amber-800 text-white px-2 py-0.5 rounded">
                    NO: 2010-TEACHER
                  </span>
                </div>

                {/* Card Title & Content */}
                <div className="py-1.5 text-center">
                  <div className="inline-flex p-2 rounded-full bg-white/70 shadow-xs mb-1">
                    <Coffee className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-amber-950 leading-normal">
                    VOUCHER TIẾP NĂNG LƯỢNG DÀNH RIÊNG CHO PHƯƠNG ☕🧋
                  </h3>
                  <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                    01 buổi Cafe / Trà sữa đặc biệt để cô giáo Phương tiếp năng lượng và nghỉ giọng sau những tiết dạy hết mình.
                  </p>
                </div>

                {/* Terms */}
                <div className="mt-2 pt-2 border-t border-amber-300/80 text-[10px] text-amber-900/90 space-y-0.5 leading-normal">
                  <p><b>Hạn sử dụng:</b> Bất cứ khi nào Phương rảnh rỗi (chỉ cần cô giáo phát tín hiệu nè!).</p>
                  <p><b>Địa điểm:</b> Quán cafe xinh xắn và ấm cúng nhất do Phương chọn nha.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                
                {/* Primary Button: Claim Voucher */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleClaimVoucher}
                  className={`w-full min-h-[48px] rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isVoucherClaimed
                      ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                      : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white shadow-rose-600/30 ring-2 ring-pink-300/50'
                  }`}
                >
                  {isVoucherClaimed ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã nhận vé mời! Hẹn gặp cô giáo Phương nhé ☕🌸</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Nhận vé mời này nè 💌</span>
                    </>
                  )}
                </motion.button>

                {/* Secondary Actions: Restart Story & Floating Heart */}
                <div className="flex items-center gap-2">
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={restartStory}
                    className="flex-1 min-h-[42px] rounded-xl bg-white border border-rose-200 text-rose-700 font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 active:scale-95 transition shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xem lại từ đầu ↺</span>
                  </button>

                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={triggerHeartBurst}
                    className="min-h-[42px] px-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium text-xs flex items-center justify-center gap-1 hover:bg-rose-100 active:scale-95 transition"
                    title="Thả tim cho Phương"
                  >
                    <Smile className="w-4 h-4 text-rose-500" />
                    <span>Thả tim cho Phương 🌸</span>
                  </button>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* =========================================================================
          BOTTOM CONTROLS: SUBTLE NAVIGATION & TOUCH CONTROLS
          ========================================================================= */}
      <footer className="relative z-30 w-full max-w-md mx-auto flex items-center justify-between py-1 px-1 text-slate-500">
        
        {/* Prev Scene Button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            goToPrevScene();
          }}
          disabled={currentScene === 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
            currentScene === 1
              ? 'opacity-30 cursor-not-allowed'
              : 'bg-white/80 hover:bg-white text-slate-700 shadow-xs active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </button>

        {/* Play / Pause Toggle Button */}
        {currentScene > 1 && currentScene < 5 && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused(!isPaused);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-rose-200 text-xs font-medium text-slate-700 shadow-xs active:scale-95"
          >
            {isPaused ? (
              <>
                <Play className="w-3 h-3 text-rose-600 fill-rose-600" />
                <span>Tiếp tục</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 text-slate-600 fill-slate-600" />
                <span>Tạm dừng</span>
              </>
            )}
          </button>
        )}

        {/* Next Scene Button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            goToNextScene();
          }}
          disabled={currentScene === 5}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
            currentScene === 5
              ? 'opacity-30 cursor-not-allowed'
              : 'bg-white/80 hover:bg-white text-slate-700 shadow-xs active:scale-95'
          }`}
        >
          <span className="hidden sm:inline">Tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </footer>

      {/* =========================================================================
          MODAL: CONFIRMATION TOAST / MODAL FOR VOUCHER CLAIM
          ========================================================================= */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl border border-rose-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <Coffee className="w-6 h-6" />
              </div>

              <h4 className="font-serif font-bold text-base text-slate-900 mb-1">
                Đã Xác Nhận Kèo Cafe! ☕✨
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Lời nhắn siêu ngọt ngào đã được lưu vào Clipboard rùi nè. Phương chỉ cần gửi qua cho người tặng là xong nha!
              </p>

              <button
                onClick={() => setShowVoucherModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-semibold shadow-md shadow-rose-600/25 active:scale-95 transition"
              >
                Dạ nhận kèo cafe rùi nè! ☕🌸
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          TOAST NOTIFICATION
          ========================================================================= */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 z-50 max-w-[90vw] sm:max-w-md px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white text-xs font-medium backdrop-blur-md shadow-xl border border-white/10 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <p className="flex-1">{toastMessage}</p>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: CUSTOMIZE RECIPIENT NAME
          ========================================================================= */}
      <AnimatePresence>
        {isEditingName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl border border-rose-100 text-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Tùy chỉnh tên người nhận
                </h3>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Nhập tên crush hoặc cô giáo (ví dụ: <i>Cô Giáo Tiếng Anh, Ms. Phương, Hương Ly...</i>):
              </p>

              <form onSubmit={handleSaveName} className="space-y-3">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Nhập tên..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium"
                  maxLength={30}
                  autoFocus
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition shadow-xs"
                  >
                    Lưu tên
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
