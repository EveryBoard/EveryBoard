import { Minimax } from '../../jscaip/AI/Minimax';

import { ConspirateursHeuristic } from './ConspirateursHeuristic';
import { ConspirateursMove } from './ConspirateursMove';
import { ConspirateursOrderedMoveGenerator } from './ConspirateursOrderedMoveGenerator';
import { ConspirateursRules } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';

export class ConspirateursJumpMinimax extends Minimax<ConspirateursMove, ConspirateursState> {

    public constructor() {
        super($localize`Jump`,
              ConspirateursRules.get(),
              new ConspirateursHeuristic(),
              new ConspirateursOrderedMoveGenerator(),
        );
    }
}
