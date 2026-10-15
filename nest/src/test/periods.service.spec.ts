import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DRIZZLE_DB,
  GL_SERVICE,
  PeriodsService,
  TX_NUMBER_SERVICE,
} from '../modules/periods/periods.service';

// 1. Membuat Mocking Drizzle Query Builder yang bisa di-chain (berantai)
const createQueryBuilderMock = () => {
  const qb: any = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
  };
  return qb;
};

describe('PeriodsService', () => {
  let service: PeriodsService;
  let mockDb: any;
  let mockTxNumberService: any;
  let mockGlService: any;

  beforeEach(async () => {
    // Setup mock objects
    const qbMock = createQueryBuilderMock();

    mockDb = {
      ...qbMock,
      query: {
        periods: { findFirst: vi.fn() },
        chartOfAccounts: { findFirst: vi.fn() },
      },
      // Mock transaction dengan langsung mengeksekusi callback-nya dan melempar mockDb sebagai 'tx'
      transaction: vi.fn(async (cb) => {
        const txMock = {
          ...mockDb,
          rollback: vi.fn(),
        };
        return cb(txMock);
      }),
    };

    mockTxNumberService = {
      generate: vi.fn(),
    };

    mockGlService = {
      refreshGeneralLedgers: vi.fn(),
      clearSelectedPeriodLedgers: vi.fn(),
    };

    // Konfigurasi NestJS Testing Module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodsService,
        { provide: DRIZZLE_DB, useValue: mockDb },
        { provide: TX_NUMBER_SERVICE, useValue: mockTxNumberService },
        { provide: GL_SERVICE, useValue: mockGlService },
      ],
    }).compile();

    service = module.get<PeriodsService>(PeriodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPeriods', () => {
    it('should return periods and selectedPeriodId correctly', async () => {
      const userId = 'user-123';
      const mockPeriods = [
        { id: 1, periodName: 'January 2026', isSelected: false },
        { id: 2, periodName: 'February 2026', isSelected: true },
      ];

      // Resolve hasil query Drizzle di ujung chain (orderBy)
      mockDb.orderBy.mockResolvedValueOnce(mockPeriods);

      const result = await service.getPeriods(userId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();

      expect(result.success).toBe(true);
      expect(result.selectedPeriodId).toBe(2);
      expect(result.periods).toEqual([
        { id: 1, periodName: 'January 2026', isSelected: false },
        { id: 2, periodName: 'February 2026', isSelected: true }, // Terpilih
      ]);
    });
  });

  describe('selectPeriod', () => {
    it('should select a period, update DB, and refresh GL', async () => {
      const userId = 'user-123';
      const periodId = 5;
      const mockPeriod = { id: periodId, periodName: 'March 2026', isClosed: false };

      // Mock findFirst query periods
      mockDb.query.periods.findFirst.mockResolvedValueOnce(mockPeriod);

      const result = await service.selectPeriod(userId, periodId);

      expect(mockDb.query.periods.findFirst).toHaveBeenCalled();
      // Memastikan db.update dipanggil (mengubah isSelected = false lalu true)
      expect(mockDb.update).toHaveBeenCalledTimes(2);
      // Memastikan db.insert (untuk selectedPeriods) dipanggil
      expect(mockDb.insert).toHaveBeenCalled();
      // Memastikan service eksternal GL di-refresh
      expect(mockGlService.refreshGeneralLedgers).toHaveBeenCalledWith(userId);

      expect(result).toEqual({
        success: true,
        selectedPeriodId: periodId,
        message: 'Now viewing March 2026.',
      });
    });

    it('should return null if period is not found', async () => {
      const userId = 'user-123';
      const periodId = 999;

      // Mock tidak menemukan data
      mockDb.query.periods.findFirst.mockResolvedValueOnce(null);

      const result = await service.selectPeriod(userId, periodId);

      expect(result).toBeNull();
      expect(mockDb.update).not.toHaveBeenCalled();
      expect(mockGlService.refreshGeneralLedgers).not.toHaveBeenCalled();
    });
  });

  describe('closePeriod', () => {
    it('should close the period successfully if no earlier open periods exist', async () => {
      const userId = 'user-123';
      const periodId = 1;

      // Mock period yang ingin ditutup
      mockDb.query.periods.findFirst
        .mockResolvedValueOnce({ id: periodId, periodName: 'Jan 2026', isClosed: false })
        // Mock pencarian earlier period (tidak menemukan period sebelumnya yang terbuka)
        .mockResolvedValueOnce(null);

      const result = await service.closePeriod(userId, periodId);

      expect(mockDb.update).toHaveBeenCalled(); // Pastikan update dipanggil
      expect(result).toEqual({
        success: true,
        message: 'Period Jan 2026 has been closed. Transactions in this period are now locked.',
      });
    });

    it('should fail to close if period is already closed', async () => {
      const userId = 'user-123';
      const periodId = 1;

      mockDb.query.periods.findFirst.mockResolvedValueOnce({
        id: periodId,
        periodName: 'Jan 2026',
        isClosed: true, // Sudah tertutup
      });

      const result = await service.closePeriod(userId, periodId);

      expect(result).toEqual({
        success: false,
        message: 'Period Jan 2026 is already closed.',
      });
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });
});
