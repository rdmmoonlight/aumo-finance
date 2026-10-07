// Pengganti AumoBackend.Helpers.PeriodLock
// Cek apakah tanggal masuk dalam periode yang sudah closed

export interface ClosedPeriod {
    startDate: Date;
    endDate: Date;
}

export function isDateLocked(entryDate: Date, closedPeriods: ClosedPeriod[]): boolean {
    if (!closedPeriods || closedPeriods.length === 0) return false;

    const target = new Date(entryDate);
    // Normalize ke start of day untuk perbandingan
    target.setHours(0, 0, 0, 0);

    return closedPeriods.some(period => {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return target >= start && target <= end;
    });
}

export const PeriodLock = {
    IsDateLocked: isDateLocked,
    isDateLocked
};
