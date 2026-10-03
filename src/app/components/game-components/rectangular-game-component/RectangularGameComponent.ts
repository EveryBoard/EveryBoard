import { computed, Signal } from '@angular/core';

import { Move } from '@everyboard/games';
import { SuperRules } from '@everyboard/games';
import { EmptyRulesConfig, RulesConfig } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { GameStateWithTable } from '@everyboard/games';

import { ViewBox } from '../GameComponentUtils';
import { GameComponent } from '../game-component/GameComponent';

export abstract class RectangularGameComponent<R extends SuperRules<M, S, C, L>,
                                               M extends Move,
                                               S extends GameStateWithTable<P>,
                                               P extends NonNullable<unknown>,
                                               C extends RulesConfig = EmptyRulesConfig,
                                               L = void>
    extends GameComponent<R, M, S, C, L>
{

    public constructor(urlName: string) {
        super(urlName);
    }

    public board: Table<P>;

    protected readonly width: Signal<number> = computed(() => this.state().getWidth());

    protected readonly height: Signal<number> = computed(() => this.state().getHeight());

    protected override computeViewBox(): ViewBox {
        const width: number = this.width() * this.SPACE_SIZE;
        const height: number = this.height() * this.SPACE_SIZE;
        return this.getViewBoxFor(width, height);
    }

    public getViewBoxFor(width: number, height: number): ViewBox {
        const halfStroke: number = 0.5 * this.STROKE_WIDTH;
        return ViewBox
            .fromLimits(0, width, 0, height)
            .expandAll(halfStroke);
    }

}
