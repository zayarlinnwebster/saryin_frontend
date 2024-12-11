import { Injectable } from '@angular/core';
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class DateRangeService {
  hoveredDate: NgbDate | null = null;

  private _fromDate!: NgbDate | null;
  private _toDate!: NgbDate | null;

  constructor(
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter
  ) { }

  get fromDate() {
    return this._fromDate;
  }

  get toDate() {
    return this._toDate;
  }

  get currentDate() {
    return new Date();
  }

  // First date of the current month
  get monthFirstDate(): NgbDate {
    const firstDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );

    return <NgbDate>{
      day: firstDay.getDate(),
      month: firstDay.getMonth() + 1,
      year: firstDay.getFullYear(),
    };
  }

  // Last date of the current month
  get monthLastDate(): NgbDate {
    const lastDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0
    );

    return <NgbDate>{
      day: lastDay.getDate(),
      month: lastDay.getMonth() + 1,
      year: lastDay.getFullYear(),
    };
  }

  // First date of the current year
  get yearFirstDate(): NgbDate {
    const firstDayOfYear = new Date(this.currentDate.getFullYear(), 0, 1);

    return <NgbDate>{
      day: firstDayOfYear.getDate(),
      month: firstDayOfYear.getMonth() + 1,
      year: firstDayOfYear.getFullYear(),
    };
  }

  // Last date of the current year
  get yearLastDate(): NgbDate {
    const lastDayOfYear = new Date(this.currentDate.getFullYear(), 11, 31);

    return <NgbDate>{
      day: lastDayOfYear.getDate(),
      month: lastDayOfYear.getMonth() + 1,
      year: lastDayOfYear.getFullYear(),
    };
  }

  set fromDate(date: NgbDate | null) {
    this._fromDate = date;
  }

  set toDate(date: NgbDate | null) {
    this._toDate = date;
  }

  isHovered(date: NgbDate) {
    return (
      this._fromDate &&
      !this._toDate &&
      this.hoveredDate &&
      date.after(this._fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return (
      this._toDate && date.after(this._fromDate) && date.before(this._toDate)
    );
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this._fromDate) ||
      (this._toDate && date.equals(this._toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }
}
