import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Web3Service } from 'nest-web3';

import rewardDistJson from '../abi/RewardDist';
import { EventTrackerService, IEvent } from '../event-tracker/event-tracker.service';
import nftSettingsRegistryJson from '../abi/NftSettingsRegistry';
import { calculateStats } from './generate_stats';
// import tokenJson from '../abi/Token';

export interface IRebalanceConfig {
    positionId: number;
    autoRebalance: string;
    cutoffTickLow: string;
    cutoffTickHigh: string;
    bufferTicksBelow: string;
    bufferTicksAbove: string;
    tickSpacesBelow: string;
    tickSpacesAbove: string;
    dustBP: string;
    priceImpactBP: string;
    slippageBP: string;
}

const SYNC_INTERVAL = 2 * 1000;

@Injectable()
export class RewardDistService {
    private readonly logger = new Logger(RewardDistService.name);
    private client = this.web3Service.getClient('sonic');

    private lastUpdateTime = '';
    private lastSuccessTx = '';
    private lastErrorTx = '';
    private lastError = '';

    private infoData: any = {};

    private cachedPositionIds: number[] = [];
    private vfatPositions: any[] = [];

    eventTrackerService: EventTrackerService;
    eventLogs: any[] = [];

    wallets: any[] = [];
    positions: any[] = []; 

    constructor(
        private configService: ConfigService,
        private readonly web3Service: Web3Service
    ) {
        this.eventTrackerService = new EventTrackerService({
            contractAddress: "0xb7190708356b592cdaa0082e15a43baa983cb72c",
            contractAbi: nftSettingsRegistryJson.abi,
            web3: this.client,
            chain: 'eth',
            getEventCallback: async (event: IEvent) => {
                if(event.name === "NftSettingsSet") {
                    // this.logger.log(
                    //     // event.returnValues["0"][1], 
                    //     event.returnValues["0"][2]
                    // );

                    // console.log(event.returnValues.settings.rebalanceConfig);

                    // rebalance config example
                    // [
                    //     '12',
                    //     '41',
                    //     '0',
                    //     '0',
                    //     '100',
                    //     '50',
                    //     '50',
                    //     '-887272',
                    //     '887272',
                    //     '0',
                    //     [
                    //       '1',
                    //       '0x0000000000000000000000000000000000000000',
                    //       rewardBehavior: '1',
                    //       harvestTokenOut: '0x0000000000000000000000000000000000000000'
                    //     ],
                    //     tickSpacesBelow: '12',
                    //     tickSpacesAbove: '41',
                    //     bufferTicksBelow: '0',
                    //     bufferTicksAbove: '0',
                    //     dustBP: '100',
                    //     priceImpactBP: '50',
                    //     slippageBP: '50',
                    //     cutoffTickLow: '-887272',
                    //     cutoffTickHigh: '887272',
                    //     delayMin: '0',
                    //     rewardConfig: [
                    //       '1',
                    //       '0x0000000000000000000000000000000000000000',
                    //       rewardBehavior: '1',
                    //       harvestTokenOut: '0x0000000000000000000000000000000000000000'
                    //     ]
                    //   ]

                    const rebalanceConfig: IRebalanceConfig = {
                        positionId: event.returnValues["0"][2],
                        autoRebalance: event.returnValues.settings.autoRebalance,
                        cutoffTickLow: event.returnValues.settings.rebalanceConfig.cutoffTickLow,
                        cutoffTickHigh: event.returnValues.settings.rebalanceConfig.cutoffTickHigh,
                        bufferTicksBelow: event.returnValues.settings.rebalanceConfig.bufferTicksBelow,
                        bufferTicksAbove: event.returnValues.settings.rebalanceConfig.bufferTicksAbove,
                        tickSpacesBelow: event.returnValues.settings.rebalanceConfig.tickSpacesBelow,
                        tickSpacesAbove: event.returnValues.settings.rebalanceConfig.tickSpacesAbove,
                        dustBP: event.returnValues.settings.rebalanceConfig.dustBP,
                        priceImpactBP: event.returnValues.settings.rebalanceConfig.priceImpactBP,
                        slippageBP: event.returnValues.settings.rebalanceConfig.slippageBP,
                    };

                    this.cachedPositionIds.push(rebalanceConfig.positionId);
                    this.vfatPositions.push(rebalanceConfig);
                }

                return Promise.resolve();
            }
        })

        this.eventTrackerService.start(7710000);

        this.syncStats();
    }

    syncStats = async () => {
        try {

            if(Number(this.eventTrackerService.getInfo().progress) === 1) {
                this.logger.log('Start calculateStats');

                const { wallets, positions } = await calculateStats(this.cachedPositionIds, this.vfatPositions);

                this.logger.log('End calculateStats');

                this.wallets = wallets;
                this.positions = positions;
            } else {
                this.logger.log(`Progress: ${(+this.eventTrackerService.getInfo().progress * 100).toFixed(2)}%`);
                setTimeout(() => this.syncStats(), SYNC_INTERVAL);
            }
        } catch (e) {
            this.logger.error(e);
        }
    }

    info = () => {
        this.eventTrackerService.getInfo();
        // return {
        //     sync: this.infoData,
        //     lastUpdateTime: this.lastUpdateTime,
        //     lastSuccessTx: this.lastSuccessTx,
        //     lastErrorTx: this.lastErrorTx,
        //     lastError: this.lastError,
        //     contracts: {
        //         rewardDistributor: this.configService.get('contracts.rewardDistributor'),
        //         stakingVault: this.configService.get('contracts.stakingVault'),
        //         token: this.configService.get('contracts.token'),
        //     },
        //     SYNC_INTERVAL,
        // }
    }

    list = () => { return this.eventLogs };

    eventsTrackerInfo = () => this.eventTrackerService.getInfo();

    getPosition = (positionId: string) => {
        return this.positions.find(position => position.id === positionId);
    }

    getPositions = () => {
        return this.positions.slice(0, 100);
    }

    getPositionsWithImpermanentLoss = () => {
        return this.positions.filter(position => Number(position.impermanent_loss) > 0).slice(0, 100);
    }

    getWallet = (walletId: string) => {
        return this.wallets.find(wallet => wallet.wallet === walletId);
    }

    getPositionByWallet = (walletId: string) => {
        return this.positions.filter(position => position.wallet === walletId);
    }
}
