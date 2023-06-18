import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { KalahMove } from './KalahMove';
import { MancalaState } from './../MancalaState';
import { KalahNode, KalahRules } from './KalahRules';
import { MancalaCaptureResult, MancalaDistributionResult } from '../MancalaRules';
import { MancalaMove } from '../MancalaMove';

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
                const move: KalahMove = new KalahMove(MancalaMove.from(x));
                moves.push(...this.getChildMoves(state, x, playerY, move));
            }
        }
        return moves;
    }
    private getChildMoves(state: MancalaState, x: number, y: number, currentMove: KalahMove): KalahMove[] {
        const moves: KalahMove[] = [];
        let distributionResult: MancalaDistributionResult =
            this.ruler.distributeHouse(x, y, state);
        if (distributionResult.endUpInKalah) {
            // We don't need to update captured result here
            state = distributionResult.resultingState;
            distributionResult = this.ruler.distributeHouse(x, y, state);
            for (let x: number = 0; x < 6; x++) {
                if (state.getPieceAtXY(x, y) > 0) {
                    const move: KalahMove = currentMove.add(MancalaMove.from(x));
                    moves.push(...this.getChildMoves(state, x, y, move));
                }
            }
            return moves;
        } else {
            return [currentMove];
        }
    }
}
