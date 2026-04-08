// zoom-scale.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ZoomDetectionService } from '../../@shared/services/zoom-detection.service';

@Component({
  selector: 'app-zoom-scale',
  template: `
    <div class="zoom-container" [ngStyle]="getContainerStyle()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .zoom-container {
      transform-origin: top left;
      transition: transform 0.3s ease-in-out;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ZoomScaleComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  public scaleAdjustment = 1;
  public isZoomed = false;

  constructor(private zoomService: ZoomDetectionService) {}

  ngOnInit(): void {
    // Subscribe to zoom level changes
    this.subscription.add(
      this.zoomService.scaleAdjustment$.subscribe(scale => {
        this.scaleAdjustment = scale;
      })
    );

    this.subscription.add(
      this.zoomService.isZoomed$.subscribe(isZoomed => {
        this.isZoomed = isZoomed;
      })
    );
  }

  getContainerStyle(): any {
    if (this.isZoomed && this.scaleAdjustment < 1) {
      return {
        'transform': `scale(${this.scaleAdjustment})`,
        'width': `${100 / this.scaleAdjustment}%`,
        'height': `${100 / this.scaleAdjustment}%`
      };
    }
    return {};
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}