import { Move } from '../../../jscaip/Move';
import { Component, Inject } from '@angular/core';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { GameComponent } from '../game-component/GameComponent';
import { Table } from 'src/app/utils/ArrayUtils';
import { Rules } from 'src/app/jscaip/Rules';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';

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

    public constructor(messageDisplayer: MessageDisplayer,
                       @Inject(Boolean) mustRotateBoard: boolean)
    {
        super(messageDisplayer, mustRotateBoard);
    }
}
