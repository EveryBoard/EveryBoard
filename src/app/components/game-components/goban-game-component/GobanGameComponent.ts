import { Component } from '@angular/core';

import { Comparable } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { GobanConfig } from '../../../jscaip/GobanConfig';
import { GobanUtils } from '../../../jscaip/GobanUtils';
import { Move } from '../../../jscaip/Move';
import { SuperRules } from '../../../jscaip/Rules';
import { GameStateWithTable } from '../../../jscaip/state/GameStateWithTable';
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
