import { MoveGenerator } from 'src/app/jscaip/AI';
import { LascaMove } from './LascaMove';
import { LascaNode, LascaRules } from './LascaRules';
import { LascaState } from './LascaState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export class LascaMoveGenerator extends MoveGenerator<LascaMove, LascaState> {

    public getListMoves(node: LascaNode, _config: MGPOptional<EmptyRulesConfig>): LascaMove[] {
        const possiblesCaptures: LascaMove[] = LascaRules.get().getCaptures(node.gameState);
        if (possiblesCaptures.length > 0) {
            return possiblesCaptures;
        } else {
            return LascaRules.get().getSteps(node.gameState);
        }
    }

}
