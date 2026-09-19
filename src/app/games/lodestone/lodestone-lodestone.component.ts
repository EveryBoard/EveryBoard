import { NgClass } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';

import { BaseGameComponent } from '../../components/game-components/base-game-component/BaseGameComponent';

import { LodestoneInfo } from './lodestone.component';

@Component({
    selector: '[app-lodestone-lodestone]',
    templateUrl: './lodestone-lodestone.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class LodestoneLodestoneComponent extends BaseGameComponent {

    public readonly lodestoneInfo: InputSignal<LodestoneInfo> = input.required<LodestoneInfo>();

    public PIECE_RADIUS: number;
    public TRIANGLE_OUT: string;
    public TRIANGLE_IN: string;

    public constructor() {
        super();
        this.PIECE_RADIUS = (this.SPACE_SIZE - (2 * this.STROKE_WIDTH)) * 0.5;
        const radius80: number = this.PIECE_RADIUS * 0.8;
        const radius30: number = this.PIECE_RADIUS * 0.3;
        const radius20: number = this.PIECE_RADIUS * 0.2;
        this.TRIANGLE_OUT = `${radius80},0 ${radius30},${radius20} ${radius30},-${radius20}`;
        this.TRIANGLE_IN = `${radius30},0 ${radius80},${radius30} ${radius80},-${radius30}`;
    }

    public getArrowRotate(i: number): string {
        let rotate: number = i * 90;
        if (this.lodestoneInfo().orientation === 'diagonal') {
            rotate += 45;
        }
        return 'rotate(' + rotate + ')';
    }
}
