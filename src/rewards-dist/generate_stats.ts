const fs = require('fs');
const readline = require('readline');
const { ethers } = require("ethers");
import { exportArrayToCSV, exportToJson } from "./utils";
import { IRebalanceConfig } from "./rewards-dist.service";

import { loadData as loadRewards } from "../loaders/export_rewards";
import { loadData as loadPositions } from "../loaders/export_positions";
import { loadData as loadPositionsBurns } from "../loaders/export_positions_burns";
import { loadData as loadPoolHoursData } from "../loaders/export_pool_hours_data";
import { loadData as loadSwaps } from "../loaders/export_swaps";

function compute(owner: string, index: string, tickLower: string, tickUpper: string) {
    return ethers.keccak256(
        ethers.solidityPacked(
            ['address', 'uint256', 'int24', 'int24'],
            [owner, index, tickLower, tickUpper]
        )
    );
}

const contractAddress = "0x89b45f5b830fb5bc42d037c1130933c86da27c58";
const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "earned",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "reward",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const rewardTokens = [
    { address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894', decimals: 6, price: 1 },
    { address: '0x6047828dc181963ba44974801FF68e538dA5eaF9', decimals: 6, price: 1 },
    { address: '0x3333b97138D4b086720b5aE8A7844b1345a33333', decimals: 18, price: 79.11 },
    { address: '0x5555b2733602DEd58D47b8D3D989E631CBee5555', decimals: 18, price: 105.029979 }
]

const getPrice = (tokenAddress: string) => {
    return rewardTokens.find(t => t.address === tokenAddress)?.price || 0;
}

// const provider = new ethers.JsonRpcProvider("wss://sonic.callstaticrpc.com");
const provider = new ethers.JsonRpcProvider("https://rpc.soniclabs.com");

const contract = new ethers.Contract(contractAddress, abi, provider);

async function getEarnedAmount(tokenAddress: string, tokenId: string, decimals: number) {
    try {
        // console.log('tokenAddress: ', tokenAddress, 'tokenId: ', tokenId, 'decimals: ', decimals)
        const earnedAmount = await contract.earned(tokenAddress, tokenId);

        if (Number(earnedAmount) > 0) {
            const price = getPrice(tokenAddress);
            // console.log('price: ', price);
            const amount = (Number(earnedAmount) / (10 ** decimals)) * price;

            //console.log(amount);

            return amount;
        }

        return 0;
    } catch (error) {
        // console.error("Ошибка при вызове метода earned:", error);
        return 0;
    }
}

const prices: any = {
    'GEMS': 105.029979,
    'xSHADOW': 79.870104,
    'USDT': 1
}

const rewards_filePath = 'export/rewards_USDC.e_USDT_1743112073.jsonl'; // путь к вашему JSONL файлу
const positions_filePath = 'export/positions_USDC.e_USDT_1743112231.jsonl'; // путь к вашему JSONL файлу
const positions_burns_filePath = 'export/positions_burns_USDC.e_USDT_1743624858.jsonl'; // путь к вашему JSONL файлу
const pool_hours_data_filePath = 'export/pool_hours_data_USDC.e_USDT_1743628848.jsonl';
const swaps_data_filePath = 'export/swaps_USDC.e_USDT_1743709148.jsonl';

const getFile = (filePath: string) => {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        const allData: any[] = [];

        rl.on('line', (line: string) => {
            try {
                const jsonData = JSON.parse(line);
                allData.push(jsonData);
            } catch (err) {
                console.error('Ошибка при парсинге строки:', err);
                reject(err);
            }
        });

        rl.on('close', () => {
            resolve(allData);
        });
    });
}

