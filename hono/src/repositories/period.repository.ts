import { CreatePeriodDTO } from '../dtos/period.dto.js';

export class PeriodRepository {
  async findExists(userId: string, year: number, month: number): Promise<boolean> {
    // Logic query DB (Drizzle/Prisma/PostgreSQL) di sini
    return false;
  }

  async createPeriod(userId: string, dto: CreatePeriodDTO) {
    // Logic insert DB di sini
    return {
      id: 1,
      userId,
      periodName: `Period ${dto.month}/${dto.year}`,
      isClosed: false,
    };
  }
      }
