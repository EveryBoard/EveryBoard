import { GoState } from './GoState';
import { GoPiece } from './GoPiece';
import { GoMove } from './GoMove';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { GoNode, AbstractGoRules } from './AbstractGoRules';
import { GoConfig } from './go/GoRules';
import { TriGoConfig } from './tri-go/TriGoRules';

export class GoHeuristic extends PlayerMetricHeuristic<GoMove, GoState, GoConfig | TriGoConfig> {

    public constructor(private readonly rules: AbstractGoRules<GoConfig | TriGoConfig>) {
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
