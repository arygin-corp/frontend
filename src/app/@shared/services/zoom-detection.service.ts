// zoom-detection.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ZoomDetectionService implements OnDestroy {
  private zoomLevelSubject = new BehaviorSubject<number>(100);
  private isZoomedSubject = new BehaviorSubject<boolean>(false);
  private scaleAdjustmentSubject = new BehaviorSubject<number>(1);
  
  public zoomLevel$ = this.zoomLevelSubject.asObservable();
  public isZoomed$ = this.isZoomedSubject.asObservable();
  public scaleAdjustment$ = this.scaleAdjustmentSubject.asObservable();
  
  private resizeListener: () => void;
  private visualViewportListener: () => void;
  private zoomThreshold = 125; // 125% zoom threshold

  constructor() {
    this.setupZoomDetection();
  }

  private setupZoomDetection(): void {
    // Method 1: Using outerWidth/innerWidth ratio (most reliable for desktop)
    const updateZoomLevel = () => {
      const zoomLevel = this.calculateZoomLevel();
      this.zoomLevelSubject.next(zoomLevel);
      this.isZoomedSubject.next(zoomLevel > this.zoomThreshold);
      
      // Calculate scale adjustment to bring back to ~100%
      if (zoomLevel > this.zoomThreshold) {
        const scaleAdjustment = 100 / zoomLevel;
        this.scaleAdjustmentSubject.next(scaleAdjustment);
      } else {
        this.scaleAdjustmentSubject.next(1);
      }
    };

    // Listen to window resize events
    this.resizeListener = () => updateZoomLevel();
    window.addEventListener('resize', this.resizeListener);

    // Method 2: VisualViewport API for pinch-to-zoom (mobile/tablet)
    if (window.visualViewport) {
      this.visualViewportListener = () => updateZoomLevel();
      window.visualViewport.addEventListener('resize', this.visualViewportListener);
    }

    // Method 3: devicePixelRatio for additional accuracy
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mediaQuery.addEventListener('change', updateZoomLevel);

    // Initial calculation
    updateZoomLevel();
  }

  private calculateZoomLevel(): number {
    // Method 1: outerWidth/innerWidth ratio
    const ratioZoom = Math.round((window.outerWidth / window.innerWidth) * 100);
    
    // Method 2: devicePixelRatio
    const dprZoom = Math.round(window.devicePixelRatio * 100);
    
    // Method 3: VisualViewport scale (if available)
    const visualZoom = window.visualViewport?.scale 
      ? Math.round(window.visualViewport.scale * 100) 
      : 100;

    // Use the most reliable method based on browser support
    // For desktop browsers, ratio method is usually most accurate
    // For mobile, VisualViewport is better
    if (window.visualViewport?.scale && window.visualViewport.scale !== 1) {
      return visualZoom;
    }
    
    // Fallback to ratio method, but validate it's reasonable
    if (ratioZoom >= 50 && ratioZoom <= 500) {
      return ratioZoom;
    }
    
    return dprZoom;
  }

  public getCurrentZoomLevel(): number {
    return this.zoomLevelSubject.value;
  }

  public isZoomedAboveThreshold(): boolean {
    return this.zoomLevelSubject.value > this.zoomThreshold;
  }

  public getScaleAdjustment(): number {
    return this.scaleAdjustmentSubject.value;
  }

  public setZoomThreshold(threshold: number): void {
    this.zoomThreshold = threshold;
    this.isZoomedSubject.next(this.zoomLevelSubject.value > threshold);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.visualViewportListener && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.visualViewportListener);
    }
  }
}