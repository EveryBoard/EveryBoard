import { KalahMove } from './KalahMove';
import { MancalaState } from './../common/MancalaState';
import { KalahNode, KalahRules } from './KalahRules';
import { MancalaDistributionResult, MancalaRules } from '../common/MancalaRules';
import { MancalaDistribution } from '../common/MancalaMove';
import { MoveGenerator } from 'src/app/jscaip/AI';

export class KalahMoveGenerator extends MoveGenerator<KalahMove, MancalaState> {

    public getListMoves(node: KalahNode): KalahMove[] {
        const moves: KalahMove[] = [];
        const playerY: number = node.gameState.getCurrentPlayerY();
        for (let x: number = 0; x < node.gameState.getWidth(); x++) {
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
        const distributionResult: MancalaDistributionResult = KalahRules.get().distributeHouse(x, y, state);
        const stateAfterDistribution: MancalaState = distributionResult.resultingState;
        const playerHasPieces: boolean = MancalaRules.isStarving(stateAfterDistribution.getCurrentPlayer(),
                                                                 stateAfterDistribution.board) === false;
        if (distributionResult.endsUpInStore && playerHasPieces) {
            for (let x: number = 0; x < stateAfterDistribution.getWidth(); x++) {
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
