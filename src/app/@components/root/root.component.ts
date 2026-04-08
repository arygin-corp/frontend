import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
//import { DropcartType } from '../../@modules/header/components/dropcart/dropcart.component';
import { DropcartType } from '../../@modules/header/components/dropproduct/dropproduct.component';
//import { PicService } from '../../@shared/services/pic.service';
import { MsalService } from '@azure/msal-angular';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { Product } from '../../@shared/interfaces/product';
import { AuthError, InteractionRequiredAuthError } from '@azure/msal-browser';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,jobTitle,userPrincipalName,mail,businessPhones,officeLocation,employeeId,department,companyName,streetAddress,city,state,postalCode,country,extension_f9db8ce126544afb895293c1adb4b749_extensionAttribute3';

interface RouterData {
    headerLayout?: 'classic'|'compact';
    dropcartType?: DropcartType;
}

@Component({
    selector: 'app-main',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss']
})

export class RootComponent {
    @Input() product!: Product;
    @Input() type!: string;
    selectedProduct: any; 

    profile:any;
    //photo:any;
    updatedVersion = environment.appVersion;

    headerLayout: 'classic'|'compact' = 'classic';
    dropcartType: DropcartType = 'dropdown';

    constructor(
        public route: ActivatedRoute,
        private authService: MsalService,
        private http: HttpClient,
        //public picService: PicService,
        private sanitizer: DomSanitizer,
        private readonly swUpdate: SwUpdate
        ) {
            this.route.data.subscribe((data: RouterData) => {
                this.headerLayout = data.headerLayout || 'classic';
                this.dropcartType = data.dropcartType || 'dropdown';
            });

            if(this.swUpdate.versionUpdates) {
                this.swUpdate.versionUpdates.subscribe(() => {
                    Swal.fire({
                        title: 'New Update Available',
                        text: 'Version ' + this.updatedVersion,
                        imageUrl: 'assets/icons/dm-brand.png',
                        imageWidth: 96,
                        imageHeight: 96,
                        imageAlt: 'Data Marketplace Icon',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Update Now',
                        allowOutsideClick: false
                      }).then((result) => {
                        if (result.isConfirmed) {
                          window.location.reload();
                        }
                    })
                });
            }

            this.selectedProduct = null;
        }

        ngOnInit() {
            this.getProfile();
            //this.picService.getUserPhoto().subscribe(photo => this.photo = photo);
        }

        getProfile() {
            this.http.get(GRAPH_ENDPOINT).subscribe({
                next: (profile) => {
                this.profile = profile;
                },
                error: (err: AuthError) => {
                if (InteractionRequiredAuthError.isInteractionRequiredError(err.errorCode)) {
                    this.authService.acquireTokenPopup({
                    scopes: ["user.read"]
                    }).subscribe({
                    next: (result) => {
                        this.http.get(GRAPH_ENDPOINT).subscribe(profile => {
                        this.profile = profile;
                        });
                    }
                    });
                }
                }
            });
        }

    // getUserPhoto(): Observable<SafeUrl> {
    //     let requestUrl = `https://graph.microsoft.com/beta/me/photo/$value`;
    //     return this.http.get(requestUrl, { responseType: 'blob' }).pipe(map(result => {
    //       let url = window.URL;
    //       return this.sanitizer.bypassSecurityTrustUrl(url.createObjectURL(result));
    //     }));
    // }
    
}

