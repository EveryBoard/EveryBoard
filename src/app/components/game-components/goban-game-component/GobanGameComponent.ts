import { Component } from '@angular/core';


import { Coord } from '@everyboard/games';
import { GobanConfig } from '@everyboard/games';
import { GobanUtils } from '@everyboard/games';
import { Move } from '@everyboard/games';
import { SuperRules } from '@everyboard/games';
import { GameStateWithTable } from '@everyboard/games';
import { Comparable } from '@everyboard/lib';

import { RectangularGameComponent } from '../rectangular-game-component/RectangularGameComponent';

/**
 * This component is used for games that are played on a Goban.
 * It helps displaying hoshis.
 */
@Component({
    template: '',
})
export abstract class GobanGameComponent<R extends SuperRules<M, S, C, L>,
                                         M extends Move,
                                         S extends GameStateWithTable<P>,
                                         P extends NonNullable<Comparable>,
                                         C extends GobanConfig = GobanConfig,
                                         L = void>
    extends RectangularGameComponent<R, M, S, P, C, L>
{

    public hoshis: Coord[] = [];
    /**
     * Creates the hoshis, filling in the `hoshis` field with the hoshis based on the board size.
     * Must be called after `this.board` has been set, usually in `updateBoard`.
     */
    public createHoshis(): void {
        const height: number = this.getHeight();
        const width: number = this.getWidth();
        this.hoshis = GobanUtils.getHoshis(width, height);
    }

}
