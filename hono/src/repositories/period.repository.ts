import { db } from '../db/index.js';
import { periodsTable } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { CreatePeriodDTO } from '../dtos/period.dto.js';

export class PeriodRepository {
  async findByUserId(userId: string) {
    return await db
      .select()
      .from(periodsTable)
      .where(eq(periodsTable.userId, userId))
      .orderBy(periodsTable.startDate);
  }

  async findExists(userId: string, startDate: Date): Promise<boolean> {
    const existing = await db
      .select()
      .from(periodsTable)
      .where(and(eq(periodsTable.userId, userId), eq(periodsTable.startDate, startDate)))
      .limit(1);

    return existing.length > 0;
  }

  async createPeriod(userId: string, periodName: string, startDate: Date, endDate: Date) {
    const [inserted] = await db
      .insert(periodsTable)
      .values({
        userId,
        periodName,
        startDate,
        endDate,
        isClosed: false,
        isSelected: false,
      })
      .returning();

    return inserted;
  }
}
