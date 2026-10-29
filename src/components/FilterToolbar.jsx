import React from 'react';
import { Search, X, Filter, Flame, Clock, Mail, Footprints, BookmarkCheck } from 'lucide-react';
import { sound } from '../utils/audio';

export default function FilterToolbar({
  searchTerm,
  setSearchTerm,
  selectedPark,
  setSelectedPark,
  selectedExp,
  setSelectedExp,
  onlyWalkIns,
  setOnlyWalkIns,
  onlyUrgent,
  setOnlyUrgent,
  onlyWithEmail,
  setOnlyWithEmail,
  showOnlyTracked,
  setShowOnlyTracked,
  sortBy,
  setSortBy,
  onResetFilters,
  totalResults
}) {
  const isAnyFilterActive = Boolean(
    searchTerm ||
    selectedPark !== 'all' ||
    selectedExp !== 'all' ||
    onlyWalkIns ||
    onlyUrgent ||
    onlyWithEmail ||
    showOnlyTracked ||
    sortBy !== 'default'
  );

  return (
    <div className="toolbar-container">
      {/* Search & Sort Row */}
      <div className="search-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by role (e.g. AI Engineer), company, or skill (e.g. Python, React)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchTerm('');
                sound.playChirp();
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="sort-select-wrapper">
          <select
            className="custom-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              sound.playChirp();
            }}
          >
            <option value="default">⚡ Latest Pipeline Scrapes</option>
            <option value="deadline">⏰ Deadline (Urgent First)</option>
            <option value="company">🏢 Company Name (A-Z)</option>
            <option value="role">💼 Job Role Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Tech Park Filter Chips */}
      <div className="filter-chip-row">
        <span className="filter-label">Tech Park:</span>
        <button
          className={`filter-chip ${selectedPark === 'all' ? 'active' : ''}`}
          onClick={() => {
            setSelectedPark('all');
            sound.playChirp();
          }}
        >
          All Parks
        </button>
        <button
          className={`filter-chip ${selectedPark === 'Infopark' ? 'active' : ''}`}
          onClick={() => {
            setSelectedPark(selectedPark === 'Infopark' ? 'all' : 'Infopark');
            sound.playChirp();
          }}
        >
          <span>🌴 Infopark Kochi</span>
        </button>
        <button
          className={`filter-chip ${selectedPark === 'Technopark' ? 'active' : ''}`}
          onClick={() => {
            setSelectedPark(selectedPark === 'Technopark' ? 'all' : 'Technopark');
            sound.playChirp();
          }}
        >
          <span>🥥 Technopark TVM</span>
        </button>
        <button
          className={`filter-chip ${selectedPark === 'Cyberpark' ? 'active' : ''}`}
          onClick={() => {
            setSelectedPark(selectedPark === 'Cyberpark' ? 'all' : 'Cyberpark');
            sound.playChirp();
          }}
        >
          <span>☕ Cyberpark Kozhikode</span>
        </button>
      </div>

      {/* Experience & Quick Toggles */}
      <div className="filter-chip-row">
        <span className="filter-label">Experience:</span>
        <button
          className={`filter-chip ${selectedExp === 'all' ? 'active' : ''}`}
          onClick={() => {
            setSelectedExp('all');
            sound.playChirp();
          }}
        >
          All Levels
        </button>
        <button
          className={`filter-chip ${selectedExp === 'fresher' ? 'active' : ''}`}
          onClick={() => {
            setSelectedExp(selectedExp === 'fresher' ? 'all' : 'fresher');
            sound.playChirp();
          }}
        >
          🌱 Fresher / Trainee
        </button>
        <button
          className={`filter-chip ${selectedExp === 'junior' ? 'active' : ''}`}
          onClick={() => {
            setSelectedExp(selectedExp === 'junior' ? 'all' : 'junior');
            sound.playChirp();
          }}
        >
          ⚡ Junior (0-2y)
        </button>
        <button
          className={`filter-chip ${selectedExp === 'mid' ? 'active' : ''}`}
          onClick={() => {
            setSelectedExp(selectedExp === 'mid' ? 'all' : 'mid');
            sound.playChirp();
          }}
        >
          🚀 Mid-level (2-5y)
        </button>
        <button
          className={`filter-chip ${selectedExp === 'senior' ? 'active' : ''}`}
          onClick={() => {
            setSelectedExp(selectedExp === 'senior' ? 'all' : 'senior');
            sound.playChirp();
          }}
        >
          🏆 Senior (5+ yrs)
        </button>

        {/* Quick Power Toggles */}
        <span className="filter-label" style={{ marginLeft: '0.5rem' }}>Quick Filters:</span>
        <button
          className={`filter-chip ${onlyWalkIns ? 'active' : ''}`}
          onClick={() => {
            setOnlyWalkIns(!onlyWalkIns);
            sound.playChirp();
          }}
        >
          <Footprints size={13} />
          <span>Walk-ins Only</span>
        </button>

        <button
          className={`filter-chip ${onlyUrgent ? 'active' : ''}`}
          onClick={() => {
            setOnlyUrgent(!onlyUrgent);
            sound.playChirp();
          }}
        >
          <Clock size={13} />
          <span>Expiring Soon</span>
        </button>

        <button
          className={`filter-chip ${onlyWithEmail ? 'active' : ''}`}
          onClick={() => {
            setOnlyWithEmail(!onlyWithEmail);
            sound.playChirp();
          }}
        >
          <Mail size={13} />
          <span>Direct HR Email</span>
        </button>

        <button
          className={`filter-chip ${showOnlyTracked ? 'active' : ''}`}
          onClick={() => {
            setShowOnlyTracked(!showOnlyTracked);
            sound.playChirp();
          }}
        >
          <BookmarkCheck size={13} />
          <span>My Tracked</span>
        </button>
      </div>

      {/* Filter Footer */}
      <div className="filter-footer">
        <span>
          Showing <strong>{totalResults}</strong> matching opportunities
        </span>
        {isAnyFilterActive && (
          <button className="reset-filters-btn" onClick={onResetFilters}>
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
