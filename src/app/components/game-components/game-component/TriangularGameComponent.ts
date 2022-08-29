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
    public SPACE_SIZE: number = 50;

    public board: Table<P>;

    public getTriangleCornerCoords(x: number, y: number) : Coord[] {
        if ((x+y)%2 === 1) return this.getDownwardCoordinate(x, y);
        else return this.getUpwardCoordinate(x, y);
    }
    public getTriangleCoordinate(x: number, y: number) : string {
        const coords: Coord[] = this.getTriangleCornerCoords(x, y);
        const strings: string[] = coords.map((c: Coord) => c.x + ',' + c.y);
        return strings.reduce((sum: string, last: string) => sum + ',' + last);
    }
    public getDownwardCoordinate(x: number, y: number): Coord[] {
        const left: number = this.SPACE_SIZE * 0.5 * x;
        const middle: number = this.SPACE_SIZE * 0.5 * (x + 1);
        const right: number = this.SPACE_SIZE * 0.5 * (x + 2);
        const top: number = this.SPACE_SIZE * y;
        const bottom: number = this.SPACE_SIZE * (y + 1);
        const leftCorner: Coord = new Coord(left, top);
        const middleCorner: Coord = new Coord(middle, bottom);
        const rightCorner: Coord = new Coord(right, top);
        return [leftCorner, middleCorner, rightCorner, leftCorner];
    }
    public getUpwardCoordinate(x: number, y: number): Coord[] {
        const left: number = this.SPACE_SIZE * 0.5 * x;
        const middle: number = this.SPACE_SIZE * 0.5 * (x + 1);
        const right: number = this.SPACE_SIZE * 0.5 * (x + 2);
        const top: number = this.SPACE_SIZE * y;
        const bottom: number = this.SPACE_SIZE * (y + 1);
        const leftCorner: Coord = new Coord(left, bottom);
        const middleCorner: Coord = new Coord(middle, top);
        const rightCorner: Coord = new Coord(right, bottom);
        return [leftCorner, middleCorner, rightCorner, leftCorner];
    }
    public getPyramidCoordinate(x: number, y: number) : string {
        if ((x+y)%2 === 1) return this.getDownwardPyramidCoordinate(x, y);
        else return this.getUpwardPyramidCoordinate(x, y);
    }
    public getDownwardPyramidCoordinate(x: number, y: number): string {
        const zx: number = this.SPACE_SIZE * x / 2;
        const zy: number = this.SPACE_SIZE * y;
        const UP_LEFT: string = zx + ', ' + zy;
        const UP_RIGHT: string = (zx+this.SPACE_SIZE) + ', ' + zy;
        const DOWN_CENTER: string = (zx+(this.SPACE_SIZE/2)) + ', ' + (zy+this.SPACE_SIZE);
        const CENTER: string = (zx+(this.SPACE_SIZE / 2)) + ', ' + (zy+(this.SPACE_SIZE / 2));
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
    public getUpwardPyramidCoordinate(x: number, y: number): string {
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
}
