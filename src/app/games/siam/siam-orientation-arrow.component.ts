import { NgFor, NgClass } from '@angular/common';
import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

import { BaseGameComponent } from '../../components/game-components/base-game-component/BaseGameComponent';
import { Coord } from '../../jscaip/Coord';
import { Ordinal } from '../../jscaip/Ordinal';
import { Orthogonal } from '../../jscaip/Orthogonal';
import { Player } from '../../jscaip/Player';

import { SiamMove } from './SiamMove';
import { SiamConfig } from './SiamRules';

@Component({
    selector: '[app-siam-orientation-arrow]',
    templateUrl: './siam-orientation-arrow.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgFor, NgClass],
})
export class SiamOrientationArrowComponent extends BaseGameComponent {

    public readonly orientations: InputSignal<SiamMove[]> = input.required<SiamMove[]>();
    public readonly currentPlayer: InputSignal<Player> = input.required<Player>();
    public readonly config: InputSignal<SiamConfig> = input.required<SiamConfig>();
    public readonly moveEmitter: OutputEmitterRef<SiamMove> = output<SiamMove>();

    public getCurrentPlayerClass(): string {
        return this.getPlayerClass(this.currentPlayer());
    }

    public getOrientationTransform(orientation: Orthogonal): string {
        const config: SiamConfig = this.config();

        // Those are the calculation for a min size of 5
        const sizeRatio: number = Math.min(config.width, config.height) / 5;
        // Our arrow base needs a width of SPACE_SIZE, they currently have 40
        const arrowRatio: number = this.SPACE_SIZE / 40;
        const scaleValue: number = arrowRatio * sizeRatio;
        const cxAfterScale: number = 0.5 * scaleValue;
        let centralCoord: Coord = new Coord(config.width / 2, config.height / 2);
        centralCoord = centralCoord.getNext(Ordinal.LEFT, cxAfterScale);
        centralCoord = centralCoord.getNext(Ordinal.UP, cxAfterScale);
        centralCoord = centralCoord.getNext(orientation, scaleValue - sizeRatio);
        centralCoord = centralCoord.scale(this.SPACE_SIZE, this.SPACE_SIZE);

        const orientationDegrees: number = (orientation.toInt() - 2) * 90;
        const translation: string = this.getSVGTranslationAt(centralCoord);
        const scale: string = `scale(${ scaleValue })`;
        const rotation: string = `rotate(${orientationDegrees} ${this.SPACE_SIZE/2} ${this.SPACE_SIZE/2})`;
        return [translation, scale, rotation].join(' ');
    }

    public selectMove(move: SiamMove): void {
        this.moveEmitter.emit(move);
    }

}
