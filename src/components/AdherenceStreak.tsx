'use client';

import React, { useEffect } from 'react';
import { Flame, CheckCircle2, Award, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScheduleItem } from '@/types';

interface AdherenceStreakProps {
  streakCount: number;
  schedule: ScheduleItem[];
}

export default function AdherenceStreak({ streakCount, schedule }: AdherenceStreakProps) {
  const total = schedule.length;
  const takenCount = schedule.filter((s) => s.taken).length;
  const percent = total > 0 ? Math.round((takenCount / total) * 100) : 0;

  useEffect(() => {
    // If all taken and more than 0 items, fire celebratory confetti!
    if (total > 0 && takenCount === total) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#f59e0b', '#3b82f6'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [takenCount, total]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Streak Flame Counter */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200">
            <Flame className="w-8 h-8 fill-current animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900">
                {streakCount} दिन लगातार
              </span>
              <span className="text-xs bg-amber-100 text-amber-900 font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                Streak!
              </span>
            </div>
            <p className="text-xs text-gray-500 font-semibold">
              आपने समय पर दवा लेने का शानदार रिकॉर्ड बनाया है।
            </p>
          </div>
        </div>

        {/* Today's Progress Badge */}
        <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200">
          <Award className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <span className="text-xs text-emerald-800 font-bold block uppercase tracking-wider">
              आज की दवाइयां
            </span>
            <span className="text-base font-black text-emerald-950">
              {takenCount} / {total} ली गई ({percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1.5 font-bold">
          <span>0%</span>
          <span>{percent === 100 ? '🎉 आज का लक्ष्य पूरा!' : `${total - takenCount} दवा बाकी`}</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
