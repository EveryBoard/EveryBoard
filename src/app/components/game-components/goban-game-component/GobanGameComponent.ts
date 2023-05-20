import { Move } from '../../../jscaip/Move';
import { Component } from '@angular/core';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Rules } from 'src/app/jscaip/Rules';
import { RectangularGameComponent } from '../rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';

/**
 * This component is used for games that are played on a Goban.
 * It helps displaying hoshis.
 */
@Component({
    template: '',
})
export abstract class GobanGameComponent<R extends Rules<M, S, L>,
                                         M extends Move,
                                         S extends GameStateWithTable<P>,
                                         P,
                                         L = void>
    extends RectangularGameComponent<R, M, S, P, L>
{
    public hoshis: Coord[] = []
    /**
     * Creates the hoshis, filling in the `hoshis` field with the hoshis based on the board size.
     * Must be called after `this.board` has been set, usually in `updateBoard`.
     */
    public createHoshis(): void {
        const height: number = this.board.length;
        const middle: number = Math.floor(height / 2);
        const begin: number = height < 12 ? 2 : 3;
        const end: number = height - (begin + 1);
        if (18 < height) {
            this.hoshis.push(
                new Coord(begin, middle),
                new Coord(middle, begin),
                new Coord(middle, end),
                new Coord(end, middle),
            );
        }
        this.hoshis.push(
            new Coord(middle, middle),
            new Coord(begin, begin),
            new Coord(begin, end),
            new Coord(end, begin),
            new Coord(end, end),
        );
    }
    public isHoshi(x: number, y: number): boolean {
        return this.hoshis.some((c: Coord): boolean => c.x === x && c.y === y);
    }
}
