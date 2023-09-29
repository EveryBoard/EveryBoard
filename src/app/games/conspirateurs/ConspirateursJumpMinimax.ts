import { Minimax } from 'src/app/jscaip/Minimax';
import { ConspirateursMove } from './ConspirateursMove';
import { ConspirateursState } from './ConspirateursState';
import { ConspirateursRules } from './ConspirateursRules';
import { ConspirateursHeuristic } from './ConspirateursHeuristic';
import { ConspirateursOrderedMoveGenerator } from './ConspirateursOrderedMoveGenerator';

export class ConspirateursJumpMinimax extends Minimax<ConspirateursMove, ConspirateursState> {

    public constructor() {
        super($localize`Jump`, ConspirateursRules.get(), new ConspirateursHeuristic(), new ConspirateursOrderedMoveGenerator());
    }
}
