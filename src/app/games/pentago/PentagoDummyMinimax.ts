import { DummyHeuristic, Minimax } from 'src/app/jscaip/AI/Minimax';
import { PentagoMove } from './PentagoMove';
import { PentagoMoveGenerator } from './PentagoMoveGenerator';
import { PentagoRules } from './PentagoRules';
import { PentagoState } from './PentagoState';

export class PentagoDummyMinimax extends Minimax<PentagoMove, PentagoState> {

    public constructor() {
        super($localize`Dummy`,
              PentagoRules.get(),
              new DummyHeuristic(),
              new PentagoMoveGenerator());
    }

}
