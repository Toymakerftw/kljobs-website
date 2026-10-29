import React from 'react';
import { 
  Building2, 
  Cpu, 
  MapPin, 
  Briefcase, 
  Award, 
  Zap, 
  Footprints, 
  Clock 
} from 'lucide-react';

export default function AnalyticsView({ jobs }) {
  const total = jobs.length || 1;

  // Tech park distribution
  const parkMap = {};
  jobs.forEach(j => {
    const p = j.parkInfo.name;
    parkMap[p] = (parkMap[p] || 0) + 1;
  });

  // Top hiring companies
  const compMap = {};
  jobs.forEach(j => {
    const c = j.company || 'Unknown';
    compMap[c] = (compMap[c] || 0) + 1;
  });
  const topCompanies = Object.entries(compMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Top skills
  const skillMap = {};
  jobs.forEach(j => {
    (j.skills || []).forEach(s => {
      skillMap[s] = (skillMap[s] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Experience breakdown
  const expMap = {};
  jobs.forEach(j => {
    const lvl = j.expInfo.level;
    expMap[lvl] = (expMap[lvl] || 0) + 1;
  });
  const expEntries = Object.entries(expMap).sort((a, b) => b[1] - a[1]);

  const walkInsCount = jobs.filter(j => j.isWalkIn).length;
  const emailCount = jobs.filter(j => j.email).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.25rem' }}>
            Kerala IT Pulse & Market Insights
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Real-time analytics computed across {jobs.length} scraped tech jobs in Kerala
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Direct HR Contacts</span>
            <strong style={{ fontSize: '1.4rem', color: '#34d399' }}>{emailCount}</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.3rem' }}>({Math.round((emailCount / total) * 100)}%)</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Walk-in Drives</span>
            <strong style={{ fontSize: '1.4rem', color: '#f87171' }}>{walkInsCount}</strong>
          </div>
        </div>
      </div>

      {/* Grid of charts / insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Tech Park Market Share */}
        <div className="stat-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <MapPin size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>Tech Park Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(parkMap).map(([park, count]) => {
              const pct = Math.round((count / total) * 100);
              const color = park === 'Infopark' ? '#10b981' : park === 'Technopark' ? '#818cf8' : '#f59e0b';
              return (
                <div key={park}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600 }}>{park}</span>
                    <span style={{ color: '#94a3b8' }}>{count} jobs ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most in-demand skills */}
        <div className="stat-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Cpu size={18} color="#34d399" />
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>Top 10 In-Demand Tech Stacks</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topSkills.map(([skill, count]) => {
              const maxCount = topSkills[0][1];
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{skill}</span>
                    <span style={{ color: '#94a3b8' }}>{count} mentions</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #34d399)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Hiring Companies */}
        <div className="stat-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Building2 size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>Top Hiring Companies in Kerala</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {topCompanies.map(([comp, count], i) => (
              <div
                key={comp}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, width: '18px' }}>
                    #{i + 1}
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#e2e8f0' }}>
                    {comp}
                  </span>
                </div>
                <span className="col-badge" style={{ color: '#38bdf8' }}>
                  {count} opening{count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Landscape */}
        <div className="stat-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Award size={18} color="#ec4899" />
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff' }}>Experience Level Landscape</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {expEntries.slice(0, 5).map(([lvl, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={lvl}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{lvl}</span>
                    <span style={{ color: '#94a3b8' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#ec4899', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
