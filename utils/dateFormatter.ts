const monthNameToNumber: { [key: string]: string } = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'december': '12', 'dec': '12'
};

const monthNumberToName: { [key: string]: string } = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'Desember'
};

/**
 * Converts a display date string (e.g., "07 June") to "dd/mm" format.
 * If the string is already in "dd/mm" format, it ensures padding and returns it.
 * @param dateStr - The date string to format.
 * @returns The date string in "dd/mm" format, or an empty string if invalid.
 */
export const formatDisplayDateToDdMm = (dateStr: string): string => {
    if (!dateStr) return '';
    const trimmedDateStr = dateStr.trim();

    const ddMmParts = trimmedDateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (ddMmParts) {
        const day = ddMmParts[1].padStart(2, '0');
        const month = ddMmParts[2].padStart(2, '0');
        return `${day}/${month}`;
    }
    
    const ddMonthParts = trimmedDateStr.split(' ');
    if (ddMonthParts.length === 2) {
        const day = ddMonthParts[0].padStart(2, '0');
        const monthName = ddMonthParts[1].toLowerCase();
        const monthNumber = monthNameToNumber[monthName];
        if (monthNumber) {
            return `${day}/${monthNumber}`;
        }
    }

    return ''; 
};

/**
 * Converts a "dd/mm" date string to "dd Month" format (e.g., "10/12" to "10 Desember").
 * @param ddMm - The date string in "dd/mm" format.
 * @returns The date string in "dd Month" format, or the original string if invalid.
 */
export const formatDdMmToDisplayDate = (ddMm: string): string => {
    if (!isValidDdMm(ddMm)) return ddMm;
    const [day, month] = ddMm.split('/');
    const monthName = monthNumberToName[month.padStart(2, '0')];
    if (monthName) {
        return `${parseInt(day, 10)} ${monthName}`;
    }
    return ddMm;
};


/**
 * Validates if a string is in "dd/mm" format and represents a plausible date.
 * @param ddMm - The string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidDdMm = (ddMm: string): boolean => {
    if (!ddMm) return false;
    const trimmedDdMm = ddMm.trim();
    if (!/^\d{1,2}\/\d{1,2}$/.test(trimmedDdMm)) return false;
    
    const parts = trimmedDdMm.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    
    if (isNaN(day) || isNaN(month)) return false;

    return day > 0 && day <= 31 && month > 0 && month <= 12;
};