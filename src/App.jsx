import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import FilterToolbar from './components/FilterToolbar';
import JobCard from './components/JobCard';
import JobDetailModal from './components/JobDetailModal';
import ColdEmailModal from './components/ColdEmailModal';
import KanbanBoard from './components/KanbanBoard';
import ChaiBreakQuiz from './components/ChaiBreakQuiz';
import AnalyticsView from './components/AnalyticsView';

import { normalizeJob } from './utils/jobNormalizer';
import { sound } from './utils/audio';
import { 
  loadTrackedJobs, 
  saveTrackedJob, 
  updateJobNote, 
  exportTrackedData, 
  loadUserPrefs, 
  saveUserPrefs,
  TRACK_STATUSES 
} from './utils/storage';
import { getRandomQuirk } from './utils/quirks';
import confetti from 'canvas-confetti';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const LIVE_DATA_URL = 'https://github.com/Toymakerftw/kljob/raw/refs/heads/main/data/jobs.json';
const FALLBACK_DATA_URL = '/data/jobs.json';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // User App State
  const [trackedJobs, setTrackedJobs] = useState({});
  const [activeTab, setActiveTab] = useState('feed');
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [malluMode, setMalluMode] = useState(true);
  const [applicantName, setApplicantName] = useState('');
  const [quirkyTip, setQuirkyTip] = useState(getRandomQuirk());

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPark, setSelectedPark] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');
  const [onlyWalkIns, setOnlyWalkIns] = useState(false);
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [onlyWithEmail, setOnlyWithEmail] = useState(false);
  const [showOnlyTracked, setShowOnlyTracked] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Modals & Overlays
  const [detailJob, setDetailJob] = useState(null);
  const [coldEmailJob, setColdEmailJob] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, icon = '✓') => {
    setToast({ message, icon });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Fetch jobs pipeline data
  const loadJobsData = useCallback(async (isManualSync = false) => {
    if (isManualSync) setIsSyncing(true);
    else setIsLoading(true);
    setErrorMsg('');

    let rawList = null;

    // Attempt 1: Fetch live from GitHub raw with cache buster
    try {
      const liveRes = await fetch(`${LIVE_DATA_URL}?_t=${Date.now()}`);
      if (liveRes.ok) {
        rawList = await liveRes.json();
      }
    } catch (err) {
      console.warn('Live GitHub fetch failed or CORS restricted, falling back to bundled data', err);
    }

    // Attempt 2: Fallback to bundled copy
    if (!rawList) {
      try {
        const fallbackRes = await fetch(FALLBACK_DATA_URL);
        if (fallbackRes.ok) {
          rawList = await fallbackRes.json();
        }
      } catch (err) {
        console.error('Failed to load fallback data', err);
        setErrorMsg('Could not fetch jobs data. Please check your internet connection.');
      }
    }

    if (rawList && Array.isArray(rawList)) {
      const normalized = rawList.map((j, idx) => normalizeJob(j, idx));
      setJobs(normalized);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      if (isManualSync) {
        sound.playSuccessCelebration();
        showToast(`Synced ${normalized.length} jobs with live pipeline!`, '🌴');
      }
    }

    setIsLoading(false);
    setIsSyncing(false);
  }, [showToast]);

  // Initial mount
  useEffect(() => {
    setTrackedJobs(loadTrackedJobs());
    const prefs = loadUserPrefs();
    setMalluMode(prefs.malluMode !== false);
    setApplicantName(prefs.applicantName || '');
    setIsSoundOn(sound.isSoundEnabled());

    loadJobsData();
  }, [loadJobsData]);

  // Handle URL deep linking (e.g. #job=xxx)
  useEffect(() => {
    if (jobs.length > 0 && window.location.hash) {
      const hash = window.location.hash;
      const match = hash.match(/#job=([\w-]+)/);
      if (match && match[1]) {
        const found = jobs.find(j => j.id === match[1]);
        if (found) {
          setDetailJob(found);
        }
      }
    }
  }, [jobs]);

  // Update applicant name in prefs
  const handleUpdateApplicantName = (name) => {
    setApplicantName(name);
    const prefs = loadUserPrefs();
    prefs.applicantName = name;
    saveUserPrefs(prefs);
  };

  // Toggle Mallu Mode
  const handleToggleMalluMode = () => {
    const next = !malluMode;
    setMalluMode(next);
    const prefs = loadUserPrefs();
    prefs.malluMode = next;
    saveUserPrefs(prefs);
    sound.playChirp();
    showToast(next ? '🌴 Mallu Mode Enabled!' : '💼 Formal Mode Enabled');
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const enabled = sound.toggleSound();
    setIsSoundOn(enabled);
    showToast(enabled ? '🔊 Sound Effects On' : '🔇 Muted');
  };

  // Tracking handlers
  const handleUpdateStatus = (jobId, newStatus) => {
    const updated = saveTrackedJob(jobId, newStatus);
    setTrackedJobs(updated);
    if (newStatus) {
      showToast(`Updated tracker stage to: ${newStatus}`, '📌');
    } else {
      showToast('Removed from tracker', '🗑️');
    }
  };

  const handleUpdateNotes = (jobId, notes) => {
    const updated = updateJobNote(jobId, notes);
    setTrackedJobs(updated);
    showToast('Saved private note', '💾');
  };

  const handleQuickTrack = (job) => {
    const current = trackedJobs[job.id]?.status;
    let nextStatus = TRACK_STATUSES.WISHLIST;
    if (!current) {
      nextStatus = TRACK_STATUSES.WISHLIST;
      sound.playBookmark();
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 }
        });
      } catch {}
      showToast(`Saved "${job.cleanTitle}" to Wishlist!`, '📌');
    } else if (current === TRACK_STATUSES.WISHLIST) {
      nextStatus = TRACK_STATUSES.APPLIED;
      sound.playSuccessCelebration();
      showToast(`Marked as Applied! 🚀`, '📤');
    } else {
      nextStatus = null;
      sound.playChirp();
      showToast('Removed from tracker', '⚪');
    }
    handleUpdateStatus(job.id, nextStatus);
  };

  // Filter & Search logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const combined = `${j.cleanTitle} ${j.company} ${j.description || ''} ${(j.skills || []).join(' ')}`.toLowerCase();
        if (!combined.includes(term)) return false;
      }

      // Tech park
      if (selectedPark !== 'all' && j.parkInfo.name !== selectedPark) {
        return false;
      }

      // Experience
      if (selectedExp !== 'all') {
        if (selectedExp === 'fresher' && j.expInfo.tag !== 'fresher') return false;
        if (selectedExp === 'junior' && j.expInfo.tag !== 'junior') return false;
        if (selectedExp === 'mid' && j.expInfo.tag !== 'mid') return false;
        if (selectedExp === 'senior' && j.expInfo.tag !== 'senior' && j.expInfo.tag !== 'lead') return false;
      }

      // Quick Toggles
      if (onlyWalkIns && !j.isWalkIn) return false;
      if (onlyUrgent && (!j.deadlineInfo || !j.deadlineInfo.isUrgent)) return false;
      if (onlyWithEmail && !j.email) return false;
      if (showOnlyTracked && !trackedJobs[j.id]) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        if (a.deadlineInfo.isUrgent && !b.deadlineInfo.isUrgent) return -1;
        if (!a.deadlineInfo.isUrgent && b.deadlineInfo.isUrgent) return 1;
        return (a.deadline || '').localeCompare(b.deadline || '');
      }
      if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      if (sortBy === 'role') {
        return a.cleanTitle.localeCompare(b.cleanTitle);
      }
      return 0; // Default scrape order
    });
  }, [
    jobs,
    searchTerm,
    selectedPark,
    selectedExp,
    onlyWalkIns,
    onlyUrgent,
    onlyWithEmail,
    showOnlyTracked,
    trackedJobs,
    sortBy
  ]);

  const handleResetFilters = () => {
    sound.playChirp();
    setSearchTerm('');
    setSelectedPark('all');
    setSelectedExp('all');
    setOnlyWalkIns(false);
    setOnlyUrgent(false);
    setOnlyWithEmail(false);
    setShowOnlyTracked(false);
    setSortBy('default');
  };

  const handleViewAllInFeed = (park, stack, exp) => {
    if (park !== 'any') setSelectedPark(park);
    if (exp !== 'any') setSelectedExp(exp);
    if (stack !== 'any') setSearchTerm(stack);
    setActiveTab('feed');
  };

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <span>{toast.icon}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jobsCount={jobs.length}
        trackedCount={Object.keys(trackedJobs).length}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onSync={() => loadJobsData(true)}
        isSoundOn={isSoundOn}
        onToggleSound={handleToggleSound}
        malluMode={malluMode}
        onToggleMalluMode={handleToggleMalluMode}
        onExportData={exportTrackedData}
      />

      {/* Quirky Kerala Techie Banner */}
      {malluMode && quirkyTip && (
        <div className="quirky-banner">
          <div className="quirky-content">
            <span className="quirky-icon">🥥</span>
            <div>
              <span className="quirky-quote">"{quirkyTip.quote}"</span>
              <span className="quirky-author">— {quirkyTip.author}</span>
            </div>
          </div>
          <button
            className="banner-refresh-btn"
            onClick={() => {
              setQuirkyTip(getRandomQuirk());
              sound.playChaiSip();
            }}
            title="Next Kerala Techie Quote"
          >
            <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
            Next Tip
          </button>
        </div>
      )}

      {/* TAB 1: Main Jobs Feed */}
      {activeTab === 'feed' && (
        <main>
          {/* Top Quick Stats Bar */}
          <StatsBar
            jobs={jobs}
            trackedJobs={trackedJobs}
            selectedPark={selectedPark}
            onSelectPark={setSelectedPark}
            selectedExp={selectedExp}
            onSelectExp={setSelectedExp}
            showOnlyTracked={showOnlyTracked}
            onToggleTrackedOnly={() => setShowOnlyTracked(!showOnlyTracked)}
          />

          {/* Filter Toolbar */}
          <FilterToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedPark={selectedPark}
            setSelectedPark={setSelectedPark}
            selectedExp={selectedExp}
            setSelectedExp={setSelectedExp}
            onlyWalkIns={onlyWalkIns}
            setOnlyWalkIns={setOnlyWalkIns}
            onlyUrgent={onlyUrgent}
            setOnlyUrgent={setOnlyUrgent}
            onlyWithEmail={onlyWithEmail}
            setOnlyWithEmail={setOnlyWithEmail}
            showOnlyTracked={showOnlyTracked}
            setShowOnlyTracked={setShowOnlyTracked}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onResetFilters={handleResetFilters}
            totalResults={filteredJobs.length}
          />

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="empty-state">
              <RefreshCw size={36} className="spin-animation" style={{ color: 'var(--accent-primary)' }} />
              <h3 className="empty-title">Connecting to Kerala Tech Parks...</h3>
              <p className="empty-desc">
                Fetching latest openings from Infopark, Technopark, and Cyberpark...
              </p>
            </div>
          ) : errorMsg ? (
            <div className="empty-state">
              <AlertCircle size={36} color="#ef4444" />
              <h3 className="empty-title">Pipeline Connection Issue</h3>
              <p className="empty-desc">{errorMsg}</p>
              <button className="tool-btn" onClick={() => loadJobsData(true)}>
                Retry Sync
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No matching jobs found</h3>
              <p className="empty-desc">
                Try loosening your filters or resetting the search term to see all {jobs.length} opportunities.
              </p>
              <button className="tool-btn" onClick={handleResetFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  trackedInfo={trackedJobs[job.id]}
                  onOpenDetails={setDetailJob}
                  onOpenColdEmail={setColdEmailJob}
                  onQuickTrack={handleQuickTrack}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* TAB 2: Kanban Tracker Board */}
      {activeTab === 'tracker' && (
        <KanbanBoard
          jobs={jobs}
          trackedJobs={trackedJobs}
          onUpdateStatus={handleUpdateStatus}
          onOpenDetails={setDetailJob}
          onOpenColdEmail={setColdEmailJob}
          onExportData={exportTrackedData}
          onSwitchToFeed={() => setActiveTab('feed')}
        />
      )}

      {/* TAB 3: Chai-Break Matcher Quiz */}
      {activeTab === 'quiz' && (
        <ChaiBreakQuiz
          jobs={jobs}
          trackedJobs={trackedJobs}
          onOpenDetails={setDetailJob}
          onOpenColdEmail={setColdEmailJob}
          onQuickTrack={handleQuickTrack}
          onViewAllInFeed={handleViewAllInFeed}
        />
      )}

      {/* TAB 4: Kerala Tech Pulse / Analytics */}
      {activeTab === 'analytics' && (
        <AnalyticsView jobs={jobs} />
      )}

      {/* MODALS */}
      {detailJob && (
        <JobDetailModal
          job={detailJob}
          trackedInfo={trackedJobs[detailJob.id]}
          onClose={() => setDetailJob(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNotes={handleUpdateNotes}
          onOpenColdEmail={(j) => {
            setDetailJob(null);
            setColdEmailJob(j);
          }}
        />
      )}

      {coldEmailJob && (
        <ColdEmailModal
          job={coldEmailJob}
          applicantName={applicantName}
          onUpdateApplicantName={handleUpdateApplicantName}
          onClose={() => setColdEmailJob(null)}
          onMarkAsApplied={(jobId) => handleUpdateStatus(jobId, TRACK_STATUSES.APPLIED)}
        />
      )}
    </div>
  );
}
