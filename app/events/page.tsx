"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, X } from "lucide-react";
import { scheduledEvents as events, ScheduledEvent } from "@/lib/events-schedule";

export default function EventsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Start in July 2026
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null); // State for popup
  
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Helper to check if a day has events
  const getEventsForDay = (day: number) => {
    return events.filter(e => 
      e.date.getDate() === day && 
      e.date.getMonth() === currentDate.getMonth() && 
      e.date.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-16 relative overflow-hidden">

      {/* Ambient decoration comes from the global FloatingBackground (trimmed on this route) —
          this page previously layered ~55 of its own perpetually-animating elements on top of it. */}

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <div className="inline-flex items-center justify-center p-4 bg-cyan-400/10 text-cyan-400 rounded-full mb-6 border border-cyan-400/20">
                <CalendarIcon size={32} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-400">Calendar</span>
            </h1>
            <p className="text-xl text-neutral-400">
                Stay updated with workshops, hackathons, and community meetups.
            </p>
        </motion.div>


        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Calendar View */}
          <div className="lg:col-span-2 glass-subtle p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} aria-label="Previous month" className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                  <ChevronLeft aria-hidden="true" size={20} />
                </button>
                <button onClick={nextMonth} aria-label="Next month" className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                  <ChevronRight aria-hidden="true" size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center font-medium text-neutral-500 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square p-2 rounded-xl bg-neutral-900/20" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                
                return (
                  <div 
                    key={day} 
                    onClick={() => { if (dayEvents.length > 0) setSelectedEvent(dayEvents[0]); }}
                    className={`aspect-square p-2 rounded-xl border flex flex-col transition-all cursor-pointer hover:border-cyan-400/50 ${
                      isToday ? 'bg-cyan-400/10 border-cyan-400/30' : 'bg-neutral-900/40 border-neutral-800'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isToday ? 'text-cyan-300' : 'text-neutral-300'}`}>{day}</span>
                    <div className="mt-auto space-y-1">
                      {dayEvents.map(e => (
                        <div key={e.id} className="w-full h-1.5 bg-cyan-400 rounded-full" title={e.title} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events List */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Upcoming Events</h3>
            {events.filter(e => e.date >= currentDate).sort((a,b) => a.date.getTime() - b.date.getTime()).slice(0, 3).map((event, i) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-subtle p-6 rounded-2xl group hover:border-cyan-400/30 transition-colors"
              >
                <div className="text-sm font-bold text-cyan-300 mb-2 uppercase tracking-wider">{event.category}</div>
                <h4 className="text-xl font-bold mb-4 group-hover:text-cyan-300 transition-colors">{event.title}</h4>
                
                <div className="space-y-3 text-neutral-400 text-sm">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={16} className="text-neutral-500" />
                    <span>{event.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-neutral-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-neutral-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-strong p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-sm font-bold text-cyan-300 mb-2 uppercase tracking-wider">
                {selectedEvent.category}
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">
                {selectedEvent.title}
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-neutral-300">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                    <CalendarIcon size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Date</div>
                    <div className="text-sm">{selectedEvent.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-neutral-300">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                    <Clock size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Time</div>
                    <div className="text-sm">{selectedEvent.time}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-neutral-300">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                    <MapPin size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Location</div>
                    <div className="text-sm">{selectedEvent.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-neutral-300">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                    <Users size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">POC</div>
                    <div className="text-sm">{selectedEvent.poc}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-cyan-100 text-sm leading-relaxed">
                {selectedEvent.description}
              </div>
              
              <button 
                onClick={() => setSelectedEvent(null)}
                className="w-full mt-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
