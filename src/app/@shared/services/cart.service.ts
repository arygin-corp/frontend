import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Product } from '../interfaces/product';
import { CartItem } from '../interfaces/cart-item';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface CartTotal {
    title: string;
    price: number;
    type: 'shipping'|'fee'|'tax'|'other';
}

export interface MarketplaceState {
    items: CartItem[];
    catalogItems: CartItem[];
    darRequests: any[];
    productRequests: any[];
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private data = {
        items: [] as CartItem[],
        darRequests: [] as any[],
        quantity: 0,
        subtotal: 0,
        totals: [] as CartTotal[],
        total: 0
    };

    // Add this to store the successful order details
    private lastReceipt: any = null;

    private itemsSubject$ = new BehaviorSubject<CartItem[]>([]);
    private quantitySubject$ = new BehaviorSubject<number>(0);
    private subtotalSubject$ = new BehaviorSubject<number>(0);
    private totalsSubject$ = new BehaviorSubject<CartTotal[]>([]);
    private totalSubject$ = new BehaviorSubject<number>(0);
    private stateSubject$ = new BehaviorSubject<MarketplaceState>({ 
        items: [], catalogItems: [], darRequests: [], productRequests: [] 
    });

    readonly items$ = this.itemsSubject$.asObservable();
    readonly quantity$ = this.quantitySubject$.asObservable();
    readonly subtotal$ = this.subtotalSubject$.asObservable();
    readonly totals$ = this.totalsSubject$.asObservable();
    readonly total$ = this.totalSubject$.asObservable();
    readonly state$ = this.stateSubject$.asObservable();

    get items(): ReadonlyArray<CartItem> { return this.data.items; }

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private http: HttpClient 
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.loadFromStorage();
        }
    }

     /**
     * Stores the receipt data so it persists after the cart is cleared
     */
    public setReceipt(data: any): void {
        this.lastReceipt = data;
    }

    public loadFromStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            const items = sessionStorage.getItem('cartItems');
            const dars = sessionStorage.getItem('darRequests');
            this.data.items = items ? JSON.parse(items) : [];
            this.data.darRequests = dars ? JSON.parse(dars) : [];
            this.calc();
        }
    }

    private save(): void {
        if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem('cartItems', JSON.stringify(this.data.items));
            sessionStorage.setItem('darRequests', JSON.stringify(this.data.darRequests));
        }
    }

    private calc(): void {
        let quantity = 0;
        let subtotal = 0;

        this.data.items.forEach(item => {
            quantity += item.quantity;
            subtotal += (item.product.price || 0) * item.quantity;
        });

        if (this.data.darRequests) {
            quantity += this.data.darRequests.length;
        }

        this.data.quantity = quantity;
        this.data.subtotal = subtotal;
        this.data.total = subtotal;

        this.itemsSubject$.next(this.data.items);
        this.quantitySubject$.next(this.data.quantity);
        this.subtotalSubject$.next(this.data.subtotal);
        this.totalsSubject$.next(this.data.totals);
        this.totalSubject$.next(this.data.total);
        this.stateSubject$.next({
            items: this.data.items,
            catalogItems: this.data.items,
            darRequests: this.data.darRequests || [],
            productRequests: []
        });
    }

    // Restored for PageOrderSuccessComponent
    getReceipt() {
        return {
            items: this.data.items,
            darRequests: this.data.darRequests
        };
    }

    add(product: Product, quantity: number, options: any[] = [], formData?: any): Observable<CartItem> {
        let item = this.data.items.find(i => i.product.id === product.id);
        if (item) {
            item.quantity += quantity;
            if (formData) item.formData = formData;
        } else {
            item = { id: product.id, product, quantity, options, formData };
            this.data.items.push(item);
        }
        this.save();
        this.calc();
        return of(item);
    }

    addDataRequest(dar: any): Observable<void> {
        this.data.darRequests.push(dar);
        this.save();
        this.calc();
        return of(void 0);
    }

    update(updates: {item: CartItem, quantity: number}[]): Observable<void> {
        updates.forEach(u => {
            const item = this.data.items.find(i => i === u.item);
            if (item) item.quantity = u.quantity;
        });
        this.save();
        this.calc();
        return of(void 0);
    }

    remove(item: CartItem): Observable<void> {
        this.data.items = this.data.items.filter(i => i !== item);
        this.save();
        this.calc();
        return of(void 0);
    }

    removeDar(dar: any): Observable<void> {
        this.data.darRequests = (this.data.darRequests || []).filter(d => d !== dar);
        this.save();
        this.calc();
        return of(void 0);
    }

    clear(): void {
        this.data.items = [];
        this.data.darRequests = [];
        this.save();
        this.calc();
    }
}