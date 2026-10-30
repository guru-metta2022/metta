import React, { useEffect, useState } from 'react';
import { X, Network, Compass, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export default function GraphModal({ isOpen, onClose }) {
  const [graphData, setGraphData] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/graph')
        .then((res) => res.json())
        .then((data) => {
          setGraphData(data);
          if (data.edges?.length > 0) {
            setSelectedEdge(data.edges[0]);
          }
        })
        .catch((err) => console.error('Failed to load graph:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101319] border border-[#232834] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2430]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16212e] border border-[#263c54] flex items-center justify-center text-[#6c8eb5]">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f0f2f5]">
                Decision Resolution Map
              </h2>
              <p className="text-xs text-[#828a99]">
                Structured pathways from tension or dilemma to constructive resolution and equanimity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7c8494] hover:text-[#e1e5ee] hover:bg-[#1a1f29] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Graph Content */}
        <div className="my-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Paths List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            <span className="text-[11px] font-semibold text-[#737c8e] uppercase tracking-wider block mb-1">
              Resolution Pathways ({graphData?.edges?.length || 0})
            </span>
            {graphData?.edges?.map((edge) => {
              const isSelected = selectedEdge?.id === edge.id;
              const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
              const targetNode = graphData.nodes.find((n) => n.id === edge.target);

              return (
                <div
                  key={edge.id}
                  onClick={() => setSelectedEdge(edge)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                    isSelected
                      ? 'bg-[#18231e] border-[#366049] text-[#e3ece6]'
                      : 'bg-[#131720] border-[#1d222e] hover:border-[#273042] text-[#9ba3b2]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                    <span className="text-[#d87c7c] truncate max-w-[120px]">
                      {sourceNode?.name || edge.source}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#556075] shrink-0" />
                    <span className="text-[#7ec69d] truncate max-w-[120px]">
                      {targetNode?.name || edge.target}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#788294] truncate">
                    {edge.principle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Path Inspection */}
          <div className="lg:col-span-7 bg-[#131720] border border-[#202736] rounded-xl p-5 flex flex-col justify-between">
            {selectedEdge ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#62b485] tracking-wider block mb-1">
                    Guiding Principle
                  </span>
                  <h3 className="text-sm font-semibold text-[#f0f2f5] leading-relaxed">
                    {selectedEdge.principle}
                  </h3>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0e1117] border border-[#1a1f2b] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#757f92] tracking-wider block">
                    Perspective Shift
                  </span>
                  <p className="text-xs text-[#c2c8d4] leading-relaxed">
                    {selectedEdge.reframe}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#141e18] border border-[#264432] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#86caa3] tracking-wider block">
                    Actionable Step
                  </span>
                  <p className="text-xs text-[#a9d8be] leading-relaxed">
                    {selectedEdge.immediate_action}
                  </p>
                </div>

                {selectedEdge.sutta_reference && (
                  <div className="pt-2 border-t border-[#1a1f2b] space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-[#818b9c]">
                      <BookOpen className="w-3.5 h-3.5 text-[#5e9e7b]" />
                      <span className="font-medium text-[#c4cbd8]">Source Reference: {selectedEdge.sutta_reference}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      {selectedEdge.suttacentral_url && (
                        <a
                          href={selectedEdge.suttacentral_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#7ec69d] hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>SuttaCentral Text</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      )}
                      {selectedEdge.accesstoinsight_url && (
                        <a
                          href={selectedEdge.accesstoinsight_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6c8eb5] hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>Access to Insight Translation</span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[#6e7787]">
                Select a pathway to inspect its details
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 pt-4 border-t border-[#1f2430] flex items-center justify-between text-xs text-[#717a8a]">
          <span>Deterministic resolution framework • Fast & lightweight graph</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#1d2330] hover:bg-[#252d3d] text-[#e0e4ee] transition"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
