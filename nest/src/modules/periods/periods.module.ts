import { Module } from '@nestjs/common';
console.log('PERIODS MODULE: File loaded');
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PeriodsController } from './periods.controller.js';
import { PeriodsService } from './periods.service.js';

@Module({
  controllers: [PeriodsController],
  providers: [PeriodsService, AuthGuard],
  exports: [PeriodsService],
})
export class PeriodsModule {}