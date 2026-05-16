import { NgClass } from '@angular/common';
import { Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

import { BaseGameComponent } from '../../../../components/game-components/base-game-component/BaseGameComponent';
import { BlankGobanComponent } from '../../../../components/game-components/goban-game-component/blank-goban/blank-goban.component';
import { Coord } from '../../../../jscaip/Coord';
import { GoPiece } from '../../GoPiece';
import { GoState } from '../../GoState';
import { GoSubBoardHelper } from '../GoSubBoardHelper';

@Component({
    selector: '[app-go-board]',
    templateUrl: './go-board.component.svg',
    styleUrls: ['../../../../components/game-components/game-component/game-component.scss'],
    imports: [BlankGobanComponent, NgClass],
})
export class GoBoardComponent extends BaseGameComponent {

    // input coord match the zoom 0
    public captures: InputSignal<Coord[]> = input.required();

    public ko: InputSignal<MGPOptional<Coord>> = input.required();

    public last: InputSignal<MGPOptional<Coord>> = input.required();

    public hover: InputSignal<MGPOptional<Coord>> = input.required();

    public adaptedCaptures: Signal<Coord[]> = computed(() => {
        return this
            .captures()
            .map((coord: Coord) => GoSubBoardHelper.fromNormalToZoomedCoord(coord, this.zx(), this.zy(), this.zoom()))
            .filter((coord: MGPOptional<Coord>) => coord.isPresent())
            .map((coord: MGPOptional<Coord>) => coord.get());
    });

    public adaptedKo: Signal<MGPOptional<Coord>> = computed(() => {
        return GoSubBoardHelper.fromNormalToOptionalZoomedCoord(
            this.ko(),
            this.zx(),
            this.zy(),
            this.zoom(),
        );
    });

    public adaptedLast: Signal<MGPOptional<Coord>> = computed(() => {
        return GoSubBoardHelper.fromNormalToOptionalZoomedCoord(
            this.last(),
            this.zx(),
            this.zy(),
            this.zoom(),
        );
    });

    public adaptedHover: Signal<MGPOptional<Coord>> = computed(() => {
        return GoSubBoardHelper.fromNormalToOptionalZoomedCoord(
            this.hover(),
            this.zx(),
            this.zy(),
            this.zoom(),
        );
    });

    public state: InputSignal<GoState> = input.required();

    public zoom: InputSignal<number> = input.required();

    public zx: InputSignal<number> = input.required();

    public zy: InputSignal<number> = input.required();

    public clicked: OutputEmitterRef<Coord> = output<Coord>();

    public takeHover: OutputEmitterRef<Coord> = output<Coord>();

    public GoPiece: typeof GoPiece = GoPiece;

    public onClick(coord: Coord): void {
        const zoomAdaptedCoord: Coord = GoSubBoardHelper.fromZoomedToNormalCoord(
            coord,
            this.zx(),
            this.zy(),
            this.zoom(),
        );
        this.clicked.emit(zoomAdaptedCoord);
    }

    public getSpaceClass(coord: Coord): string {
        const piece: GoPiece = this.state().getPieceAt(coord);
        return this.getPlayerClass(piece.getOwner());
    }

    public spaceIsFull(coord: Coord): boolean {
        const piece: GoPiece = this.state().getPieceAt(coord);
        return piece !== GoPiece.EMPTY && this.isTerritory(coord) === false;
    }

    public isLastSpace(coord: Coord): boolean {
        return this.adaptedLast().equalsValue(coord);
    }

    public isDead(coord: Coord): boolean {
        return this.state().isDead(coord);
    }

    public isTerritory(coord: Coord): boolean {
        return this.state().isTerritory(coord);
    }

    public onMouseOver(coord: Coord): void {
        this.takeHover.emit(coord);
    }

}