export const calculateStats = async (cachedPositionIds: number[], vfatPositions: IRebalanceConfig[]) => {
    const rewards: any = await getFile(rewards_filePath);
    let positions: any = await getFile(positions_filePath);
    const positionsBurns: any = await getFile(positions_burns_filePath);
    const poolHoursData: any = await getFile(pool_hours_data_filePath);
    const swaps: any = await getFile(swaps_data_filePath);

    console.log('vfatPositions: ', vfatPositions.length);

    // const poolSymbolBase = 'USDC.e/scUSD'// 'USDC.e/USDT'

    // const rewards = await loadRewards(poolSymbolBase);
    // const positions = await loadPositions(poolSymbolBase);
    // const positionsBurns = await loadPositionsBurns(poolSymbolBase);
    // const poolHoursData = await loadPoolHoursData(poolSymbolBase);
    // const swaps = await loadSwaps(poolSymbolBase);

    console.log('pool: ', 'USDC.e/USDT');

    console.log('rewards: ', rewards.length);
    console.log('positions: ', positions.length);
    console.log('positions in vfat: ', positions.filter((p: any) => cachedPositionIds.includes(p.id)).length);
    console.log('positionsBurns: ', positionsBurns.length);
    console.log('poolHoursData: ', poolHoursData.length);

    positions = positions.filter((p: any) => cachedPositionIds.includes(p.id));

    positions = positions.map((p: any) => {
        const vfatPosition = vfatPositions.find((vp: IRebalanceConfig) => vp.positionId === p.id);

        return {
            ...p,
            ...vfatPosition
        }
    })

    positionsBurns.sort((a: any, b: any) => {
        return Number(a.timestamp) - Number(b.timestamp) > 0 ? -1 : 1;
    })

    // positionsBurns.forEach((pb: any) => {
    //     console.log(pb.position.id, pb.timestamp)
    // })

    // const result = [];

    // positions.forEach(pos => {
    //     // result.push(compute(pos.owner, pos.id, pos.tickLower.tickIdx, pos.tickUpper.tickIdx));
    //     // result.push(compute(pos.transaction.from, pos.id, pos.tickLower.tickIdx, pos.tickUpper.tickIdx));
    //     result.push(compute("0x12e66c8f215ddd5d48d150c8f46ad0c6fb0f4406", pos.id, pos.tickLower.tickIdx, pos.tickUpper.tickIdx));
    // })

    // console.log('result: ', result.length)

    //console.log('rewards: ', rewards.filter(r => result.includes(r.nfpPositionHash)).length)

    const rewardsByPosition = rewards.reduce((acc: any, curr: any) => {
        acc[curr.nfpPositionHash] = [].concat(acc[curr.nfpPositionHash] || [], curr);
        return acc;
    }, {});

    console.log('rewards by position: ', Object.keys(rewardsByPosition).length)

    const positionsWithRewards = positions.map((pos: any) => {
        return {
            ...pos,
            rewards: rewardsByPosition[compute(
                "0x12e66c8f215ddd5d48d150c8f46ad0c6fb0f4406",
                pos.id,
                pos.tickLower.tickIdx,
                pos.tickUpper.tickIdx
            )]?.reduce((acc: any, curr: any) => {
                acc[curr.rewardToken.symbol] = (acc[curr.rewardToken.symbol] || 0) + Number(curr.rewardAmount);

                if (!prices[curr.rewardToken.symbol]) {
                    console.log('no price for', curr.rewardToken.symbol)
                }

                acc['USD'] = (acc['USD'] || 0) + Number(curr.rewardAmount) * prices[curr.rewardToken.symbol];

                return acc;
            }, {})
        }
    }).map((p: any) => {
        return {
            ...p,
            totalUSD: p.rewards?.['USD'] || 0 + Number(p.collectedFeesToken0) + Number(p.collectedFeesToken1)
        }
    })

    positionsWithRewards.sort((a: any, b: any) => {
        return b.totalUSD - a.totalUSD;
    })

    let totalUSD = positionsWithRewards.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.totalUSD) || 0);
    }, 0)

    console.log('totalUSD: ', totalUSD)

    // console.log(positionsWithRewards.filter(p => p.rewards?.['USD'] > 300).length)

    console.log(positionsWithRewards.length)

    for (let i = 0; i < positionsWithRewards.length; i += 200) {
        break;

        const requests: any[] = [];

        positionsWithRewards.slice(i, i + 200).forEach((p: any) => {
            rewardTokens.forEach((token: any) => {
                requests.push({
                    token: token.address,
                    id: p.id,
                    decimals: token.decimals
                })
            })
        })

        const amounts = await Promise.all(requests.map(async (req) => {
            return await getEarnedAmount(req.token, req.id, req.decimals);
        }));

        amounts.forEach((amount, idx) => {
            if (positionsWithRewards[i + idx]) {
                positionsWithRewards[i + idx].totalUSD += Number(amount) || 0;
            }
        })

        console.log(Math.round((i + 200) / positionsWithRewards.length * 100) + '/100 %')
    }

    totalUSD = positionsWithRewards.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.totalUSD) || 0);
    }, 0)

    const TVL = positionsWithRewards.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.depositedToken0) || 0) + (Number(curr.depositedToken1) || 0);
    }, 0)

    console.log('TVL: ', TVL);

    const positionsFinal = positionsWithRewards.map((p: any) => {
        const closeDate = positionsBurns.find((pb: any) => pb.position.id === p.id);
        const endDate = closeDate?.timestamp * 1000 || Date.now();

        const daysElapsed = Math.ceil((endDate - p.transaction.timestamp * 1000) / (1000 * 60 * 60 * 24));

        //console.log('daysElapsed: ', daysElapsed);
        const openDateTime = p.transaction.timestamp;
        const closeDateTime = closeDate?.timestamp || Date.now() / 1000;

        let hoursInRange = poolHoursData
            .filter((ph: any) => Number(ph.startOfHour) >= (openDateTime - 3600) && Number(ph.startOfHour) <= (Number(closeDateTime) + 3600))
            .filter((ph: any) => {
                //console.log(ph.tick, p.tickLower.tickIdx, p.tickUpper.tickIdx, ph.tick >= p.tickLower.tickIdx && ph.tick <= p.tickUpper.tickIdx);
                return Number(ph.tick) >= Number(p.tickLower.tickIdx) && Number(ph.tick) <= Number(p.tickUpper.tickIdx);
                // console.log(p.tickUpper.price0, ph.high, p.tickLower.price0, ph.low);
                // return Number(p.tickUpper.price0) >= Number(ph.low) && Number(p.tickLower.price0) <= Number(ph.high);
                // return Number(p.tickUpper.price0) >= Number(ph.token0Price) && Number(ph.token0Price) >= Number(p.tickLower.price0)
            }).length;

        const duration = closeDateTime - openDateTime;

        hoursInRange = Math.min(hoursInRange, duration / 3600);

        const inRange = Math.round((hoursInRange / (duration / 3600)) * 100);

        const swapsInInterval = swaps.filter((swap: any) => swap.transaction.timestamp > openDateTime && swap.transaction.timestamp < closeDateTime)
        const swapsInRange = swapsInInterval.filter((ph: any) => Number(ph.tick) >= Number(p.tickLower.tickIdx) && Number(ph.tick) <= Number(p.tickUpper.tickIdx))

        return {
            ...p,
            apr: (((p.totalUSD / (Number(p.depositedToken0) + Number(p.depositedToken1))) * (365 / daysElapsed)) * 100).toFixed(2),
            apr_30d: (((p.totalUSD / (Number(p.depositedToken0) + Number(p.depositedToken1))) * (30 / daysElapsed)) * 100).toFixed(2),
            price_mid: ((Number(p.tickLower.price0) + Number(p.tickUpper.price0)) / 2).toFixed(4),
            ticks: Math.abs(p.tickUpper.tickIdx - p.tickLower.tickIdx),
            open_date: openDateTime,
            close_date: closeDateTime,
            duration,
            in_range: inRange,
            hours_in_range: hoursInRange,
            wallet: p.transaction.from,
            hours: poolHoursData
            // .filter((ph: any) => ph.startOfHour >= openDateTime && ph.startOfHour <= closeDateTime).length,
                .filter((ph: any) => Number(ph.startOfHour) >= (openDateTime - 3600) && Number(ph.startOfHour) <= (+closeDateTime + 3600)).length,
            swapsInInterval: swapsInInterval.length,
            swapsInRange: swapsInRange.length,
            in_range_swaps: Math.round(swapsInRange.length / (swapsInInterval.length || 1) * 100),
            closed: closeDate ? true : false,
            impermanent_loss: (() => {
                // Get all swaps within the position's time interval
                const positionSwaps = swapsInInterval;

                if (positionSwaps.length === 0) {
                    return '0.00';
                }

                // Get initial and final prices from amount0/amount1 ratio
                const initialPrice = Number(positionSwaps[0].amount1) > 0 ? Math.abs(Number(positionSwaps[0].amount0) / Number(positionSwaps[0].amount1)) : 0;
                const finalPrice = Math.abs(Number(positionSwaps[positionSwaps.length - 1].amount0) / Number(positionSwaps[positionSwaps.length - 1].amount1) || 0);

                // Check if current price is within position range
                const isInRange = finalPrice >= Number(p.tickLower.price0) && finalPrice <= Number(p.tickUpper.price0);

                if (!isInRange) {
                    // If price is out of range, calculate maximum losses
                    const priceRatio = finalPrice / initialPrice;
                    const impermanentLoss = ((2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * -100);

                    // if(Number(impermanentLoss) > 0) {
                        // console.log(1, 2 * Math.sqrt(priceRatio) / (1 + priceRatio), 'initialPrice: ', initialPrice, 'finalPrice: ', finalPrice, 'priceRatio: ', priceRatio, 'impermanentLoss: ', impermanentLoss);
                    // }

                    return impermanentLoss;
                } else {
                    // If price is in range, calculate losses considering the range
                    const priceRatio = finalPrice / initialPrice;
                    const rangeRatio = Number(p.tickUpper.price0) / Number(p.tickLower.price0);
                    const impermanentLoss = ((2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * -100 * (1 - (Math.log(priceRatio) / Math.log(rangeRatio)))).toFixed(2);
                    

                    
                    // if(Number(impermanentLoss) > 0) {
                        // console.log(2,  2 * Math.sqrt(priceRatio) / (1 + priceRatio), 'initialPrice: ', initialPrice, 'finalPrice: ', finalPrice, 'priceRatio: ', priceRatio, 'rangeRatio: ', rangeRatio, 'impermanentLoss: ', impermanentLoss);
                    // }

                    return impermanentLoss;
                }
            })(),
        }
    })

    console.log('totalUSD: ', totalUSD)

    positionsFinal.sort((a: any, b: any) => {
        return b.apr_30d - a.apr_30d;
    })

    // new

    console.log('Total positions: ',  positionsFinal.length);

    const uniqueOwners = positionsFinal.reduce((acc: any, pos: any) => {
        return {
            ...acc,
            [pos.transaction.from]: (acc[pos.transaction.from] || 0) + 1 
        }
    }, {});

    console.log('Unique owners: ',  Object.keys(uniqueOwners).length, Math.max.apply(this, Object.values(uniqueOwners)));

    // console.log(positionsFinal.filter(p => p.id == '295623'))
    // 295623.0	-3.0	2.0	5.0	8760.9	4999.4	0.0	0.0	13760.3	-13760.3	-1216.67	0.9997	1.0002	0.00049995	1.0
    const swapsCsv = positionsFinal.map((pos: any) => {
      return {
        id: pos.id,
        tick_lower: pos.tickLower.tickIdx,
        tick_upper: pos.tickUpper.tickIdx,
        ticks: pos.ticks,
        deposited_token0: pos.depositedToken0,
        deposited_token1: pos.depositedToken1,
        collected_token0: pos.collectedToken0,
        collected_token1: pos.collectedToken1,
        total_deposited_usd: Number(pos.depositedToken0) + Number(pos.depositedToken1),
        total_profit_usd: pos.totalUSD,
        apr_30d: pos.apr_30d,
        apr: pos.apr,
        in_range: pos.in_range,
        in_range_swaps: pos.in_range_swaps,
        //swaps_in_interval: pos.swapsInInterval,
        //swaps_in_range: pos.swapsInRange,
        //hours_in_range: pos.hours_in_range,
        //hours: pos.hours,
        //duration: pos.duration,
        //open_date: pos.open_date,
        //close_date: pos.close_date,
        price_lower: Number(pos.tickLower.price0).toFixed(4),
        price_upper: Number(pos.tickUpper.price0).toFixed(4),
        price_range: (Number(pos.tickUpper.price0) - Number(pos.tickLower.price0)).toFixed(4),
        price_mid: Number(pos.price_mid).toFixed(4),
        wallet: pos.wallet,
        auto_rebalance: pos.autoRebalance,
        cutoff_tick_low: pos.cutoffTickLow,
        cutoff_tick_high: pos.cutoffTickHigh,
        buffer_ticks_below: pos.bufferTicksBelow,
        buffer_ticks_above: pos.bufferTicksAbove,
        tick_spaces_below: pos.tickSpacesBelow,
        tick_spaces_above: pos.tickSpacesAbove,
        dust_bp: pos.dustBP
      }
    })
    const poolSymbol = 'USDC.e/USDT'

    // return;

    const exportFileName = `export/positions_stats_${poolSymbol.replace('/', '_')
        }_
        }`
    console.log(`Total swaps: ${swapsCsv.length}. Exporting to ${exportFileName}...`)
    exportArrayToCSV(`${exportFileName}.csv`, swapsCsv)
    await exportToJson(`${exportFileName}.jsonl`, swaps)
    console.log('Export complete! check' + exportFileName)

    const groupedByWallet = positionsFinal.reduce((acc: any, pos: any) => {
        const wallet_ticks = pos.wallet + '_' + pos.ticks;
        
        return {
            ...acc,
            [wallet_ticks]: (acc[wallet_ticks] || 0) + 1
        }
    }, {});

    console.log('Grouped by wallet: ', Object.keys(groupedByWallet).length);

    let wallets = Object.keys(groupedByWallet).map(wallet_ticks => {
        const [wallet, ticks] = wallet_ticks.split('_');

        const positions = positionsFinal.filter((p: any) => p.wallet === wallet && p.ticks == ticks);

        const intervals = positions.map((p: any) => {
            return {
                start: p.open_date,
                end: p.close_date
            }
        })

        intervals.sort((a: any, b: any) => a.start - b.start);

        let totalGap = 0;
        let gapCount = 0;
      
        for (let i = 1; i < intervals.length; i++) {
          const prevEnd = intervals[i - 1].end;
          const currentStart = intervals[i].start;
          const gap = currentStart - prevEnd;
          if (gap > 0) {
            totalGap += gap;
            gapCount++;
          }
        }

        const averageGapMs = gapCount ? totalGap / gapCount : 0;

        return {
            wallet,
            positions: groupedByWallet[wallet_ticks],
            total_profit_usd: positions.reduce((acc: number, pos: any) => {
                return acc + Number(pos.totalUSD) || 0;
            }, 0).toFixed(2),
            mid_deposited_usd: (positions.reduce((acc: number, pos: any) => {
                return acc + (Number(pos.depositedToken0) || 0) + (Number(pos.depositedToken1) || 0);
            }, 0) / positions.length).toFixed(2),
            apr: (positions.reduce((acc: number, pos: any) => {
                return acc + Number(pos.apr) || 0;
            }, 0) / positions.length).toFixed(2),
            in_range: (positions.reduce((acc: number, pos: any) => {
                return acc + Number(pos.in_range) || 0;
            }, 0) / positions.length).toFixed(2),
            ticks,
            duration: positions.reduce((acc: number, pos: any) => {
                return acc + Number(pos.duration) || 0;
            }, 0) / positions.length,
            price: positions.reduce((acc: number, pos: any) => {
                return acc + '|' + String(pos.price_mid);
            }, ''),
            averageGap: averageGapMs
        }
    });

    wallets = wallets.filter((w: any) => Number(w.total_profit_usd) > 100);

    wallets.sort((a: any, b: any) => {
        return b.apr - a.apr;
    })

    const walletsCsv = wallets.map((wallet: any) => {
        return {
            wallet: wallet.wallet,
            ticks: wallet.ticks,
            apr: wallet.apr,
            total_profit_usd: wallet.total_profit_usd,
            mid_deposited_usd: wallet.mid_deposited_usd,
            rebalances: wallet.positions,
            in_range: wallet.in_range,
            rebalances_gap_hours: Math.round(wallet.averageGap / 3600),
            mid_duration_hours: Math.round(wallet.duration / 3600),
            // price: wallet.price,
        }
    })

    const exportFileNameWallets = `export/wallets_stats_${poolSymbol.replace('/', '_')}`
    
    exportArrayToCSV(`${exportFileNameWallets}.csv`, walletsCsv)
    
    console.log('Export complete! check' + exportFileNameWallets)

    return {
        wallets,
        positions: positionsFinal
    }
};

