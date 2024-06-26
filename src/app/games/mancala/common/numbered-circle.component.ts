import { Component, Input } from '@angular/core';
import { MGPOptional } from '@everyboard/lib';

@Component({
    selector: '[app-numbered-circle]',
    templateUrl: './numbered-circle.component.svg',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class NumberedCircleComponent {

    @Input() x: number;
    @Input() y: number;
    @Input() spaceClasses: string[];
    @Input() content: number;
    @Input() secondaryContent: MGPOptional<string>;
    @Input() rotation: string;
}
