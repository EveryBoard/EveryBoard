import { PlayerOrNone } from '@everyboard/games';
import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';

import { ApagosMove } from './ApagosMove';
import { ApagosConfig, ApagosNode } from './ApagosRules';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';

export class ApagosFullBoardHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState, ApagosConfig> {

    public override getMetrics(node: ApagosNode, _config: ApagosConfig): PlayerNumberTable {
        const result: PlayerNumberTable = PlayerNumberTable.of(
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        );
        const board: readonly ApagosSquare[] = node.gameState.board;
        const size: number = board.length;
        for (let i: number = 0; i < size; i++) {
            const levelDominant: PlayerOrNone = board[size - 1 - i].getDominatingPlayer();
            if (levelDominant.isPlayer()) {
                result.add(levelDominant, i, 1);
            }
        }
        return result;
    }

}
