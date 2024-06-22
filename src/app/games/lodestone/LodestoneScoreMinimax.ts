import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { LodestoneMove } from './LodestoneMove';
import { LodestoneMoveGenerator } from './LodestoneMoveGenerator';
import { LodestoneInfos, LodestoneRules } from './LodestoneRules';
import { LodestoneScoreHeuristic } from './LodestoneScoreHeuristic';
import { LodestoneState } from './LodestoneState';

export class LodestoneScoreMinimax extends Minimax<LodestoneMove, LodestoneState, EmptyRulesConfig, LodestoneInfos> {

    public constructor() {
        super($localize`Score`,
              LodestoneRules.get(),
              new LodestoneScoreHeuristic(),
              new LodestoneMoveGenerator());
    }

}
