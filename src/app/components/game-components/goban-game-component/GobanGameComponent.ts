import { Move } from '../../../jscaip/Move';
import { Component } from '@angular/core';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Rules } from 'src/app/jscaip/Rules';
import { RectangularGameComponent } from '../rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

/**
 * This component is used for games that are played on a Goban.
 * It helps displaying hoshis.
 */
@Component({
    template: '',
})
export abstract class GobanGameComponent<R extends Rules<M, S, C, L>,
                                         M extends Move,
                                         S extends GameStateWithTable<P>,
                                         P,
                                         C extends RulesConfig = RulesConfig,
                                         L = void>
    extends RectangularGameComponent<R, M, S, P, C, L>
{

    public static getHoshis(width: number, height: number): Coord[] {
        const hoshis: Coord[] = [];
        const horizontalMiddle: number = GobanGameComponent.getHorizontalCenter(width);
        const verticalMiddle: number = GobanGameComponent.getVerticalCenter(height);
        const left: number = GobanGameComponent.getHorizontalLeft(width);
        const up: number = GobanGameComponent.getVerticalUp(height);
        const right: number = GobanGameComponent.getHorizontalRight(width);
        const down: number = GobanGameComponent.getVerticalDown(height);
        if (12 < height && height % 2 === 1 ) {
            hoshis.push(
                new Coord(left, verticalMiddle),
                new Coord(right, verticalMiddle),
            );
        }
        if (12 < width && width % 2 === 1 ) {
            hoshis.push(
                new Coord(horizontalMiddle, up),
                new Coord(horizontalMiddle, down),
            );
        }
        if (width % 2 === 1 && height % 2 === 1) {
            hoshis.push(
                new Coord(horizontalMiddle, verticalMiddle),
            );
        }
        hoshis.push(
            new Coord(left, up),
            new Coord(left, down),
            new Coord(right, up),
            new Coord(right, down),
        );
        return hoshis;
    }

    public static getHorizontalLeft(width: number): number {
        return width < 12 ? 2 : 3;
    }

    public static getHorizontalCenter(width: number): number {
        return Math.floor(width / 2);
    }

    public static getHorizontalRight(width: number): number {
        const left: number = GobanGameComponent.getHorizontalLeft(width);
        return width - (left + 1);
    }

    public static getVerticalUp(height: number): number {
        return height < 12 ? 2 : 3;
    }

    public static getVerticalCenter(height: number): number {
        return Math.floor(height / 2);
    }

    public static getVerticalDown(height: number): number {
        const up: number = GobanGameComponent.getVerticalUp(height);
        return height - (up + 1);
    }

    public hoshis: Coord[] = [];
    /**
     * Creates the hoshis, filling in the `hoshis` field with the hoshis based on the board size.
     * Must be called after `this.board` has been set, usually in `updateBoard`.
     */
    public createHoshis(): void {
        const height: number = this.board.length;
        const width: number = this.board[0].length;
        this.hoshis = GobanGameComponent.getHoshis(width, height);
    }

    public isHoshi(x: number, y: number): boolean {
        return this.hoshis.some((c: Coord): boolean => c.x === x && c.y === y);
    }
}
