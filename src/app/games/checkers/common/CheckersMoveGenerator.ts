import { ArrayUtils } from '@everyboard/lib';

import { MoveGenerator } from '../../../jscaip/AI/AI';

import { AbstractCheckersRules, CheckersConfig, CheckersNode } from './AbstractCheckersRules';
import { CheckersMove } from './CheckersMove';
import { CheckersState } from './CheckersState';

export class CheckersMoveGenerator extends MoveGenerator<CheckersMove, CheckersState, CheckersConfig> {

    public constructor(private readonly rules: AbstractCheckersRules) {
        super();
    }

    public override getListMoves(node: CheckersNode, config: CheckersConfig): CheckersMove[] {
        const captures: CheckersMove[] = this.getLegalCaptures(node.gameState, config);
        if (captures.length > 0) {
            return captures;
        } else {
            return this.rules.getSteps(node.gameState, config);
        }
    }

    public getLegalCaptures(state: CheckersState, config: CheckersConfig): CheckersMove[] {
        const possibleCaptures: CheckersMove[] = this.rules.getCompleteCaptures(state, config);
        if (config.mustMakeMaximalCapture) {
            return ArrayUtils.maximumsBy(possibleCaptures, (m: CheckersMove) => m.coords.size());
        } else {
            return possibleCaptures;
        }
    }

}
