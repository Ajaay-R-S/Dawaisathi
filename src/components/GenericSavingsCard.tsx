'use client';

import React from 'react';
import { Coins, CheckCircle, ArrowRight, AlertCircle, ShoppingCart } from 'lucide-react';
import { GenericDrugInfo } from '@/types';

interface GenericSavingsCardProps {
  genericInfo: GenericDrugInfo;
}

export default function GenericSavingsCard({ genericInfo }: GenericSavingsCardProps) {
  const diff = genericInfo.brandPricePerStrip - genericInfo.genericPricePerStrip;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition">
      {/* Top Banner: Brand Name & Savings Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
            सस्ती जेनेरिक दवा (Jan Aushadhi)
          </span>
          <h4 className="text-lg font-black text-gray-900 mt-1">
            {genericInfo.brandName}
          </h4>
          <p className="text-xs text-gray-600 font-medium">
            सॉल्ट: <span className="font-bold text-gray-800">{genericInfo.genericSalt}</span>
          </p>
        </div>

        {/* Big Savings Tag */}
        <div className="bg-emerald-600 text-white rounded-xl px-3 py-1.5 text-center shadow">
          <span className="text-xs uppercase font-bold block leading-none">बचत</span>
          <span className="text-xl font-black">{genericInfo.savingsPercent}%</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-emerald-200">
        <div className="bg-white/80 p-3 rounded-xl border border-gray-200">
          <span className="text-xs text-gray-500 font-semibold block">ब्रांडेड दवा कीमत</span>
          <span className="text-base font-bold text-gray-500 line-through">
            ₹{genericInfo.brandPricePerStrip.toFixed(1)}
          </span>
          <span className="text-[11px] text-gray-400 block">प्रति पत्ता (Strip)</span>
        </div>

        <div className="bg-emerald-100/70 p-3 rounded-xl border-2 border-emerald-400">
          <span className="text-xs text-emerald-800 font-bold block">जन औषधि कीमत</span>
          <span className="text-xl font-black text-emerald-900">
            ₹{genericInfo.genericPricePerStrip.toFixed(1)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block">₹{diff.toFixed(0)} की बचत</span>
        </div>
      </div>

      {/* Jan Aushadhi Full Equivalent Name */}
      <div className="mt-3 p-2.5 bg-white/90 rounded-xl border border-emerald-200 text-xs">
        <span className="font-bold text-gray-800">जन औषधि केंद्र पर मांगें: </span>
        <span className="font-medium text-emerald-950">{genericInfo.janAushadhiName}</span>
      </div>

      {/* Mandatory Regulatory / Safety Disclaimer */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
        <span className="font-semibold">
          दवा बदलने से पहले अपने डॉक्टर या फार्मासिस्ट से परामर्श अवश्य लें। (Ask doctor/pharmacist before switching)
        </span>
      </div>
    </div>
  );
}
