import { Component, Input } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { CoordXYZ } from 'src/app/jscaip/CoordXYZ';
import { Direction } from 'src/app/jscaip/Direction';
import { ModeConfig, TrexoComponent } from './trexo.component';
import { TrexoMove } from './TrexoMove';

@Component({
    selector: '[app-3d-iso-square]',
    templateUrl: './three-d-iso-square.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ThreeDIsoSquareComponent {

    @Input() coord: CoordXYZ;
    @Input() move: TrexoMove | null;
    @Input() pieceClasses: string[];
    @Input() mode: ModeConfig;
    @Input() mustDisplayHeight: boolean;

    public getOpenRhombusPoints(): string {
        const coords: Coord[] = this.getOpenRhombusCoords();
        return coords.map((coord: Coord) => {
            return coord.x + ' ' + coord.y;
        }).join(' ');
    }
    private getOpenRhombusCoords(): Coord[] {
        const orientation: Direction | null = this.getMoveOrientation();
        const RHOMBUS_WIDTH: number = TrexoComponent.SPACE_SIZE * this.mode.HORIZONTAL_WIDTH_RATIO;
        const RHOMBUS_HEIGHT: number = TrexoComponent.SPACE_SIZE;
        const RHOMBUS_OFFSET: number = this.mode.OFFSET_RATIO * TrexoComponent.SPACE_SIZE;
        const x1: number = RHOMBUS_WIDTH;
        const y1: number = 0;
        const x2: number = RHOMBUS_WIDTH - RHOMBUS_OFFSET;
        const y2: number = RHOMBUS_HEIGHT;
        const x3: number = - RHOMBUS_OFFSET;
        const y3: number = RHOMBUS_HEIGHT;
        const p0: Coord = new Coord(0, 0);
        const p1: Coord = new Coord(x1, y1);
        const p2: Coord = new Coord(x2, y2);
        const p3: Coord = new Coord(x3, y3);
        switch (orientation) {
            case Direction.RIGHT: return [p1, p0, p3, p2];
            case Direction.DOWN: return [p3, p0, p1, p2];
            case Direction.LEFT: return [p0, p1, p2, p3];
            case Direction.UP: return [p0, p3, p2, p1];
            default: return [p1, p0, p3, p2, p1];
        }
    }
    private getMoveOrientation(): Direction | null {
        if (this.move == null) {
            return null;
        } else {
            let other: Coord = this.move.end;
            if (this.move.end.equals(this.coord)) {
                other = this.move.coord;
            }
            return this.coord.getDirectionToward(other).get();
        }
    }
    public getRhombusHorizontalVolumeLeft(): string {
        const RHOMBUS_WIDTH: number = TrexoComponent.SPACE_SIZE * this.mode.HORIZONTAL_WIDTH_RATIO;
        const RHOMBUS_HEIGHT: number = TrexoComponent.SPACE_SIZE;
        const RHOMBUS_OFFSET: number = this.mode.OFFSET_RATIO * TrexoComponent.SPACE_SIZE;
        const PIECE_HEIGHT: number = TrexoComponent.SPACE_SIZE * this.mode.PIECE_HEIGHT_RATIO;

        const x0: number = - RHOMBUS_OFFSET;
        const y0: number = RHOMBUS_HEIGHT;
        const x1: number = RHOMBUS_WIDTH - RHOMBUS_OFFSET;
        const y1: number = RHOMBUS_HEIGHT;
        const x2: number = RHOMBUS_WIDTH - RHOMBUS_OFFSET;
        const y2: number = RHOMBUS_HEIGHT + PIECE_HEIGHT;
        const x3: number = - RHOMBUS_OFFSET;
        const y3: number = RHOMBUS_HEIGHT + PIECE_HEIGHT;
        return [
            new Coord(x1, y1),
            new Coord(x0, y0), // upper left coord, 0, 0
            new Coord(x3, y3),
            new Coord(x2, y2),
            new Coord(x1, y1),
        ].map((coord: Coord) => coord.x + ' ' + coord.y).join(' ');
    }
    public getRhombusHorizontalVolumeRight(): string {
        const RHOMBUS_WIDTH: number = TrexoComponent.SPACE_SIZE * this.mode.HORIZONTAL_WIDTH_RATIO;
        const RHOMBUS_HEIGHT: number = TrexoComponent.SPACE_SIZE;
        const RHOMBUS_OFFSET: number = this.mode.OFFSET_RATIO * TrexoComponent.SPACE_SIZE;
        const PIECE_HEIGHT: number = TrexoComponent.SPACE_SIZE * this.mode.PIECE_HEIGHT_RATIO;

        const x0: number = - RHOMBUS_OFFSET;
        const y0: number = RHOMBUS_HEIGHT;
        const x1: number = RHOMBUS_WIDTH - RHOMBUS_OFFSET;
        const y1: number = RHOMBUS_HEIGHT;
        const x2: number = RHOMBUS_WIDTH - RHOMBUS_OFFSET;
        const y2: number = RHOMBUS_HEIGHT + PIECE_HEIGHT;
        const x3: number = - RHOMBUS_OFFSET;
        const y3: number = RHOMBUS_HEIGHT + PIECE_HEIGHT;
        return [
            new Coord(x0, y0), // upper left coord, 0, 0
            new Coord(x1, y1),
            new Coord(x2, y2),
            new Coord(x3, y3),
        ].map((coord: Coord) => coord.x + ' ' + coord.y).join(' ');
    }
    private getOpenDiagonalPoints(upRight: boolean): string {
        const RHOMBUS_WIDTH: number = TrexoComponent.SPACE_SIZE * this.mode.HORIZONTAL_WIDTH_RATIO;
        const RHOMBUS_HEIGHT: number = TrexoComponent.SPACE_SIZE;
        const RHOMBUS_OFFSET: number = this.mode.OFFSET_RATIO * TrexoComponent.SPACE_SIZE;
        const PIECE_HEIGHT: number = TrexoComponent.SPACE_SIZE * this.mode.PIECE_HEIGHT_RATIO;

        const x0: number = RHOMBUS_WIDTH - RHOMBUS_OFFSET;
        const y0: number = RHOMBUS_HEIGHT;
        const x1: number = RHOMBUS_WIDTH;
        const y1: number = 0;
        const x2: number = RHOMBUS_WIDTH;
        const y2: number = PIECE_HEIGHT;
        const x3: number = RHOMBUS_WIDTH - RHOMBUS_OFFSET;
        const y3: number = RHOMBUS_HEIGHT + PIECE_HEIGHT;

        let coords: Coord[] = [];
        if (upRight) {
            coords = [
                new Coord(x0, y0),
                new Coord(x1, y1),
                new Coord(x2, y2),
                new Coord(x3, y3),
            ];
        } else {
            coords = [
                new Coord(x1, y1),
                new Coord(x0, y0),
                new Coord(x3, y3),
                new Coord(x2, y2),
                new Coord(x1, y1),
            ];
        }
        return coords.map((coord: Coord) => coord.x + ' ' + coord.y).join(' ');
    }
    public getOpenDiagonalRightUp(): string {
        return this.getOpenDiagonalPoints(true);
    }
    public getOpenDiagonalRightDown(): string {
        return this.getOpenDiagonalPoints(false);
    }
    public pieceIsOnTheRight(): boolean {
        if (this.move) {
            const righterPoint: number = Math.max(this.move.coord.x, this.move.end.x);
            return this.coord.x === righterPoint;
        } else {
            return true;
        }
    }
    private pieceIsOnTheLeft(): boolean {
        if (this.move) {
            const lefterPoint: number = Math.min(this.move.coord.x, this.move.end.x);
            return this.coord.x === lefterPoint;
        } else {
            return true;
        }
    }
    private pieceIsOnTheBottom(): boolean {
        if (this.move) {
            const lowerPoint: number = Math.max(this.move.coord.y, this.move.end.y);
            return this.coord.y === lowerPoint;
        } else {
            return true;
        }
    }
    private pieceIsOnTheTop(): boolean {
        if (this.move) {
            const upperPoint: number = Math.min(this.move.coord.y, this.move.end.y);
            return this.coord.y === upperPoint;
        } else {
            return true;
        }
    }
    public pieceIsOnTheRightUp(): boolean {
        return this.pieceIsOnTheRight() &&
               this.pieceIsOnTheTop();
    }
    public pieceIsOnTheRightDown(): boolean {
        return this.pieceIsOnTheRight() &&
               this.pieceIsOnTheBottom();
    }
    public pieceIsOnTheDownLeft(): boolean {
        return this.pieceIsOnTheLeft() &&
               this.pieceIsOnTheBottom();
    }
}
