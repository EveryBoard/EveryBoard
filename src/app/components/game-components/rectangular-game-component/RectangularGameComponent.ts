import { Move } from '../../../jscaip/Move';
import { Component } from '@angular/core';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { GameComponent } from '../game-component/GameComponent';
import { Table } from 'src/app/utils/ArrayUtils';
import { Rules } from 'src/app/jscaip/Rules';
import { EmptyRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

@Component({
    template: '',
})
export abstract class RectangularGameComponent<R extends Rules<M, S, C, L>,
                                               M extends Move,
                                               S extends GameStateWithTable<P>,
                                               P,
                                               C extends RulesConfig = EmptyRulesConfig,
                                               L = void>
    extends GameComponent<R, M, S, C, L>
{

    public board: Table<P>;

    public getViewBox(): string {
        return (-0.5 * this.STROKE_WIDTH) + ' ' +
            (-0.5 * this.STROKE_WIDTH) + ' ' +
            (this.board[0].length * this.SPACE_SIZE + this.STROKE_WIDTH) + ' ' +
            (this.board.length * this.SPACE_SIZE + this.STROKE_WIDTH);
    }

    public getWidth(): number {
        return this.getState().getWidth();
    }

    public getHeight(): number {
        return this.getState().getHeight();
    }

}
