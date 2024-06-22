import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneMoveGenerator } from './AbaloneMoveGenerator';
import { AbaloneLegalityInformation, AbaloneRules } from './AbaloneRules';
import { AbaloneScoreHeuristic } from './AbaloneScoreHeuristic';
import { AbaloneState } from './AbaloneState';

export class AbaloneScoreMinimax
    extends Minimax<AbaloneMove, AbaloneState, EmptyRulesConfig, AbaloneLegalityInformation> {

    public constructor() {
        super($localize`Score`,
              AbaloneRules.get(),
              new AbaloneScoreHeuristic(),
              new AbaloneMoveGenerator());
    }

}
