import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { BaseGameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { GobanUtils } from 'src/app/jscaip/GobanUtils';

@Component({
    selector: '[app-blank-goban]',
    templateUrl: './blank-goban.component.svg',
    styleUrls: ['../../game-component/game-component.scss'],
})
export class BlankGobanComponent extends BaseGameComponent implements OnChanges {

    @Input() width: number;
    @Input() height: number;
    @Output() clickCallBack: EventEmitter<Coord> = new EventEmitter<Coord>();
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
        this.hoshis = GobanUtils.getHoshis(this.width, this.height);
    }

}
