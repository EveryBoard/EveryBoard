import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-not-found',
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './not-found.component.html',
})
export class NotFoundComponent {

    public message: string;

    public constructor() {
        this.message = inject(ActivatedRoute).snapshot.paramMap.get('message') ?? $localize`This page does not exist.`;
    }
}
