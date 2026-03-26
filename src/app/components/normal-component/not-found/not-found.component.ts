import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
    readonly route: ActivatedRoute = inject(ActivatedRoute);

    public message: string;

    public constructor() {
        this.message = this.route.snapshot.paramMap.get('message') ?? $localize`This page does not exist.`;
    }
}
