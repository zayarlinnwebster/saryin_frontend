import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

const DELIMITER = '-';

/**
 * Converts a Date object to an NgbDateStruct.
 * @param date - The Date object to convert.
 * @returns An NgbDateStruct or null if the input is null.
 */
export function fromDateToNgbDate(date: Date | null): NgbDateStruct | null {
    if (date) {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
        };
    }
    return null;
}

/**
 * Converts an NgbDateStruct to a Date object.
 * @param ngbDate - The NgbDateStruct to convert.
 * @returns A Date object or null if the input is null.
 */
export function fromNgbDateToDate(ngbDate: NgbDateStruct | null): Date | null {
    if (ngbDate) {
        return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
    }
    return null;
}

/**
 * Formats an NgbDateStruct into a string with a custom delimiter.
 * @param ngbDate - The NgbDateStruct to format.
 * @returns A formatted string or an empty string if the input is null.
 */
export function formatNgbDate(ngbDate: NgbDateStruct | null): string {
    if (!ngbDate) {
        return '';
    }

    const year = ngbDate.year.toString().padStart(4, '0');
    const month = ngbDate.month.toString().padStart(2, '0');
    const day = ngbDate.day.toString().padStart(2, '0');

    return `${year}${DELIMITER}${month}${DELIMITER}${day}`;
}

/**
 * Parses a formatted string into an NgbDateStruct.
 * @param value - The string to parse.
 * @returns An NgbDateStruct or null if parsing fails.
 */
export function parseToNgbDate(value: string): NgbDateStruct | null {
    if (!value) {
        return null;
    }

    const parts = value.trim().split(DELIMITER);
    if (parts.length !== 3) {
        return null;
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
    }

    return { year, month, day };
}
