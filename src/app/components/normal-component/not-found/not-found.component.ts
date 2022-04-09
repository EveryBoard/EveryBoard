import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Utils } from 'src/app/utils/utils';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
    public message: string;
    constructor(readonly route: ActivatedRoute) {
        this.message = Utils.getNonNullable(route.snapshot.paramMap.get('message'));
    }
}
