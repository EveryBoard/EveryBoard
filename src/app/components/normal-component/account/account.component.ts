import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink],
})
export class AccountComponent {

}
