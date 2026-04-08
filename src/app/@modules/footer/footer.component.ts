import { Component } from '@angular/core';
import { theme } from '../../../data/theme';
import { footer } from '../../../data/footer';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    theme = theme;
    footer = footer;
    currentApplicationVersion = environment.appVersion;
    currentYear = new Date().getFullYear();


    constructor() { }
}
