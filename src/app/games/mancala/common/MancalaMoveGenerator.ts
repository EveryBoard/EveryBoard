import { MancalaState } from '../common/MancalaState';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { MancalaDistribution, MancalaMove } from '../common/MancalaMove';
import { MancalaDistributionResult, MancalaNode, MancalaRules } from '../common/MancalaRules';
import { MancalaConfig } from './MancalaConfig';
import { MGPOptional, MGPValidation } from '@everyboard/lib';
import { AwaleRules } from '../awale/AwaleRules';
import { Player } from 'src/app/jscaip/Player';

export class MancalaMoveGenerator extends MoveGenerator<MancalaMove, MancalaState, MancalaConfig> {

    public constructor(private readonly rules: MancalaRules) {
        super();
    }

    public override getListMoves(node: MancalaNode, config: MGPOptional<MancalaConfig>): MancalaMove[] {
        const moves: MancalaMove[] = [];
        const state: MancalaState = node.gameState;
        const playerY: number = state.getCurrentPlayerY();
        for (let x: number = 0; x < state.getWidth(); x++) {
            if (state.getPieceAtXY(x, playerY) > 0) {
                // if the house is not empty
                const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(x));
                if (config.get().mustContinueDistributionAfterStore) {
                    moves.push(...this.getPossibleMoveContinuations(state, x, playerY, move, config.get()));
                } else {
                    const legality: MGPValidation = this.rules.isLegal(move, state, config);
                    if (legality.isSuccess()) {
                        moves.push(move);
                    }
                }
            }
        }
        if (moves.length === 0) {
            // Print full state
            console.log(node.gameState.getCurrentPlayer().toString())
            console.table(node.gameState.board);
            console.log(this.rules.getGameStatus(node, config));
            console.log(node.gameState.turn);
            // Print parent state
            console.log(node.parent.get().gameState.getCurrentPlayer().toString())
            console.table(node.parent.get().gameState.board);
            console.log(this.rules.getGameStatus(node.parent.get(), config));
            // Reproduce last move application
            MancalaRules.DEBUG = true;
            const legality = this.rules.isLegal(node.previousMove.get(), node.parent.get().gameState, config);
            console.log('legality: ' + legality);
            const child = this.rules.applyLegalMove(node.previousMove.get(), node.parent.get().gameState, config, legality.get());
            console.table(child.board)
            MancalaRules.DEBUG = false;

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
            this.rules.distributeHouse(x, y, previousDistributionResult, config);
        const stateAfterDistribution: MancalaState = distributionResult.resultingState;
        const isStarving: boolean =
            MancalaRules.isStarving(stateAfterDistribution.getCurrentPlayer(),
                                    stateAfterDistribution.board);
        const playerHasPieces: boolean = isStarving === false;
        if (distributionResult.endsUpInStore && playerHasPieces) {
            for (let i: number = 0; i < stateAfterDistribution.getWidth(); i++) {
                if (stateAfterDistribution.getPieceAtXY(i, y) > 0) {
                    const move: MancalaMove = currentMove.add(MancalaDistribution.of(i));
                    moves.push(...this.getPossibleMoveContinuations(stateAfterDistribution, i, y, move, config));
                }
            }
            return moves;
        } else {
            return [currentMove];
        }
    }

}
