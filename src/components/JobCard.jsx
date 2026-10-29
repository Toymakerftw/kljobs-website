import React from 'react';
import { 
  Bookmark, 
  Mail, 
  ExternalLink, 
  Clock, 
  ChevronRight, 
  Footprints, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { sound } from '../utils/audio';
import { STATUS_META } from '../utils/storage';

export default function JobCard({
  job,
  trackedInfo,
  onOpenDetails,
  onOpenColdEmail,
  onQuickTrack
}) {
  const parkClass = job.parkInfo.name === 'Infopark'
    ? 'park-infopark'
    : job.parkInfo.name === 'Technopark'
    ? 'park-technopark'
    : job.parkInfo.name === 'Cyberpark'
    ? 'park-cyberpark'
    : '';

  const isTracked = Boolean(trackedInfo);
  const currentStatus = trackedInfo?.status || null;
  const statusMeta = currentStatus ? STATUS_META[currentStatus] : null;

  return (
    <article className={`job-card ${parkClass}`}>
      <div>
        {/* Top park badge & status badge */}
        <div className="job-header">
          <span className={`tech-park-badge ${job.parkInfo.badgeClass}`}>
            <span>{job.parkInfo.emoji}</span>
            <span>{job.parkInfo.name}</span>
          </span>

          {statusMeta && (
            <span
              className="status-badge-pill"
              style={{
                background: `${statusMeta.color}22`,
                color: statusMeta.color,
                border: `1px solid ${statusMeta.color}55`
              }}
            >
              <span>{statusMeta.emoji}</span>
              <span>{statusMeta.label}</span>
            </span>
          )}
        </div>

        {/* Job Title */}
        <h2 className="job-title" title={job.cleanTitle}>
          {job.cleanTitle}
        </h2>

        {/* Company Name */}
        <div className="company-name">
          <Building2 size={15} style={{ opacity: 0.7 }} />
          <span>{job.company}</span>
        </div>

        {/* Meta badges row */}
        <div className="meta-tags-row">
          {/* Experience badge */}
          <span className={`meta-tag tag-exp-${job.expInfo.badgeColor}`}>
            {job.expInfo.level}
          </span>

          {/* Walk in badge */}
          {job.isWalkIn && (
            <span className="meta-tag walkin-tag">
              <Footprints size={12} />
              <span>Walk-in Alert!</span>
            </span>
          )}

          {/* Deadline */}
          {job.deadlineInfo && (
            <span className={`meta-tag deadline-tag ${job.deadlineInfo.isUrgent ? 'urgent' : ''}`}>
              <Clock size={12} />
              <span>{job.deadlineInfo.text}</span>
            </span>
          )}
        </div>

        {/* Skills pill chips */}
        {job.skills && job.skills.length > 0 && (
          <div className="skills-tags-row">
            {job.skills.map((skill, i) => (
              <span key={i} className="skill-pill">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="card-actions">
        <div className="action-left">
          {/* Track / Bookmark Button */}
          <button
            className={`btn-icon ${isTracked ? 'tracked' : ''}`}
            onClick={() => onQuickTrack(job)}
            title={isTracked ? `Status: ${statusMeta?.label}. Click to cycle status.` : 'Save to My Applications Tracker'}
          >
            {isTracked ? <CheckCircle2 size={18} /> : <Bookmark size={18} />}
          </button>

          {/* Cold Email Button */}
          {job.email ? (
            <button
              className="btn-cold-email"
              onClick={() => {
                sound.playChirp();
                onOpenColdEmail(job);
              }}
              title={`Compose cold email to HR (${job.email})`}
            >
              <Mail size={14} />
              <span>Email HR</span>
            </button>
          ) : (
            job.link && (
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-icon"
                title="View original Tech Park posting"
              >
                <ExternalLink size={16} />
              </a>
            )
          )}
        </div>

        {/* View Details Modal Button */}
        <button
          className="btn-view-details"
          onClick={() => {
            sound.playChirp();
            onOpenDetails(job);
          }}
        >
          <span>View Details</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </article>
  );
}
