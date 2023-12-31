import { GoState, GoPiece } from './GoState';
import { GoMove } from './GoMove';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { GoConfig, GoNode, GoRules } from './GoRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class GoHeuristic extends PlayerMetricHeuristic<GoMove, GoState, GoConfig> {

    public override getMetrics(node: GoNode, _config: MGPOptional<GoConfig>): PlayerNumberTable {
        const goState: GoState = GoRules.markTerritoryAndCount(node.gameState);
        const goScore: number[] = goState.getCapturedCopy();
        const goKilled: number[] = this.getDeadStones(goState);
        return PlayerNumberTable.of(
            [goScore[0] + (2 * goKilled[1])],
            [goScore[1] + (2 * goKilled[0])],
        );
    }

    public getDeadStones(state: GoState): number[] {
        const killed: number[] = [0, 0];

        for (const coordAndContent of state.getCoordsAndContents()) {
            const piece: GoPiece = coordAndContent.content;
            if (piece.type === 'dead') {
                killed[piece.player.value] = killed[piece.player.value] + 1;
            }
        }
        return killed;
    }

}
