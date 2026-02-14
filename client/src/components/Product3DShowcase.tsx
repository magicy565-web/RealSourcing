import React from 'react';
import { useMouseFollow } from '../hooks/useMouseFollow';
import { GlassCard } from './GlassCard';
import { Video, Users, CheckCircle, Clock, BarChart, Globe } from 'lucide-react';

export function Product3DShowcase() {
  const { rotation, containerRef } = useMouseFollow({ smoothing: 0.08 });

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto aspect-[16/10] perspective-[1500px] group py-12"
    >
      <div 
        className="w-full h-full relative transition-transform duration-300 ease-out preserve-3d"
        style={{
          transform: `rotateX(${rotation.x * 0.6}deg) rotateY(${rotation.y * 0.4}deg)`,
        }}
      >
        {/* Main Dashboard UI Mockup - Re-engineered for Artistry */}
        <div className="absolute inset-0 bg-[#0d1117] rounded-2xl border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden backface-hidden">
          {/* Header */}
          <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0c10]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-white/60">Sourcing Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10"></div>
              <div className="w-24 h-3 bg-white/5 rounded-full"></div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 grid grid-cols-12 gap-6">
            {/* Stats Grid */}
            <div className="col-span-12 grid grid-cols-4 gap-4 mb-2">
              {[
                { label: 'Live Webinars', value: '1', icon: <Video className="w-4 h-4 text-red-400" />, bg: 'bg-red-400/10' },
                { label: 'Factories', value: '6', icon: <Users className="w-4 h-4 text-blue-400" />, bg: 'bg-blue-400/10' },
                { label: 'Participants', value: '6', icon: <Globe className="w-4 h-4 text-green-400" />, bg: 'bg-green-400/10' },
                { label: 'Pending', value: '3', icon: <Clock className="w-4 h-4 text-yellow-400" />, bg: 'bg-yellow-400/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold font-serif">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Main List */}
            <div className="col-span-8 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold tracking-tight">Recent Sourcing Events</h4>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest cursor-pointer hover:text-purple-300 transition-colors">View All</span>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'TikTok Hot Products Sourcing', date: 'Feb 15, 2026', status: 'Scheduled', color: 'text-blue-400' },
                  { title: 'LED Lighting Solutions 2026', date: 'Feb 22, 2026', status: 'Scheduled', color: 'text-blue-400' },
                  { title: 'Consumer Electronics Q1 Fair', date: 'Feb 17, 2026', status: 'Scheduled', color: 'text-blue-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                        <Video className="w-5 h-5 text-white/20" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.title}</div>
                        <div className="text-[10px] text-white/30">{item.date}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold ${item.color} px-2 py-1 bg-white/5 rounded-md`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Activity */}
            <div className="col-span-4 space-y-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 h-full">
                <h4 className="text-sm font-bold mb-6 tracking-tight">Pending Approvals</h4>
                <div className="space-y-4">
                  {[
                    { name: 'Ahmed Hassan', company: 'ME Trading LLC', type: 'Buyer' },
                    { name: 'Maria Garcia', company: 'LatAm Goods', type: 'Buyer' },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/50 flex items-center justify-center text-[10px] font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-grow">
                        <div className="text-[10px] font-bold">{user.name}</div>
                        <div className="text-[8px] text-white/30">{user.company}</div>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">{user.type}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold hover:bg-white/10 transition-all">
                  Manage All Reviews
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Detail Elements - Artistic Perspective */}
        <div 
          className="absolute -right-12 top-24 transition-transform duration-500"
          style={{ transform: `translateZ(100px)` }}
        >
          <GlassCard className="p-4 border-purple-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold">Verified Factory</div>
                <div className="text-[8px] text-white/40">KUKA Home Furniture</div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div 
          className="absolute -left-10 bottom-32 transition-transform duration-500"
          style={{ transform: `translateZ(150px)` }}
        >
          <GlassCard className="p-4 border-blue-500/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BarChart className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold">Order Conversion</div>
                <div className="text-[8px] text-white/40">+24% vs last quarter</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Glow & Reflection Effects */}
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-3xl opacity-5 -z-10 group-hover:opacity-10 transition-opacity"></div>
        
        {/* Subtle Reflection below the main element */}
        <div 
          className="absolute -bottom-12 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/5 to-transparent blur-xl pointer-events-none opacity-50"
          style={{ transform: 'rotateX(90deg) translateZ(-40px)' }}
        ></div>
      </div>
    </div>
  );
}
