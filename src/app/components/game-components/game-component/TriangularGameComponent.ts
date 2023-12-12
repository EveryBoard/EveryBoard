import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { GameComponent } from './GameComponent';
import { GameState } from 'src/app/jscaip/GameState';
import { Table } from 'src/app/utils/ArrayUtils';
import { SuperRules } from 'src/app/jscaip/Rules';
import { EmptyRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

@Component({ template: '' })
export abstract class TriangularGameComponent<R extends SuperRules<M, S, C, L>,
                                              M extends Move,
                                              S extends GameState,
                                              P,
                                              C extends RulesConfig = EmptyRulesConfig,
                                              L = void>
    extends GameComponent<R, M, S, C, L>
{
    public override SPACE_SIZE: number = 100;

    public board: Table<P>;

    protected getTriangleCornerCoords(x: number, y: number): Coord[] {
        if ((x + y) % 2 === 0) {
            return this.getUpwardCoordinate();
        } else {
            return this.getDownwardCoordinate();
        }
    }
    public getTrianglePoints(x: number, y: number): string {
        const coords: Coord[] = this.getTriangleCornerCoords(x, y);
        const strings: string[] = coords.map((c: Coord) => c.x + ',' + c.y);
        return strings.reduce((sum: string, last: string) => sum + ',' + last);
    }
    public getTriangleTranslateCoord(x: number, y: number): Coord {
        const translateX: number = 0.5 * x * this.SPACE_SIZE;
        const translateY: number = y * this.SPACE_SIZE;
        return new Coord(translateX, translateY);
    }
    public getTriangleTranslate(x: number, y: number): string {
        const translate: Coord = this.getTriangleTranslateCoord(x, y);
        return 'translate(' + translate.x + ', ' + translate.y + ')';
    }
    private getDownwardCoordinate(): Coord[] {
        const left: number = - this.SPACE_SIZE / 2;
        const middle: number = 0;
        const right: number = this.SPACE_SIZE / 2;
        const top: number = - this.SPACE_SIZE / 2;
        const bottom: number = this.SPACE_SIZE / 2;
        const leftCorner: Coord = new Coord(left, top);
        const middleCorner: Coord = new Coord(middle, bottom);
        const rightCorner: Coord = new Coord(right, top);
        return [leftCorner, middleCorner, rightCorner, leftCorner];
    }
    private getUpwardCoordinate(): Coord[] {
        const left: number = - this.SPACE_SIZE / 2;
        const middle: number = 0;
        const right: number = this.SPACE_SIZE / 2;
        const top: number = - this.SPACE_SIZE / 2;
        const bottom: number = this.SPACE_SIZE / 2;
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
        const halfWidth: number = this.SPACE_SIZE / 2;
        const UP_LEFT: string = (- halfWidth) + ', ' + (- halfWidth);
        const UP_RIGHT: string = halfWidth + ', ' + (- halfWidth);
        const DOWN_CENTER: string = '0, ' + halfWidth;
        const CENTER: string = '0, 0';
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
        const halfWidth: number = this.SPACE_SIZE / 2;
        const DOWN_LEFT: string = (- halfWidth) + ', ' + halfWidth;
        const DOWN_RIGHT: string = halfWidth + ', ' + halfWidth;
        const UP_CENTER: string = '0, ' + (- halfWidth);
        const CENTER: string = '0, 0';
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
