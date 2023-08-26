import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { GameComponent } from './GameComponent';
import { GameState } from 'src/app/jscaip/GameState';
import { Table } from 'src/app/utils/ArrayUtils';
import { Rules } from 'src/app/jscaip/Rules';

@Component({ template: '' })
export abstract class TriangularGameComponent<R extends Rules<M, S, L>,
                                              M extends Move,
                                              S extends GameState,
                                              P,
                                              L = void>
    extends GameComponent<R, M, S, L>
{
    public override SPACE_SIZE: number = 50;

    public board: Table<P>;

    private getTrianglePointsCoords(x: number, y: number): Coord[] {
        // coord is used to define if it is downward or not
        if ((x + y) % 2 === 0) {
            return this.getUpwardCoordinate();
        } else {
            return this.getDownwardCoordinate();
        }
    }
    protected getTriangleCornerCoords(x: number, y: number): Coord[] {
        if ((x + y) % 2 === 0) {
            return this.getUpwardCoordinate();
        } else {
            return this.getDownwardCoordinate();
        }
    }
    public getTrianglePoints(x: number, y: number): string {
        const coords: Coord[] = this.getTrianglePointsCoords(x, y);
        const strings: string[] = coords.map((c: Coord) => c.x + ',' + c.y);
        return strings.reduce((sum: string, last: string) => sum + ',' + last);
    }
    public getTriangleTranslate(x: number, y: number): string {
        const translateX: number = 0.5 * x * this.SPACE_SIZE;
        const translateY: number = y * this.SPACE_SIZE;
        return 'translate(' + translateX + ', ' + translateY + ')';
    }
    private getDownwardCoordinate(): Coord[] {
        const left: number = 0;
        const middle: number = this.SPACE_SIZE * 0.5;
        const right: number = this.SPACE_SIZE * 0.5 * 2;
        const top: number = 0;
        const bottom: number = this.SPACE_SIZE;
        const leftCorner: Coord = new Coord(left, top);
        const middleCorner: Coord = new Coord(middle, bottom);
        const rightCorner: Coord = new Coord(right, top);
        return [leftCorner, middleCorner, rightCorner, leftCorner];
    }
    private getUpwardCoordinate(): Coord[] {
        const left: number = 0;
        const middle: number = this.SPACE_SIZE * 0.5;
        const right: number = this.SPACE_SIZE * 0.5 * 2;
        const top: number = 0;
        const bottom: number = this.SPACE_SIZE;
        const leftCorner: Coord = new Coord(left, bottom);
        const middleCorner: Coord = new Coord(middle, top);
        const rightCorner: Coord = new Coord(right, bottom);
        return [leftCorner, middleCorner, rightCorner, leftCorner];
    }
    public getPyramidPoints(x: number, y: number): string {
        if ((x + y) % 2 === 1) {
            return this.getDownwardPyramidPoints();
        } else {
            return this.getUpwardPyramidPoints();
        }
    }
    private getDownwardPyramidPoints(): string {
        const UP_LEFT: string = '0, 0';
        const UP_RIGHT: string = (this.SPACE_SIZE) + ', 0';
        const DOWN_CENTER: string = (this.SPACE_SIZE / 2) + ', ' + this.SPACE_SIZE;
        const CENTER: string = (this.SPACE_SIZE / 2) + ', ' + (this.SPACE_SIZE / 2);
        return UP_LEFT + ',' +
               DOWN_CENTER + ',' +
               CENTER + ',' +
               UP_LEFT + ',' +
               CENTER + ',' +
               UP_RIGHT + ',' +
               UP_LEFT + ',' +
               UP_RIGHT + ',' +
               DOWN_CENTER + ',' +
               CENTER + ',' +
               UP_RIGHT;
    }
    private getUpwardPyramidPoints(): string {
        const x: number = 0;
        const y: number = 0;
        const zx: number = this.SPACE_SIZE * x / 2;
        const zy: number = (y + 1) * this.SPACE_SIZE;
        const DOWN_LEFT: string = zx + ', ' + zy;
        const DOWN_RIGHT: string = (zx + this.SPACE_SIZE) + ', ' + zy;
        const UP_CENTER: string = (zx + (this.SPACE_SIZE / 2)) + ', ' + (zy - this.SPACE_SIZE);
        const CENTER: string = (zx + (this.SPACE_SIZE / 2)) + ', ' + (zy- (this.SPACE_SIZE / 2));
        return DOWN_LEFT + ',' +
               UP_CENTER + ',' +
               CENTER + ',' +
               DOWN_LEFT + ',' +
               CENTER + ',' +
               DOWN_RIGHT + ',' +
               DOWN_LEFT + ',' +
               DOWN_RIGHT + ',' +
               UP_CENTER + ',' +
               CENTER + ',' +
               DOWN_RIGHT;
    }
    public getPyramidTransform(x: number, y: number): string {
        let translateX: number = (0.5 * x) * this.SPACE_SIZE;
        let translateY: number = y * this.SPACE_SIZE;
        if ((x + y) % 2 === 0) {
            translateX += 0.0 * this.SPACE_SIZE;
            translateY += 0.0 * this.SPACE_SIZE;
        } else {
            translateX += 0.0 * this.SPACE_SIZE;
            translateY += 0.0 * this.SPACE_SIZE;
        }
        const translate: string = 'translate(' + translateX + ' ' + translateY + ')';
        const scale: string = 'scale(1)';
        return translate + ' ' + scale;
    }
}
