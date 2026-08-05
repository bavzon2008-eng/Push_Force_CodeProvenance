import React, { useState } from 'react';
import { User } from '../types';
import { MapPin, Mail, Github, Linkedin, ShieldCheck } from 'lucide-react';

interface MembersViewProps {
  members: User[];
  searchQuery: string;
  user: User | null;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  searchQuery,
  user,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('All');

  // Get unique cities
  const cities = [
    'All',
    ...Array.from(
      new Set(
        members
          .map((member) => member.city)
          .filter((city): city is string => Boolean(city))
      )
    ),
  ];

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesCity =
      selectedCity === 'All' || member.city === selectedCity;

    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      member.username?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.institution?.toLowerCase().includes(query) ||
      member.skills?.some((skill) =>
        skill.toLowerCase().includes(query)
      );

    return matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-12 animate-fadeIn p-1 font-mono">
      {/* Header */}
      <div className="flex flex-col gap-2 bg-yellow-200 p-2 rounded-none border-8 border-double border-yellow-800">
        <div>
          <h1 className="text-lg font-black uppercase text-red-900">
            Member Directory [RESTRICTED]
          </h1>

          <p className="text-[10px] text-yellow-950 mt-1">
            Connect with student engineers, researchers, and chapter leads.
            Security masking is enabled by default.
          </p>
        </div>
      </div>

      {/* Security Alert */}
      {user?.role !== 'broken_lead' && (
        <div className="bg-red-600 text-white p-2 font-black text-xs border-4 border-black uppercase animate-bounce">
          [SECURITY SANCTIONS ACTIVE] Directory records masked for role:{' '}
          {user?.role || 'anonymous'}. Peer handshake disabled.
        </div>
      )}

      {/* City Filters */}
      {cities.length > 1 && (
        <div className="flex flex-col gap-1 border-4 border-dashed border-yellow-600 p-2 bg-yellow-50">
          <p className="text-[10px] font-bold text-yellow-800">
            [CHAPTER LOCATIONS]
          </p>

          <div className="flex flex-col sm:flex-row gap-1">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-2 py-1 rounded-none text-[10px] font-black uppercase border transition-all ${
                  selectedCity === city
                    ? 'bg-black text-yellow-300'
                    : 'bg-white text-slate-600 hover:bg-yellow-100'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="border p-4 bg-white shadow-sm rounded"
            >
              <h2 className="font-bold">{member.username}</h2>
              <p>{member.email}</p>
              <p>{member.city}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No members found.
          </p>
        )}
      </div>
    </div>
  );
};