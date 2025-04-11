import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RewardDistService } from './rewards-dist.service';

@ApiTags('stats')
@Controller('stats')
export class RewardDistController {
  constructor(
    private readonly configService: ConfigService,
    private readonly rewardDistService: RewardDistService
  ) { }
  @Get('/list')
  getEvents() {
    // return this.rewardDistService.list();
  }

  @Get('/info')
  getInfo() {
    // return this.rewardDistService.info();
  }

  @Get('/events-tracker-info')
  getEventsTrackerInfo() {
    // return this.rewardDistService.eventsTrackerInfo();
  }

  @Get('/positions/:id')
  getPosition(@Param('id') id: string, @Query() query: any) {
    if(query.walletId) {
      return this.rewardDistService.getPositionByWallet(query.walletId);
    } 

    return this.rewardDistService.getPosition(id);
  }

  @Get('/wallets/:id')
  getWallet(@Param('id') id: string) {
    return this.rewardDistService.getWallet(id);
  }

  @Get('/positions')
  getPositions() {
    return this.rewardDistService.getPositionsWithImpermanentLoss();
  }
}
