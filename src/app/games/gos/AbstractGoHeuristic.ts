import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { Player } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';

import { GoNode, AbstractGoRules, AbstractGoConfig } from './AbstractGoRules';
import { GoMove } from './GoMove';
import { GoPiece } from './GoPiece';
import { GoState } from './GoState';

export abstract class AbstractGoHeuristic<C extends AbstractGoConfig>
    extends PlayerMetricHeuristic<GoMove, GoState, C>
{

    public constructor(private readonly rules: AbstractGoRules<C>) {
        super();
    }

    public override getMetrics(node: GoNode): PlayerNumberTable {
        const goState: GoState = this.rules.markTerritoryAndCount(node.gameState);
        const goScore: PlayerNumberMap = goState.getCapturedCopy();
        const goKilled: PlayerNumberMap = this.getDeadStones(goState);
        return PlayerNumberTable.ofSingle(
            goScore.get(Player.ZERO) + (2 * goKilled.get(Player.ONE)),
            goScore.get(Player.ONE) + (2 * goKilled.get(Player.ZERO)),
        );
    }

    public getDeadStones(state: GoState): PlayerNumberMap {
        const killed: PlayerNumberMap = PlayerNumberMap.of(0, 0);

        for (const coordAndContent of state.getCoordsAndContents()) {
            const piece: GoPiece = coordAndContent.content;
            if (piece.type === 'dead') {
                killed.add(piece.player as Player, 1);
            }
        }
        return killed;
    }

}
