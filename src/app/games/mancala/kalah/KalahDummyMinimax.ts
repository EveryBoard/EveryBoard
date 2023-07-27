import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { KalahMove } from './KalahMove';
import { MancalaState } from './../commons/MancalaState';
import { KalahNode, KalahRules } from './KalahRules';
import { MancalaDistributionResult } from '../commons/MancalaRules';
import { MancalaDistribution } from '../commons/MancalaMove';

export class KalahDummyMinimax extends PlayerMetricsMinimax<KalahMove,
                                                            MancalaState,
                                                            void,
                                                            KalahRules>
{
    public constructor() {
        super(KalahRules.get(), 'Dummy Minimax');
    }
    public override getMetrics(node: KalahNode): [number, number] {
        return node.gameState.getCapturedCopy();
    }
    public override getListMoves(node: KalahNode): KalahMove[] {
        const moves: KalahMove[] = [];
        const playerY: number = node.gameState.getCurrentOpponent().value;
        for (let x: number = 0; x < 6; x++) {
            if (node.gameState.getPieceAtXY(x, playerY) > 0) {
                const state: MancalaState = node.gameState;
                const move: KalahMove = KalahMove.of(MancalaDistribution.of(x));
                moves.push(...this.getChildMoves(state, x, playerY, move));
            }
        }
        return moves;
    }
    private getChildMoves(state: MancalaState, x: number, y: number, currentMove: KalahMove): KalahMove[] {
        const moves: KalahMove[] = [];
        const distributionResult: MancalaDistributionResult = this.ruler.distributeHouse(x, y, state);
        state = distributionResult.resultingState;
        const playerHasPieces: boolean = this.ruler.isStarving(state.getCurrentPlayer(), state.board) === false;
        if (distributionResult.endUpInKalah && playerHasPieces) {
            for (let x: number = 0; x < 6; x++) {
                if (state.getPieceAtXY(x, y) > 0) {
                    const move: KalahMove = currentMove.add(MancalaDistribution.of(x));
                    moves.push(...this.getChildMoves(state, x, y, move));
                }
            }
            return moves;
        } else {
            return [currentMove];
        }
    }
}
