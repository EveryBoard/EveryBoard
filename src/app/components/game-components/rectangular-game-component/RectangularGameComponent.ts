import { Move } from '../../../jscaip/Move';
import { Component } from '@angular/core';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { GameComponent } from '../game-component/GameComponent';
import { Table } from 'src/app/utils/ArrayUtils';
import { Rules } from 'src/app/jscaip/Rules';
import { ViewBox } from '../GameComponentUtils';

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

    public getWidth(): number {
        return this.board[0].length;
    }

    public getHeight(): number {
        return this.board.length;
    }

    public getViewBox(): string {
        const left: number = -0.5 * this.STROKE_WIDTH;
        const up: number = -0.5 * this.STROKE_WIDTH;
        const right: number = this.getWidth() * this.SPACE_SIZE + this.STROKE_WIDTH;
        const down: number = this.getHeight() * this.SPACE_SIZE + this.STROKE_WIDTH;
        return ViewBox.fromLimits(left, right, up, down).toSVGString();
    }

    public getViewBoxWithExtraSpace(bonusLeft: number,
                                    bonusRight: number,
                                    bonusUp: number,
                                    bonusDown: number)
    : string
    {
        const left: number = -0.5 * this.STROKE_WIDTH - bonusLeft;
        const up: number = -0.5 * this.STROKE_WIDTH - bonusUp;
        const right: number = (this.getWidth() * this.SPACE_SIZE + this.STROKE_WIDTH + bonusRight);
        const down: number = (this.getHeight() * this.SPACE_SIZE + this.STROKE_WIDTH + bonusDown);
        return ViewBox.fromLimits(left, right, up, down).toSVGString();
    }
}
