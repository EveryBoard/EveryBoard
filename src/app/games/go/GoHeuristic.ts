import { GoState, GoPiece } from './GoState';
import { GoMove } from './GoMove';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';
import { Player } from 'src/app/jscaip/Player';
import { GoConfig, GoNode, GoRules } from './GoRules';

export class GoHeuristic extends PlayerMetricHeuristic<GoMove, GoState, GoConfig> {

    public getMetrics(node: GoNode): [number, number] {
        const goState: GoState = GoRules.markTerritoryAndCount(node.gameState);
        const goScore: PlayerMap<number> = goState.getCapturedCopy();
        const goKilled: [number, number] = this.getDeadStones(goState);
        return [
            goScore.get(Player.ZERO).get() + (2 * goKilled[1]),
            goScore.get(Player.ONE).get() + (2 * goKilled[0]),
        ];
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
