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
}
