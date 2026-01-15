/**
 * Format phone number based on country
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
export function formatPhone(phone) {
    if (!phone) return '';

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Uzbekistan format: +998(XX)-XXX-XX-XX
    if (cleaned.startsWith('+998') || cleaned.startsWith('998')) {
        const digits = cleaned.replace(/\D/g, '');
        if (digits.length === 12) {
            return `+998(${digits.slice(3, 5)})-${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
        }
    }

    // Russia format: +7(XXX)-XXX-XX-XX
    if (cleaned.startsWith('+7') || (cleaned.startsWith('7') && cleaned.length === 11)) {
        const digits = cleaned.replace(/\D/g, '');
        if (digits.length === 11) {
            return `+7(${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
        }
    }

    // USA/Canada format: +1(XXX)-XXX-XXXX
    if (cleaned.startsWith('+1') || (cleaned.length === 10 && !cleaned.startsWith('+'))) {
        const digits = cleaned.replace(/\D/g, '');
        if (digits.length === 10) {
            return `+1(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        }
        if (digits.length === 11 && digits.startsWith('1')) {
            return `+1(${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
        }
    }

    // Kazakhstan format: +7(7XX)-XXX-XX-XX
    if (cleaned.startsWith('+77') || cleaned.startsWith('77')) {
        const digits = cleaned.replace(/\D/g, '');
        if (digits.length === 11) {
            return `+7(${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
        }
    }

    // Default: return as-is with + prefix if missing
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}
