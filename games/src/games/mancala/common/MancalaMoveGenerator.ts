import { MGPValidation } from '@everyboard/lib';

import { MoveGenerator } from '../../../jscaip/AI/AI';

import { MancalaConfig } from './MancalaConfig';
import { MancalaDistribution, MancalaDistributionDirection, MancalaMove } from './MancalaMove';
import { MancalaDistributionResult, MancalaNode, MancalaRules } from './MancalaRules';
import { MancalaState } from './MancalaState';

export class MancalaMoveGenerator extends MoveGenerator<MancalaMove, MancalaState, MancalaConfig> {

    public constructor(private readonly rules: MancalaRules) {
        super();
    }

    public override getListMoves(node: MancalaNode, config: MancalaConfig): MancalaMove[] {
        const moves: MancalaMove[] = [];
        const state: MancalaState = node.gameState;
        const directions: ReadonlyArray<MancalaDistributionDirection> = this.getLegalDirections(config);
        for (const direction of directions) {
            for (const coord of MancalaRules.getAllCoordOf(state.getCurrentPlayer(), config)) {
                if (state.getPieceAt(coord) > 0) {
                    // if the house is not empty
                    const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(direction, coord.x, coord.y));
                    if (config.mustContinueDistributionAfterStore) {
                        moves.push(...this.getPossibleMoveContinuations(
                            state,
                            direction,
                            coord.x,
                            coord.y,
                            move,
                            config,
                        ));
                    } else {
                        const legality: MGPValidation = this.rules.isLegal(move, state, config);
                        if (legality.isSuccess()) {
                            moves.push(move);
                        }
                    }
                }
            }
        }
        return moves;
    }

    private getLegalDirections(config: MancalaConfig): ReadonlyArray<MancalaDistributionDirection> {
        const directions: MancalaDistributionDirection[] = ['CLOCKWISE'];
        if (config.verticalSowing) {
            directions.push('UP');
        }
        return directions;
    }

    private getPossibleMoveContinuations(
        state: MancalaState,
        direction: MancalaDistributionDirection,
        x: number,
        y: number,
        currentMove: MancalaMove,
        config: MancalaConfig,
    ): MancalaMove[] {
        const moves: MancalaMove[] = [];
        const previousDistributionResult: MancalaDistributionResult =
            MancalaRules.getEmptyDistributionResult(state);
        const distributionResult: MancalaDistributionResult = this.rules.distributeHouse(
            MancalaDistribution.of(direction, x, y),
            previousDistributionResult,
            config,
        );
        const stateAfterDistribution: MancalaState = distributionResult.resultingState;
        const isStarving: boolean = MancalaRules.isStarving(
            stateAfterDistribution.getCurrentPlayer(),
            stateAfterDistribution.board,
            config,
        );
        const playerHasPieces: boolean = isStarving === false;
        if (distributionResult.endsUpInStore && playerHasPieces) {
            for (let i: number = 0; i < state.getWidth(); i++) {
                if (stateAfterDistribution.getPieceAtXY(i, y) > 0) {
                    for (const nextDirection of this.getLegalDirections(config)) {
                        const move: MancalaMove = currentMove.add(MancalaDistribution.of(nextDirection, i, y));
                        moves.push(...this.getPossibleMoveContinuations(
                            stateAfterDistribution,
                            nextDirection,
                            i,
                            y,
                            move,
                            config,
                        ));
                    }
                }
            }
            return moves;
        } else {
            return [currentMove];
        }
    }

}
