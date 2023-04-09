import { Component, Input } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { Coord3D } from 'src/app/jscaip/Coord3D';
import { Vector } from 'src/app/jscaip/Direction';
import { assert } from 'src/app/utils/assert';
import { ModeConfig, TrexoComponent } from './trexo.component';
import { TrexoMove } from './TrexoMove';

@Component({
    selector: '[mgp-trexo-half-piece]',
    templateUrl: './trexo-half-piece.component.svg',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class TrexoHalfPieceComponent {

    @Input() coord: Coord3D;
    @Input() move: TrexoMove | undefined; // When move is null, it is the first click (only one dropped piece)
    @Input() pieceClasses: string[];
    @Input() mode: ModeConfig;
    @Input() mustDisplayHeight: boolean;

    public static STROKE_OFFSET: number = TrexoComponent.STROKE_WIDTH / 2;

    public mustForceStrokeDisplay(): boolean {

        return this.move === undefined ||
               this.pieceClasses.some((pieceClass: string) => pieceClass === 'victory-stroke') ||
               this.pieceClasses.some((pieceClass: string) => pieceClass === 'last-move-stroke');
    }

    /**
     * In all that page, when a Coord is named, it'll be according to that graph
     * Note that STROKE_OFFSET has to be excluded of those calculations to get the outside shape coords
     *       0-------1
     *      /       /|
     *     /   U   / |
     *    /       /  |
     *   2-------3   |
     *   |       | R |
     *   |       |   4
     *   |   F   |  /
     *   |       | /
     *   |       |/
     *   5-------6
     */
    public get3DIsoSquarePoints(): string {
        const points: Coord[] = this.getParallelogramPoints();
        const coords: Coord[] = [
            points[0],
            points[1],
            points[4],
            points[6],
            points[5],
            points[2],
            points[0],
        ];
        return this.mapCoordToPoints(coords);
    }
    private getParallelogramPoints(): [Coord, Coord, Coord, Coord, Coord, Coord, Coord] {
        const parallelogramWidth: number = TrexoComponent.SPACE_SIZE * this.mode.horizontalWidthRatio;
        const parallelogramHeight: number = TrexoComponent.SPACE_SIZE;
        const parallelogramOffset: number = this.mode.offsetRatio * TrexoComponent.SPACE_SIZE;
        const pieceHeight: number = TrexoComponent.SPACE_SIZE * this.mode.pieceHeightRatio;
        const x1: number = parallelogramWidth;
        const y1: number = 0;
        const x3: number = parallelogramWidth - parallelogramOffset;
        const y3: number = parallelogramHeight;
        const x2: number = - parallelogramOffset;
        const y2: number = parallelogramHeight;
        const p0: Coord = new Coord(0, 0);
        const p1: Coord = new Coord(x1, y1);
        const p2: Coord = new Coord(x2, y2);
        const p3: Coord = new Coord(x3, y3);
        const p4: Coord = new Coord(x1, y1 + pieceHeight);
        const p5: Coord = new Coord(x2, y2 + pieceHeight);
        const p6: Coord = new Coord(x3, y3 + pieceHeight);
        return [p0, p1, p2, p3, p4, p5, p6];
    }
    public mapCoordToPoints(coords: Coord[]): string {
        return coords.map((coord: Coord) => {
            return coord.x + ' ' + coord.y;
        }).join(' ');
    }
    private getUpperHorizontalLineCoords(): Coord[] { // Stroke from 0 to 1 (inside U)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const upLeft: Coord = parallelogramPoints[0];
        const upRight: Coord = parallelogramPoints[1];
        const STROKE_OFFSET: number = -1 * this.mode.offsetRatio * TrexoComponent.STROKE_WIDTH;
        const STROKE_VECTOR: Vector = new Vector(STROKE_OFFSET, TrexoComponent.STROKE_WIDTH);
        const downLeft: Coord = upLeft.getNext(STROKE_VECTOR);
        const downRight: Coord = upRight.getNext(STROKE_VECTOR);
        return [upLeft, upRight, downRight, downLeft];
    }
    public getUpperHorizontalLine(): string { // Stroke from 0 to 1 (inside U)
        const coords: Coord[] = this.getUpperHorizontalLineCoords();
        return this.mapCoordToPoints(coords);
    }
    private getMiddleHorizontalCoords(): Coord[] { // Stroke from 2 to 3 (inside U)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const downLeft: Coord = parallelogramPoints[2];
        const downRight: Coord = parallelogramPoints[3];
        const STROKE_OFFSET: number = -1 * this.mode.offsetRatio * TrexoComponent.STROKE_WIDTH;
        const STROKE_VECTOR: Vector = new Vector(STROKE_OFFSET, TrexoComponent.STROKE_WIDTH);
        const upLeft: Coord = downLeft.getNext(STROKE_VECTOR, -1);
        const upRight: Coord = downRight.getNext(STROKE_VECTOR, -1);
        return [upLeft, upRight, downRight, downLeft];
    }
    public getMiddleHorizontalLine(): string { // Stroke from 2 to 3
        const coords: Coord[] = this.getMiddleHorizontalCoords();
        return this.mapCoordToPoints(coords);
    }
    public getLowerHorizontalLine(): string { // Stroke from 5 to 6 (inside F)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const downLeft: Coord = parallelogramPoints[5];
        const downRight: Coord = parallelogramPoints[6];
        const STROKE_VECTOR: Vector = new Vector(0, TrexoComponent.STROKE_WIDTH);
        const upLeft: Coord = downLeft.getNext(STROKE_VECTOR, -1);
        const upRight: Coord = downRight.getNext(STROKE_VECTOR, -1);
        const coords: Coord[] = [upLeft, upRight, downRight, downLeft];
        return this.mapCoordToPoints(coords);
    }
    public getLeftDiagonalLine(): string { // Stroke from 0 to 2 (inside U)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const upLeft: Coord = parallelogramPoints[0];
        const downLeft: Coord = parallelogramPoints[2];
        const STROKE_OFFSET: number = TrexoComponent.STROKE_WIDTH;
        const STROKE_VECTOR: Vector = new Vector(STROKE_OFFSET, 0);
        const upRight: Coord = upLeft.getNext(STROKE_VECTOR, 1);
        const downRight: Coord = downLeft.getNext(STROKE_VECTOR, 1);
        const coords: Coord[] = [upLeft, upRight, downRight, downLeft];
        return this.mapCoordToPoints(coords);
    }
    public getMiddleDiagonalLine(): string { // Stroke from 1 to 3 (inside U)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const upRight: Coord = parallelogramPoints[1];
        const downRight: Coord = parallelogramPoints[3];
        const STROKE_OFFSET: number = TrexoComponent.STROKE_WIDTH;
        const STROKE_VECTOR: Vector = new Vector(STROKE_OFFSET, 0);
        const upLeft: Coord = upRight.getNext(STROKE_VECTOR, -1);
        const downLeft: Coord = downRight.getNext(STROKE_VECTOR, -1);
        const coords: Coord[] = [upLeft, upRight, downRight, downLeft];
        return this.mapCoordToPoints(coords);
    }
    public getRighterDiagonalLine(): string { // Stroke from 4 to 6 (inside R)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const upRight: Coord = parallelogramPoints[4];
        const downRight: Coord = parallelogramPoints[6];
        const STROKE_OFFSET: number = TrexoComponent.STROKE_WIDTH;
        const STROKE_VECTOR: Vector = new Vector(0, STROKE_OFFSET);
        const upLeft: Coord = upRight.getNext(STROKE_VECTOR, -1);
        const downLeft: Coord = downRight.getNext(STROKE_VECTOR, -1);
        const coords: Coord[] = [upLeft, upRight, downRight, downLeft];
        return this.mapCoordToPoints(coords);
    }
    public getLeftVerticalLine(): string { // Stroke from 2 to 5 (inside F)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const upLeft: Coord = parallelogramPoints[2];
        const downLeft: Coord = parallelogramPoints[5];
        const STROKE_OFFSET: number = TrexoComponent.STROKE_WIDTH;
        const STROKE_VECTOR: Vector = new Vector(STROKE_OFFSET, 0);
        const upRight: Coord = upLeft.getNext(STROKE_VECTOR, 1);
        const downRight: Coord = downLeft.getNext(STROKE_VECTOR, 1);
        const coords: Coord[] = [upLeft, upRight, downRight, downLeft];
        return this.mapCoordToPoints(coords);
    }
    public getMiddleVerticalLine(): string { // Stroke from 3 to 6 (inside F)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const upRight: Coord = parallelogramPoints[3];
        const downRight: Coord = parallelogramPoints[6];
        const STROKE_OFFSET: number = TrexoComponent.STROKE_WIDTH;
        const STROKE_VECTOR: Vector = new Vector(STROKE_OFFSET, 0);
        const upLeft: Coord = upRight.getNext(STROKE_VECTOR, -1);
        const downLeft: Coord = downRight.getNext(STROKE_VECTOR, -1);
        const coords: Coord[] = [upLeft, upRight, downRight, downLeft];
        return this.mapCoordToPoints(coords);
    }
    public getRighterVerticalLine(): string { // Stroke from 1 to 4 (inside R)
        const parallelogramPoints: Coord[] = this.getParallelogramPoints();
        const upRight: Coord = parallelogramPoints[1];
        const downRight: Coord = parallelogramPoints[4];
        const STROKE_OFFSET_X: number = TrexoComponent.STROKE_WIDTH;
        const STROKE_OFFSET_Y: number = TrexoComponent.STROKE_WIDTH / this.mode.offsetRatio;
        const STROKE_VECTOR: Vector = new Vector(STROKE_OFFSET_X, - STROKE_OFFSET_Y);
        const upLeft: Coord = upRight.getNext(STROKE_VECTOR, -1);
        const downLeft: Coord = downRight.getNext(STROKE_VECTOR, -1);
        const coords: Coord[] = [upLeft, upRight, downRight, downLeft];
        return this.mapCoordToPoints(coords);
    }
    public getOtherCoord(): Coord {
        // If the coord is part of a move there is another coord toward which the shape is oriented
        // It is this coord that we return
        assert(this.move != null, 'Move should be set before calling getOtherCoord');
        const move: TrexoMove = this.move as TrexoMove;
        if (move.getZero().equals(this.coord)) {
            return move.getOne();
        } else {
            return move.getZero();
        }
    }
    public isLeftHalf(): boolean {
        if (this.move == null) {
            return false;
        } else {
            const otherCoord: Coord = this.getOtherCoord();
            return this.coord.x === otherCoord.x - 1;
        }
    }
    public isRightHalf(): boolean {
        if (this.move == null) {
            return false;
        } else {
            const otherCoord: Coord = this.getOtherCoord();
            return this.coord.x === otherCoord.x + 1;
        }
    }
    public isTopHalf(): boolean {
        if (this.move == null) {
            return false;
        } else {
            const otherCoord: Coord = this.getOtherCoord();
            return this.coord.y === otherCoord.y - 1;
        }
    }
    public isBottomHalf(): boolean {
        if (this.move == null) {
            return false;
        } else {
            const otherCoord: Coord = this.getOtherCoord();
            return this.coord.y === otherCoord.y + 1;
        }
    }
}
