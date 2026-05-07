import { NgClass } from '@angular/common';
import { Component, computed, EventEmitter, input, InputSignal, ModelSignal, Output, Signal } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

import { BaseGameComponent } from '../../../../components/game-components/base-game-component/BaseGameComponent';
import { BlankGobanComponent } from '../../../../components/game-components/goban-game-component/blank-goban/blank-goban.component';
import { Coord } from '../../../../jscaip/Coord';
import { GoPiece } from '../../GoPiece';
import { GoState } from '../../GoState';
import { Vector } from 'src/app/jscaip/Vector';

@Component({
    selector: '[app-go-board]',
    templateUrl: './go-board.component.svg',
    styleUrls: ['../../../../components/game-components/game-component/game-component.scss'],
    imports: [BlankGobanComponent, NgClass],
})
export class GoBoardComponent extends BaseGameComponent {

    public captures: InputSignal<Coord[]> = input.required();

    public adaptedCaptures: Signal<Coord[]> = computed(() => {
        // return this.captures()
        //     .map((coord: Coord) => this.getZoomAdaptedCoord(coord))
        //     .filter((coord: Coord) => this.state().isOnBoard(coord)); // TODO TEST
        const a: Coord[] = this.captures();
        const b: MGPOptional<Coord>[] = a.map((coord: Coord) => this.fromNormalToZoomedCoord(coord));
        const c: MGPOptional<Coord>[] = b.filter((coord: MGPOptional<Coord>) => coord.isPresent()); // TODO TEST
        const d: Coord[] = c.map((coord: MGPOptional<Coord>) => coord.get()); // TODO TEST
        console.log(this.zoom(), this.zx(), this.zy(), 'A', a)
        console.log(this.zoom(), this.zx(), this.zy(), 'mapped', b)
        console.log(this.zoom(), this.zx(), this.zy(), 'filtered', c)
        return d;
    });

    public ko: InputSignal<MGPOptional<Coord>> = input.required();

    public adaptedKo: Signal<MGPOptional<Coord>> = computed(() => {
        return this.fromNormalToOptionalZoomedCoord(this.ko());
        // return this.ko().map((coord: Coord) => this.fromNormalToZoomedCoord(coord));
    });

    private fromNormalToOptionalZoomedCoord(coord: MGPOptional<Coord>): MGPOptional<Coord> {
        if (coord.isPresent()) {
            return this.fromNormalToZoomedCoord(coord.get());
        } else {
            return MGPOptional.empty();
        }
    }

    public last: InputSignal<MGPOptional<Coord>> = input.required();

    public adaptedLast: Signal<MGPOptional<Coord>> = computed(() => {
        // TODO TEST
        // const last: MGPOptional<Coord> = this.last()
        //     .map((coord: Coord) => this.fromNormalToZoomedCoord(coord)); // TODO: MGPOptional.filter
        // if (last.isPresent() && this.state().isOnBoard(last.get())) {
        //     return MGPOptional.of(last.get());
        // } else {
        //     return MGPOptional.empty();
        // }

    });

    public state: InputSignal<GoState> = input.required();

    public zoom: InputSignal<number> = input.required();

    public zx: InputSignal<number> = input.required();

    public zy: InputSignal<number> = input.required();

    @Output() public clicked: EventEmitter<Coord> = new EventEmitter<Coord>();

    public GoPiece: typeof GoPiece = GoPiece;

    private fromZoomedToNormalCoord(zoomedCoord: Coord): Coord {
        const oneBasedZoom: number = this.zoom() + 1;
        return new Coord(
            this.zx() + (zoomedCoord.x * oneBasedZoom),
            this.zy() + (zoomedCoord.y * oneBasedZoom),
        );
    }

    public fromNormalToZoomedCoord(normalCoord: Coord): MGPOptional<Coord> {
        const zoomVector: Vector = new Vector(this.zx(), this.zy());
        const offsetCoord: Coord = normalCoord.getNext(zoomVector, -1);
        const oneBasedZoom: number = this.zoom() + 1;
        if (offsetCoord.x % oneBasedZoom === 0 && offsetCoord.y % oneBasedZoom === 0) {
            return new Coord(
                offsetCoord.x / oneBasedZoom,
                offsetCoord.y / oneBasedZoom,
            );
        } else {
            return MGPOptional.empty();
        }
    }

    public onClick(coord: Coord): void {
        const zoomAdaptedCoord: Coord = this.fromZoomedToNormalCoord(coord);
        this.clicked.emit(zoomAdaptedCoord);
    }

    public getSpaceClass(coord: Coord): string {
        const piece: GoPiece = this.state().getPieceAt(coord);
        // const zoomAdaptedCoord: Coord = this.getZoomAdaptedCoord(coord);
        // const piece: GoPiece = this.state().getPieceAt(zoomAdaptedCoord);
        return this.getPlayerClass(piece.getOwner());
    }

    public spaceIsFull(coord: Coord): boolean {
        const piece: GoPiece = this.state().getPieceAt(coord);
        // const zoomAdaptedCoord: Coord = this.getZoomAdaptedCoord(coord);
        // return piece !== GoPiece.EMPTY && this.isTerritory(zoomAdaptedCoord) === false;
        return piece !== GoPiece.EMPTY && this.isTerritory(coord) === false;
    }

    public isLastSpace(coord: Coord): boolean {
        const zoomAdaptedCoord: Coord = this.fromZoomedToNormalCoord(coord);
        return this.last().equalsValue(zoomAdaptedCoord);
        // TODO: test
    }

    public isDead(coord: Coord): boolean {
        // const zoomAdaptedCoord: Coord = this.getZoomAdaptedCoord(coord);
        return this.state().isDead(coord);
    }

    public isTerritory(coord: Coord): boolean {
        // const zoomAdaptedCoord: Coord = this.getZoomAdaptedCoord(coord);
        return this.state().isTerritory(coord);
    }

}
