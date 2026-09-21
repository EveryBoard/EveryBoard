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
    public readonly captures: InputSignal<Coord[]> = input.required();

    public readonly ko: InputSignal<MGPOptional<Coord>> = input.required();

    public readonly last: InputSignal<MGPOptional<Coord>> = input.required();

    public readonly hover: InputSignal<MGPOptional<Coord>> = input.required();

    public readonly state: InputSignal<GoState> = input.required();

    public readonly zoom: InputSignal<number> = input.required();

    public readonly zx: InputSignal<number> = input.required();

    public readonly zy: InputSignal<number> = input.required();

    public readonly clicked: OutputEmitterRef<Coord> = output<Coord>();

    public readonly takeHover: OutputEmitterRef<MGPOptional<Coord>> = output<MGPOptional<Coord>>();

    protected readonly adaptedCaptures: Signal<Coord[]> = computed(() => {
        return this
            .captures()
            .map((coord: Coord) => GoSubBoardHelper.fromNormalToZoomedCoord(coord, this.zx(), this.zy(), this.zoom()))
            .filter((coord: MGPOptional<Coord>) => coord.isPresent())
            .map((coord: MGPOptional<Coord>) => coord.get());
    });

    protected readonly adaptedKo: Signal<MGPOptional<Coord>> = computed(() => {
        return GoSubBoardHelper.fromNormalToOptionalZoomedCoord(
            this.ko(),
            this.zx(),
            this.zy(),
            this.zoom(),
        );
    });

    private readonly adaptedLast: Signal<MGPOptional<Coord>> = computed(() => {
        return GoSubBoardHelper.fromNormalToOptionalZoomedCoord(
            this.last(),
            this.zx(),
            this.zy(),
            this.zoom(),
        );
    });

    protected readonly adaptedHover: Signal<MGPOptional<Coord>> = computed(() => {
        return GoSubBoardHelper.fromNormalToOptionalZoomedCoord(
            this.hover(),
            this.zx(),
            this.zy(),
            this.zoom(),
        );
    });

    protected readonly GoPiece: typeof GoPiece = GoPiece;

    protected onClick(coord: Coord): void {
        const zoomAdaptedCoord: Coord = GoSubBoardHelper.fromZoomedToNormalCoord(
            coord,
            this.zx(),
            this.zy(),
            this.zoom(),
        );
        this.clicked.emit(zoomAdaptedCoord);
    }

    protected getSpaceClass(coord: Coord): string {
        const piece: GoPiece = this.state().getPieceAt(coord);
        return this.getPlayerClass(piece.getOwner());
    }

    protected spaceIsFull(coord: Coord): boolean {
        const piece: GoPiece = this.state().getPieceAt(coord);
        return piece !== GoPiece.EMPTY && this.isTerritory(coord) === false;
    }

    protected isLastSpace(coord: Coord): boolean {
        return this.adaptedLast().equalsValue(coord);
    }

    protected isDead(coord: Coord): boolean {
        return this.state().isDead(coord);
    }

    protected isTerritory(coord: Coord): boolean {
        return this.state().isTerritory(coord);
    }

    protected onMouseEnter(coord: Coord): void {
        return this.onOptionalMouseOver(MGPOptional.of(coord));
    }

    protected onOptionalMouseOver(coord: MGPOptional<Coord>): void {
        this.takeHover.emit(coord);
    }

    protected onSVGLeave(): void {
        this.takeHover.emit(MGPOptional.empty());
    }

}
