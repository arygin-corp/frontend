import { Component } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
    links: {label: string; url: string}[] = [
        {label: 'All', url: './'},
        {label: 'Updates', url: './updates'},
        {label: 'Features', url: './features'},
        {label: 'Trending', url: './trending'},
        {label: 'Security', url: './security'},
    ];

    constructor() { }
}
