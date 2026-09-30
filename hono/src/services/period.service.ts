import { CreatePeriodDTO } from '../dtos/period.dto.js';
import { PeriodRepository } from '../repositories/period.repository.js';

export class PeriodService {
  constructor(private repo: PeriodRepository) {}

  async getPeriods(userId: string) {
    return await this.repo.findByUserId(userId);
  }

  async createPeriod(userId: string, dto: CreatePeriodDTO) {
    const startDate = new Date(Date.UTC(dto.year, dto.month - 1, 1));
    const endDate = new Date(Date.UTC(dto.year, dto.month, 0, 23, 59, 59, 999));
    const periodName = startDate.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

    const exists = await this.repo.findExists(userId, startDate);
    if (exists) {
      throw new Error(`Period ${periodName} already exists.`);
    }

    return await this.repo.createPeriod(userId, periodName, startDate, endDate);
  }
      }
                                        
