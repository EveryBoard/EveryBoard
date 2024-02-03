import { Move } from '../../../jscaip/Move';
import { Component } from '@angular/core';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { GameComponent } from '../game-component/GameComponent';
import { Table } from 'src/app/utils/ArrayUtils';
import { SuperRules } from 'src/app/jscaip/Rules';
import { EmptyRulesConfig, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { ViewBox } from '../GameComponentUtils';

@Component({
    template: '',
})
export abstract class RectangularGameComponent<R extends SuperRules<M, S, C, L>,
                                               M extends Move,
                                               S extends GameStateWithTable<P>,
                                               P,
                                               C extends RulesConfig = EmptyRulesConfig,
                                               L = void>
    extends GameComponent<R, M, S, C, L>
{

    public board: Table<P>;

    public getWidth(): number {
        return this.getState().getWidth();
    }

    public getHeight(): number {
        return this.getState().getHeight();
    }

    public getViewBox(): ViewBox {
        const width: number = this.getWidth() * this.SPACE_SIZE;
        const height: number = this.getHeight() * this.SPACE_SIZE;
        const halfStroke: number = 0.5 * this.STROKE_WIDTH;
        return ViewBox
            .fromLimits(0, width, 0, height)
            .expand(halfStroke, halfStroke, halfStroke, halfStroke);
    }

}
