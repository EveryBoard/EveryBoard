import { MGPValidation } from '@everyboard/lib';

import { MoveGenerator } from '../../../jscaip/AI/AI';

import { MancalaConfig } from './MancalaConfig';
import { MancalaDistribution, MancalaMove } from './MancalaMove';
import { MancalaDistributionResult, MancalaNode, MancalaRules } from './MancalaRules';
import { MancalaState } from './MancalaState';

export class MancalaMoveGenerator extends MoveGenerator<MancalaMove, MancalaState, MancalaConfig> {

    public constructor(private readonly rules: MancalaRules) {
        super();
    }

    public override getListMoves(node: MancalaNode, config: MancalaConfig): MancalaMove[] {
        const moves: MancalaMove[] = [];
        const state: MancalaState = node.gameState;
        for (const coord of MancalaRules.getAllCoordOf(state.getCurrentPlayer(), config)) {
            if (state.getPieceAt(coord) > 0) {
                // if the house is not empty
                const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(coord.x, coord.y));
                if (config.mustContinueDistributionAfterStore) {
                    moves.push(...this.getPossibleMoveContinuations(state, coord.x, coord.y, move, config));
                } else {
                    const legality: MGPValidation = this.rules.isLegal(move, state, config);
                    if (legality.isSuccess()) {
                        moves.push(move);
                    }
                }
            }
        }
        return moves;
    }

    private getPossibleMoveContinuations(state: MancalaState,
                                         x: number,
                                         y: number,
                                         currentMove: MancalaMove,
                                         config: MancalaConfig)
    : MancalaMove[]
    {
        const moves: MancalaMove[] = [];
        const previousDistributionResult: MancalaDistributionResult =
            MancalaRules.getEmptyDistributionResult(state);
        const distributionResult: MancalaDistributionResult =
            this.rules.distributeHouse(MancalaDistribution.of(x, y), previousDistributionResult, config);
        const stateAfterDistribution: MancalaState = distributionResult.resultingState;
        const isStarving: boolean = MancalaRules.isStarving(
            stateAfterDistribution.getCurrentPlayer(),
            stateAfterDistribution.board,
            config,
        );
        const playerHasPieces: boolean = isStarving === false;
        if (distributionResult.endsUpInStore && playerHasPieces) {
            for (let i: number = 0; i < stateAfterDistribution.getWidth(); i++) {
                if (stateAfterDistribution.getPieceAtXY(i, y) > 0) {
                    const move: MancalaMove = currentMove.add(MancalaDistribution.of(i, y));
                    moves.push(...this.getPossibleMoveContinuations(stateAfterDistribution, i, y, move, config));
                }
            }
            return moves;
        } else {
            return [currentMove];
        }
    }

}
