import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../../../@shared/services/app.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { CompareService } from '../../services/compare.service';
import { RootService } from '../../services/root.service';
import { OffcanvasProductService } from '../../services/offcanvas-product.service';
import { OffcanvasRequestService } from '../../services/offcanvas-request.service';
import { ProductService } from '../../../@shared/services/product.service';
import { DropcartType } from '../../../@modules/header/components/dropcart/dropcart.component';

export type ProductLayout = 'standard' | 'sidebar' | 'columnar' | 'quickview';

interface RouterData {
    headerLayout?: 'classic'|'compact';
    dropcartType?: DropcartType;
}

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent {
    @Input() layout: ProductLayout = 'standard';
    @Input() product!: any;
    @Input() email: string = '';           // Recipient email
    @Input() message: string = '';         // Pre-filled message
    headerLayout: 'classic'|'compact' = 'classic';
    dropcartType: DropcartType = 'dropdown';
    quantity: FormControl = new FormControl(1);

    //viewDetails = false;
    addingToCart = false;
    addingToForm = false;
    addingToWishlist = false;
    addingToCompare = false;
    keywords: [];

    constructor(
        public route: ActivatedRoute,
        public offcanvasProduct: OffcanvasProductService,
        public offcanvasRequest: OffcanvasRequestService,
        private productService: ProductService,
        private cart: CartService,
        private favorites: FavoritesService,
        private compare: CompareService,
        public root: RootService,
        public appSvc: AppService,
    ) { 
        this.route.data.subscribe((data: RouterData) => {
            this.headerLayout = data.headerLayout || 'classic';
            this.dropcartType = data.dropcartType || 'dropdown';
        });
    }

    ngOnInit() {  

    }

    openRequestForm(): void {
        // Check if product is already in the cart items list
        const isAlreadyInCart = this.cart.items.some(item => item.product.id === this.product.id);

        if (isAlreadyInCart) {
            // Block and notify
           this.appSvc.notifyInfo?.(`"${this.product.name}" has been added to your cart.`);
        } else {
            // Allow opening the form
            this.offcanvasRequest.open();
        }
    }

    addToCart(): void {
        if (!this.addingToCart && this.product && this.quantity.value > 0) {
            this.addingToCart = true;

            this.cart.add(this.product, this.quantity.value).subscribe({complete: () => this.addingToCart = false});
        }
    }

    viewDetails(): void {
        if (!this.addingToCart && this.product && this.quantity.value > 0) {
            this.addingToCart = true;

            this.cart.add(this.product, this.quantity.value).subscribe({complete: () => this.addingToCart = false});
        }
    }

    addToWishlist(): void {
        if (!this.addingToWishlist && this.product) {
            this.addingToWishlist = true;

            this.favorites.add(this.product).subscribe({complete: () => this.addingToWishlist = false});
        }
    }

    addToCompare(): void {
        if (!this.addingToCompare && this.product) {
            this.addingToCompare = true;

            this.compare.add(this.product).subscribe({complete: () => this.addingToCompare = false});
        }
    }

    addToForm(): void {
        if (!this.addingToForm && this.product && this.quantity.value > 0) {
            console.log('Setting product data:', this.product, this.quantity.value); // Add this line
            this.productService.setProductData(this.product, this.quantity.value);
            this.showForm();
        }
    }

    showForm(): void {
        // Logic to navigate to the form URL
        window.location.href = "marketplace/product/request";
    }

    onFormSubmit(formData: any): void {
        if (formData.valid) {
            this.addingToCart = true;
            this.cart.add(this.product, this.quantity.value).subscribe({
                complete: () => this.addingToCart = false
            });
        }
    }

    // getTeamsLink(contact: any): string {
    //     if (!contact || !contact.email) return '';
    //     const message = encodeURIComponent(`Hi, ${contact.name}! I have an inquiry about ${this.product.name} in Data Marketplace.`);
    //     const topic = encodeURIComponent(this.product.name);
    //     return `https://teams.microsoft.com/l/chat/0/0?users=${contact.email}&topicName=${topic}&message=${message}`;
    // }

    getTeamsLink(contact: any): string {
        if (!contact || !contact.email) return '';
        
        const email = encodeURIComponent(contact.email);
        const product = encodeURIComponent(this.product.name);
        const name = encodeURIComponent(contact.name);
        
        // Using the direct /l/chat/ format is more reliable than the dl/launcher format
        const message = encodeURIComponent(`Hi, ${contact.name}! I have an inquiry about ${this.product.name} in Data Marketplace.`);
        
        return `https://teams.microsoft.com/l/chat/0/0?users=${email}&topicName=${product}&message=${message}`;
    }

    getMailtoLink(contact: any): string {
        if (!contact || !contact.email) return '';
        const subject = encodeURIComponent(`Inquiry About ${this.product.name} product in Data Marketplace!`);
        const body = encodeURIComponent(`Hi ${contact.name},\n\nI was inquiring about the ${this.product.name} product in the Data Marketplace.`);
        return `mailto:${contact.email}?subject=${subject}&body=${body}`;
    }

}
