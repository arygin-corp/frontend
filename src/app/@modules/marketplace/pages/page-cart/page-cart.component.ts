// src/app/@modules/marketplace/pages/page-cart/page-cart.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CartService } from '../../../../@shared/services/cart.service';
import { RootService } from '../../../../@shared/services/root.service';
import { OffcanvasRequestService } from '../../../../@shared/services/offcanvas-request.service';
import { OffcanvasDARService } from '../../../../@shared/services/offcanvas-dar.service';
import { CartItem } from '../../../../@shared/interfaces/cart-item';

@Component({
    selector: 'app-cart',
    templateUrl: './page-cart.component.html',
    styleUrls: ['./page-cart.component.scss']
})
export class PageCartComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject();
    selectedItem: CartItem | null = null;
    selectedDar: any | null = null;

    items: any[] = [];
    productItems: any[] = [];
    darRequests: any[] = [];
    allItems: any[] = [];

    productRequests: any[] = [];
    removedItems: CartItem[] = [];
    updating = false;
    dropcartType: 'dropdown' | 'offcanvas' = 'offcanvas';
    product: any = null;

    activeTab: 'all' | 'products' | 'dar' = 'all';

    constructor(
        public cart: CartService,
        public root: RootService,
        public offCanvasRequestService: OffcanvasRequestService,
        public offCanvasDarService: OffcanvasDARService
    ) {}

    ngOnInit(): void {
        this.cart.items$.pipe(
            takeUntil(this.destroy$),
            map(cartItems => cartItems
                .filter(ci => !!ci.product)
                .map(cartItem => ({
                    type: 'product',
                    cartItem,
                    quantity: cartItem.quantity,
                    quantityControl: new FormControl({ value: cartItem.quantity, disabled: true }, Validators.required)
                }))
            )
        ).subscribe(items => {
            this.productItems = items;
            this.items = items;
            this.rebuildAll();
        });

        this.cart.state$.pipe(takeUntil(this.destroy$)).subscribe(state => {
            this.darRequests = (state.darRequests || []).map(d => ({ type: 'dar', dar: d }));
            this.productRequests = state.productRequests || [];
            this.rebuildAll();
        });
    }

    rebuildAll(): void {
        this.allItems = [...this.productItems, ...this.darRequests];
    }

    editItem(item: CartItem): void {
        this.selectedItem = item;
        this.offCanvasRequestService.open();
    }

    editDar(dar: any): void {
        this.selectedDar = dar;
        this.offCanvasDarService.open();
    }

    remove(item: CartItem): void {
        this.removedItems.push(item);
        this.cart.remove(item).subscribe({
            complete: () => this.removedItems = this.removedItems.filter(i => i !== item)
        });
    }

    removeDar(dar: any): void {
        if (typeof (this.cart as any).removeDar === 'function') {
            this.removedItems.push(dar);
            (this.cart as any).removeDar(dar).subscribe({
                complete: () => this.removedItems = this.removedItems.filter(i => i !== dar)
            });
        }
    }

    update(): void {
        this.updating = true;
        this.cart.update(
            this.items
                .filter(item => item.quantityControl.value !== item.quantity)
                .map(item => ({ item: item.cartItem, quantity: item.quantityControl.value }))
        ).subscribe({ complete: () => this.updating = false });
    }

    needUpdate(): boolean {
        return this.items.some(item => item.quantityControl.value !== item.quantity && item.quantityControl.valid);
    }

    getProductImage(product: any): string {
        const fallback = 'assets/images/product_images/data-access-request.jpg';
        if (!product) return fallback;

        let img = '';

        if (Array.isArray(product.images) && product.images.length) {
            img = String(product.images[0]).trim();
        } else if (product.image) {
            img = String(product.image).trim();
        } else {
            return fallback;
        }

        if (!img) return fallback;

        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('//')) {
            return img;
        }

        if (img.startsWith('/') || img.startsWith('assets/')) {
            return img;
        }

        return `assets/images/product_images/${img}`;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}