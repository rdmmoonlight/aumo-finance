/**
 * Format Angka ke Rupiah (IDR)
 */
export function formatRupiah(amount, options = {}) {
    const { showSymbol = true, compact = false } = options;
    if (amount == null || isNaN(amount)) return showSymbol ? 'Rp 0' : '0';

    if (compact) {
        return new Intl.NumberFormat('id-ID', {
            style: showSymbol ? 'currency' : 'decimal',
            currency: 'IDR',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(amount);
    }

    const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);

    return showSymbol ? `Rp ${formatted}` : formatted;
}

/**
 * Format Tanggal Indonesia (contoh: 12 Oktober 2026)
 */
export function formatDate(date, formatStyle = 'medium') {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const optionsMap = {
        short: { day: 'numeric', month: 'numeric', year: 'numeric' }, // 12/10/2026
        medium: { day: 'numeric', month: 'short', year: 'numeric' },  // 12 Okt 2026
        long: { day: 'numeric', month: 'long', year: 'numeric' },     // 12 Oktober 2026
    };

    return new Intl.DateTimeFormat('id-ID', optionsMap[formatStyle] || optionsMap.medium).format(d);
}

/**
 * Format Angka Generik
 */
export function formatNumber(val, decimals = 0) {
    if (val == null || isNaN(val)) return '0';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(val);
}

export const formatNumberAccounting = (n) => {
    const f = new Intl.NumberFormat("id-ID", {
        style: "decimal",
        maximumFractionDigits: 0,
    }).format(Math.abs(n));
    return n < 0 ? `(${f})` : f;
};

export const formatDateDisplay = (s) =>
    !s
        ? ""
        : new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(s));

export const formatNumberWithParen = (amount) => {
    const f = new Intl.NumberFormat("id-ID", {
        style: "decimal",
        maximumFractionDigits: 0,
    }).format(Math.abs(amount));
    return amount < 0 ? `(${f})` : f;
};

export const formatDateTimeDisplay = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return `${new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(d)}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
