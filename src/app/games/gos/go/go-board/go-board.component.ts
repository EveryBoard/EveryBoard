import { NgClass } from '@angular/common';
import { Component, computed, EventEmitter, input, InputSignal, ModelSignal, Output, Signal } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

import { BaseGameComponent } from '../../../../components/game-components/base-game-component/BaseGameComponent';
import { BlankGobanComponent } from '../../../../components/game-components/goban-game-component/blank-goban/blank-goban.component';
import { Coord } from '../../../../jscaip/Coord';
import { GoPiece } from '../../GoPiece';
import { GoState } from '../../GoState';

@Component({
    selector: '[app-go-board]',
    templateUrl: './go-board.component.svg',
    styleUrls: ['../../../../components/game-components/game-component/game-component.scss'],
    imports: [BlankGobanComponent, NgClass],
})
export class GoBoardComponent extends BaseGameComponent {

    public captures: InputSignal<Coord[]> = input.required();

    public adaptedCaptures: Signal<Coord[]> = computed(() => {
        return this.captures()
            .map((coord: Coord) => this.getZoomAdaptedCoord(coord))
            .filter((coord: Coord) => this.state().isOnBoard(coord)); // TODO TEST
    });

    public ko: InputSignal<MGPOptional<Coord>> = input.required();

    public adaptedKo: Signal<MGPOptional<Coord>> = computed(() => {
        const ko: MGPOptional<Coord> = this.ko()
            .map((coord: Coord) => this.getZoomAdaptedCoord(coord)); // TODO: MGPOptional.filter
        // TODO TEST
        if (ko.isPresent() && this.state().isOnBoard(ko.get())) {
            return MGPOptional.of(ko.get());
        } else {
            return MGPOptional.empty();
        }
    });

    public last: InputSignal<MGPOptional<Coord>> = input.required();

    public state: InputSignal<GoState> = input.required();

    public zoom: InputSignal<number> = input.required();

    public zx: InputSignal<number> = input.required();

    public zy: InputSignal<number> = input.required();

    @Output() public clicked: EventEmitter<Coord> = new EventEmitter<Coord>();

    public GoPiece: typeof GoPiece = GoPiece;

    private getZoomAdaptedCoord(coord: Coord): Coord {
        const oneBasedZoom: number = this.zoom() + 1;
        return new Coord(
            this.zx() + (coord.x * oneBasedZoom),
            this.zy() + (coord.y * oneBasedZoom),
        );
    }
    public onClick(coord: Coord): void {
        const zoomAdaptedCoord: Coord = this.getZoomAdaptedCoord(coord);
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
        const zoomAdaptedCoord: Coord = this.getZoomAdaptedCoord(coord);
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
