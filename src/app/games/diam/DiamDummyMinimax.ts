import { DummyHeuristic, Minimax } from 'src/app/jscaip/AI/Minimax';
import { DiamMove } from './DiamMove';
import { DiamMoveGenerator } from './DiamMoveGenerator';
import { DiamRules } from './DiamRules';
import { DiamState } from './DiamState';

export class DiamDummyMinimax
    extends Minimax<DiamMove, DiamState> {

    public constructor() {
        super($localize`Dummy`,
              DiamRules.get(),
              new DummyHeuristic(),
              new DiamMoveGenerator());
    }

}
