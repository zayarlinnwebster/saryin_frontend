import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class CustomDateAdapterFormatter extends NgbDateAdapter<Date> implements NgbDateParserFormatter {
  readonly DELIMITER = '-';

  fromModel(date: Date | null): NgbDateStruct | null {
    if (date) {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): Date | null {
    if (date) {
      return new Date(date.year, date.month - 1, date.day);
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    if (!date) {
      return '';
    }

    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');

    return `${year}${this.DELIMITER}${month}${this.DELIMITER}${day}`;
  }

  parse(value: string): NgbDateStruct | null {
    if (!value) {
      return null;
    }

    const parts = value.trim().split(this.DELIMITER);
    if (parts.length !== 3) {
      return null;
    }

    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null;
    }

    return { day, month, year };
  }
}
