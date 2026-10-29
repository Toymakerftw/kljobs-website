import React from 'react';
import { 
  Briefcase, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Coffee, 
  Kanban, 
  BarChart2, 
  Layers, 
  Download 
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function Header({
  activeTab,
  setActiveTab,
  jobsCount,
  trackedCount,
  isSyncing,
  lastSyncTime,
  onSync,
  isSoundOn,
  onToggleSound,
  malluMode,
  onToggleMalluMode,
  onExportData
}) {
  return (
    <header className="site-header">
      <div className="brand-wrapper">
        <div className="brand-logo-badge" title="KLJobs — Kerala Tech Jobs Radar">
          🌴
        </div>
        <div className="brand-titles">
          <h1>
            KLJobs <span style={{ fontSize: '0.9rem', color: '#6ee7b7', fontWeight: 600 }}>v1.0</span>
          </h1>
          <p className="brand-tagline">
            Kerala Tech Job Radar & Application Tracker • Infopark • Technopark • Cyberpark
          </p>
        </div>
      </div>

      <nav className="nav-tab-group" aria-label="Main Navigation">
        <button
          className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => {
            sound.playChirp();
            setActiveTab('feed');
          }}
        >
          <Layers size={16} />
          <span>Job Radar</span>
          <span className="nav-tab-badge">{jobsCount}</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => {
            sound.playChirp();
            setActiveTab('tracker');
          }}
        >
          <Kanban size={16} />
          <span>Tracker Board</span>
          {trackedCount > 0 && <span className="nav-tab-badge">{trackedCount}</span>}
        </button>

        <button
          className={`nav-tab ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => {
            sound.playChaiSip();
            setActiveTab('quiz');
          }}
        >
          <Coffee size={16} />
          <span>Chai Matcher</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => {
            sound.playChirp();
            setActiveTab('analytics');
          }}
        >
          <BarChart2 size={16} />
          <span>Tech Pulse</span>
        </button>
      </nav>

      <div className="header-actions">
        {/* Pipeline Sync Button */}
        <button
          className={`tool-btn ${isSyncing ? 'active-glow' : ''}`}
          onClick={onSync}
          disabled={isSyncing}
          title={`Pipeline raw source: github.com/Toymakerftw/kljob | Last checked: ${lastSyncTime || 'Just now'}`}
        >
          <RefreshCw size={14} className={isSyncing ? 'spin-animation' : ''} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Raw'}</span>
        </button>

        {/* Mallu Techie Mode Toggle */}
        <button
          className={`tool-btn ${malluMode ? 'active-glow' : ''}`}
          onClick={onToggleMalluMode}
          title="Toggle Mallu Techie Mode (Local Kerala quotes & vibes)"
        >
          <Sparkles size={14} color={malluMode ? '#f59e0b' : 'inherit'} />
          <span>{malluMode ? '🌴 Mallu Mode: ON' : '💼 Formal Mode'}</span>
        </button>

        {/* Sound Toggle */}
        <button
          className="tool-btn"
          onClick={onToggleSound}
          title={isSoundOn ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
        >
          {isSoundOn ? <Volume2 size={15} color="#34d399" /> : <VolumeX size={15} color="#94a3b8" />}
        </button>

        {/* Export Data */}
        {trackedCount > 0 && (
          <button
            className="tool-btn"
            onClick={onExportData}
            title="Export your tracked applications backup as JSON"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        )}
      </div>
    </header>
  );
}
