import React from 'react';
import { 
  Building2, 
  Trash2, 
  ExternalLink, 
  ArrowRight, 
  Clock, 
  Mail, 
  PlusCircle, 
  Download 
} from 'lucide-react';
import { TRACK_STATUSES, STATUS_META } from '../utils/storage';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

const COLUMNS = [
  { id: TRACK_STATUSES.WISHLIST, title: 'Wishlist / Saved', emoji: '📌', color: '#38bdf8' },
  { id: TRACK_STATUSES.APPLIED, title: 'Applied', emoji: '📤', color: '#a855f7' },
  { id: TRACK_STATUSES.INTERVIEW, title: 'Interviewing', emoji: '⏳', color: '#f59e0b' },
  { id: TRACK_STATUSES.OFFER, title: 'Offer Received', emoji: '🤝', color: '#10b981' },
  { id: TRACK_STATUSES.REJECTED, title: 'Ghosted / Rej', emoji: '👻', color: '#ef4444' }
];

export default function KanbanBoard({
  jobs,
  trackedJobs,
  onUpdateStatus,
  onOpenDetails,
  onOpenColdEmail,
  onExportData,
  onSwitchToFeed
}) {
  // Map tracked jobs to full job objects
  const jobsById = React.useMemo(() => {
    const map = new Map();
    jobs.forEach(j => map.set(j.id, j));
    return map;
  }, [jobs]);

  const columnJobs = React.useMemo(() => {
    const grouped = {
      [TRACK_STATUSES.WISHLIST]: [],
      [TRACK_STATUSES.APPLIED]: [],
      [TRACK_STATUSES.INTERVIEW]: [],
      [TRACK_STATUSES.OFFER]: [],
      [TRACK_STATUSES.REJECTED]: []
    };

    Object.entries(trackedJobs).forEach(([id, meta]) => {
      const job = jobsById.get(id);
      if (job && grouped[meta.status]) {
        grouped[meta.status].push({ job, meta });
      }
    });

    return grouped;
  }, [trackedJobs, jobsById]);

  const totalTracked = Object.keys(trackedJobs).length;

  const handleStatusChange = (jobId, newStatus) => {
    if (newStatus === TRACK_STATUSES.OFFER) {
      sound.playSuccessCelebration();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      sound.playChirp();
    }
    onUpdateStatus(jobId, newStatus || null);
  };

  if (totalTracked === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📌</div>
        <h3 className="empty-title">Your Job Tracker is Empty</h3>
        <p className="empty-desc">
          Browse the Job Radar feed and click the bookmark icon or "Email HR" to save and track your applications here!
        </p>
        <button
          className="btn-view-details"
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.92rem' }}
          onClick={onSwitchToFeed}
        >
          <PlusCircle size={16} />
          <span>Explore Kerala Tech Jobs</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Board Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: '#ffffff' }}>Application Tracker Kanban</h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Tracking <strong>{totalTracked}</strong> opportunities across stages. Data is securely saved in your browser.
          </p>
        </div>

        <button className="tool-btn" onClick={onExportData}>
          <Download size={14} />
          <span>Export Backup (.JSON)</span>
        </button>
      </div>

      {/* Columns */}
      <div className="kanban-container">
        {COLUMNS.map((col) => {
          const items = columnJobs[col.id] || [];

          return (
            <div key={col.id} className="kanban-column">
              {/* Header */}
              <div className="column-header">
                <div className="col-title" style={{ color: col.color }}>
                  <span>{col.emoji}</span>
                  <span>{col.title}</span>
                </div>
                <span className="col-badge" style={{ color: col.color }}>
                  {items.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="kanban-cards-list">
                {items.length === 0 ? (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    border: '1px dashed rgba(255,255,255,0.06)',
                    borderRadius: '8px'
                  }}>
                    No jobs in {col.title}
                  </div>
                ) : (
                  items.map(({ job, meta }) => (
                    <div key={job.id} className="kanban-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <span className={`tech-park-badge ${job.parkInfo.badgeClass}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                          <span>{job.parkInfo.emoji}</span>
                          <span>{job.parkInfo.name}</span>
                        </span>
                        <button
                          style={{ background: 'transparent', color: '#64748b', padding: '2px' }}
                          title="Remove from tracker"
                          onClick={() => handleStatusChange(job.id, null)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div
                        className="kanban-card-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onOpenDetails(job)}
                        title="Click to view details"
                      >
                        {job.cleanTitle}
                      </div>

                      <div className="kanban-card-company">
                        {job.company}
                      </div>

                      {meta.notes && (
                        <div style={{
                          fontSize: '0.75rem',
                          background: 'rgba(0,0,0,0.3)',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          color: '#cbd5e1',
                          borderLeft: '2px solid var(--accent-primary)'
                        }}>
                          {meta.notes.length > 50 ? `${meta.notes.slice(0, 50)}...` : meta.notes}
                        </div>
                      )}

                      {/* Card actions & status mover */}
                      <div className="kanban-card-actions">
                        <select
                          className="kanban-select"
                          value={col.id}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        >
                          {COLUMNS.map(c => (
                            <option key={c.id} value={c.id}>
                              Move to: {c.title}
                            </option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {job.email && (
                            <button
                              style={{ background: 'transparent', color: '#34d399', padding: '2px' }}
                              title="Email HR"
                              onClick={() => onOpenColdEmail(job)}
                            >
                              <Mail size={13} />
                            </button>
                          )}
                          <button
                            style={{ background: 'transparent', color: '#a5b4fc', padding: '2px' }}
                            title="View details"
                            onClick={() => onOpenDetails(job)}
                          >
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
