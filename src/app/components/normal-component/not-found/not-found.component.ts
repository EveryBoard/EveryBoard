import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
    public message: string;
    constructor(readonly route: ActivatedRoute) {
        this.message = route.snapshot.paramMap.get('message') ?? $localize`This page does not exist.`;
    }
}
