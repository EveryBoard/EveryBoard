import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root',
})
export class DynamicCSSService {

    constructor(@Inject(DOCUMENT) private document: Document) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.loadStyle('dark.css');
        } else {
            this.loadStyle('light.css');
        }
    }

    private loadStyle(styleName: string): void {
        const head: HTMLHeadElement = this.document.getElementsByTagName('head')[0];

        const themeLink: HTMLLinkElement = this.document.getElementById('theme') as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = styleName;
        } else {
            const style: HTMLLinkElement = this.document.createElement('link');
            style.id = 'theme';
            style.rel = 'stylesheet';
            style.href = `${styleName}`;

            head.appendChild(style);
        }
    }
}
