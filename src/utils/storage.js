// LocalStorage manager for job applications & preferences

const STORAGE_KEY = 'kljobs_tracked_v1';
const PREFS_KEY = 'kljobs_preferences_v1';

export const TRACK_STATUSES = {
  WISHLIST: 'wishlist',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'rejected'
};

export const STATUS_META = {
  wishlist: { label: 'Wishlist / Saved', emoji: '📌', color: '#38bdf8' },
  applied: { label: 'Applied', emoji: '📤', color: '#a855f7' },
  interview: { label: 'Interviewing', emoji: '⏳', color: '#f59e0b' },
  offer: { label: 'Got Offer! 🎉', emoji: '🤝', color: '#10b981' },
  rejected: { label: 'Ghosted / Rej', emoji: '👻', color: '#ef4444' }
};

export function loadTrackedJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Failed to load tracked jobs from storage', err);
    return {};
  }
}

export function saveTrackedJob(jobId, status, notes = '', appliedAt = null) {
  const current = loadTrackedJobs();
  if (!status) {
    // Remove if status is null/falsy
    delete current[jobId];
  } else {
    current[jobId] = {
      ...(current[jobId] || {}),
      status,
      notes: notes !== undefined ? notes : (current[jobId]?.notes || ''),
      updatedAt: new Date().toISOString(),
      appliedAt: appliedAt || (status === 'applied' ? (current[jobId]?.appliedAt || new Date().toISOString()) : current[jobId]?.appliedAt)
    };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
  return current;
}

export function updateJobNote(jobId, notes) {
  const current = loadTrackedJobs();
  if (current[jobId]) {
    current[jobId].notes = notes;
    current[jobId].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return current;
}

export function exportTrackedData() {
  const data = loadTrackedJobs();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kljobs-my-tracker-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function loadUserPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {
      malluMode: true,
      applicantName: '',
      applicantPhone: '',
      applicantLinkedIn: ''
    };
  } catch {
    return {
      malluMode: true,
      applicantName: '',
      applicantPhone: '',
      applicantLinkedIn: ''
    };
  }
}

export function saveUserPrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn('Failed to save prefs', err);
  }
}
