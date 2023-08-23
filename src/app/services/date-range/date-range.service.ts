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
  ) {}

  get fromDate() {
    return this._fromDate;
  }

  get toDate() {
    return this._toDate;
  }

  get currentDate() {
    return new Date();
  }

  get monthFirstDate(): NgbDate {
    var firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);

    return <NgbDate>{
      day: firstDay.getDate(),
      month: firstDay.getMonth() + 1,
      year: firstDay.getFullYear(),
    };
  }

  get monthLastDate(): NgbDate {
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    return <NgbDate>{
      day: lastDay.getDate(),
      month: lastDay.getMonth() + 1,
      year: lastDay.getFullYear(),
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
