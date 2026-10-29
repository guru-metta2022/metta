import React, { useState, useEffect } from 'react';
import { X, Network, Trash2, Sparkles, ExternalLink, RefreshCw, Activity, Layers } from 'lucide-react';

export default function UserGraphModal({ isOpen, onClose, userProfile }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserGraph = async () => {
    if (!userProfile?.user_id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/graph?user_id=${encodeURIComponent(userProfile.user_id)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userProfile?.user_id) {
      fetchUserGraph();
    }
  }, [isOpen, userProfile]);

  const handleClearMemory = async () => {
    if (!window.confirm("Release Personal Memory Graph?\n\nThis will permanently purge all observed cognitive patterns, recurring knot counts, and growth milestones for this identity, returning your mind's footprint to Beginner's Mind (Anatta).")) {
      return;
    }

    setClearing(true);
    try {
      const res = await fetch(`/api/user/graph?user_id=${encodeURIComponent(userProfile.user_id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to purge memory graph');
      await fetchUserGraph();
    } catch (err) {
      alert("Error purging memory graph: " + err.message);
    } finally {
      setClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f1218] border border-[#202737] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b212e] flex items-center justify-between bg-[#131722]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#192b21] border border-[#2d523e] flex items-center justify-center text-sm">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#f0f2f5]">Personal Memory Graph</h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-[#162a1f] text-[#7ec69d] border border-[#2b543c]">
                  Authenticated
                </span>
              </div>
              <p className="text-[11px] text-[#7d8799]">
                Continuous topological tracking of knots, growth, and effective Dhamma reframings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUserGraph}
              disabled={loading}
              className="p-1.5 rounded-lg text-[#6f788b] hover:text-[#e4e7ee] hover:bg-[#1a202d] transition"
              title="Refresh Graph"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6f788b] hover:text-[#e4e7ee] hover:bg-[#1a202d] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* User Profile Banner */}
          <div className="p-4 rounded-xl bg-[#131722] border border-[#1f2637] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1b2b23] border border-[#2b4c39] flex items-center justify-center text-base font-semibold text-[#7ec69d]">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : '🌿'}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#f0f2f5]">{userProfile?.name || 'Seeker'}</h4>
                <p className="text-[11px] text-[#7e889b]">{userProfile?.email}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#6a7487] uppercase tracking-wider block">Total Inquiries</span>
              <span className="text-base font-semibold text-[#7ec69d] font-mono">
                {graphData?.total_turns || 0}
              </span>
            </div>
          </div>

          {loading && !graphData && (
            <div className="py-12 text-center text-[#7e889b] flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#7ec69d]" />
              <span>Traversing topological memory graph...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-[#2b1717] border border-[#4d2525] text-[#e58080]">
              Failed to load personal memory graph: {error}
            </div>
          )}

          {graphData && (
            <>
              {/* Section 1: Recurring Patterns */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#7ec69d]" />
                    <h4 className="font-semibold text-[#dce1ea]">Observed Cognitive & Emotional Patterns</h4>
                  </div>
                  <span className="text-[10px] text-[#6d7687]">
                    {graphData.patterns?.length || 0} patterns identified
                  </span>
                </div>

                {(!graphData.patterns || graphData.patterns.length === 0) ? (
                  <div className="p-6 rounded-xl bg-[#11141c] border border-[#1d222e] text-center text-[#737c8e]">
                    <p className="mb-1 font-medium text-[#9da6b7]">No recurring friction patterns recorded yet.</p>
                    <p className="text-[11px]">As you share dilemmas, Metta mindfully records recurring knots and the Dhamma principles that brought relief.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {graphData.patterns.map((pattern, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#121620] border border-[#202737] hover:border-[#2f3a52] transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#f0f2f5] capitalize">
                              {pattern.knot_category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#18261e] text-[#7ec69d] border border-[#264836]">
                              {pattern.occurrence_count}x observed
                            </span>
                          </div>
                          <span className="text-[10px] text-[#666f80] font-mono">
                            {new Date(pattern.last_observed_timestamp * 1000).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#9099ab] mb-3 leading-relaxed">
                          {pattern.observed_tendency}
                        </p>

                        {pattern.effective_principles && pattern.effective_principles.length > 0 && (
                          <div className="pt-2 border-t border-[#1a2130]">
                            <span className="text-[10px] uppercase tracking-wider text-[#697385] font-semibold block mb-1.5">
                              Effective Dhamma Principles:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {pattern.effective_principles.map((pr, pIdx) => (
                                <span
                                  key={pIdx}
                                  className="px-2 py-1 rounded-md text-[10px] font-medium bg-[#14231b] text-[#84d8a7] border border-[#254936]"
                                >
                                  🌿 {pr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Growth Milestones */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#e0a96d]" />
                  <h4 className="font-semibold text-[#dce1ea]">Distilled Growth Milestones</h4>
                </div>

                {(!graphData.growth_milestones || graphData.growth_milestones.length === 0) ? (
                  <div className="p-4 rounded-xl bg-[#11141c] border border-[#1d222e] text-[#737c8e]">
                    <p className="text-[11px]">Milestones distill automatically as recurring patterns reach mindful synthesis over 3+ sessions.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {graphData.growth_milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#181d28] border border-[#283244] flex items-start gap-2.5 text-[#d2d7e2]"
                      >
                        <span className="text-sm">🌱</span>
                        <p className="text-[11px] leading-relaxed">{milestone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Sovereign Control (Anatta Purge) */}
              <div className="pt-4 border-t border-[#1c2230]">
                <div className="p-4 rounded-xl bg-[#181414] border border-[#3b1f1f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-semibold text-[#f08585] flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" />
                      Sovereign Right: Release All Memory
                    </h5>
                    <p className="text-[11px] text-[#966b6b] mt-0.5">
                      Wipe all pattern nodes and distilled milestones to return to pure Beginner's Mind (*Anatta*).
                    </p>
                  </div>
                  <button
                    onClick={handleClearMemory}
                    disabled={clearing}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#2d1717] hover:bg-[#3d1c1c] text-[#fca5a5] border border-[#5a2727] transition shrink-0"
                  >
                    {clearing ? 'Releasing...' : 'Purge Personal Graph'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
