import { HeirInput, HeirResult, InheritanceCalculationResult } from '../types';

export function calculateIslamicInheritance(
  grossEstate: number,
  funeralExpenses: number,
  debts: number,
  bequests: number, // Wasiyyah
  inputs: HeirInput
): InheritanceCalculationResult {
  // 1. Calculate Net Estate
  const afterExpenses = Math.max(0, grossEstate - funeralExpenses - debts);
  
  // Wasiyyah (Bequest) is limited to 1/3 of the net estate after debts
  const maxBequestAllowed = afterExpenses / 3;
  const actualBequest = Math.min(bequests, maxBequestAllowed);
  const distributableEstate = Math.max(0, afterExpenses - actualBequest);

  if (distributableEstate <= 0) {
    return {
      grossEstate,
      netEstate: distributableEstate,
      funeralExpenses,
      debts,
      bequests: actualBequest,
      heirs: [],
      explanation: "No distributable estate remaining after deducting funeral expenses, debts, and approved bequests."
    };
  }

  const results: HeirResult[] = [];
  const hasChildren = inputs.sons > 0 || inputs.daughters > 0;
  const totalSiblings = inputs.fullBrothers + inputs.fullSisters + inputs.paternalBrothers + inputs.paternalSisters + inputs.maternalBrothersSisters;

  // Track fractional shares
  let fixedFractionSum = 0;

  // 1. Spouses (Ashab al-Furud)
  if (inputs.husband) {
    const fraction = hasChildren ? 0.25 : 0.5;
    const fractionStr = hasChildren ? "1/4" : "1/2";
    fixedFractionSum += fraction;
    results.push({
      name: "Husband",
      arabicName: "الزوج",
      shareFraction: fractionStr,
      shareDecimal: fraction,
      amount: 0,
      notes: hasChildren ? "Receives 1/4 because children exist." : "Receives 1/2 because no children exist.",
      quranicEvidence: "Surah An-Nisa 4:12"
    });
  } else if (inputs.wifeCount > 0) {
    const numWives = Math.min(4, inputs.wifeCount);
    const totalWifeFraction = hasChildren ? 0.125 : 0.25;
    const totalFractionStr = hasChildren ? "1/8" : "1/4";
    fixedFractionSum += totalWifeFraction;
    
    for (let i = 1; i <= numWives; i++) {
      const individualFraction = totalWifeFraction / numWives;
      results.push({
        name: numWives > 1 ? `Wife #${i}` : "Wife",
        arabicName: numWives > 1 ? `الزوجة ${i}` : "الزوجة",
        shareFraction: `${totalFractionStr} (Shared equally)`,
        shareDecimal: individualFraction,
        amount: 0,
        notes: hasChildren 
          ? `Shares 1/8 equally among ${numWives} wife/wives due to presence of children.`
          : `Shares 1/4 equally among ${numWives} wife/wives due to absence of children.`,
        quranicEvidence: "Surah An-Nisa 4:12"
      });
    }
  }

  // 2. Mother
  if (inputs.mother) {
    const fraction = (hasChildren || totalSiblings >= 2) ? (1 / 6) : (1 / 3);
    const fractionStr = (hasChildren || totalSiblings >= 2) ? "1/6" : "1/3";
    fixedFractionSum += fraction;
    results.push({
      name: "Mother",
      arabicName: "الأم",
      shareFraction: fractionStr,
      shareDecimal: fraction,
      amount: 0,
      notes: (hasChildren || totalSiblings >= 2)
        ? "Receives 1/6 due to children or multiple siblings."
        : "Receives 1/3 in absence of children and multiple siblings.",
      quranicEvidence: "Surah An-Nisa 4:11"
    });
  }

  // 3. Father
  if (inputs.father) {
    if (hasChildren) {
      const fraction = 1 / 6;
      fixedFractionSum += fraction;
      results.push({
        name: "Father",
        arabicName: "الأب",
        shareFraction: "1/6",
        shareDecimal: fraction,
        amount: 0,
        notes: "Receives fixed 1/6 share due to presence of children.",
        quranicEvidence: "Surah An-Nisa 4:11"
      });
    }
    // If no children, father acts as Asabah (Residuary) later
  }

  // 4. Daughters (if NO Sons exist)
  if (inputs.daughters > 0 && inputs.sons === 0) {
    if (inputs.daughters === 1) {
      const fraction = 0.5;
      fixedFractionSum += fraction;
      results.push({
        name: "Daughter (Single)",
        arabicName: "البنت الواحدة",
        shareFraction: "1/2",
        shareDecimal: fraction,
        amount: 0,
        notes: "Receives fixed 1/2 share as an only daughter.",
        quranicEvidence: "Surah An-Nisa 4:11"
      });
    } else {
      const totalFraction = 2 / 3;
      fixedFractionSum += totalFraction;
      const indFraction = totalFraction / inputs.daughters;
      for (let i = 1; i <= inputs.daughters; i++) {
        results.push({
          name: `Daughter #${i}`,
          arabicName: `البنت ${i}`,
          shareFraction: `2/3 shared equally`,
          shareDecimal: indFraction,
          amount: 0,
          notes: `Shares 2/3 equally among ${inputs.daughters} daughters.`,
          quranicEvidence: "Surah An-Nisa 4:11"
        });
      }
    }
  }

  // Calculate Residuary (Asabah)
  const remainingFraction = Math.max(0, 1 - fixedFractionSum);

  // Check if Sons exist -> Sons & Daughters inherit as Asabah (2:1 ratio)
  if (inputs.sons > 0) {
    const totalParts = (inputs.sons * 2) + inputs.daughters;
    const valPerPart = remainingFraction / (totalParts > 0 ? totalParts : 1);

    for (let i = 1; i <= inputs.sons; i++) {
      const sonFraction = valPerPart * 2;
      results.push({
        name: `Son #${i}`,
        arabicName: `الابن ${i}`,
        shareFraction: `Residuary (2x daughter)`,
        shareDecimal: sonFraction,
        amount: 0,
        notes: "Inherits as prime Residuary (Asabah bi-Nafsihi).",
        quranicEvidence: "Surah An-Nisa 4:11 (Male gets twice female share)"
      });
    }

    for (let i = 1; i <= inputs.daughters; i++) {
      const daughterFraction = valPerPart;
      results.push({
        name: `Daughter #${i}`,
        arabicName: `البنت ${i}`,
        shareFraction: `Residuary (1x)`,
        shareDecimal: daughterFraction,
        amount: 0,
        notes: "Inherits as Residuary together with brother(s) (Asabah bi-Ghayriha).",
        quranicEvidence: "Surah An-Nisa 4:11"
      });
    }
  } else if (inputs.father && !hasChildren) {
    // Father takes remaining residuary
    results.push({
      name: "Father",
      arabicName: "الأب",
      shareFraction: "Residuary (Asabah)",
      shareDecimal: remainingFraction,
      amount: 0,
      notes: "Takes all remaining residue as primary male relative in absence of sons.",
      quranicEvidence: "Classical Consensus (Ijma) & Sunnah"
    });
  } else if (inputs.fullBrothers > 0 && !inputs.father && inputs.sons === 0) {
    // Full Brothers & Full Sisters inherit residue
    const totalParts = (inputs.fullBrothers * 2) + inputs.fullSisters;
    const valPerPart = remainingFraction / (totalParts > 0 ? totalParts : 1);

    for (let i = 1; i <= inputs.fullBrothers; i++) {
      results.push({
        name: `Full Brother #${i}`,
        arabicName: `الأخ الشقيق ${i}`,
        shareFraction: "Residuary",
        shareDecimal: valPerPart * 2,
        amount: 0,
        notes: "Inherits remaining residue in absence of sons and father.",
        quranicEvidence: "Surah An-Nisa 4:176"
      });
    }
    for (let i = 1; i <= inputs.fullSisters; i++) {
      results.push({
        name: `Full Sister #${i}`,
        arabicName: `الأخت الشقيقة ${i}`,
        shareFraction: "Residuary",
        shareDecimal: valPerPart,
        amount: 0,
        notes: "Inherits residue with brother (2:1 ratio).",
        quranicEvidence: "Surah An-Nisa 4:176"
      });
    }
  }

  // Handle Awl or Radd if sum doesn't equal 1 exactly
  let totalCalculatedDecimal = results.reduce((acc, r) => acc + r.shareDecimal, 0);

  let explanation = "Inheritance computed according to Sharia (Quran 4:11-12, 4:176).";
  let awlFactor: number | undefined;
  let raddFactor: number | undefined;

  if (totalCalculatedDecimal > 1.0001) {
    // Awl (Proportional Reduction)
    awlFactor = 1 / totalCalculatedDecimal;
    explanation = `Awl (العول) applied: Total fixed Quranic shares exceeded 1 (sum = ${(totalCalculatedDecimal * 100).toFixed(1)}%). Shares proportionally adjusted.`;
    results.forEach(r => {
      r.shareDecimal = r.shareDecimal * awlFactor!;
    });
  } else if (totalCalculatedDecimal < 0.999 && results.length > 0) {
    // Radd (Redistribution of leftover to non-spouse Quranic heirs if no Asabah)
    raddFactor = 1 / totalCalculatedDecimal;
    explanation = `Radd (الرد) applied: Residue remained with no Asabah relative. Leftover redistributed proportionally among eligible Quranic heirs.`;
  }

  // Compute final monetary amounts
  results.forEach(r => {
    r.amount = Math.round(r.shareDecimal * distributableEstate * 100) / 100;
  });

  return {
    grossEstate,
    netEstate: distributableEstate,
    funeralExpenses,
    debts,
    bequests: actualBequest,
    heirs: results,
    awlFactor,
    raddFactor,
    explanation
  };
}
