import {exportArrayToCSV, exportToJson} from "./utils";
import {getSwapEvents, getPositions} from "../api";
import moment from "moment";

export const loadData = async (poolSymbolBase: string) => {
  const poolSymbol = poolSymbolBase || 'USDC.e/USDT'
  let timestampFrom = moment().subtract(14, 'days').unix()

  let continueLoop = true
  let swaps: any[] = []
  do {
    const newSwaps = await getSwapEvents({
      first: 1000,
      filter: {
        poolSymbol,
        timestamp_gt: timestampFrom
      },
      sort: {
        orderBy: 'transaction__blockNumber',
        orderDirection: 'asc'
      }
    })
    if(newSwaps.length < 1000) {
      continueLoop = false
    }
    if(newSwaps.length > 0) {
      timestampFrom = Number(newSwaps[newSwaps.length - 1].transaction.timestamp)
    }
    swaps.push(...newSwaps)
    console.log(`timestampFrom=${timestampFrom}, new=${newSwaps.length}, total=${swaps.length}`)
  } while (continueLoop)

  swaps.sort((a, b) => Number(a.transaction.blockNumber) - Number(b.transaction.blockNumber))

  // const swapsCsv = swaps.map(swap => {
  //   return {
  //     txHash: swap.transaction.id,
  //     blockNumber: swap.transaction.blockNumber,
  //     timestamp: swap.transaction.timestamp,
  //     pool: swap.pool.symbol,
  //     poolId: swap.pool.id,
  //     origin: swap.origin,
  //     recipient: swap.recipient,
  //     token0: swap.token0.symbol,
  //     token1: swap.token1.symbol,
  //     amount0: swap.amount0,
  //     amount1: swap.amount1,
  //     amountUSD: swap.amountUSD,
  //   }
  // })

  const exportFileName = `export/swaps_${
    poolSymbol.replace('/','_')
  }_${
    Math.round(Date.now() / 1000)
  }`
  console.log(`Total swaps: ${swaps.length}. Exporting to ${exportFileName}...`)
  //exportArrayToCSV(`${exportFileName}.csv`, swapsCsv)
  await exportToJson(`${exportFileName}.jsonl`, swaps)
  console.log('Export complete! check' + exportFileName)

  return swaps;
}

