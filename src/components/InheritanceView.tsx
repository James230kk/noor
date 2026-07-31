import React, { useState } from 'react';
import { HeirInput } from '../types';
import { calculateIslamicInheritance } from '../utils/inheritanceEngine';
import { Users, FileText, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export const InheritanceView: React.FC = () => {
  const [estate, setEstate] = useState<number>(100000);
  const [funeral, setFuneral] = useState<number>(2000);
  const [debts, setDebts] = useState<number>(3000);
  const [bequests, setBequests] = useState<number>(5000);

  const [heirInputs, setHeirInputs] = useState<HeirInput>({
    husband: false,
    wifeCount: 1,
    father: true,
    mother: true,
    sons: 2,
    daughters: 1,
    paternalGrandfather: false,
    paternalGrandmother: false,
    maternalGrandmother: false,
    fullBrothers: 0,
    fullSisters: 0,
    paternalBrothers: 0,
    paternalSisters: 0,
    maternalBrothersSisters: 0
  });

  const result = calculateIslamicInheritance(estate, funeral, debts, bequests, heirInputs);

  const updateHeir = <K extends keyof HeirInput>(key: K, val: HeirInput[K]) => {
    setHeirInputs(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <Users className="w-3.5 h-3.5" />
          <span>Fara'id & Mawarith • علم الفرائض والمواريث</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">Islamic Inheritance Calculator</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3]">
          Sharia-compliant division of estate according to classical Islamic jurisprudence (Quran 4:11-12, 4:176).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-1 space-y-5 bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] shadow-xs text-xs">
          {/* Estate & Debts */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#3A4D39] border-b pb-2 border-[#E6E1D3] uppercase tracking-wider">
              1. Estate & Obligations
            </h3>

            <div>
              <label className="block text-[#8C8474] mb-1 font-serif">Gross Estate Value ($)</label>
              <input
                type="number"
                value={estate || ''}
                onChange={(e) => setEstate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm font-bold focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#8C8474] mb-1 font-serif">Funeral Cost ($)</label>
                <input
                  type="number"
                  value={funeral || ''}
                  onChange={(e) => setFuneral(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B]"
                />
              </div>
              <div>
                <label className="block text-[#8C8474] mb-1 font-serif">Unpaid Debts ($)</label>
                <input
                  type="number"
                  value={debts || ''}
                  onChange={(e) => setDebts(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#8C8474] mb-1 font-serif">Wasiyyah / Bequests (Max 1/3) ($)</label>
              <input
                type="number"
                value={bequests || ''}
                onChange={(e) => setBequests(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B]"
              />
            </div>
          </div>

          {/* Surviving Heirs Form */}
          <div className="space-y-3 pt-3 border-t border-[#E6E1D3]">
            <h3 className="font-serif font-bold text-sm text-[#3A4D39] border-b pb-2 border-[#E6E1D3] uppercase tracking-wider">
              2. Surviving Relatives
            </h3>

            {/* Spouses */}
            <div className="space-y-2">
              <span className="font-serif font-semibold text-[#C5A059] block">Spouse</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer font-serif">
                  <input
                    type="checkbox"
                    checked={heirInputs.husband}
                    onChange={(e) => {
                      updateHeir('husband', e.target.checked);
                      if (e.target.checked) updateHeir('wifeCount', 0);
                    }}
                  />
                  <span>Husband</span>
                </label>

                {!heirInputs.husband && (
                  <div className="flex items-center gap-1 font-serif">
                    <span>Wives:</span>
                    <select
                      value={heirInputs.wifeCount}
                      onChange={(e) => updateHeir('wifeCount', parseInt(e.target.value, 10))}
                      className="p-1 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B]"
                    >
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Parents & Children */}
            <div className="grid grid-cols-2 gap-2 pt-2 font-serif">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heirInputs.father}
                  onChange={(e) => updateHeir('father', e.target.checked)}
                />
                <span>Father</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heirInputs.mother}
                  onChange={(e) => updateHeir('mother', e.target.checked)}
                />
                <span>Mother</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 font-serif">
              <div>
                <label className="block text-[#8C8474] mb-1">Sons Count</label>
                <input
                  type="number"
                  min="0"
                  value={heirInputs.sons}
                  onChange={(e) => updateHeir('sons', parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B]"
                />
              </div>
              <div>
                <label className="block text-[#8C8474] mb-1">Daughters Count</label>
                <input
                  type="number"
                  min="0"
                  value={heirInputs.daughters}
                  onChange={(e) => updateHeir('daughters', parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B]"
                />
              </div>
            </div>

            {/* Siblings */}
            <div className="grid grid-cols-2 gap-2 pt-2 font-serif">
              <div>
                <label className="block text-[#8C8474] mb-1">Full Brothers</label>
                <input
                  type="number"
                  min="0"
                  value={heirInputs.fullBrothers}
                  onChange={(e) => updateHeir('fullBrothers', parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B]"
                />
              </div>
              <div>
                <label className="block text-[#8C8474] mb-1">Full Sisters</label>
                <input
                  type="number"
                  min="0"
                  value={heirInputs.fullSisters}
                  onChange={(e) => updateHeir('fullSisters', parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Breakdown */}
        <div className="lg:col-span-2 space-y-5">
          {/* Distributable Net Summary */}
          <div className="bg-[#3A4D39] text-[#F9F7F2] p-6 rounded-sm border border-[#3A4D39] shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#C5A059] uppercase tracking-wider">
              Estate Distribution Calculation
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F9F7F2]/10 rounded-sm border border-[#F9F7F2]/20 font-serif">
                <span className="block text-[10px] text-[#A8B5A3] uppercase">Gross Estate</span>
                <strong className="text-[#F9F7F2] text-base font-sans">${estate.toLocaleString()}</strong>
              </div>
              <div className="p-3 bg-[#F9F7F2]/10 rounded-sm border border-[#F9F7F2]/20 font-serif">
                <span className="block text-[10px] text-red-300 uppercase">Debts & Expenses</span>
                <strong className="text-red-300 text-base font-sans">-${(funeral + debts).toLocaleString()}</strong>
              </div>
              <div className="p-3 bg-[#F9F7F2]/10 rounded-sm border border-[#F9F7F2]/20 font-serif">
                <span className="block text-[10px] text-[#C5A059] uppercase">Approved Bequest</span>
                <strong className="text-[#C5A059] text-base font-sans">-${result.bequests.toLocaleString()}</strong>
              </div>
              <div className="p-3 bg-[#C5A059]/20 rounded-sm border border-[#C5A059]/40 font-serif">
                <span className="block text-[10px] text-[#C5A059] uppercase">Net Distributable</span>
                <strong className="text-[#C5A059] text-base font-sans">${result.netEstate.toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-xs text-[#A8B5A3] italic font-serif">{result.explanation}</p>
          </div>

          {/* Heirs Table */}
          <div className="bg-[#FFFFFF] rounded-sm p-6 border border-[#E6E1D3] shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-base text-[#3A4D39] flex items-center justify-between">
              <span>Heirs Distribution Table</span>
              <span className="text-xs text-[#C5A059] font-sans font-normal">{result.heirs.length} Heir(s) Eligible</span>
            </h4>

            {result.heirs.length === 0 ? (
              <div className="text-center py-8 text-[#8C8474] font-serif">Select surviving relatives to view Sharia inheritance shares.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E1D3] text-[#8C8474] font-serif uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">Heir</th>
                      <th className="py-2.5 px-3">Share Fraction</th>
                      <th className="py-2.5 px-3">Percentage</th>
                      <th className="py-2.5 px-3">Amount ($)</th>
                      <th className="py-2.5 px-3">Proof / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1D3]">
                    {result.heirs.map((heir, idx) => (
                      <tr key={idx} className="hover:bg-[#F9F7F2] transition-colors">
                        <td className="py-3 px-3 font-serif font-bold text-[#3A4D39] flex items-center gap-2">
                          <span>{heir.name}</span>
                          <span className="font-arabic font-normal text-[#C5A059]">{heir.arabicName}</span>
                        </td>
                        <td className="py-3 px-3 text-[#C5A059] font-serif font-semibold">{heir.shareFraction}</td>
                        <td className="py-3 px-3 font-sans font-medium text-[#2C332B]">{(heir.shareDecimal * 100).toFixed(2)}%</td>
                        <td className="py-3 px-3 font-serif font-bold text-[#3A4D39]">${heir.amount.toLocaleString()}</td>
                        <td className="py-3 px-3 text-[#5C635A] font-serif text-[11px]">{heir.notes} ({heir.quranicEvidence})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
