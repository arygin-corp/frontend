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
import { FormBuilder, FormGroup } from '@angular/forms';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';

import { Product } from '../../interfaces/product';
import { RootService } from '../../services/root.service';
import { ShopService } from '../../api/shop.service';
import { CartService } from '../../services/cart.service';

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
    // Data
    suggestedProducts: Product[] = [];
    addedToCartProducts: Product[] = [];
    recentSearches: string[] = [];
    // Pagination & Suggestion logic
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    didYouMean: string | null = null;
    // Filters (Matching template expectations)

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
        public root: RootService,
    ) { }

    ngOnInit(): void {
        this.loadRecentSearches();
        this.initForm();
        this.initExternalClickListeners();
    }

    // 3. Fix the "applyFilters does not exist" error
    applyFilters(): void {
        this.isLoading = true;
        this.currentPage = 1; // Reset to first page on filter change
        this.executeSearch().subscribe({
            next: (res) => {
                this.handleResults(res);
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    private initForm(): void {
        this.form = this.fb.group({ query: [''] });

        this.form.get('query')?.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map(q => q.trim()),
            switchMap(query => {
                if (query.length >= 3) {
                    this.isLoading = true;
                    this.currentPage = 1;
                    return this.executeSearch(query);
                }
                this.isLoading = false;
                this.hasSuggestions = false;
                return of({ items: [], total_pages: 0 });
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (res) => this.handleResults(res),
            error: () => this.isLoading = false
        });
    }

    toggleDomain(slug: string): void {
        this.runSearch();
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
        return this.shop.getSuggestions(query, 6, { 
            page: this.currentPage,
        });
    }

    handleResults(res: any): void {
        this.isLoading = false;
        this.suggestedProducts = res.items || [];
        this.totalPages = res.total_pages || 1;
        this.totalItems = res.total_items || 0;
        this.didYouMean = res.did_you_mean || null;
        this.hasSuggestions = this.suggestedProducts.length > 0 || !!this.didYouMean;
        
        if (this.hasSuggestions) {
            this.saveRecentSearch(this.form.value.query);
            this.openSuggestion();
        }
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.runSearch();
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
        if (!query || query.length < 3) return;
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
    trackByProductId(index: number, product: Product): number { return product.id; }

    ngOnChanges(changes: SimpleChanges): void {
        // Handle location changes if needed
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}