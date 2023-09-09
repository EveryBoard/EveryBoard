import { ChangeDetectorRef } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaMove } from './MancalaMove';
import { MancalaRules } from './MancalaRules';
import { MancalaComponent } from './MancalaComponent';

export abstract class MancalaSingleSowComponent<R extends MancalaRules<M>, M extends MancalaMove>
    extends MancalaComponent<R, M>
{

    public constructor(messageDisplayer: MessageDisplayer,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, cdr);
    }
    protected updateOrCreateCurrentMove(x: number): void {
        this.currentMove = MGPOptional.of(this.generateMove(x));
    }
}