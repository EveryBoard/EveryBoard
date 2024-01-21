import { GoState, GoPiece } from './GoState';
import { GoMove } from './GoMove';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { GoConfig, GoNode, GoRules } from './GoRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class GoHeuristic extends PlayerMetricHeuristic<GoMove, GoState, GoConfig> {

    public override getMetrics(node: GoNode, _config: MGPOptional<GoConfig>): PlayerNumberTable {
        const goState: GoState = GoRules.markTerritoryAndCount(node.gameState);
        const goScore: PlayerNumberMap = goState.getCapturedCopy();
        const goKilled: [number, number] = this.getDeadStones(goState);
        return PlayerNumberTable.ofSingle(
            goScore.get(Player.ZERO).get() + (2 * goKilled[1]),
            goScore.get(Player.ONE).get() + (2 * goKilled[0]),
        );
    }

    public getDeadStones(state: GoState): [number, number] {
        const killed: [number, number] = [0, 0];

        for (const coordAndContent of state.getCoordsAndContents()) {
            const piece: GoPiece = coordAndContent.content;
            if (piece.type === 'dead') {
                killed[piece.player.getValue()] = killed[piece.player.getValue()] + 1;
            }
        }
        return killed;
    }

}
