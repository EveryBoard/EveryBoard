import { Move } from '../../../jscaip/Move';
import { Component } from '@angular/core';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { GameComponent } from '../game-component/GameComponent';
import { Table } from 'src/app/utils/ArrayUtils';
import { Rules } from 'src/app/jscaip/Rules';

@Component({
    template: '',
})
export abstract class RectangularGameComponent<R extends Rules<M, S, L>,
                                               M extends Move,
                                               S extends GameStateWithTable<P>,
                                               P,
                                               L = void>
    extends GameComponent<R, M, S, L>
{

    public board: Table<P>;

    public getViewBox(): string {
        return (-0.5 * this.STROKE_WIDTH) + ' ' +
            (-0.5 * this.STROKE_WIDTH) + ' ' +
            (this.board.length * this.SPACE_SIZE + this.STROKE_WIDTH) + ' ' +
            (this.board[0].length * this.SPACE_SIZE + this.STROKE_WIDTH);
    }
    public getViewBoxWithExtraSpace(bonusLeft: number = 0, bonusRight: number = 0,
                                    bonusUp: number = 0, bonusDown: number = 0): string {
        return (-0.5 * this.STROKE_WIDTH - bonusLeft) + ' ' +
            (-0.5 * this.STROKE_WIDTH - bonusUp) + ' ' +
            (this.board.length * this.SPACE_SIZE + this.STROKE_WIDTH + bonusRight) + ' ' +
            (this.board[0].length * this.SPACE_SIZE + this.STROKE_WIDTH + bonusDown);
    }
}
