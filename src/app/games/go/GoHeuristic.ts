import { GoState, GoPiece, Phase } from './GoState';
import { GoMove } from './GoMove';
import { Minimax, PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { GoLegalityInformation, GoNode, GoRules } from './GoRules';

export class GoHeuristic extends PlayerMetricHeuristic<GoMove, GoState> {

    public getMetrics(node: GoNode): [number, number] {
        const goState: GoState = GoRules.markTerritoryAndCount(node.gameState);
        const goScore: number[] = goState.getCapturedCopy();
        const goKilled: number[] = this.getDeadStones(goState);
        return [
            goScore[0] + (2 * goKilled[1]),
            goScore[1] + (2 * goKilled[0]),
        ];
    }
    public getDeadStones(state: GoState): number[] {
        const killed: number[] = [0, 0];
        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[0].length; x++) {
                const piece: GoPiece = state.getPieceAtXY(x, y);
                if (piece.type === 'dead') {
                    killed[piece.player.value] = killed[piece.player.value] + 1;
                }
            }
        }
        return killed;
    }
}
