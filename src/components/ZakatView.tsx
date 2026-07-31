import React, { useState } from 'react';
import { ZakatInputs } from '../types';
import { calculateZakat } from '../utils/zakatCalculator';
import { Calculator, Coins, ShieldCheck, Info, Sparkles, HelpCircle } from 'lucide-react';

export const ZakatView: React.FC = () => {
  const [inputs, setInputs] = useState<ZakatInputs>({
    cashOnHand: 2500,
    cashInBank: 7500,
    goldGram24k: 20,
    goldGram22k: 0,
    goldGram21k: 0,
    goldGram18k: 0,
    silverGrams: 100,
    stocksCrypto: 1500,
    businessGoods: 0,
    receivables: 0,
    shortTermDebts: 500,
    goldPricePerGram24k: 75,
    silverPricePerGram: 0.9
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'categories'>('calculator');

  const result = calculateZakat(inputs);

  const updateField = (field: keyof ZakatInputs, val: number) => {
    setInputs(prev => ({ ...prev, [field]: Math.max(0, val) }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#3A4D39] text-[#F9F7F2] p-8 rounded-sm border border-[#3A4D39] shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#F9F7F2]/10 text-[#C5A059] px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#F9F7F2]/20">
          <Calculator className="w-3.5 h-3.5" />
          <span>Third Pillar of Islam • حاسبة الزكاة</span>
        </div>
        <h2 className="text-3xl font-serif text-[#F9F7F2]">Comprehensive Zakat Calculator</h2>
        <p className="text-xs font-serif italic text-[#A8B5A3]">
          Calculate your obligatory Zakat (2.5%) across cash, gold, silver, stocks, crypto, and business assets against live Nisab limits.
        </p>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E6E1D3] pb-2">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'calculator' 
              ? 'bg-[#3A4D39] text-[#F9F7F2] shadow-xs' 
              : 'bg-[#F9F7F2] text-[#5C635A] border border-[#E6E1D3]'
          }`}
        >
          Calculator
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'categories' 
              ? 'bg-[#3A4D39] text-[#F9F7F2] shadow-xs' 
              : 'bg-[#F9F7F2] text-[#5C635A] border border-[#E6E1D3]'
          }`}
        >
          8 Eligible Categories (Surah At-Tawbah 9:60)
        </button>
      </div>

      {activeTab === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-5 bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] shadow-xs">
            <h3 className="font-serif font-bold text-base text-[#3A4D39] flex items-center justify-between border-b pb-3 border-[#E6E1D3]">
              <span>Your Wealth & Assets</span>
              <span className="text-xs text-[#C5A059] font-sans font-normal">Held for 1 Lunar Year (Hawl)</span>
            </h3>

            {/* Cash & Bank */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8474]">1. Cash & Bank Savings ($)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">Cash on Hand ($)</label>
                  <input
                    type="number"
                    value={inputs.cashOnHand || ''}
                    onChange={(e) => updateField('cashOnHand', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">Cash in Bank / Deposit ($)</label>
                  <input
                    type="number"
                    value={inputs.cashInBank || ''}
                    onChange={(e) => updateField('cashInBank', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>
            </div>

            {/* Gold & Silver */}
            <div className="space-y-3 pt-2 border-t border-[#E6E1D3]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8474]">2. Gold & Silver (in Grams)</span>
                <span className="text-[11px] text-[#C5A059] font-serif">Gold: ${inputs.goldPricePerGram24k}/g • Silver: ${inputs.silverPricePerGram}/g</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">24K Gold (grams)</label>
                  <input
                    type="number"
                    value={inputs.goldGram24k || ''}
                    onChange={(e) => updateField('goldGram24k', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">22K Gold (grams)</label>
                  <input
                    type="number"
                    value={inputs.goldGram22k || ''}
                    onChange={(e) => updateField('goldGram22k', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">21K Gold (grams)</label>
                  <input
                    type="number"
                    value={inputs.goldGram21k || ''}
                    onChange={(e) => updateField('goldGram21k', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">Silver (grams)</label>
                  <input
                    type="number"
                    value={inputs.silverGrams || ''}
                    onChange={(e) => updateField('silverGrams', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Investments & Business */}
            <div className="space-y-3 pt-2 border-t border-[#E6E1D3]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8474]">3. Investments & Business Assets ($)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">Stocks, Crypto, Funds ($)</label>
                  <input
                    type="number"
                    value={inputs.stocksCrypto || ''}
                    onChange={(e) => updateField('stocksCrypto', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">Business Inventory Value ($)</label>
                  <input
                    type="number"
                    value={inputs.businessGoods || ''}
                    onChange={(e) => updateField('businessGoods', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#8C8474] mb-1 font-serif">Money Owed to You ($)</label>
                  <input
                    type="number"
                    value={inputs.receivables || ''}
                    onChange={(e) => updateField('receivables', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-sm border border-[#E6E1D3] bg-[#F9F7F2] text-[#2C332B] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Debts */}
            <div className="pt-2 border-t border-[#E6E1D3]">
              <label className="block text-xs font-bold text-red-700 mb-1 font-serif uppercase tracking-wider">4. Deduct Immediate Short-Term Debts ($)</label>
              <input
                type="number"
                value={inputs.shortTermDebts || ''}
                onChange={(e) => updateField('shortTermDebts', parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-sm border border-red-200 bg-red-50/20 text-sm text-red-900"
              />
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="space-y-4">
            <div className="bg-[#3A4D39] text-[#F9F7F2] p-6 rounded-sm border border-[#3A4D39] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base uppercase tracking-wider text-[#C5A059] border-b pb-2 border-[#ffffff15]">
                Zakat Calculation Summary
              </h3>

              <div className="space-y-2 text-xs font-serif">
                <div className="flex justify-between">
                  <span className="text-[#A8B5A3]">Net Zakatable Assets:</span>
                  <strong className="text-[#F9F7F2] font-sans">${result.netZakatableAssets.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A8B5A3]">Gold Nisab Threshold (85g):</span>
                  <strong className="text-[#C5A059] font-sans">${result.nisabGoldValue.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A8B5A3]">Silver Nisab Threshold (595g):</span>
                  <strong className="text-[#C5A059] font-sans">${result.nisabSilverValue.toLocaleString()}</strong>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`p-4 rounded-sm text-center border font-serif font-bold text-xs uppercase tracking-wider ${
                result.isEligibleForZakat
                  ? 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40'
                  : 'bg-[#F9F7F2]/10 text-[#A8B5A3] border-[#F9F7F2]/20'
              }`}>
                {result.isEligibleForZakat ? 'Zakat is Obligatory (Nisab Met)' : 'Net assets below Gold Nisab threshold'}
              </div>

              {/* Final Amount Box */}
              <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#E6E1D3] text-center space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8474] font-semibold block">TOTAL ZAKAT DUE (2.5%)</span>
                <span className="text-4xl font-serif font-bold text-[#3A4D39]">
                  ${result.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Categories Tab */
        <div className="bg-[#FFFFFF] p-6 rounded-sm border border-[#E6E1D3] space-y-4">
          <h3 className="font-serif font-bold text-xl text-[#3A4D39]">8 Quranic Categories of Zakat Recipients (Surah At-Tawbah 9:60)</h3>
          <p className="text-xs text-[#5C635A] italic font-serif leading-relaxed">
            "Zahkat expenditures are only for the poor and for the needy and for those employed to collect [zakat] and for bringing hearts together [for Islam] and for freeing captives [or slaves] and for those in debt and for the cause of Allah and for the [stranded] traveler - an obligation [imposed] by Allah."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3">
            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] space-y-1">
              <strong className="text-[#3A4D39] font-serif text-sm">1. Al-Fuqara (الفقراء) • The Poor</strong>
              <p className="text-[#5C635A] font-serif">Individuals with no income or below basic living needs.</p>
            </div>
            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] space-y-1">
              <strong className="text-[#3A4D39] font-serif text-sm">2. Al-Masakin (المساكين) • The Needy</strong>
              <p className="text-[#5C635A] font-serif">Individuals who earn some income but cannot fulfill basic food & shelter.</p>
            </div>
            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] space-y-1">
              <strong className="text-[#3A4D39] font-serif text-sm">3. Al-Amilina 'Alayha (العاملين عليها) • Administrators</strong>
              <p className="text-[#5C635A] font-serif">Staff employed to collect, manage, and distribute Zakat funds.</p>
            </div>
            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] space-y-1">
              <strong className="text-[#3A4D39] font-serif text-sm">4. Al-Mu'allafatu Qulubuhum (المؤلفة قلوبهم) • Reconciled Hearts</strong>
              <p className="text-[#5C635A] font-serif">New Muslims or allies needing support to strengthen faith and community ties.</p>
            </div>
            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] space-y-1">
              <strong className="text-[#3A4D39] font-serif text-sm">5. Fir-Riqab (في الرقاب) • Captives / Bondage</strong>
              <p className="text-[#5C635A] font-serif">Freeing victims of human trafficking, bondage, or unlawful captivity.</p>
            </div>
            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] space-y-1">
              <strong className="text-[#3A4D39] font-serif text-sm">6. Al-Gharimin (الغارمين) • Debtors</strong>
              <p className="text-[#5C635A] font-serif">Persons burdened with overwhelming debts incurred for necessary basic living.</p>
            </div>
            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] space-y-1">
              <strong className="text-[#3A4D39] font-serif text-sm">7. Fi Sabilillah (في سبيل الله) • Cause of Allah</strong>
              <p className="text-[#5C635A] font-serif">Supporting defense of Islamic values, community education, and righteous efforts.</p>
            </div>
            <div className="p-4 rounded-sm bg-[#F9F7F2] border border-[#E6E1D3] space-y-1">
              <strong className="text-[#3A4D39] font-serif text-sm">8. Ibn Al-Sabil (ابن السبيل) • Stranded Wayfarer</strong>
              <p className="text-[#5C635A] font-serif">Travelers cut off from resources during a lawful journey needing assistance to return home.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
