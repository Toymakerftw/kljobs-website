import React from 'react';
import { sound } from '../utils/audio';

export default function StatsBar({
  jobs,
  trackedJobs,
  selectedPark,
  onSelectPark,
  selectedExp,
  onSelectExp,
  showOnlyTracked,
  onToggleTrackedOnly
}) {
  const total = jobs.length;

  const infoparkCount = jobs.filter(j => j.parkInfo.name === 'Infopark').length;
  const technoparkCount = jobs.filter(j => j.parkInfo.name === 'Technopark').length;
  const cyberparkCount = jobs.filter(j => j.parkInfo.name === 'Cyberpark').length;
  const fresherCount = jobs.filter(j => j.expInfo.tag === 'fresher').length;
  const trackedCount = Object.keys(trackedJobs).length;

  return (
    <div className="stats-grid">
      {/* Total Jobs */}
      <button
        className={`stat-card ${!selectedPark && !selectedExp && !showOnlyTracked ? 'selected' : ''}`}
        onClick={() => {
          sound.playChirp();
          onSelectPark('all');
          onSelectExp('all');
          if (showOnlyTracked) onToggleTrackedOnly();
        }}
      >
        <div className="stat-top">
          <span className="stat-title">Active Radar</span>
          <span className="stat-icon">⚡</span>
        </div>
        <div className="stat-count">{total}</div>
        <div className="stat-subtitle">Total scraped & verified</div>
      </button>

      {/* Infopark */}
      <button
        className={`stat-card ${selectedPark === 'Infopark' ? 'selected' : ''}`}
        onClick={() => {
          sound.playChirp();
          onSelectPark(selectedPark === 'Infopark' ? 'all' : 'Infopark');
        }}
      >
        <div className="stat-top">
          <span className="stat-title" style={{ color: '#6ee7b7' }}>Infopark Kochi</span>
          <span className="stat-icon">🌴</span>
        </div>
        <div className="stat-count" style={{ color: '#6ee7b7' }}>{infoparkCount}</div>
        <div className="stat-subtitle">Kakkanad IT Campus</div>
      </button>

      {/* Technopark */}
      <button
        className={`stat-card ${selectedPark === 'Technopark' ? 'selected' : ''}`}
        onClick={() => {
          sound.playChirp();
          onSelectPark(selectedPark === 'Technopark' ? 'all' : 'Technopark');
        }}
      >
        <div className="stat-top">
          <span className="stat-title" style={{ color: '#c7d2fe' }}>Technopark TVM</span>
          <span className="stat-icon">🥥</span>
        </div>
        <div className="stat-count" style={{ color: '#c7d2fe' }}>{technoparkCount}</div>
        <div className="stat-subtitle">Kazhakoottam Hub</div>
      </button>

      {/* Cyberpark */}
      <button
        className={`stat-card ${selectedPark === 'Cyberpark' ? 'selected' : ''}`}
        onClick={() => {
          sound.playChirp();
          onSelectPark(selectedPark === 'Cyberpark' ? 'all' : 'Cyberpark');
        }}
      >
        <div className="stat-top">
          <span className="stat-title" style={{ color: '#fcd34d' }}>Cyberpark Calicut</span>
          <span className="stat-icon">☕</span>
        </div>
        <div className="stat-count" style={{ color: '#fcd34d' }}>{cyberparkCount}</div>
        <div className="stat-subtitle">Malabar IT Corridor</div>
      </button>

      {/* Freshers & Trainees */}
      <button
        className={`stat-card ${selectedExp === 'fresher' ? 'selected' : ''}`}
        onClick={() => {
          sound.playChirp();
          onSelectExp(selectedExp === 'fresher' ? 'all' : 'fresher');
        }}
      >
        <div className="stat-top">
          <span className="stat-title" style={{ color: '#34d399' }}>Fresher / Trainee</span>
          <span className="stat-icon">🌱</span>
        </div>
        <div className="stat-count" style={{ color: '#34d399' }}>{fresherCount}</div>
        <div className="stat-subtitle">Entry level & internships</div>
      </button>

      {/* Tracked Applications */}
      <button
        className={`stat-card ${showOnlyTracked ? 'selected' : ''}`}
        onClick={() => {
          sound.playChirp();
          onToggleTrackedOnly();
        }}
      >
        <div className="stat-top">
          <span className="stat-title" style={{ color: '#f472b6' }}>My Tracker</span>
          <span className="stat-icon">📌</span>
        </div>
        <div className="stat-count" style={{ color: '#f472b6' }}>{trackedCount}</div>
        <div className="stat-subtitle">{showOnlyTracked ? 'Showing tracked only' : 'Saved & applied jobs'}</div>
      </button>
    </div>
  );
}
