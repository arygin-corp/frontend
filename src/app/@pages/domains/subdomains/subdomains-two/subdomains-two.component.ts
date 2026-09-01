import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomainsService } from '../../../../@shared/services/domains.service';
import { ShopService } from '../../../../@shared/api/shop.service';
import { ProductsList } from '../../../../@shared/interfaces/list';

@Component({
  selector: 'app-subdomains-two',
  templateUrl: './subdomains-two.component.html',
  styleUrls: ['./subdomains-two.component.scss']
})
export class SubdomainsTwoComponent implements OnInit {
  level1Domain: any;
  parentDomain: any;
  subdomains: any[] = [];
  products: ProductsList = { items: [], total: 0, page: 1, limit: 12, sort: 'default', filters: [], filterValues: {}, pages: 1, from: 1, to: 0 };
  isLoading: boolean = true;
  currentType: string = '';
  currentSubtype: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private domainsService: DomainsService,
    private shop: ShopService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentType = params.get('type') || '';
      this.currentSubtype = params.get('subtype') || '';
      this.fetchData();
      this.fetchProducts();
    });
  }

  private fetchData(): void {
    this.isLoading = true;
    this.domainsService.getDomains().subscribe({
      next: (data) => {
        this.level1Domain = this.findDomainBySlug(data, this.currentType);

        if (this.level1Domain) {
          this.parentDomain = this.findSubdomainBySlug(
            this.level1Domain.subdomains || [],
            this.currentSubtype
          );

          if (this.parentDomain) {
            this.subdomains = this.formatSubdomains(this.parentDomain.subdomains || []);
          }
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private fetchProducts(): void {
    this.shop.getDeepestProducts(
      this.currentSubtype,
      { page: 1, limit: 12, sort: 'default' },
    ).subscribe(list => {
      this.products = list;
    });
  }

  private findDomainBySlug(domains: any[], slug: string): any {
    return domains.find(d =>
      d.slug === slug || d.name.toLowerCase().replace(/ /g, '-') === slug
    );
  }

  private findSubdomainBySlug(subdomains: any[], slug: string): any {
    return subdomains.find(s =>
      s.slug === slug || s.name.toLowerCase().replace(/ /g, '-') === slug
    );
  }

  private formatSubdomains(subdomains: any[]): any[] {
    return subdomains
      .map((sub: any) => ({
        ...sub,
        image: this.formatImageUrl(sub.image)
      }))
      .sort((a: any, b: any) => (b.product_count || 0) - (a.product_count || 0));
  }

  private formatImageUrl(imagePath: string | null): string {
    if (!imagePath) {
      return 'assets/images/placeholder.jpg';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const baseUrl = 'http://localhost:8000';
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${path}`;
  }

  navigateTo(subdomain: any): void {
    if (this.hasSingleProduct(subdomain)) {
      const product = subdomain.products[0];
      const productSlug = product.slug || product.name.toLowerCase().replace(/ /g, '-');
      this.router.navigate(['/marketplace/product', productSlug]);
      return;
    }

    if (this.hasMultipleProducts(subdomain)) {
      const subdomainSlug = subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-');
      this.router.navigate(['/marketplace', {
        subdomain: this.currentSubtype,
        subdomain_2: subdomainSlug
      }]);
      return;
    }

    this.router.navigate(['/marketplace']);
  }

  getRouterLink(subdomain: any): any[] | null {
    if (this.hasSingleProduct(subdomain)) {
      const product = subdomain.products[0];
      const productSlug = product.slug || product.name.toLowerCase().replace(/ /g, '-');
      return ['/marketplace/product', productSlug];
    }

    // For multiple products, return null so the template falls back to (click)="navigateTo(subdomain)"
    return null;
  }

  private hasSingleProduct(subdomain: any): boolean {
    return subdomain.product_count === 1 && subdomain.products?.length > 0;
  }

  private hasMultipleProducts(subdomain: any): boolean {
    return subdomain.product_count > 1;
  }

  getDescription(item: any): string {
    return item.desc || item.description || item.name;
  }

  resolveNavigation(subdomain: any): any[] {
    // If only one product, go directly to its detail page
    if (subdomain.product_count === 1) {
        const productSlug = subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-');
        return ['/marketplace/product', productSlug];
    }

    // Multiple products — go to marketplace with matrix params
    return ['/marketplace', {
        subdomain: this.currentSubtype,
        subdomain_2: subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-')
    }];
  }
  
}