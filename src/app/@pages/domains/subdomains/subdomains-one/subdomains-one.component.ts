import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomainsService } from '../../../../@shared/services/domains.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-subdomains-one',
  templateUrl: './subdomains-one.component.html',
  styleUrls: ['./subdomains-one.component.scss']
})
export class SubdomainsOneComponent implements OnInit {
  parentDomain: any;
  subdomains: any[] = [];
  isLoading: boolean = true;
  currentType: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private domainsService: DomainsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentType = params.get('type') || '';
      this.fetchData();
    });
  }

  private fetchData(): void {
    this.isLoading = true;
    this.domainsService.getDomains().subscribe({
      next: (data) => {
        this.parentDomain = this.findDomainBySlug(data, this.currentType);

        if (this.parentDomain) {
          this.subdomains = this.formatSubdomains(this.parentDomain.subdomains || []);
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private findDomainBySlug(domains: any[], slug: string): any {
    return domains.find(d =>
      d.slug === slug || d.name.toLowerCase().replace(/ /g, '-') === slug
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

    return `${environment.apiUrl}${imagePath}`;
  }

  navigateTo(subdomain: any): void {
    if (this.hasNestedSubdomains(subdomain)) {
      const subSlug = subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-');
      this.router.navigate(['/', this.currentType, subSlug]);
      return;
    }

    if (this.hasSingleProduct(subdomain)) {
      const product = subdomain.products[0];
      const productSlug = product.slug || product.name.toLowerCase().replace(/ /g, '-');
      this.router.navigate(['/marketplace/product', productSlug]);
      return;
    }

    if (this.hasMultipleProducts(subdomain)) {
      const subdomainSlug = subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-');
      this.router.navigate(['/marketplace'], {
        queryParams: { subdomain: subdomainSlug }
      });
      return;
    }

    this.router.navigate(['/marketplace']);
  }

  getRouterLink(subdomain: any): any[] {
    if (this.hasNestedSubdomains(subdomain)) {
      const subSlug = subdomain.slug || subdomain.name.toLowerCase().replace(/ /g, '-');
      return ['/', this.currentType, subSlug];
    }

    if (this.hasSingleProduct(subdomain)) {
      const product = subdomain.products[0];
      const productSlug = product.slug || product.name.toLowerCase().replace(/ /g, '-');
      return ['/marketplace/product', productSlug];
    }

    return null;
  }

  private hasNestedSubdomains(subdomain: any): boolean {
    return subdomain.subdomains && subdomain.subdomains.length > 0;
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
}