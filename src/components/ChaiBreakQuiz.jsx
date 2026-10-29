import React, { useState } from 'react';
import { Coffee, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import JobCard from './JobCard';

export default function ChaiBreakQuiz({
  jobs,
  trackedJobs,
  onOpenDetails,
  onOpenColdEmail,
  onQuickTrack,
  onViewAllInFeed
}) {
  const [step, setStep] = useState(1);
  const [parkChoice, setParkChoice] = useState('any');
  const [stackChoice, setStackChoice] = useState('any');
  const [expChoice, setExpChoice] = useState('any');
  const [matchedJobs, setMatchedJobs] = useState([]);

  const handleCalculateMatches = (park, stack, exp) => {
    sound.playSuccessCelebration();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const results = jobs.filter(j => {
      // Park match
      if (park !== 'any' && j.parkInfo.name !== park) {
        return false;
      }

      // Exp match
      if (exp === 'fresher' && j.expInfo.tag !== 'fresher') return false;
      if (exp === 'junior' && j.expInfo.tag !== 'junior' && j.expInfo.tag !== 'fresher') return false;
      if (exp === 'senior' && j.expInfo.tag !== 'senior' && j.expInfo.tag !== 'lead') return false;

      // Stack match
      if (stack !== 'any') {
        const fullText = `${j.cleanTitle} ${j.description || ''} ${(j.skills || []).join(' ')}`.toLowerCase();
        if (stack === 'python' && !fullText.includes('python') && !fullText.includes('ai') && !fullText.includes('data')) return false;
        if (stack === 'react' && !fullText.includes('react') && !fullText.includes('frontend') && !fullText.includes('javascript')) return false;
        if (stack === 'java' && !fullText.includes('java') && !fullText.includes('spring')) return false;
        if (stack === 'devops' && !fullText.includes('aws') && !fullText.includes('devops') && !fullText.includes('docker') && !fullText.includes('cloud')) return false;
      }

      return true;
    });

    setMatchedJobs(results);
    setStep(4); // Results step
  };

  const handleReset = () => {
    sound.playChirp();
    setStep(1);
    setParkChoice('any');
    setStackChoice('any');
    setExpChoice('any');
    setMatchedJobs([]);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Quiz Card */}
      <div style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {step < 4 ? (
          <div>
            {/* Top title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: '#fbbf24'
              }}>
                ☕
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#ffffff' }}>The Chai-Break Job Matcher</h2>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                  Answer 3 quick questions. We brew you the ideal tech openings across Kerala.
                </p>
              </div>
            </div>

            {/* Step Progress Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
              <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= 1 ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
              <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= 2 ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
              <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= 3 ? '#f59e0b' : 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* STEP 1: Tech Park Choice */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1rem' }}>
                  Step 1 of 3: Where do you picture yourself working?
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'Infopark', title: '🌴 Infopark Kochi', desc: 'Marine Drive breeze & Metro connectivity' },
                    { id: 'Technopark', title: '🥥 Technopark TVM', desc: 'The OG IT giant with campus life' },
                    { id: 'Cyberpark', title: '☕ Cyberpark Kozhikode', desc: 'Malabar biriyani breaks & beach vibes' },
                    { id: 'any', title: '🚀 Anywhere in Kerala', desc: 'Open to the best opportunity!' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      className={`stat-card ${parkChoice === opt.id ? 'selected' : ''}`}
                      onClick={() => {
                        setParkChoice(opt.id);
                        sound.playChirp();
                        setStep(2);
                      }}
                      style={{ padding: '1rem', cursor: 'pointer' }}
                    >
                      <strong style={{ fontSize: '0.98rem', color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
                        {opt.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Stack Choice */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1rem' }}>
                  Step 2 of 3: What is your preferred tech stack?
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'python', title: '🐍 Python, AI & Data', desc: 'LLMs, BigQuery, Analytics, ML' },
                    { id: 'react', title: '⚛️ React / Frontend', desc: 'UI/UX, TypeScript, Web Apps' },
                    { id: 'java', title: '☕ Java & Enterprise', desc: 'Spring Boot, Microservices, Scale' },
                    { id: 'devops', title: '☁️ Cloud & DevOps', desc: 'AWS, Azure, Docker, Kubernetes' },
                    { id: 'any', title: '⚡ Any Stack / All-Rounder', desc: 'I code where the value is' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      className={`stat-card ${stackChoice === opt.id ? 'selected' : ''}`}
                      onClick={() => {
                        setStackChoice(opt.id);
                        sound.playChirp();
                        setStep(3);
                      }}
                      style={{ padding: '1rem', cursor: 'pointer' }}
                    >
                      <strong style={{ fontSize: '0.98rem', color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
                        {opt.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Experience Choice */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', marginBottom: '1rem' }}>
                  Step 3 of 3: What is your current experience level?
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'fresher', title: '🌱 Fresher / Trainee', desc: 'Ready for my first break' },
                    { id: 'junior', title: '⚡ 0 - 2 Years Experience', desc: 'Building solid chops' },
                    { id: 'senior', title: '🏆 3+ Years Experience', desc: 'Mid to Senior & Lead roles' },
                    { id: 'any', title: '🚀 Show Everything', desc: 'No experience filters' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      className={`stat-card ${expChoice === opt.id ? 'selected' : ''}`}
                      onClick={() => {
                        setExpChoice(opt.id);
                        handleCalculateMatches(parkChoice, stackChoice, opt.id);
                      }}
                      style={{ padding: '1rem', cursor: 'pointer' }}
                    >
                      <strong style={{ fontSize: '0.98rem', color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
                        {opt.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation back */}
            {step > 1 && (
              <button
                className="tool-btn"
                onClick={() => {
                  sound.playChirp();
                  setStep(step - 1);
                }}
              >
                ← Back
              </button>
            )}
          </div>
        ) : (
          /* STEP 4: Results Display */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                  <Sparkles size={16} /> Freshly Brewed Platter
                </div>
                <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>
                  We found {matchedJobs.length} match{matchedJobs.length === 1 ? '' : 'es'} for you!
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Criteria: {parkChoice === 'any' ? 'All Parks' : parkChoice} • {stackChoice} • {expChoice}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="tool-btn" onClick={handleReset}>
                  <RotateCcw size={14} />
                  <span>Brew Again</span>
                </button>
                <button
                  className="btn-view-details"
                  onClick={() => onViewAllInFeed(parkChoice, stackChoice, expChoice)}
                >
                  <span>Filter in Main Radar</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Job matches cards grid */}
            {matchedJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">☕</div>
                <h3 className="empty-title">A Bit Too Specific!</h3>
                <p className="empty-desc">
                  No exact matches for that specific trio right now, but dozens of related openings exist in the main radar!
                </p>
                <button className="tool-btn" onClick={handleReset}>
                  Try Different Choices
                </button>
              </div>
            ) : (
              <div className="jobs-grid">
                {matchedJobs.slice(0, 6).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    trackedInfo={trackedJobs[job.id]}
                    onOpenDetails={onOpenDetails}
                    onOpenColdEmail={onOpenColdEmail}
                    onQuickTrack={onQuickTrack}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
