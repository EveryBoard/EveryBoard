import { MancalaState } from './../common/MancalaState';
import { KalahRules } from './KalahRules';
import { MancalaDistributionResult, MancalaNode, MancalaRules } from '../common/MancalaRules';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';
import { MoveGenerator } from 'src/app/jscaip/AI';

export class KalahMoveGenerator extends MoveGenerator<MancalaMove, MancalaState> {

    public getListMoves(node: MancalaNode): MancalaMove[] {
        const moves: MancalaMove[] = [];
        const playerY: number = node.gameState.getCurrentPlayerY();
        for (let x: number = 0; x < node.gameState.getWidth(); x++) {
            if (node.gameState.getPieceAtXY(x, playerY) > 0) {
                const state: MancalaState = node.gameState;
                const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(x));
                moves.push(...this.getPossibleMoveContinuations(state, x, playerY, move));
            }
        }
        return moves;
    }
    private getPossibleMoveContinuations(state: MancalaState, x: number, y: number, currentMove: MancalaMove)
    : MancalaMove[]
    {
        const moves: MancalaMove[] = [];
        const distributionResult: MancalaDistributionResult = KalahRules.get().distributeHouse(x, y, state);
        const stateAfterDistribution: MancalaState = distributionResult.resultingState;
        const playerHasPieces: boolean = MancalaRules.isStarving(stateAfterDistribution.getCurrentPlayer(),
                                                                 stateAfterDistribution.board) === false;
        if (distributionResult.endsUpInStore && playerHasPieces) {
            for (let x: number = 0; x < stateAfterDistribution.getWidth(); x++) {
                if (stateAfterDistribution.getPieceAtXY(x, y) > 0) {
                    const move: MancalaMove = currentMove.add(MancalaDistribution.of(x));
                    moves.push(...this.getPossibleMoveContinuations(stateAfterDistribution, x, y, move));
                }
            }
            return moves;
        } else {
            return [currentMove];
        }
    }
}
