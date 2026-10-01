import { db } from '../db/index.js';
import { periods } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { CreatePeriodDTO } from '../dtos/period.dto.js';

export class PeriodRepository {
  async findByUserId(userId: string) {
    return await db
      .select()
      .from(periods)
      .where(eq(periods.userId, userId))
      .orderBy(periods.startDate);
  }

  async findExists(userId: string, startDate: Date): Promise<boolean> {
    const existing = await db
      .select()
      .from(periods)
      .where(
        and(
          eq(periods.userId, userId),
          eq(periods.startDate, startDate.toISOString())
        )
      )
      .limit(1);

    return existing.length > 0;
  }

  async createPeriod(userId: string, periodName: string, startDate: Date, endDate: Date) {
    const [inserted] = await db
      .insert(periods)
      .values({
        userId,
        periodName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isClosed: false,
        isSelected: false,
      })
      .returning();

    return inserted;
  }
}
