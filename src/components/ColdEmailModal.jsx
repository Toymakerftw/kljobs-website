import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  User 
} from 'lucide-react';
import { sound } from '../utils/audio';
import { EMAIL_TEMPLATES, generateMailtoUrl } from '../utils/coldEmail';
import confetti from 'canvas-confetti';

export default function ColdEmailModal({
  job,
  applicantName,
  onUpdateApplicantName,
  onClose,
  onMarkAsApplied
}) {
  if (!job) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState('pro');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];
  const subject = template.subject(job, applicantName);
  const body = template.body(job, applicantName);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    sound.playChirp();
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(body);
    setCopiedBody(true);
    sound.playChirp();
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleLaunchEmail = () => {
    sound.playSuccessCelebration();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // Safe catch
    }

    // Auto-mark as applied if user opens mail client
    if (onMarkAsApplied) {
      onMarkAsApplied(job.id);
    }

    const mailto = generateMailtoUrl(job.email || '', subject, body);
    window.open(mailto, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <Mail size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Cold Email Assistant</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Applying for <strong>{job.cleanTitle}</strong> at <strong>{job.company}</strong>
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ gap: '1rem' }}>
          {/* HR Target Email */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Recipient HR Email:</span>
            <strong style={{ color: '#6ee7b7', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              {job.email || 'No direct email scraped — submit via official portal'}
            </strong>
          </div>

          {/* Applicant Name Input */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
              <User size={14} /> Your Name (fills into email template):
            </label>
            <input
              type="text"
              className="search-input"
              style={{ padding: '0.55rem 0.9rem' }}
              placeholder="e.g. Rahul Nair / Ananya Kurian"
              value={applicantName}
              onChange={(e) => onUpdateApplicantName(e.target.value)}
            />
          </div>

          {/* Template Choice Tabs */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
              Select Tone / Style:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {EMAIL_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  className={`filter-chip ${selectedTemplateId === tmpl.id ? 'active' : ''}`}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    gap: '0.2rem'
                  }}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    sound.playChirp();
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{tmpl.name}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.75 }}>{tmpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Line Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Subject Line:</label>
              <button
                className="tool-btn"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={handleCopySubject}
              >
                {copiedSubject ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copiedSubject ? 'Copied!' : 'Copy Subject'}</span>
              </button>
            </div>
            <div style={{
              background: 'rgba(8, 11, 18, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              color: '#f8fafc',
              fontSize: '0.88rem',
              fontWeight: 600
            }}>
              {subject}
            </div>
          </div>

          {/* Body Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Draft Message Body:</label>
              <button
                className="tool-btn"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={handleCopyBody}
              >
                {copiedBody ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                <span>{copiedBody ? 'Copied!' : 'Copy Body'}</span>
              </button>
            </div>
            <textarea
              readOnly
              style={{
                width: '100%',
                background: 'rgba(8, 11, 18, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.85rem',
                color: '#cbd5e1',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                minHeight: '190px'
              }}
              value={body}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Tip: Attach your PDF resume in your email client after opening!
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="tool-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-cold-email"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                padding: '0.6rem 1.25rem',
                fontWeight: 700
              }}
              onClick={handleLaunchEmail}
            >
              <Send size={15} />
              <span>Launch Mail & Mark Applied</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
