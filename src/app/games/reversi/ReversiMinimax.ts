import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';
import { ReversiConfig, ReversiLegalityInformation, ReversiRules } from './ReversiRules';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';
import { ReversiHeuristic } from './ReversiHeuristic';

export class ReversiMinimax extends Minimax<ReversiMove, ReversiState, ReversiConfig, ReversiLegalityInformation> {

    public constructor() {
        super($localize`Minimax`,
              ReversiRules.get(),
              new ReversiHeuristic(),
              new ReversiMoveGenerator(),
        );
    }
}
