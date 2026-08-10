import { Component, computed, Signal } from '@angular/core';

import { Move } from '../../../jscaip/Move';
import { SuperRules } from '../../../jscaip/Rules';
import { EmptyRulesConfig, RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { Table } from '../../../jscaip/TableUtils';
import { GameStateWithTable } from '../../../jscaip/state/GameStateWithTable';
import { ViewBox } from '../GameComponentUtils';
import { GameComponent } from '../game-component/GameComponent';

@Component({
    template: '',
})
export abstract class RectangularGameComponent<R extends SuperRules<M, S, C, L>,
                                               M extends Move,
                                               S extends GameStateWithTable<P>,
                                               P extends NonNullable<unknown>,
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

    public readonly viewBox: Signal<ViewBox> = computed(() => this.computeViewBox());

    protected computeViewBox(): ViewBox {
        const width: number = this.getWidth() * this.SPACE_SIZE;
        const height: number = this.getHeight() * this.SPACE_SIZE;
        const halfStroke: number = 0.5 * this.STROKE_WIDTH;
        return ViewBox
            .fromLimits(0, width, 0, height)
            .expandAll(halfStroke);
    }

}
