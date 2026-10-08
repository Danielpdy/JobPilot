'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Mic, Square, Volume2, ArrowRight, RotateCcw, LogOut, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { submitAnswer, synthesizeSpeech } from '@/app/Services/InterviewService';
import GradientWaves from '@/app/components/ui/GradientWaves/GradientWaves';
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

const STATUS = {
  [S.AI_SPEAKING]: 'The interviewer is asking',
  [S.READY]:       'Your turn',
  [S.RECORDING]:   'Listening to your answer',
  [S.RECORDED]:    'Answer captured',
  [S.PROCESSING]:  'Answer captured', // sending shows only in the submit button
  [S.COMPLETED]:   'Round complete',
  [S.ERROR]:       'Paused',
};

const WAVE_BARS = 28;
const EASE_OUT  = [0.16, 1, 0.3, 1];
const SENT_MS   = 700; // how long the submit button holds its check before the next question
const EASE_IN   = [0.7, 0, 0.84, 0];

// Deck motion: a card rises from the deck, holds, then keeps rising out of view.
const cardMotion = {
  initial: { opacity: 0, y: 96, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.3 } },
  exit:    { opacity: 0, y: -240, scale: 0.97, zIndex: 20,
             transition: { duration: 0.38, ease: EASE_IN, opacity: { duration: 0.3, ease: EASE_IN, delay: 0.06 } } },
};

// ── Helpers ─────────────────────────────────────────────────
function minutesLeft(currentQ, totalQ) {
  const remaining = Math.max(0, (totalQ - currentQ + 1) * 2.5);
  return remaining < 1 ? 'Under a minute left' : `~${Math.round(remaining)} min left`;
}

function formatClock(secs) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Voice wave — real audio when an analyser exists, a calm synthetic swell otherwise ──
// Bar height follows loudness per frequency band; --tone follows the spectral centroid
// (darker voice → navy, brighter voice → ocean/cyan).
function VoiceWave({ active, analyserRef, variant }) {
  const wrapRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    const bars = barsRef.current;
    if (!active) {
      bars.forEach(el => el && (el.style.transform = 'scaleY(0.08)'));
      return;
    }
    let raf;
    let tone = 0.5;
    let buf = null;
    const tick = (t) => {
      const an = analyserRef?.current;
      if (an) {
        if (!buf || buf.length !== an.frequencyBinCount) buf = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(buf);
        const binHz = an.context.sampleRate / an.fftSize;
        const lo = Math.max(1, Math.floor(85 / binHz));
        const hi = Math.min(buf.length - 1, Math.ceil(4000 / binHz));
        let sum = 0, weighted = 0;
        for (let b = lo; b <= hi; b++) { sum += buf[b]; weighted += buf[b] * (b - lo); }
        if (sum > 400) tone = tone * 0.88 + (weighted / sum / (hi - lo)) * 2.2 * 0.12;
        for (let i = 0; i < bars.length; i++) {
          // log-spaced bands across the voice range, mirrored so the wave peaks in the middle
          const k = Math.abs(i - (bars.length - 1) / 2) / ((bars.length - 1) / 2);
          const b = Math.round(lo * Math.pow(hi / lo, k));
          const v = Math.pow(buf[Math.min(b, hi)] / 255, 0.85);
          if (bars[i]) bars[i].style.transform = `scaleY(${Math.max(0.08, v)})`;
        }
      } else {
        for (let i = 0; i < bars.length; i++) {
          const v = 0.28 + 0.24 * Math.sin(t / 210 + i * 0.55) * Math.sin(t / 640 + i * 0.17) + 0.12 * Math.sin(t / 95 + i);
          if (bars[i]) bars[i].style.transform = `scaleY(${Math.max(0.08, v)})`;
        }
      }
      wrapRef.current?.style.setProperty('--tone', Math.min(1, Math.max(0, tone)).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, analyserRef]);

  return (
    <div ref={wrapRef} className={`${styles.wave} ${variant === 'you' ? styles.waveYou : styles.waveCoach}`} aria-hidden="true">
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <span key={i} ref={el => { barsRef.current[i] = el; }} className={styles.waveBar} />
      ))}
    </div>
  );
}

