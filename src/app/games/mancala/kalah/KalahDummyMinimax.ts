import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { KalahMove } from './KalahMove';
import { MancalaState } from './../commons/MancalaState';
import { KalahNode, KalahRules } from './KalahRules';
import { MancalaDistributionResult, MancalaRules } from '../commons/MancalaRules';
import { MancalaDistribution } from '../commons/MancalaMove';
import { MancalaConfig } from '../commons/MancalaConfig';

export class KalahScoreMinimax extends PlayerMetricsMinimax<KalahMove,
                                                            MancalaState,
                                                            MancalaConfig,
                                                            void,
                                                            KalahRules>
{
    public constructor() {
        super(KalahRules.get(), 'Dummy Minimax');
    }
    public override getMetrics(node: KalahNode): [number, number] {
        return node.gameState.getScoresCopy();
    }
    public override getListMoves(node: KalahNode): KalahMove[] {
        const moves: KalahMove[] = [];
        const playerY: number = node.gameState.getCurrentPlayerY();
        for (let x: number = 0; x < node.gameState.board[0].length; x++) {
            if (node.gameState.getPieceAtXY(x, playerY) > 0) {
                const state: MancalaState = node.gameState;
                const move: KalahMove = KalahMove.of(MancalaDistribution.of(x));
                moves.push(...this.getPossibleMoveContinuations(state, x, playerY, move));
            }
        }
        return moves;
    }
    private getPossibleMoveContinuations(state: MancalaState, x: number, y: number, currentMove: KalahMove)
    : KalahMove[]
    {
        const moves: KalahMove[] = [];
        const distributionResult: MancalaDistributionResult = this.ruler.distributeHouse(x, y, state);
        const stateAfterDistribution: MancalaState = distributionResult.resultingState;
        const playerHasPieces: boolean = MancalaRules.isStarving(stateAfterDistribution.getCurrentPlayer(),
                                                                 stateAfterDistribution.board) === false;
        if (distributionResult.endsUpInKalah && playerHasPieces) {
            for (let x: number = 0; x < stateAfterDistribution.board[0].length; x++) {
                if (stateAfterDistribution.getPieceAtXY(x, y) > 0) {
                    const move: KalahMove = currentMove.add(MancalaDistribution.of(x));
                    moves.push(...this.getPossibleMoveContinuations(stateAfterDistribution, x, y, move));
                }
            }
            return moves;
        } else {
            return [currentMove];
        }
    }
}
