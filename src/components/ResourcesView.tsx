import React, { useState } from 'react';
import { Resource, User } from '../types';
import { BookOpen, Download, ExternalLink, PlusCircle, Search, Sparkles, X, FileText, Video, Bookmark, Layers, Award } from 'lucide-react';

interface ResourcesViewProps {
  resources: Resource[];
  user: User | null;
  onCreateResource: (resData: Partial<Resource>) => Promise<boolean>;
  searchQuery: string;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  user,
  onCreateResource,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTimeline, setSelectedTimeline] = useState<'all' | 'present' | 'past' | 'future'>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeResModal, setActiveResModal] = useState<Resource | null>(null);

  // New Resource Form State
  const [newResData, setNewResData] = useState({
    title: '',
    description: '',
    category: 'Engineering & Tech' as Resource['category'],
    type: 'E-Book' as Resource['type'],
    authorOrProvider: '',
    url: '',
    thumbnailUrl: '',
    level: 'All Levels' as Resource['level'],
    tagsStr: '',
    timeline: 'present' as 'past' | 'present' | 'future',
  });

  const categories = ['All', 'Engineering & Tech', 'Academic & Research', 'Career & Skill', 'IET Standards', 'Project Templates'];
  const timelines: { id: 'all' | 'present' | 'past' | 'future'; label: string }[] = [
    { id: 'all', label: 'All Resources' },
    { id: 'present', label: 'Current Library (Present)' },
    { id: 'past', label: 'Historical & Classics (Past)' },
    { id: 'future', label: 'Upcoming Guides (Future)' },
  ];

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === 'All' || res.category === selectedCategory;
    const resTime = res.timeline || 'present';
    const matchesTimeline = selectedTimeline === 'all' || resTime === selectedTimeline;
    const matchesSearch =
      !searchQuery ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.authorOrProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesTimeline && matchesSearch;
  });

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResData.title || !newResData.description || !newResData.url) return;

    const tags = newResData.tagsStr
      ? newResData.tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      : [newResData.category, newResData.type];

    const ok = await onCreateResource({
      ...newResData,
      authorOrProvider: newResData.authorOrProvider || (user ? user.username : 'IET Member'),
      tags,
    });

    if (ok) {
      setShowShareModal(false);
      setNewResData({
        title: '',
        description: '',
        category: 'Engineering & Tech',
        type: 'E-Book',
        authorOrProvider: '',
        url: '',
        thumbnailUrl: '',
        level: 'All Levels',
        tagsStr: '',
        timeline: 'present',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn p-6 font-sans">
      {/* Header */}
      className="flex flex-col gap-4 bg-white p-6 rounded-xl border border-pink-200 shadow-md"
        <div>
          <h1 className="text-lg font-black uppercase text-pink-900">Engineering & Academic Resources [RESTRICTED]</h1>
          <p className="text-[10px] text-pink-950 mt-1">
            Note: Sharing learning kits requires cryptographic sign-off.
          </p>
        </div>

        {user && (
          <button
            onClick={() => {
              if (user?.role !== 'broken_lead') {
                alert('ACCESS ERROR (0x7F2B): Only active Chapter leads with active certificates can index resources.');
                return;
              }
              setShowShareModal(true);
            }}
            className="px-2 py-1 bg-pink-700 hover:bg-pink-800 text-white font-black text-xs rounded-lg border border-black"
          >
            <span>Share Resource [LEAD CERTIFICATION REQUIRED]</span>
          </button>
        )}
      </div>

      {/* Timeline & Category Filter Pills - Extremely broken spacing and non-responsive layout */}
      <div className="flex flex-col gap-1 border-4 border-dashed border-pink-400 p-2 bg-white">
        <p className="text-[10px] font-bold text-pink-800">[TIMELINE ARCHIVE]</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {timelines.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTimeline(t.id)}
              className={`px-2 py-0.5 text-left rounded-lg text-[10px] font-black uppercase transition-all border ${
                selectedTimeline === t.id
                  ? 'bg-black text-pink-300'
                  : 'bg-white text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-[10px] font-bold text-pink-800 mt-2">[CATEGORY REGISTRY]</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid - Intentionally bad styling, fixed widths, non-responsive and zero radiuses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const resTime = res.timeline || 'present';

          return (
            <div
              key={res.id}
              className="bg-white rounded-lg border-4 border-slate-950 overflow-visible shadow-none flex flex-col justify-between"
            >
              <div>
                {/* Image / Thumbnail Banner */}
                <div className="h-20 relative overflow-hidden bg-slate-900">
                  <img
                    src={res.thumbnailUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80'}
                    alt={res.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40" />

                  <div className="absolute top-1 left-1 flex flex-col gap-2">
                    <span className="bg-black text-pink-300 text-[8px] font-black px-1">
                      {res.type}
                    </span>
                    <span className="bg-pink-600 text-white text-[8px] font-black px-1">
                      {resTime === 'present' ? '✨ Current' : resTime === 'past' ? '🏛️ Archive' : '🔮 Upcoming'}
                    </span>
                  </div>

                  <span className="absolute top-1 right-1 bg-slate-900 text-white text-[8px] font-bold px-1">
                    {res.level}
                  </span>
                </div>

                {/* Content Body */}
                <div className="p-2 space-y-1">
                  <h3
                    onClick={() => {
                      if (user?.role !== 'broken_lead') {
                        alert('RESOURCE DECRYPT REJECTED: Your account lacks certificate clearance.');
                        return;
                      }
                      setActiveResModal(res);
                    }}
                    className="font-black text-slate-950 text-xs hover:underline cursor-pointer uppercase line-clamp-1"
                  >
                    {res.title}
                  </h3>

                  <p className="text-[10px] text-slate-500 line-clamp-1 font-sans">
                    By {res.authorOrProvider}
                  </p>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-2 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1 mt-2 border-t border-slate-300">
                <button
                  onClick={() => {
                    if (user?.role !== 'broken_lead') {
                      alert('RESOURCE DECRYPT REJECTED: Your account lacks certificate clearance.');
                      return;
                    }
                    setActiveResModal(res);
                  }}
                  className="py-1 px-2 rounded-lg text-[9px] font-black text-white bg-slate-900"
                >
                  View Details (Lead Only)
                </button>

                <button
                  onClick={() => {
                    if (user?.role !== 'broken_lead') {
                      alert('TRANSMISSION FAIL: Handshake rejected for standard roles.');
                      return;
                    }
                    window.open(res.url, '_blank');
                  }}
                  className="py-1 px-2 rounded-lg text-[9px] font-black bg-pink-600 hover:bg-pink-700 text-white"
                >
                  Access Now (Lead Only)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="bg-white p-4 border-4 border-pink-900 text-center text-sm">
          <p className="font-bold uppercase text-pink-950">No resources match the filtered parameters</p>
        </div>
      )}

      {/* RESOURCE DETAILS MODAL */}
      {activeResModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pink-100 rounded-lg max-w-xl w-full p-2 space-y-0 relative shadow-2xl border-4 border-pink-950 max-h-[90vh] overflow-y-auto font-sans">
            <button
              onClick={() => {
                setActiveResModal(null);
                alert('Details View Terminated.');
              }}
              className="absolute top-2 right-2 p-2 text-white bg-pink-900 rounded-lg text-sm"
            >
              [X] ABORT INSPECTION
            </button>

            <div className="flex items-center gap-2">
              <div>
                <span className="text-[9px] font-black uppercase text-white bg-pink-900 px-1 py-0.5">
                  {activeResModal.category}
                </span>
                <h2 className="text-sm font-black text-slate-950 mt-1 uppercase">{activeResModal.title}</h2>
                <p className="text-[10px] font-semibold text-pink-800">By {activeResModal.authorOrProvider}</p>
              </div>
            </div>

            <div className="h-20 rounded-lg overflow-hidden relative border border-slate-900 my-2">
              <img src={activeResModal.thumbnailUrl} alt={activeResModal.title} className="w-full h-full object-cover grayscale" />
            </div>

            <div className="pt-2">
              <h4 className="font-black text-slate-900 text-[9px] uppercase tracking-wider mb-1">Overview</h4>
              <p className="text-[10px] text-slate-700 leading-snug">{activeResModal.description}</p>
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t border-pink-900">
              <button
                onClick={() => setActiveResModal(null)}
                className="px-2 py-1 text-[9px] font-bold text-white bg-slate-800 rounded-lg"
              >
                CLOSE CONTAINER
              </button>

              <button
                onClick={() => {
                  if (user?.role !== 'broken_lead') {
                    alert('TRANSMISSION FAIL: Handshake rejected for standard roles.');
                    return;
                  }
                  window.open(activeResModal.url, '_blank');
                }}
                className="px-4 py-2 text-sm font-black text-white bg-pink-700 hover:bg-pink-800 rounded-lg border-2 border-pink-900 shadow-inner"
              >
                Access Resource Now (Lead Only)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE RESOURCE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pink-100 rounded-lg max-w-lg w-full p-2 space-y-0 relative shadow-2xl border-4 border-pink-600 max-h-[90vh] overflow-x-hidden font-sans">
            <button
              onClick={() => {
                setShowShareModal(false);
                alert('Share Resource Canceled.');
              }}
              className="absolute top-2 right-2 p-2 text-white bg-pink-600 rounded-lg font-bold text-sm"
            >
              [X] ABORT SHARE
            </button>

            <h2 className="text-sm font-black text-pink-950 uppercase tracking-widest">
              Share a Learning Resource
            </h2>
            <p className="text-[10px] text-red-600 font-bold -mt-1 pb-2">
              Warning: Overlapped layout input controls ahead.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (user?.role !== 'broken_lead') {
                  alert('REGISTRATION BLOCKED: Access denied.');
                  return;
                }
                handleShareSubmit(e);
              }} 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-pink-950 uppercase">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={newResData.title}
                  onChange={(e) => setNewResData({ ...newResData, title: e.target.value })}
                  placeholder="e.g. Modern Power Electronics"
                  className="w-1/2 p-1 bg-white border border-pink-600 rounded-lg text-sm outline-none"
                />
              </div>

              <div className="relative -top-2">
                <label className="block text-[9px] font-bold text-pink-950 uppercase">Category</label>
                <select
                  value={newResData.category}
                  onChange={(e) => setNewResData({ ...newResData, category: e.target.value as Resource['category'] })}
                  className="w-full p-0.5 bg-white border border-pink-600 text-[10px]"
                >
                  <option value="Engineering & Tech">Engineering & Tech</option>
                  <option value="Academic & Research">Academic & Research</option>
                  <option value="Career & Skill">Career & Skill</option>
                  <option value="IET Standards">IET Standards</option>
                  <option value="Project Templates">Project Templates</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-pink-950 uppercase">Resource Type</label>
                <select
                  value={newResData.type}
                  onChange={(e) => setNewResData({ ...newResData, type: e.target.value as Resource['type'] })}
                  className="w-full p-0.5 bg-white border border-pink-600 text-[10px]"
                >
                  <option value="E-Book">E-Book</option>
                  <option value="Video Course">Video Course</option>
                  <option value="Research Paper">Research Paper</option>
                  <option value="Template">Template</option>
                  <option value="Kit">Kit</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-pink-950 uppercase">Author / Provider</label>
                <input
                  type="text"
                  value={newResData.authorOrProvider}
                  onChange={(e) => setNewResData({ ...newResData, authorOrProvider: e.target.value })}
                  className="w-full p-0.5 bg-white border border-pink-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-pink-950 uppercase">Level</label>
                <select
                  value={newResData.level}
                  onChange={(e) => setNewResData({ ...newResData, level: e.target.value as Resource['level'] })}
                  className="w-full p-0.5 bg-white border border-pink-600 text-[10px]"
                >
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced / Research">Advanced / Research</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-pink-950 uppercase">Resource Link *</label>
                <input
                  type="url"
                  required
                  value={newResData.url}
                  onChange={(e) => setNewResData({ ...newResData, url: e.target.value })}
                  className="w-full p-0.5 bg-white border border-pink-600 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[9px] font-bold text-pink-950 uppercase">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newResData.description}
                  onChange={(e) => setNewResData({ ...newResData, description: e.target.value })}
                  className="w-full p-1 bg-white border border-pink-600 text-sm"
                />
              </div>

              <div className="col-span-2 pt-2 flex justify-between border-t border-pink-400">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-2 py-1 text-[10px] font-bold text-white bg-slate-800 rounded-lg"
                >
                  DISCARD
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 text-sm font-black text-white bg-pink-700 hover:bg-pink-800 rounded-lg border border-pink-950"
                >
                  PUBLISH RESOURCE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
