import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Mail, 
  Calendar, 
  Building2, 
  MapPin, 
  Clock, 
  Edit3, 
  Save, 
  Share2, 
  Check 
} from 'lucide-react';
import { sound } from '../utils/audio';
import { TRACK_STATUSES, STATUS_META } from '../utils/storage';

export default function JobDetailModal({
  job,
  trackedInfo,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onOpenColdEmail
}) {
  if (!job) return null;

  const [notes, setNotes] = useState(trackedInfo?.notes || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const currentStatus = trackedInfo?.status || '';

  const handleSaveNotes = () => {
    onUpdateNotes(job.id, notes);
    sound.playChirp();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '#job=' + job.id);
    setCopiedLink(true);
    sound.playChirp();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmail = () => {
    if (job.email) {
      navigator.clipboard.writeText(job.email);
      setCopiedEmail(true);
      sound.playChirp();
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className={`tech-park-badge ${job.parkInfo.badgeClass}`}>
                <span>{job.parkInfo.emoji}</span>
                <span>{job.parkInfo.name}</span>
              </span>
              <span className={`meta-tag tag-exp-${job.expInfo.badgeColor}`}>
                {job.expInfo.level}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '0.2rem' }}>
              {job.cleanTitle}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Building2 size={15} />
                <strong>{job.company}</strong>
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={15} />
                {job.parkInfo.city}
              </span>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Tracker Control Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                Application Tracker Stage:
              </span>
              <select
                className="custom-select"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                value={currentStatus}
                onChange={(e) => {
                  onUpdateStatus(job.id, e.target.value || null);
                  sound.playChirp();
                }}
              >
                <option value="">⚪ Not Tracked (Untracked)</option>
                <option value={TRACK_STATUSES.WISHLIST}>📌 Wishlist / Saved</option>
                <option value={TRACK_STATUSES.APPLIED}>📤 Applied</option>
                <option value={TRACK_STATUSES.INTERVIEW}>⏳ In Interview</option>
                <option value={TRACK_STATUSES.OFFER}>🤝 Offer Received 🎉</option>
                <option value={TRACK_STATUSES.REJECTED}>👻 Ghosted / Rejected</option>
              </select>
            </div>

            {/* Quick Actions in detail bar */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {job.email && (
                <button
                  className="btn-cold-email"
                  onClick={() => {
                    onOpenColdEmail(job);
                  }}
                >
                  <Mail size={14} />
                  <span>Cold Email Assistant</span>
                </button>
              )}
              <button className="tool-btn" onClick={handleCopyLink}>
                {copiedLink ? <Check size={14} color="#34d399" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} /> Deadline
              </div>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                {job.deadlineInfo ? job.deadlineInfo.text : 'Open / Rolling'}
                {job.deadline && <span style={{ opacity: 0.6, fontSize: '0.75rem', marginLeft: '0.3rem' }}>({job.deadline})</span>}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} /> Scraped At
              </div>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                {job.scraped_at ? new Date(job.scraped_at).toLocaleDateString() : 'Recent'}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Mail size={13} /> HR Email
              </div>
              <div style={{ fontWeight: 600, color: '#6ee7b7', wordBreak: 'break-all' }}>
                {job.email ? (
                  <button
                    onClick={handleCopyEmail}
                    style={{ background: 'transparent', color: '#6ee7b7', textDecoration: 'underline', fontSize: '0.84rem' }}
                    title="Click to copy email"
                  >
                    {copiedEmail ? 'Copied!' : job.email}
                  </button>
                ) : (
                  <span style={{ color: '#94a3b8' }}>Apply via portal</span>
                )}
              </div>
            </div>
          </div>

          {/* Key Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Extracted Technologies & Requirements:
              </h4>
              <div className="skills-tags-row">
                {job.skills.map((s, idx) => (
                  <span key={idx} className="skill-pill" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Job Description */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              Full Job Description:
            </h4>
            <div className="formatted-description">
              {job.description || 'No detailed description provided by the company.'}
            </div>
          </div>

          {/* Personal Application Notes */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px dashed rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={14} />
                My Private Notes (Auto-saved locally):
              </h4>
              <button
                className="tool-btn"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                onClick={handleSaveNotes}
              >
                <Save size={12} />
                <span>Save Note</span>
              </button>
            </div>
            <textarea
              style={{
                width: '100%',
                background: 'rgba(8, 11, 18, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.65rem',
                color: '#f8fafc',
                fontSize: '0.88rem',
                minHeight: '75px',
                resize: 'vertical'
              }}
              placeholder="e.g. Sent CV on Oct 29, follow up scheduled for Friday..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            ID: <code>{job.id}</code>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {job.link && (
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="tool-btn"
                style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
              >
                <span>Original Tech Park Posting</span>
                <ExternalLink size={14} />
              </a>
            )}
            <button
              className="btn-view-details"
              onClick={onClose}
              style={{ background: 'var(--accent-primary)', color: '#ffffff' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
