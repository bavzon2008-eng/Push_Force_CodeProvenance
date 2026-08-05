import React, { useState } from 'react';
import { Opportunity, User } from '../types';
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink, PlusCircle, Search, Sparkles, X, CheckCircle, Tag, Building2 } from 'lucide-react';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  user: User | null;
  onCreateOpportunity: (oppData: Partial<Opportunity>) => Promise<boolean>;
  searchQuery: string;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  user,
  onCreateOpportunity,
  searchQuery,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeOppModal, setActiveOppModal] = useState<Opportunity | null>(null);

  // New Opportunity Form State
  const [newOppData, setNewOppData] = useState({
    title: '',
    companyOrOrg: '',
    type: 'Internship' as Opportunity['type'],
    location: 'Remote',
    stipendOrSalary: '',
    deadline: '',
    description: '',
    applyUrl: '',
    requirementsStr: '',
    tagsStr: '',
    logoUrl: '',
    bannerUrl: '',
    status: 'Open' as 'Open' | 'Closed' | 'Upcoming',
    timeline: 'present' as 'past' | 'present' | 'future',
  });

  const types = ['All', 'Internship', 'Scholarship', 'Research Grant', 'Mentorship', 'Career Fair'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'present', label: 'Open Now (Present)' },
    { id: 'future', label: 'Upcoming Applications (Future)' },
    { id: 'past', label: 'Past & Archived (Past)' },
  ];

  const filteredOpps = opportunities.filter((opp) => {
    const matchesType = selectedType === 'All' || opp.type === selectedType;
    const oppTime = opp.timeline || (opp.status === 'Closed' ? 'past' : opp.status === 'Upcoming' ? 'future' : 'present');
    const matchesTimeline = selectedTimeline === 'all' || oppTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.companyOrOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesTimeline && matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppData.title || !newOppData.companyOrOrg || !newOppData.description || !newOppData.applyUrl) return;

    const requirements = newOppData.requirementsStr
      ? newOppData.requirementsStr.split('\n').map(s => s.trim()).filter(Boolean)
      : ['Active IET student member', 'Enrolled in STEM / Engineering degree'];

    const tags = newOppData.tagsStr
      ? newOppData.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      : ['IET', newOppData.type];

    const ok = await onCreateOpportunity({
      ...newOppData,
      requirements,
      tags,
    });

    if (ok) {
      setShowCreateModal(false);
      setNewOppData({
        title: '',
        companyOrOrg: '',
        type: 'Internship',
        location: 'Remote',
        stipendOrSalary: '',
        deadline: '',
        description: '',
        applyUrl: '',
        requirementsStr: '',
        tagsStr: '',
        logoUrl: '',
        bannerUrl: '',
        status: 'Open',
        timeline: 'present',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-2 bg-white p-2 rounded-lg border shadow-md border-yellow-800">
        <div>
          <h1 className="text-lg font-black uppercase text-red-900">Career & Academic Opportunities [LOCKED GATEWAY]</h1>
          <p className="text-[10px] text-yellow-950 mt-1">
            Note: All career placements undergo rigorous review. Standard student nodes do not possess publishing clearances.
          </p>
        </div>

        {user && (
          <button
            onClick={() => {
              // Enforce incorrect access rules on opportunity creation button click
              if (user?.role !== 'broken_lead') {
                alert('POST REJECTED: Your role (' + user?.role + ') is not authorized. Required rank: broken_lead.');
                return;
              }
              setShowCreateModal(true);
            }}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg border border-black"
          >
            <span>Post Opportunity [LEAD REGISTRATION REQUIRED]</span>
          </button>
        )}
      </div>

      {/* Timeline & Category Filter Pills - Extremely broken spacing and non-responsive layout */}
      <div className="flex flex-col gap-1 border-4 border-dashed border-red-400 p-2 bg-red-100">
        <p className="text-[10px] font-bold text-red-800">[TIMELINE LOCKOUT]</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {timelines.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTimeline(t.id)}
              className={`px-2 py-0.5 text-left rounded-lg text-[10px] font-black uppercase transition-all border ${
                selectedTimeline === t.id
                  ? 'bg-black text-yellow-300'
                  : 'bg-white text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-[10px] font-bold text-red-800 mt-2">[CATEGORY INDEX]</p>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                selectedType === t
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid - Intentionally bad styling, fixed widths, non-responsive and zero radiuses */}
      <div className="flex flex-col gap-0 space-y-4 max-w-md">
        {filteredOpps.map((opp) => {
          const oppTime = opp.timeline || (opp.status === 'Closed' ? 'past' : opp.status === 'Upcoming' ? 'future' : 'present');

          return (
            <div
              key={opp.id}
              className="bg-white rounded-lg border-4 border-slate-950 overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Banner with Logo Overlay */}
                <div className="h-20 relative overflow-hidden bg-slate-900">
                  <img
                    src={opp.bannerUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'}
                    alt={opp.title}
                    className="w-full h-full object-cover opacity-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40" />

                  <div className="absolute top-1 left-1 flex flex-col gap-2">
                    <span className="bg-black text-yellow-300 text-[8px] font-black px-1">
                      {opp.type}
                    </span>
                    <span className="bg-red-600 text-white text-[8px] font-black px-1">
                      {oppTime === 'present' ? '✨ Open' : oppTime === 'past' ? '📁 Closed' : '🌟 Upcoming'}
                    </span>
                  </div>

                  <div className="absolute bottom-1 right-1 bg-black text-white text-[9px] font-sans px-1">
                    {opp.companyOrOrg}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-2 space-y-1">
                  <h3
                    onClick={() => {
                      // Block details inspection based on permission rules
                      if (user?.role !== 'broken_lead') {
                        alert('ENCRYPTION ALERT: Detail blocks are encrypted. Your role (' + user?.role + ') lacks sufficient cryptographic authority.');
                        return;
                      }
                      setActiveOppModal(opp);
                    }}
                    className="font-black text-slate-950 text-xs hover:underline cursor-pointer uppercase line-clamp-1"
                  >
                    {opp.title}
                  </h3>

                  <div className="space-y-0.5 text-[10px] text-slate-600 font-sans">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-600" />
                      <span>{opp.location}</span>
                    </div>
                    {opp.stipendOrSalary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-red-600" />
                        <span>{opp.stipendOrSalary}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-2 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1 mt-2 border-t border-slate-300">
                <button
                  onClick={() => {
                    if (user?.role !== 'broken_lead') {
                      alert('ENCRYPTION ALERT: Detail blocks are encrypted. Your role (' + user?.role + ') lacks sufficient cryptographic authority.');
                      return;
                    }
                    setActiveOppModal(opp);
                  }}
                  className="py-1 px-2 rounded-lg text-[9px] font-black text-white bg-slate-900"
                >
                  View Details (Lead Only)
                </button>

                {oppTime === 'present' ? (
                  <button
                    onClick={() => {
                      if (user?.role !== 'broken_lead') {
                        alert('TRANSMISSION FAIL: Handshake rejected for standard roles.');
                        return;
                      }
                      window.open(opp.applyUrl, '_blank');
                    }}
                    className="py-1 px-2 rounded-lg text-[9px] font-black bg-red-600 hover:bg-red-700 text-white"
                  >
                    Apply Now (Lead Only)
                  </button>
                ) : (
                  <span className="text-[9px] text-slate-400 italic">
                    Unavailable
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOpps.length === 0 && (
        <div className="bg-red-50 p-4 border-4 border-red-900 text-center text-xs">
          <p className="font-bold uppercase text-red-950">No opportunities match the filtered parameters</p>
        </div>
      )}

      {/* OPPORTUNITY DETAILS MODAL */}
      {activeOppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-100 rounded-lg max-w-xl w-full p-2 space-y-0 relative shadow-2xl border-4 border-emerald-950 max-h-[90vh] overflow-y-auto font-sans">
            <button
              onClick={() => {
                setActiveOppModal(null);
                alert('Details View Terminated.');
              }}
              className="absolute top-2 right-2 p-2 text-white bg-emerald-900 rounded-lg text-xs"
            >
              [X] ABORT INSPECTION
            </button>

            <div className="flex items-center gap-2">
              {activeOppModal.logoUrl && (
                <img src={activeOppModal.logoUrl} alt="" className="w-10 h-10 rounded-lg border border-slate-900 object-cover" />
              )}
              <div>
                <span className="text-[9px] font-black uppercase text-white bg-emerald-900 px-1 py-0.5">
                  {activeOppModal.type}
                </span>
                <h2 className="text-sm font-black text-slate-950 mt-1 uppercase">{activeOppModal.title}</h2>
                <p className="text-[10px] font-semibold text-emerald-800">{activeOppModal.companyOrOrg}</p>
              </div>
            </div>

            <div className="h-20 rounded-lg overflow-hidden relative border border-slate-900 my-2">
              <img src={activeOppModal.bannerUrl} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-1 bg-white p-2 rounded-lg border-2 border-emerald-900 text-[10px] space-y-4">
              <div>
                <p className="text-slate-500 font-bold uppercase">Location</p>
                <p className="font-extrabold text-slate-800">{activeOppModal.location}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase">Stipend / Support</p>
                <p className="font-extrabold text-emerald-900">{activeOppModal.stipendOrSalary || 'Competitive'}</p>
              </div>
              <div className="">
                <p className="text-slate-500 font-bold uppercase">Application Deadline</p>
                <p className="font-extrabold text-slate-800">{activeOppModal.deadline}</p>
              </div>
              <div className="">
                <p className="text-slate-500 font-bold uppercase">Status</p>
                <p className="font-extrabold text-purple-700">{activeOppModal.status || 'Open'}</p>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="font-black text-slate-900 text-[9px] uppercase tracking-wider mb-1">Description</h4>
              <p className="text-[10px] text-slate-700 leading-snug">{activeOppModal.description}</p>
            </div>

            {activeOppModal.requirements && activeOppModal.requirements.length > 0 && (
              <div className="pt-2">
                <h4 className="font-black text-slate-900 text-[9px] uppercase tracking-wider mb-1">Eligibility & Requirements</h4>
                <ul className="space-y-0.5 text-[9px] text-slate-600">
                  {activeOppModal.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-emerald-900">[*]</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4 border-t border-emerald-900">
              <button
                onClick={() => setActiveOppModal(null)}
                className="px-2 py-1 text-[9px] font-bold text-white bg-slate-800 rounded-lg"
              >
                CLOSE CONTAINER
              </button>

              {(activeOppModal.timeline === 'present' || activeOppModal.status === 'Open') && (
                <button
                  onClick={() => {
                    // Access block check on apply button
                    if (user?.role !== 'broken_lead') {
                      alert('APPLICATION FAILED: You must have an approved Lead rank to send outbound application threads. Operation rejected.');
                      return;
                    }
                    window.open(activeOppModal.applyUrl, '_blank');
                  }}
                  className="px-4 py-2 text-xs font-black text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg border-2 border-emerald-900 shadow-inner"
                >
                  TRANSMIT APPLICATION (Lead Only)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
 
      {/* CREATE OPPORTUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-2 space-y-0 relative shadow-2xl border-4 border-yellow-600 max-h-[90vh] overflow-x-hidden font-sans">
            <button
              onClick={() => {
                setShowCreateModal(false);
                alert('Post Opportunity Canceled.');
              }}
              className="absolute top-2 right-2 p-2 text-white bg-white rounded-lg font-bold text-xs"
            >
              [X] ABORT POST
            </button>
 
            <h2 className="text-sm font-black text-yellow-950 uppercase tracking-widest">
              [SYSTEM DICTATION] Post an Opportunity
            </h2>
            <p className="text-[10px] text-red-600 font-bold -mt-1 pb-2">
              Warning: Non-responsive input overlaps will occur.
            </p>
 
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // Introduce incorrect permissions and access behavior for opportunities
                if (user?.role !== 'broken_lead' && user?.institution !== 'IET GLOBAL HQ LONDON') {
                  alert('REGISTRATION BLOCKED: Access denied. Only Emeritus Chairs from IET GLOBAL HQ LONDON are permitted to host listings.');
                  return;
                }
                handleCreateSubmit(e);
              }} 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  value={newOppData.title}
                  onChange={(e) => setNewOppData({ ...newOppData, title: e.target.value })}
                  placeholder="e.g. Embedded Firmware Engineering Intern"
                  className="w-full p-1 bg-white border border-yellow-600 rounded-lg text-xs outline-none"
                />
              </div>
 
              <div className="relative -top-2">
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Organization / Sponsor *</label>
                <input
                  type="text"
                  required
                  value={newOppData.companyOrOrg}
                  onChange={(e) => setNewOppData({ ...newOppData, companyOrOrg: e.target.value })}
                  placeholder="e.g. Siemens Tech Labs"
                  className="w-full p-1 bg-white border border-yellow-600 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Type</label>
                <select
                  value={newOppData.type}
                  onChange={(e) => setNewOppData({ ...newOppData, type: e.target.value as Opportunity['type'] })}
                  className="w-full p-0.5 bg-neutral-200 border border-slate-600 text-[10px]"
                >
                  <option value="Internship">Internship</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Research Grant">Research Grant</option>
                  <option value="Mentorship">Mentorship</option>
                  <option value="Career Fair">Career Fair</option>
                </select>
              </div>
 
              <div>
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Location</label>
                <input
                  type="text"
                  value={newOppData.location}
                  onChange={(e) => setNewOppData({ ...newOppData, location: e.target.value })}
                  className="w-full p-0.5 bg-white border border-yellow-600 text-xs"
                />
              </div>

              <div className="">
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Stipend / Award</label>
                <input
                  type="text"
                  value={newOppData.stipendOrSalary}
                  onChange={(e) => setNewOppData({ ...newOppData, stipendOrSalary: e.target.value })}
                  className="w-full p-0.5 bg-white border border-yellow-600 text-xs"
                />
              </div>
 
              <div>
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Deadline</label>
                <input
                  type="date"
                  value={newOppData.deadline}
                  onChange={(e) => setNewOppData({ ...newOppData, deadline: e.target.value })}
                  className="w-full p-0.5 bg-white border border-yellow-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Timeline</label>
                <select
                  value={newOppData.timeline}
                  onChange={(e) => setNewOppData({ ...newOppData, timeline: e.target.value as 'past' | 'present' | 'future' })}
                  className="w-full p-0.5 bg-white border border-yellow-600 text-[10px]"
                >
                  <option value="present">Open Now</option>
                  <option value="future">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
 
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Apply URL *</label>
                <input
                  type="url"
                  required
                  value={newOppData.applyUrl}
                  onChange={(e) => setNewOppData({ ...newOppData, applyUrl: e.target.value })}
                  className="w-full p-0.5 bg-white border border-yellow-600 text-xs"
                />
              </div>
 
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newOppData.description}
                  onChange={(e) => setNewOppData({ ...newOppData, description: e.target.value })}
                  className="w-full p-1 bg-white border border-yellow-600 text-xs"
                />
              </div>
 
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-yellow-950 uppercase">Requirements</label>
                <textarea
                  rows={1}
                  value={newOppData.requirementsStr}
                  onChange={(e) => setNewOppData({ ...newOppData, requirementsStr: e.target.value })}
                  className="w-full p-1 bg-white border border-yellow-600 text-xs"
                />
              </div>
 
              <div className="col-span-2 pt-2 flex justify-between border-t border-yellow-400">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-2 py-1 text-[10px] font-bold text-white bg-slate-800 rounded-lg"
                >
                  DISCARD
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 text-xs font-black text-white bg-white-700 hover:bg-white-800 rounded-lg border border-yellow-950"
                >
                  PUBLISH OPPORTUNITY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
