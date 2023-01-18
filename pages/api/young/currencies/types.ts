export type Currency = {
  name: string;
  symbol: string,
  activeBuy: boolean,
  activeSell: boolean,
  activeDeposit: boolean,
  activeWithdraw: boolean,
  decimalPrecision: number,
  withdrawFee: number,
  withdrawFeePercentage: number,
  withdrawFixedFee: boolean
}