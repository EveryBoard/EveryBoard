import { DummyHeuristic, Minimax } from 'src/app/jscaip/AI/Minimax';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsuleMoveGenerator } from './EncapsuleMoveGenerator';
import { EncapsuleLegalityInformation, EncapsuleRules } from './EncapsuleRules';
import { EncapsuleState } from './EncapsuleState';

export class EncapsuleDummyMinimax
    extends Minimax<EncapsuleMove, EncapsuleState, EmptyRulesConfig, EncapsuleLegalityInformation> {

    public constructor() {
        super($localize`Dummy`,
              EncapsuleRules.get(),
              new DummyHeuristic(),
              new EncapsuleMoveGenerator());
    }

}
