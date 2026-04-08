// roadmap.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RoadmapEvent {
  title: string;
  description: string;
}

export interface RoadmapMonth {
  monthIndex: number; // 0-11
  monthName: string;
  event: RoadmapEvent;
}

export interface RoadmapQuarter {
  quarterNumber: number; // 1-4
  quarterName: string;
  startMonth: number; // 0-11
  endMonth: number; // 0-11
  months: RoadmapMonth[];
}

export interface RoadmapYear {
  startDate: Date;
  endDate: Date;
  fiscalYear: string; // e.g., "FY2026-2027"
  quarters: RoadmapQuarter[];
}

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  private currentYearSubject = new BehaviorSubject<RoadmapYear | null>(null);
  public currentYear$ = this.currentYearSubject.asObservable();

  private monthNames = [
    'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December', 'January', 'February', 'March'
  ];

  private quarterNames = ['Q1 - Spring', 'Q2 - Summer', 'Q3 - Fall', 'Q4 - Winter'];

  constructor() {
    this.initializeCurrentYear();
  }

  private initializeCurrentYear(): void {
    const today = new Date();
    const currentYear = this.getOrCreateFiscalYear(today);
    this.currentYearSubject.next(currentYear);
  }

  private getOrCreateFiscalYear(date: Date): RoadmapYear {
    const fiscalYear = this.calculateFiscalYear(date);
    const roadmapYear = this.createRoadmapYear(fiscalYear.startDate, fiscalYear.endDate);
    return roadmapYear;
  }

  private calculateFiscalYear(date: Date): { startDate: Date; endDate: Date; fiscalYear: string } {
    const year = date.getFullYear();
    const month = date.getMonth();

    // If current date is April or later, fiscal year starts this year
    // If current date is January, February, or March, fiscal year started previous year
    let startYear: number;
    let endYear: number;

    if (month >= 3) { // April is month 3 (0-indexed)
      startYear = year;
      endYear = year + 1;
    } else {
      startYear = year - 1;
      endYear = year;
    }

    const startDate = new Date(startYear, 3, 1); // April 1st
    const endDate = new Date(endYear, 2, 31); // March 31st
    const fiscalYearString = `Fiscal Year ${startYear}-${endYear.toString().slice(-2)}`;

    return { startDate, endDate, fiscalYear: fiscalYearString };
  }

  private createRoadmapYear(startDate: Date, endDate: Date): RoadmapYear {
    const quarters: RoadmapQuarter[] = [];
    
    // Create 4 quarters, each with 3 months
    for (let q = 0; q < 4; q++) {
      const months: RoadmapMonth[] = [];
      const startMonth = q * 3;
      const endMonth = startMonth + 2;

      for (let m = startMonth; m <= endMonth; m++) {
        const actualMonthIndex = (m + 3) % 12; // Convert fiscal month to calendar month
        const monthName = this.monthNames[m];
        
        // Get existing events or create default ones
        const event = this.getDefaultEvent(m, monthName);
        
        months.push({
          monthIndex: m,
          monthName,
          event
        });
      }

      quarters.push({
        quarterNumber: q + 1,
        quarterName: this.quarterNames[q],
        startMonth: startMonth,
        endMonth: endMonth,
        months
      });
    }

    return {
      startDate,
      endDate,
      fiscalYear: `FY${startDate.getFullYear()}-${endDate.getFullYear().toString().slice(-2)}`,
      quarters
    };
  }

  private getDefaultEvent(monthIndex: number, monthName: string): RoadmapEvent {
    // Default events based on fiscal month position
    const defaultEvents: { [key: number]: RoadmapEvent } = {
      0: { title: 'Fiscal Year Kickoff', description: 'Begin new fiscal year planning and goal setting' },
      1: { title: 'Spring Planning', description: 'Q1 initiatives and resource allocation' },
      2: { title: 'Mid-Q1 Review', description: 'Progress assessment and adjustments' },
      3: { title: 'Summer Strategy', description: 'Q2 strategic planning and team building' },
      4: { title: 'Performance Review', description: 'Q1 performance evaluation and feedback' },
      5: { title: 'Mid-Year Assessment', description: 'First half fiscal year review and course correction' },
      6: { title: 'Fall Planning', description: 'Q3 operational planning and budget review' },
      7: { title: 'Q2 Wrap-up', description: 'Complete Q2 deliverables and documentation' },
      8: { title: 'Budget Planning', description: 'Begin next fiscal year budget preparation' },
      9: { title: 'Winter Strategy', description: 'Q4 execution and final quarter planning' },
      10: { title: 'Year-end Review', description: 'Performance summary and lessons learned' },
      11: { title: 'Fiscal Close', description: 'Complete fiscal year-end activities and reporting' }
    };

    return defaultEvents[monthIndex] || { title: `${monthName} Event`, description: `Monthly activities for ${monthName}` };
  }

  // Public methods
  getCurrentYear(): Observable<RoadmapYear | null> {
    return this.currentYear$;
  }

  getCurrentYearValue(): RoadmapYear | null {
    return this.currentYearSubject.value;
  }

  getQuarter(quarterNumber: number): RoadmapQuarter | undefined {
    const currentYear = this.getCurrentYearValue();
    return currentYear?.quarters.find(q => q.quarterNumber === quarterNumber);
  }

  getMonth(monthIndex: number): RoadmapMonth | undefined {
    const currentYear = this.getCurrentYearValue();
    for (const quarter of currentYear?.quarters || []) {
      const month = quarter.months.find(m => m.monthIndex === monthIndex);
      if (month) return month;
    }
    return undefined;
  }

  updateMonthEvent(monthIndex: number, event: RoadmapEvent): void {
    const currentYear = this.getCurrentYearValue();
    if (!currentYear) return;

    // Find and update the month event
    for (const quarter of currentYear.quarters) {
      const month = quarter.months.find(m => m.monthIndex === monthIndex);
      if (month) {
        month.event = { ...event };
        this.currentYearSubject.next({ ...currentYear });
        break;
      }
    }
  }

  updateQuarterEvents(quarterNumber: number, events: RoadmapEvent[]): void {
    const currentYear = this.getCurrentYearValue();
    if (!currentYear || events.length !== 3) return;

    const quarter = currentYear.quarters.find(q => q.quarterNumber === quarterNumber);
    if (quarter) {
      quarter.months.forEach((month, index) => {
        if (events[index]) {
          month.event = { ...events[index] };
        }
      });
      this.currentYearSubject.next({ ...currentYear });
    }
  }

  rotateToNextYear(): void {
    const currentYear = this.getCurrentYearValue();
    if (!currentYear) return;

    const nextYearStart = new Date(currentYear.startDate);
    nextYearStart.setFullYear(nextYearStart.getFullYear() + 1);
    
    const nextYearEnd = new Date(currentYear.endDate);
    nextYearEnd.setFullYear(nextYearEnd.getFullYear() + 1);

    const newYear = this.createRoadmapYear(nextYearStart, nextYearEnd);
    this.currentYearSubject.next(newYear);
  }

  rotateToPreviousYear(): void {
    const currentYear = this.getCurrentYearValue();
    if (!currentYear) return;

    const prevYearStart = new Date(currentYear.startDate);
    prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);
    
    const prevYearEnd = new Date(currentYear.endDate);
    prevYearEnd.setFullYear(prevYearEnd.getFullYear() - 1);

    const newYear = this.createRoadmapYear(prevYearStart, prevYearEnd);
    this.currentYearSubject.next(newYear);
  }

  isDateInCurrentFiscalYear(date: Date): boolean {
    const currentYear = this.getCurrentYearValue();
    if (!currentYear) return false;

    return date >= currentYear.startDate && date <= currentYear.endDate;
  }

  getCurrentFiscalMonth(): number {
    const today = new Date();
    const currentYear = this.getCurrentYearValue();
    if (!currentYear || !this.isDateInCurrentFiscalYear(today)) return -1;

    // Calculate fiscal month (0-11)
    const startYear = currentYear.startDate.getFullYear();
    const currentMonth = today.getMonth();
    const currentYearMonth = today.getFullYear() * 12 + currentMonth;
    const startYearMonth = startYear * 12 + 3; // April is month 3

    return currentYearMonth - startYearMonth;
  }

  // Auto-rotation check (can be called periodically)
  checkAndAutoRotate(): void {
    const today = new Date();
    const currentYear = this.getCurrentYearValue();
    
    if (currentYear && today > currentYear.endDate) {
      this.rotateToNextYear();
    }
  }
}