import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { LascaMove } from './LascaMove';
import { LascaNode, LascaRules } from './LascaRules';
import { LascaState } from './LascaState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class LascaMoveGenerator extends MoveGenerator<LascaMove, LascaState> {

    public override getListMoves(node: LascaNode, _config: NoConfig): LascaMove[] {
        const possiblesCaptures: LascaMove[] = LascaRules.get().getCaptures(node.gameState);
        if (possiblesCaptures.length > 0) {
            return possiblesCaptures;
        } else {
            return LascaRules.get().getSteps(node.gameState);
        }
    }

}
