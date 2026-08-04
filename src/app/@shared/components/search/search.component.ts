import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { Product } from '../../interfaces/product';
import { RootService } from '../../services/root.service';
import { ShopService } from '../../api/shop.service';
import { CartService } from '../../services/cart.service';
import { ProductSuggestionService, SuggestionResult, NormalizedProduct } from '../../api/product-suggestion.service';

export type SearchLocation = 'header' | 'indicator' | 'mobile-header';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  exportAs: 'search',
})

export class SearchComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('input') inputElementRef!: ElementRef;
  @Input() location: SearchLocation = 'header';
  @Output() escape: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeButtonClick: EventEmitter<void> = new EventEmitter<void>();
  @HostBinding('class.search') classSearch = true;
  @HostBinding('class.search--location--header') get classSearchLocationHeader() { return this.location === 'header'; }
  @HostBinding('class.search--location--indicator') get classSearchLocationIndicator() { return this.location === 'indicator'; }
  @HostBinding('class.search--location--mobile-header') get classSearchLocationMobileHeader() { return this.location === 'mobile-header'; }
  @HostBinding('class.search--has-suggestions') get classSearchHasSuggestions() { return this.hasSuggestions; }
  @HostBinding('class.search--suggestions-open') classSearchSuggestionsOpen = false;

  private destroy$: Subject<void> = new Subject<void>();
  form!: FormGroup;
  isLoading = false;
  hasSuggestions = false;

  suggestedProducts: Partial<Product>[] = [];
  addedToCartProducts: Product[] = [];
  recentSearches: string[] = [];

  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  didYouMean: string | null = null;

  get inputElement(): HTMLInputElement {
    return this.inputElementRef.nativeElement;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private zone: NgZone,
    private shop: ShopService,
    private cart: CartService,
    private suggestionService: ProductSuggestionService,
    public root: RootService,
  ) { }

  ngOnInit(): void {
    this.loadRecentSearches();
    this.initForm();
    this.initExternalClickListeners();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.runSearch();
  }

  applyFilters(): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.executeSearch(this.form.value.query).subscribe({
      next: (res) => {
        this.handleResults(res);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // applyFilters(): void {
  //   this.isLoading = true;
  //   this.currentPage = 1;
  //   this.executeSearch().subscribe({
  //     next: (res) => {
  //       this.handleResults(res);
  //       this.isLoading = false;
  //     },
  //     error: () => this.isLoading = false
  //   });
  // }

  private initForm(): void {
    this.form = this.fb.group({
      query: ['']
    });

    this.form.get('query')?.valueChanges.pipe(
      map(v => (v || '').trim()),
      debounceTime(150),               // faster responsiveness
      distinctUntilChanged(),
      tap(() => {
        // show spinner immediately
        this.isLoading = true;
      }),
      switchMap(q => {
        if (!q || q.length < 1) {
          this.isLoading = false;
          this.hasSuggestions = false;
          return of({ items: [], total_pages: 0, total_items: 0 });
        }

        // First try fast local client-side search
        return this.shop.localSearch(q, 6).pipe(
          switchMap(localRes => {
            if (localRes.items && localRes.items.length > 0) {
              return of({ items: localRes.items, total_pages: 1, total_items: localRes.items.length, did_you_mean: localRes.did_you_mean });
            }
            return this.shop.getSuggestions(q, 100, { page: 1 });
          }),
          catchError(() => of({ items: [], total_pages: 0, total_items: 0 }))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        this.handleResults(res);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private runSearch(): void {
    this.isLoading = true;
    this.currentPage = 1;

    this.executeSearch().subscribe(
      (res) => this.handleResults(res),
      () => this.isLoading = false
    );
  }

  executeSearch(query: string = this.form.value.query): Observable<any> {
    if (!query || query.trim().length < 3) {
        return of({ items: [], total_pages: 1, total_items: 0 });
    }

    const q = query.trim().toLowerCase();

    return this.shop.getProductsList(null, { page: 1, limit: 1000 }).pipe(
        map(res => {
            const all = res.items || [];
            const matched = all.filter((p: any) => {
                return (
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (p.short_desc && p.short_desc.toLowerCase().includes(q)) ||
                    (p.brief_desc && p.brief_desc.toLowerCase().includes(q)) ||
                    (p.sku && p.sku.toString().toLowerCase().includes(q)) ||
                    (p.datatype && p.datatype.toLowerCase().includes(q)) ||
                    (p.data_steward?.name && p.data_steward.name.toLowerCase().includes(q)) ||
                    (p.data_steward?.email && p.data_steward.email.toLowerCase().includes(q)) ||
                    (p.domain && p.domain.toLowerCase().includes(q)) ||
                    (p.classification && p.classification.toLowerCase().includes(q)) ||
                    (p.tags && Array.isArray(p.tags) && p.tags.some((t: any) => (t.name || t).toLowerCase().includes(q))) ||
                    (p.keywords && Array.isArray(p.keywords) && p.keywords.some((k: any) => (k.name || k).toLowerCase().includes(q)))
                );
            });

            return {
                items: matched.slice(0, 6),
                total_pages: 1,
                total_items: matched.length,
                did_you_mean: null
            };
        })
    );
  }

  private slugify(text: string): string {
    return (text || '').toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  handleResults(res: any): void {
    this.isLoading = false;
    this.suggestedProducts = res.items || [];
    this.totalPages = res.total_pages || 1;
    this.totalItems = res.total_items || this.suggestedProducts.length;
    this.didYouMean = res.did_you_mean || null;
    this.hasSuggestions = this.suggestedProducts.length > 0 || !!this.didYouMean;
    this.classSearchSuggestionsOpen = this.hasSuggestions;
    if (this.hasSuggestions) {
      this.saveRecentSearch(this.form.value.query || '');
      this.openSuggestion();
    } else {
      this.closeSuggestion();
    }
    console.log('suggestedProducts', this.suggestedProducts);
  }

  trackByProductId(index: number, product: Partial<Product>): number {
    return typeof product?.id === 'number' ? product.id : index;
  }

  applySuggestion(suggestion: string): void {
    this.form.get('query')?.setValue(suggestion);
    this.didYouMean = null;
  }

  private loadRecentSearches(): void {
    const saved = localStorage.getItem('recent_searches');
    this.recentSearches = saved ? JSON.parse(saved) : [];
  }

  private saveRecentSearch(query: string): void {
    if (!query || query.length < 1) return;
    this.recentSearches = [query, ...this.recentSearches.filter(s => s !== query)].slice(0, 5);
    localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
  }

  private initExternalClickListeners(): void {
    this.zone.runOutsideAngular(() => {
      fromEvent(this.document, 'click').pipe(takeUntil(this.destroy$)).subscribe(event => {
        if (!(event.target as HTMLElement).closest('.search')) {
          this.zone.run(() => this.closeSuggestion());
        }
      });
    });
  }

  openSuggestion(): void { this.classSearchSuggestionsOpen = true; }
  closeSuggestion(): void { this.classSearchSuggestionsOpen = false; }

  ngOnChanges(changes: SimpleChanges): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