// ── Question typed out in step with the interviewer's voice ──
// A hidden copy of the full text holds the card's final height, so nothing jumps while it types.
function TypedQuestion({ text, reveal, complete }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (complete || !reveal) return;
    const reduced = prefersReduced();
    let raf;
    const tick = (now) => {
      const lead = reveal.offset * reveal.duration;
      const frac = reduced ? 1 : Math.min(1, Math.max(0, (now - reveal.startedAt - lead) / Math.max(1, reveal.duration - lead)));
      setCount(Math.ceil(frac * text.length));
      if (frac < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reveal, text, complete]);

  const shown  = complete ? text.length : count;
  const typing = !complete && shown < text.length;

  return (
    <h2 className={styles.question}>
      <span className={styles.srOnly}>{text}</span>
      <span className={styles.questionGhost} aria-hidden="true">{text}</span>
      <span className={styles.questionTyped} aria-hidden="true">
        {text.slice(0, shown)}
        {typing && <span className={styles.caret} />}
      </span>
    </h2>
  );
}

// ── Transcript: each new word settles in as you say it ──
function LiveTranscript({ text }) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <p className={styles.transcript}>
      {words.map((w, i) => <span key={i} className={styles.word}>{w} </span>)}
    </p>
  );
}

// ═══════════════════════════════════════════════════════════
export default function InterviewSession({
  interviewId, questionNumber: initialQ, questionText: initialText,
  totalQuestions, jobTitle, interviewType, accessToken, onComplete,
}) {
  const [phase, setPhase]         = useState(S.AI_SPEAKING);
  const [sent, setSent]           = useState(false);
  const [currentQ, setCurrentQ]   = useState(initialQ);
  const [question, setQuestion]   = useState(initialText);
  const [transcript, setTrans]    = useState('');
  const [error, setError]         = useState('');
  const [elapsed, setElapsed]     = useState(0);
  const [reveal, setReveal]       = useState(null);
  const [waveColors, setWaveColors] = useState(null);
  const [reduced, setReduced]     = useState(false);

  const recRef       = useRef(null);
  const audioRef     = useRef(null);
  const speakCallRef = useRef(0);
  const startTime    = useRef(null);
  const transcriptR  = useRef('');
  const phaseR       = useRef(S.AI_SPEAKING);
  const ttsAnalyser  = useRef(null);
  const micAnalyser  = useRef(null);
  const micRef       = useRef(null);

  const hasSR = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => { phaseR.current = phase; }, [phase]);
  useEffect(() => { transcriptR.current = transcript; }, [transcript]);

  // Stage colours come from tokens.css so the WebGL waves stay on-system
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const read = (n) => css.getPropertyValue(n).trim();
    const id = requestAnimationFrame(() => {
      setReduced(prefersReduced());
      setWaveColors({ horizon: read('--wave-horizon'), body: read('--wave-body'), crest: read('--wave-crest') });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // ── Answer clock (runs only while recording) ─────────────
  useEffect(() => {
    if (phase !== S.RECORDING) return;
    const id = setInterval(() => {
      if (startTime.current) setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  // ── Mic level meter (drives the "you" wave) ──────────────
  const stopMeter = useCallback(() => {
    const m = micRef.current;
    if (m) {
      m.stream.getTracks().forEach(t => t.stop());
      m.ctx.close().catch(() => {});
    }
    micRef.current = null;
    micAnalyser.current = null;
  }, []);

  const startMeter = useCallback(async () => {
    if (micRef.current || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.72;
      ctx.createMediaStreamSource(stream).connect(analyser);
      micRef.current = { stream, ctx };
      micAnalyser.current = analyser;
    } catch {
      // No meter — the wave falls back to its synthetic swell; recording still works.
    }
  }, []);

  // ── TTS ─────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    ttsAnalyser.current = null;
  }, []);

  // onStart(durationSeconds) fires the moment audio actually begins, so the question can type in sync.
  const speak = useCallback(async (text, onDone, onStart) => {
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
      const analyser    = actx.createAnalyser();
      analyser.fftSize  = 1024;
      analyser.smoothingTimeConstant = 0.7;
      source.buffer     = decoded;
      source.connect(analyser);
      analyser.connect(actx.destination);
      source.onended    = () => { actx.close(); audioRef.current = null; ttsAnalyser.current = null; onDone?.(); };
      audioRef.current  = { pause: () => { source.stop(); actx.close(); }, src: '' };
      ttsAnalyser.current = analyser;
      await actx.resume();
      source.start(0);
      onStart?.(decoded.duration);
    } catch {
      if (typeof window === 'undefined') return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.onstart = () => onStart?.(Math.max(1.5, text.length / 14));
      u.onend = () => onDone?.();
      window.speechSynthesis.speak(u);
    }
  }, [accessToken, stopSpeaking]);

  // Type only the question part of what's spoken (the acknowledgment plays first).
  const typeWith = useCallback((full, q) => (seconds) => {
    setReveal({ startedAt: performance.now(), duration: seconds * 1000, offset: Math.max(0, 1 - q.length / full.length) });
  }, []);

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
      setElapsed(0);
      setPhase(S.RECORDING);
      startMeter();
    };

    rec.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
      setTrans(full);
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        stopMeter();
        setError('Your browser blocked the microphone. Allow microphone access for this site, then try again.');
        setPhase(S.ERROR);
      }
    };

    rec.onend = () => {
      if (phaseR.current === S.RECORDING) { stopMeter(); setPhase(S.RECORDED); }
    };

    recRef.current = rec;
    rec.start();
  }, [hasSR, startMeter, stopMeter]);

  const stopRecording = useCallback(() => {
    if (recRef.current) {
      recRef.current.onend = null;
      recRef.current.stop();
      recRef.current = null;
    }
    stopMeter();
    setPhase(S.RECORDED);
  }, [stopMeter]);

  // ── Submit answer → get next ─────────────────────────────
  const handleNext = useCallback(async () => {
    const text = transcriptR.current?.trim();
    if (!text || phaseR.current === S.PROCESSING) return;
    stopSpeaking();
    stopRecording();
    phaseR.current = S.PROCESSING; // set now, so a quick second click can't resend
    setPhase(S.PROCESSING);

    const duration = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : 0;

    try {
      const res = await submitAnswer({ interviewId, questionNumber: currentQ, answerText: text, durationSeconds: duration, accessToken });

      // The spinner turns into a check, held briefly before the card moves on
      setSent(true);
      await new Promise(r => setTimeout(r, SENT_MS));
      setSent(false);

      if (res.isComplete) {
        setPhase(S.COMPLETED);
        speak(res.acknowledgment);
        setTimeout(() => onComplete?.(interviewId), 2200);
        return;
      }

      const full = `${res.acknowledgment} ${res.nextQuestionText}`;
      setTrans('');
      setElapsed(0);
      setReveal(null);
      setPhase(S.AI_SPEAKING);
      setCurrentQ(res.nextQuestionNumber);
      setQuestion(res.nextQuestionText);
      speak(full, () => setPhase(S.READY), typeWith(full, res.nextQuestionText));
    } catch (err) {
      setError(err.message || 'We couldn’t send your answer. Check your connection and try again.');
      setPhase(S.ERROR);
    }
  }, [interviewId, currentQ, accessToken, speak, stopSpeaking, stopRecording, onComplete, typeWith]);

  // ── Repeat question ──────────────────────────────────────
  const handleRepeat = useCallback(() => {
    stopRecording();
    setTrans('');
    setElapsed(0);
    setReveal(null);
    setPhase(S.AI_SPEAKING);
    speak(question, () => setPhase(S.READY), typeWith(question, question));
  }, [question, speak, stopRecording, typeWith]);

  // ── Mount: auto-speak first question ─────────────────────
  // Cleanup only releases audio/mic resources — it must not set state (React re-runs effects in dev).
  useEffect(() => {
    const calls = speakCallRef; // counter ref, not a DOM node — bumping it cancels any in-flight speech
    speak(initialText, () => setPhase(S.READY), typeWith(initialText, initialText));
    return () => {
      calls.current++;
      stopSpeaking();
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
      if (recRef.current) { recRef.current.onend = null; recRef.current.stop(); recRef.current = null; }
      stopMeter();
    };
  }, []); // eslint-disable-line

  const canNext    = phase === S.RECORDED && transcript.trim().length > 0;
  const isLast     = currentQ >= totalQuestions;
  const busy       = phase === S.AI_SPEAKING || phase === S.PROCESSING;
  const answering  = phase === S.RECORDING || phase === S.RECORDED || phase === S.PROCESSING || (phase === S.ERROR && transcript);
  const remaining  = Math.max(0, totalQuestions - currentQ);
  const cardKey    = phase === S.COMPLETED ? 'done' : `q-${currentQ}`;

  return (
    <MotionConfig reducedMotion="user">
    {/* Full-page wave field. Lives outside .root: .root is a CSS container, which would trap a fixed layer. */}
    <div className={styles.backdrop} aria-hidden="true">
      {waveColors && (
        <GradientWaves
          horizonColor={waveColors.horizon}
          waveColor={waveColors.body}
          crestColor={waveColors.crest}
          speed={reduced ? 0 : 0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1.0}
          height={5.5}
          fogDepth={26}
          detail="medium"
          brightness={1.0}
          opacity={1.0}
          mouseInteraction={!reduced}
          parallaxStrength={0.5}
          grain={true}
          grainIntensity={0.05}
        />
      )}
    </div>

    <div className={styles.root}>

      {/* ── Top bar ── */}
      <header className={styles.top}>
        <div className={styles.topText}>
          <span className={styles.counter}>Question {currentQ} of {totalQuestions}</span>
          <span className={styles.sessionTitle}>{jobTitle} · {interviewType}</span>
        </div>
        <div className={styles.topRight}>
          <span className={styles.timeLeft}>{minutesLeft(currentQ, totalQuestions)}</span>
          <button type="button" className={styles.endBtn} onClick={() => { stopSpeaking(); stopRecording(); onComplete?.(interviewId); }}>
            <LogOut size={14} /> End round
          </button>
        </div>
      </header>

      <ol className={styles.steps} aria-label={`Question ${currentQ} of ${totalQuestions}`}>
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const n = i + 1;
          const state = n < currentQ || phase === S.COMPLETED ? styles.stepDone : n === currentQ ? styles.stepNow : '';
          return <li key={n} className={`${styles.step} ${state}`} />;
        })}
      </ol>

      {/* ── Stage: the question deck, floating on the page-wide waves ── */}
      <section className={styles.stage} aria-live="polite">
        <div className={styles.deck}>
          {/* The cards still to come, peeking from below */}
          {phase !== S.COMPLETED && remaining > 0 && <span className={`${styles.ghost} ${styles.ghost1}`} aria-hidden="true" />}
          {phase !== S.COMPLETED && remaining > 1 && <span className={`${styles.ghost} ${styles.ghost2}`} aria-hidden="true" />}

          <AnimatePresence mode="popLayout" initial={true}>
            {phase === S.COMPLETED ? (
              <motion.article key={cardKey} className={`${styles.card} ${styles.cardDone}`} {...cardMotion}>
                <CheckCircle2 size={28} className={styles.doneIcon} />
                <h2 className={styles.doneTitle}>That was the last one.</h2>
                <p className={styles.placeholder}><Loader2 size={16} className={styles.spin} /><span>Pulling your summary together…</span></p>
              </motion.article>
            ) : (
              <motion.article key={cardKey} layout className={styles.card} data-phase={phase} {...cardMotion}
                transition={{ layout: { duration: 0.42, ease: EASE_OUT } }}>

                <motion.div layout="position" className={styles.cardHead}>
                  <span className={styles.status} data-phase={phase}>
                    <span className={styles.statusDot} aria-hidden="true" />
                    {STATUS[phase]}
                  </span>
                  <button type="button" className={styles.iconBtn} onClick={handleRepeat} disabled={busy} aria-label="Hear the question again">
                    <Volume2 size={16} />
                  </button>
                </motion.div>

                <motion.div layout="position">
                  <TypedQuestion key={reveal?.startedAt ?? 'idle'} text={question} reveal={reveal} complete={phase !== S.AI_SPEAKING} />
                </motion.div>

                <motion.div layout="position" className={styles.coachWave}>
                  <VoiceWave active={phase === S.AI_SPEAKING} analyserRef={ttsAnalyser} variant="coach" />
                </motion.div>

                {phase === S.READY && (
                  <motion.p layout="position" className={styles.placeholder}
                    initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }}>
                    <Mic size={16} /><span>Press <strong>Record</strong> and answer out loud. Your words appear here as you speak.</span>
                  </motion.p>
                )}

                {/* The card grows to hold your answer once you start speaking */}
                <AnimatePresence initial={false}>
                  {answering && (
                    <motion.div key="answer" layout="position" className={styles.answer}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT, delay: 0.1 } }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                      <div className={styles.answerHead}>
                        <span className={styles.answerLabel}>Your answer</span>
                        <span className={styles.clock}>
                          {phase === S.RECORDING && <span className={styles.recDot} aria-hidden="true" />}
                          {formatClock(elapsed)}
                        </span>
                      </div>
                      <VoiceWave active={phase === S.RECORDING} analyserRef={micAnalyser} variant="you" />
                      {transcript
                        ? <LiveTranscript text={transcript} />
                        : <p className={styles.placeholder}><span>Start speaking — we’re listening.</span></p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {phase === S.ERROR && (
                  <p className={`${styles.placeholder} ${styles.errorText}`} role="alert"><AlertCircle size={18} /><span>{error}</span></p>
                )}

                {!hasSR && phase === S.READY && (
                  <p className={styles.fallback} role="note">
                    <AlertCircle size={15} /><span>This browser can’t capture speech. Open JobPilot in Chrome or Edge to answer out loud.</span>
                  </p>
                )}

                {/* Controls travel with the card */}
                <motion.div layout="position" className={styles.controls}>
                  {phase === S.ERROR ? (
                    <button type="button" className={styles.btnSubmit} onClick={() => { setError(''); setPhase(S.READY); }}>
                      Try again
                    </button>
                  ) : (
                    <>
                      <button type="button" className={styles.btnGhost} onClick={handleRepeat} disabled={busy}>
                        <RotateCcw size={15} /> Repeat
                      </button>

                      {phase === S.RECORDING ? (
                        <button type="button" className={`${styles.btnRecord} ${styles.btnRecording}`} onClick={stopRecording}>
                          <Square size={14} fill="currentColor" /> Stop
                        </button>
                      ) : (
                        <button type="button" className={styles.btnRecord} onClick={startRecording}
                          disabled={phase !== S.READY || !hasSR} aria-busy={phase === S.AI_SPEAKING}>
                          {phase === S.AI_SPEAKING
                            ? <><Loader2 size={15} className={styles.spin} /> Listening</>
                            : phase === S.RECORDED || phase === S.PROCESSING
                              ? <><CheckCircle2 size={15} /> Recorded</>
                              : <><Mic size={15} /> Record</>}
                        </button>
                      )}

                      {/* Label holds the width; spinner, then a drawn check, sit on top of it */}
                      <button type="button" className={styles.btnSubmit} onClick={handleNext}
                        disabled={!canNext && phase !== S.PROCESSING}
                        aria-disabled={phase === S.PROCESSING || undefined}
                        aria-busy={(phase === S.PROCESSING && !sent) || undefined}
                        data-state={phase === S.PROCESSING ? (sent ? 'sent' : 'sending') : undefined}>
                        <span className={styles.submitLabel}>
                          {isLast ? 'Finish round' : 'Submit answer'} <ArrowRight size={15} />
                        </span>
                        <AnimatePresence>
                          {phase === S.PROCESSING && (
                            <motion.span key="state" className={styles.submitState} aria-hidden="true"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}>
                              <AnimatePresence mode="wait" initial={false}>
                                {sent ? (
                                  <motion.svg key="sent" viewBox="0 0 24 24" width={18} height={18}>
                                    <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor"
                                      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                      transition={{ duration: 0.32, ease: EASE_OUT }} />
                                  </motion.svg>
                                ) : (
                                  <motion.span key="sending" className={styles.submitSpin}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.14 } }}>
                                    <Loader2 size={17} className={styles.spin} />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <span className={styles.srOnly} role="status">
                          {phase === S.PROCESSING ? (sent ? 'Answer sent' : 'Sending your answer') : ''}
                        </span>
                      </button>
                    </>
                  )}
                </motion.div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
    </MotionConfig>
  );
}
