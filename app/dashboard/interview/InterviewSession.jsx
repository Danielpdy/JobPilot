'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2, ChevronRight, RotateCcw, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';
import { submitAnswer, synthesizeSpeech } from '@/app/Services/InterviewService';
import styles from './InterviewSession.module.css';

// ── State machine ───────────────────────────────────────────
const S = {
  AI_SPEAKING: 'aiSpeaking',
  READY:       'ready',
  RECORDING:   'recording',
  RECORDED:    'recorded',
  PROCESSING:  'processing',
  COMPLETED:   'completed',
  ERROR:       'error',
};

const WAVE_BARS = 16;

// ── Helpers ─────────────────────────────────────────────────
function minutesLeft(currentQ, totalQ) {
  const remaining = Math.max(0, (totalQ - currentQ + 1) * 2.5);
  return remaining < 1 ? 'Less than a minute' : `About ${Math.round(remaining)} min`;
}

// ── Waveform ────────────────────────────────────────────────
function Waveform({ active, color = '#0992C2' }) {
  return (
    <div className={`${styles.waveform} ${active ? styles.waveformActive : ''}`}>
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <span key={i} className={styles.waveBar} style={{ '--i': i, '--color': color }} />
      ))}
    </div>
  );
}

// ── AI speaking rings ────────────────────────────────────────
function SpeakingIndicator() {
  return (
    <div className={styles.speakingWrap}>
      <div className={styles.speakingRing} />
      <div className={styles.speakingRing} />
      <div className={styles.speakingRing} />
      <div className={styles.speakingCore}>
        <Volume2 size={20} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
export default function InterviewSession({
  interviewId, questionNumber: initialQ, questionText: initialText,
  totalQuestions, jobTitle, interviewType, accessToken, onComplete,
}) {
  const [phase, setPhase]         = useState(S.AI_SPEAKING);
  const [currentQ, setCurrentQ]   = useState(initialQ);
  const [question, setQuestion]   = useState(initialText);
  const [transcript, setTrans]    = useState('');
  const [error, setError]         = useState('');

  const recRef       = useRef(null);
  const audioRef     = useRef(null);
  const speakCallRef = useRef(0);
  const startTime    = useRef(null);
  const transcriptR  = useRef('');
  const phaseR       = useRef(S.AI_SPEAKING);

  const hasSR = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => { phaseR.current = phase; }, [phase]);
  useEffect(() => { transcriptR.current = transcript; }, [transcript]);

  // ── TTS ─────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text, onDone) => {
    const callId = ++speakCallRef.current;
    stopSpeaking();
    try {
      const res   = await synthesizeSpeech({ text, accessToken });
      if (callId !== speakCallRef.current) return;

      const bytes       = Uint8Array.from(atob(res.audioContent), c => c.charCodeAt(0));
      const actx        = new AudioContext();
      const decoded     = await actx.decodeAudioData(bytes.buffer);
      if (callId !== speakCallRef.current) { actx.close(); return; }

      const source      = actx.createBufferSource();
      source.buffer     = decoded;
      source.connect(actx.destination);
      source.onended    = () => { actx.close(); audioRef.current = null; onDone?.(); };
      audioRef.current  = { pause: () => { source.stop(); actx.close(); }, src: '' };
      await actx.resume();
      source.start(0);
    } catch {
      if (typeof window === 'undefined') return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.onend = () => onDone?.();
      window.speechSynthesis.speak(u);
    }
  }, [accessToken, stopSpeaking]);

  // ── STT ─────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (!hasSR) { setPhase(S.READY); return; }
    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = 'en-US';

    rec.onstart = () => {
      startTime.current = Date.now();
      setPhase(S.RECORDING);
    };

    rec.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
      setTrans(full);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access in your browser and try again.');
        setPhase(S.ERROR);
      }
    };

    rec.onend = () => {
      if (phaseR.current === S.RECORDING) setPhase(S.RECORDED);
    };

    recRef.current = rec;
    rec.start();
  }, [hasSR]);

  const stopRecording = useCallback(() => {
    if (recRef.current) {
      recRef.current.onend = null;
      recRef.current.stop();
      recRef.current = null;
    }
    setPhase(S.RECORDED);
  }, []);

  // ── Submit answer → get next ─────────────────────────────
  const handleNext = useCallback(async () => {
    const text = transcriptR.current?.trim();
    if (!text) return;
    stopSpeaking();
    stopRecording();
    setPhase(S.PROCESSING);

    const duration = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : 0;

    try {
      const res = await submitAnswer({ interviewId, questionNumber: currentQ, answerText: text, durationSeconds: duration, accessToken });

      if (res.isComplete) {
        setPhase(S.COMPLETED);
        speak(res.acknowledgment);
        setTimeout(() => onComplete?.(interviewId), 2200);
        return;
      }

      setTrans('');
      setPhase(S.AI_SPEAKING);
      setCurrentQ(res.nextQuestionNumber);
      setQuestion(res.nextQuestionText);
      speak(`${res.acknowledgment} ${res.nextQuestionText}`, () => setPhase(S.READY));
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setPhase(S.ERROR);
    }
  }, [interviewId, currentQ, accessToken, speak, stopSpeaking, stopRecording, onComplete]);

  // ── Repeat question ──────────────────────────────────────
  const handleRepeat = useCallback(() => {
    stopRecording();
    setTrans('');
    setPhase(S.AI_SPEAKING);
    speak(question, () => setPhase(S.READY));
  }, [question, speak, stopRecording]);

  // ── Mount: auto-speak first question ─────────────────────
  useEffect(() => {
    speak(initialText, () => setPhase(S.READY));
    return () => { stopSpeaking(); stopRecording(); };
  }, []); // eslint-disable-line

  const progress = ((currentQ - 1) / totalQuestions) * 100;
  const canNext  = phase === S.RECORDED && transcript.trim().length > 0;

  return (
    <div className={styles.root}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.questionCounter}>Question {currentQ} of {totalQuestions}</span>
          <span className={styles.sessionTitle}>{jobTitle} · {interviewType} Interview</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.timeLeft}>{minutesLeft(currentQ, totalQuestions)} remaining</span>
          <button className={styles.endBtn} onClick={() => { stopSpeaking(); stopRecording(); onComplete?.(interviewId); }}>
            <LogOut size={14} /> End
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* ── Main card ── */}
      <div className={styles.card}>

        {/* Question */}
        <div className={styles.questionSection}>
          <div className={styles.questionLabel}>
            <span className={styles.questionTag}>Current Question</span>
            <button className={styles.speakBtn} title="Repeat question" onClick={handleRepeat} disabled={phase === S.AI_SPEAKING || phase === S.PROCESSING}>
              <Volume2 size={15} />
            </button>
          </div>
          <p className={styles.questionText}>{question}</p>
        </div>

        <div className={styles.divider} />

        {/* Visual zone */}
        <div className={styles.visualZone}>
          {phase === S.AI_SPEAKING && <SpeakingIndicator />}

          {phase === S.READY && (
            <div className={styles.readyState}>
              <div className={styles.readyMic}><Mic size={22} /></div>
              <p className={styles.visualHint}>Click <strong>Record Answer</strong> when you're ready</p>
            </div>
          )}

          {(phase === S.RECORDING || phase === S.RECORDED) && (
            <div className={styles.recordingState}>
              <Waveform active={phase === S.RECORDING} />
              <p className={styles.visualHint}>
                {phase === S.RECORDING ? '● Recording your answer…' : 'Recording complete'}
              </p>
            </div>
          )}

          {phase === S.PROCESSING && (
            <div className={styles.processingState}>
              <div className={styles.dots}><span /><span /><span /></div>
              <p className={styles.visualHint}>Processing your answer…</p>
            </div>
          )}

          {phase === S.COMPLETED && (
            <div className={styles.completedState}>
              <CheckCircle2 size={40} className={styles.completedIcon} />
              <p className={styles.visualHint}>Interview complete!</p>
            </div>
          )}

          {phase === S.ERROR && (
            <div className={styles.errorState}>
              <AlertCircle size={36} className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript && phase !== S.AI_SPEAKING && phase !== S.PROCESSING && phase !== S.COMPLETED && (
          <div className={styles.transcript}>
            <div className={styles.transcriptHeader}>
              <span className={styles.transcriptLabel}>Your response</span>
              {phase === S.RECORDING && <span className={styles.capturingDot}><span className={styles.capturingPulse} />Capturing</span>}
            </div>
            <p className={styles.transcriptText}>{transcript}</p>
          </div>
        )}

        {/* No speech recognition fallback */}
        {!hasSR && phase === S.READY && (
          <p className={styles.fallbackNote}>
            Voice input is not supported in this browser. Please use Chrome or Edge.
          </p>
        )}
      </div>

      {/* ── Controls ── */}
      {phase !== S.COMPLETED && phase !== S.ERROR && (
        <div className={styles.controls}>
          <button
            className={styles.repeatBtn}
            onClick={handleRepeat}
            disabled={phase === S.AI_SPEAKING || phase === S.PROCESSING}
          >
            <RotateCcw size={15} /> Repeat Question
          </button>

          {(phase === S.READY || phase === S.RECORDING || phase === S.RECORDED) && (
            phase === S.RECORDING ? (
              <button className={`${styles.recordBtn} ${styles.recordBtnActive}`} onClick={stopRecording}>
                <Square size={15} fill="currentColor" /> Stop Recording
              </button>
            ) : (
              <button
                className={styles.recordBtn}
                onClick={startRecording}
                disabled={phase === S.RECORDED || !hasSR}
              >
                <Mic size={15} /> {phase === S.RECORDED ? 'Recorded' : 'Record Answer'}
              </button>
            )
          )}

          {phase === S.AI_SPEAKING && (
            <button className={styles.recordBtn} disabled>
              <Volume2 size={15} /> Listening…
            </button>
          )}

          {phase === S.PROCESSING && (
            <button className={styles.recordBtn} disabled>
              Processing…
            </button>
          )}

          <button
            className={`${styles.nextBtn} ${canNext ? styles.nextBtnActive : ''}`}
            onClick={handleNext}
            disabled={!canNext}
          >
            Next Question <ChevronRight size={15} />
          </button>
        </div>
      )}

      {phase === S.ERROR && (
        <div className={styles.controls}>
          <button className={styles.repeatBtn} onClick={() => { setError(''); setPhase(S.READY); }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
