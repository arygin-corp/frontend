import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomainsService } from './../../@shared/services/domains.service';
import { Domain } from '../../../@models/domain.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss']
})

export class DomainsComponent implements OnInit {
  domainData: Domain[] = [];
  isLoading = true;
  private baseUrl = environment.apiUrl;
  
  constructor(
    private domainsService: DomainsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.domainsService.getDomains().subscribe({
      next: (data) => {
        this.domainData = data
          .map(domain => ({
            ...domain,
            image: this.formatImageUrl(domain.image)
          }))
          .sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
        
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  private formatImageUrl(imagePath: string | null): string {
    if (!imagePath) return 'assets/images/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${base}${path}`;
  }

  getDescription(domain: Domain): string {
    return (domain as any).desc || (domain as any).description || `Explore products in ${domain.name}`;
  }

  resolveNavigation(domain: Domain): string | any[] {
    if (domain.product_count === 1 && domain.products?.length > 0) {
      const product = domain.products[0];
      const productSlug = product.slug || product.name.toLowerCase().replace(/ /g, '-');
      return ['/marketplace/product', productSlug];
    }
    
    const slug = domain.slug || domain.name.toLowerCase().replace(/ /g, '-');
    return ['/', slug];
  }
}