import { Minimax } from 'src/app/jscaip/Minimax';
import { ConspirateursMove } from './ConspirateursMove';
import { ConspirateursState } from './ConspirateursState';
import { ConspirateursRules } from './ConspirateursRules';
import { ConspirateursHeuristic } from './ConspirateursHeuristic';
import { ConspirateursOrderedMoveGenerator } from './ConspirateursOrderedMoveGenerator';

export class ConspirateursMinimax extends Minimax<ConspirateursMove, ConspirateursState> {

    public constructor() {
        super('Jump', ConspirateursRules.get(), new ConspirateursHeuristic(), new ConspirateursOrderedMoveGenerator());
    }
}
