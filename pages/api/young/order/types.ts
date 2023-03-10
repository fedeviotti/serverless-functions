type Trade = {
  id: number,
  orderID: number,
  baseCurrency: string,
  quoteCurrency: string,
  side: string,
  taker: boolean,
  volume: number,
  rate: number,
  executionDate: string,
}

export type OrderRequest = {
  timestamp: number,
  recvWindow: number,
  trade: string,
  market: string,
  side: string,
  type: string,
  volume: number,
}

export type OrderResponse = {
  orderID: number,
  cid: number,
  baseCurrency: string,
  quoteCurrency: string,
  type: string,
  side: string,
  volume: number,
  rate: number,
  amount: number,
  brokerage: number,
  pendingVolume: number,
  orderStatus: boolean,
  orderPlacementDate: string,
  orderConfirmDate: string,
  trades: Trade[],
  fee: string,
}