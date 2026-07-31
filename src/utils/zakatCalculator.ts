import { ZakatInputs } from '../types';

export interface ZakatCalculationResult {
  totalCash: number;
  totalGoldValue: number;
  totalSilverValue: number;
  totalInvestments: number;
  totalBusiness: number;
  totalDebtsDeducted: number;
  netZakatableAssets: number;
  nisabGoldValue: number;
  nisabSilverValue: number;
  isEligibleForZakat: boolean;
  zakatDue: number;
}

export function calculateZakat(inputs: ZakatInputs): ZakatCalculationResult {
  const totalCash = (inputs.cashOnHand || 0) + (inputs.cashInBank || 0);

  // Convert gold karats to equivalent 24k gold value
  const gold24kGrams = (inputs.goldGram24k || 0) +
    (inputs.goldGram22k || 0) * (22 / 24) +
    (inputs.goldGram21k || 0) * (21 / 24) +
    (inputs.goldGram18k || 0) * (18 / 24);

  const totalGoldValue = gold24kGrams * (inputs.goldPricePerGram24k || 75);
  const totalSilverValue = (inputs.silverGrams || 0) * (inputs.silverPricePerGram || 0.9);

  const totalInvestments = (inputs.stocksCrypto || 0);
  const totalBusiness = (inputs.businessGoods || 0) + (inputs.receivables || 0);
  const totalDebtsDeducted = (inputs.shortTermDebts || 0);

  const grossAssets = totalCash + totalGoldValue + totalSilverValue + totalInvestments + totalBusiness;
  const netZakatableAssets = Math.max(0, grossAssets - totalDebtsDeducted);

  const nisabGoldValue = 85 * (inputs.goldPricePerGram24k || 75);
  const nisabSilverValue = 595 * (inputs.silverPricePerGram || 0.9);

  // Using Gold Nisab as standard (or user comparison)
  const isEligibleForZakat = netZakatableAssets >= nisabGoldValue;
  const zakatDue = isEligibleForZakat ? netZakatableAssets * 0.025 : 0;

  return {
    totalCash,
    totalGoldValue,
    totalSilverValue,
    totalInvestments,
    totalBusiness,
    totalDebtsDeducted,
    netZakatableAssets,
    nisabGoldValue,
    nisabSilverValue,
    isEligibleForZakat,
    zakatDue
  };
}
