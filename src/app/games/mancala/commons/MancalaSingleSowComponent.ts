import { ChangeDetectorRef } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaMove } from './MancalaMove';
import { MancalaRules } from './MancalaRules';
import { MancalaComponent } from './MancalaComponent';
import { ActivatedRoute } from '@angular/router';

export abstract class MancalaSingleSowComponent<R extends MancalaRules<M>, M extends MancalaMove>
    extends MancalaComponent<R, M>
{

    public constructor(messageDisplayer: MessageDisplayer,
                       actRoute: ActivatedRoute,
                       cdr: ChangeDetectorRef)
    {
        super(messageDisplayer, actRoute, cdr);
    }
    protected updateOrCreateCurrentMove(x: number): void {
        this.currentMove = MGPOptional.of(this.generateMove(x));
    }
}
