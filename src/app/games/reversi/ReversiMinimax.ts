import { Minimax } from '../../jscaip/AI/Minimax';

import { ReversiHeuristic } from './ReversiHeuristic';
import { ReversiMove } from './ReversiMove';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';
import { ReversiConfig, ReversiLegalityInformation, ReversiRules } from './ReversiRules';
import { ReversiState } from './ReversiState';

export class ReversiMinimax extends Minimax<ReversiMove, ReversiState, ReversiConfig, ReversiLegalityInformation> {

    public constructor() {
        super($localize`Minimax`,
              ReversiRules.get(),
              new ReversiHeuristic(),
              new ReversiMoveGenerator(),
        );
    }
}
