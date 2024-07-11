import { MancalaState } from '../common/MancalaState';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { MancalaMove } from './MancalaMove';
import { MancalaConfig } from './MancalaConfig';
import { MGPOptional } from '@everyboard/lib';
import { MancalaNode } from './MancalaRules';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';

export class MancalaScoreHeuristic extends PlayerMetricHeuristic<MancalaMove, MancalaState, MancalaConfig>
{

    public override getMetrics(node: MancalaNode, _config: MGPOptional<MancalaConfig>): PlayerNumberTable {
        return node.gameState.getScoresCopy().toTable();
    }

    public override getBounds(config: MGPOptional<MancalaConfig>): MGPOptional<{min: BoardValue, max: BoardValue}> {
        const maxScore: number = config.get().width * config.get().seedsByHouse;
        return MGPOptional.of({
            // TODO: maybe rename player0 max and player1 max
            min: BoardValue.ofSingle(maxScore, 0),
            max: BoardValue.ofSingle(0, maxScore),
        });
    }

}
