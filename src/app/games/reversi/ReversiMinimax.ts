import { Minimax } from 'src/app/jscaip/Minimax';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';
import { ReversiLegalityInformation, ReversiRules } from './ReversiRules';
import { ReversiMoveGenerator } from './ReversiMoveGenerator';
import { ReversiHeuristic } from './ReversiHeuristic';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ReversiMinimax extends Minimax<ReversiMove, ReversiState, RulesConfig, ReversiLegalityInformation> {

    public constructor() {
        super($localize`Minimax`, ReversiRules.get(), new ReversiHeuristic(), new ReversiMoveGenerator());
    }
}
