// roadmap-bootstrap.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RoadmapService, RoadmapMonth, RoadmapEvent } from '../../@shared/services/roadmap.service';

declare let bootstrap: any;

@Component({
  selector: 'app-roadmap',
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss']
})
export class RoadmapComponent implements OnInit, OnDestroy {
  currentYear$: Observable<any>;
  editingMonth: RoadmapMonth | null = null;
  editingEvent: RoadmapEvent = { title: '', description: '' };
  
  private destroy$ = new Subject<void>();

  constructor(public roadmapService: RoadmapService) {
    this.currentYear$ = this.roadmapService.currentYear$;
  }

  ngOnInit(): void {
    // Subscribe to current year changes
    this.roadmapService.currentYear$
      .pipe(takeUntil(this.destroy$))
      .subscribe(year => {
        console.log('Current fiscal year:', year);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getQuarterMonths(quarter: any): RoadmapMonth[] {
    return quarter.months || [];
  }

  getMonthDateDisplay(month: RoadmapMonth): string {
    const currentYear = this.roadmapService.getCurrentYearValue();
    if (!currentYear) return '';
    
    const fiscalStartYear = currentYear.startDate.getFullYear();
    const actualYear = month.monthIndex >= 9 ? fiscalStartYear + 1 : fiscalStartYear;
    
    return `${month.monthName} ${actualYear}`;
  }

  onEditEvent(month: RoadmapMonth): void {
    this.editingMonth = month;
    this.editingEvent = { ...month.event };
    
    // Show Bootstrap modal
    const modal = new bootstrap.Modal(document.getElementById('editEventModal'));
    modal.show();
  }

  saveEvent(): void {
    if (this.editingMonth) {
      this.roadmapService.updateMonthEvent(this.editingMonth.monthIndex, this.editingEvent);
      
      // Hide modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
      modal.hide();
      
      // Reset editing state
      this.editingMonth = null;
      this.editingEvent = { title: '', description: '' };
    }
  }

  trackByQuarter(index: number, quarter: any): number {
    return quarter.quarterNumber;
  }

  trackByMonth(index: number, month: RoadmapMonth): number {
    return month.monthIndex;
  }
}