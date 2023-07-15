import { Component, Input } from '@angular/core';
import { MGPOptional } from 'src/app/utils/MGPOptional';

@Component({
    selector: '[app-numbered-circle]',
    templateUrl: './numbered-circle.component.svg',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
})
export class NumberedCircleComponent {

    @Input() x: number;
    @Input() y: number;
    @Input() spaceClasses: string[];
    @Input() content: string | number;
    @Input() secondaryContent: MGPOptional<string>;
    @Input() rotation: string;
}
