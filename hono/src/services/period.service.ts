import { CreatePeriodDTO } from '../dtos/period.dto.js';
import { PeriodRepository } from '../repositories/period.repository.js';

export class PeriodService {
  constructor(private repo: PeriodRepository) {}

  async createPeriod(userId: string, dto: CreatePeriodDTO) {
    const exists = await this.repo.findExists(userId, dto.year, dto.month);
    if (exists) {
      throw new Error(`Period for ${dto.month}/${dto.year} already exists.`);
    }

    return await this.repo.createPeriod(userId, dto);
  }
      }
