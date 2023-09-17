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
    public hoshis: Coord[] = [];
    /**
     * Creates the hoshis, filling in the `hoshis` field with the hoshis based on the board size.
     * Must be called after `this.board` has been set, usually in `updateBoard`.
     */
    public createHoshis(): void {
        this.hoshis = [];
        const height: number = this.board.length;
        const width: number = this.board[0].length;
        const horizontalMiddle: number = Math.floor(width / 2);
        const verticalMiddle: number = Math.floor(height / 2);
        const left: number = width < 12 ? 2 : 3;
        const up: number = height < 12 ? 2 : 3;
        const right: number = width - (left + 1);
        const down: number = height - (up + 1);
        if (12 < height) {
            this.hoshis.push(
                new Coord(left, verticalMiddle),
                new Coord(right, verticalMiddle),
            );
        }
        if (12 < width) {
            this.hoshis.push(
                new Coord(horizontalMiddle, up),
                new Coord(horizontalMiddle, down),
            );
        }
        this.hoshis.push(
            new Coord(horizontalMiddle, verticalMiddle),
            new Coord(left, up),
            new Coord(left, down),
            new Coord(right, up),
            new Coord(right, down),
        );
    }
    public isHoshi(x: number, y: number): boolean {
        return this.hoshis.some((c: Coord): boolean => c.x === x && c.y === y);
    }
}
