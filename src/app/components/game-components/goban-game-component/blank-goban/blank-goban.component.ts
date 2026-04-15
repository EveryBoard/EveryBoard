import { Component, InputSignal, OnChanges, OutputEmitterRef, input, output } from '@angular/core';

import { Coord } from '../../../../jscaip/Coord';
import { GobanUtils } from '../../../../jscaip/GobanUtils';
import { BaseGameComponent } from '../../base-game-component/BaseGameComponent';

@Component({
    selector: 'app-blank-goban',
    templateUrl: './blank-goban.component.svg',
    styleUrls: ['../../game-component/game-component.scss'],
    imports: [],
})
export class BlankGobanComponent extends BaseGameComponent implements OnChanges {

    public readonly width: InputSignal<number> = input.required<number>();
    public readonly height: InputSignal<number> = input.required<number>();
    public readonly clickCallBack: OutputEmitterRef<Coord> = output<Coord>();
    public hoshis: Coord[] = [];

    public ngOnChanges(): void {
        return this.createHoshis();
    }

    public onClick(x: number, y: number): void {
        return this.clickCallBack.emit(new Coord(x, y));
    }

    /**
     * Creates the hoshis, filling in the `hoshis` field with the hoshis based on the board size.
     * Must be called after `this.board` has been set, usually in `updateBoard`.
     */
    public createHoshis(): void {
        this.hoshis = GobanUtils.getHoshis(this.width(), this.height());
    }

}
