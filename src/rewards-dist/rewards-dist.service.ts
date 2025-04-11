import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Web3Service } from 'nest-web3';

import rewardDistJson from '../abi/RewardDist';
import { EventTrackerService, IEvent } from '../event-tracker/event-tracker.service';
import stakingVaultJson from '../abi/StakingVault';
import { calculateStats } from './generate_stats';
// import tokenJson from '../abi/Token';

const SYNC_INTERVAL = 10 * 60 * 1000;

@Injectable()
export class RewardDistService {
    private readonly logger = new Logger(RewardDistService.name);

    private lastUpdateTime = '';
    private lastSuccessTx = '';
    private lastErrorTx = '';
    private lastError = '';

    private infoData: any = {};

    eventTrackerService: EventTrackerService;
    eventLogs: any[] = [];

    wallets: any[] = [];
    positions: any[] = []; 

    constructor(
        private configService: ConfigService,
        private readonly web3Service: Web3Service
    ) {
        this.syncStats();
    }

    syncStats = async () => {
        try {
            this.logger.log('Start calculateStats');
            const { wallets, positions } = await calculateStats();

            this.logger.log('End calculateStats');

            this.wallets = wallets;
            this.positions = positions;
        } catch (e) {
            this.logger.error(e);
        }

        setTimeout(() => this.syncStats(), SYNC_INTERVAL);
    }

    info = () => {
        return {
            sync: this.infoData,
            lastUpdateTime: this.lastUpdateTime,
            lastSuccessTx: this.lastSuccessTx,
            lastErrorTx: this.lastErrorTx,
            lastError: this.lastError,
            contracts: {
                rewardDistributor: this.configService.get('contracts.rewardDistributor'),
                stakingVault: this.configService.get('contracts.stakingVault'),
                token: this.configService.get('contracts.token'),
            },
            SYNC_INTERVAL,
        }
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
