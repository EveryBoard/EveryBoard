import { Component, Input } from '@angular/core';

@Component({
    selector: '[app-ring]',
    templateUrl: './ring.component.svg',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class RingComponent {

    @Input() ringOuterSize: number;

    @Input() ringMidSize: number;

    @Input() ringInnerSize: number;

    @Input() midRingClasses: string | string[];

}
