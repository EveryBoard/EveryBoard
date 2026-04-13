import { Component, input, InputSignal } from '@angular/core';

import { EloPipe } from '../../../pipes-and-directives/elo.pipe';

@Component({
    selector: '[app-elo]',
    template: `{{ elo() | elo }}`,
    imports: [EloPipe],
})
export class EloComponent {
    public readonly elo: InputSignal<number> = input.required<number>();
}
