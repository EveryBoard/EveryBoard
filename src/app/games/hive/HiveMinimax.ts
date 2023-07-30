import { Coord } from 'src/app/jscaip/Coord';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { Minimax, PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { HiveMove, HiveMoveCoordToCoord } from './HiveMove';
import { HivePiece } from './HivePiece';
import { HiveNode, HiveRules } from './HiveRules';
import { HiveState } from './HiveState';

export class HiveMoveGenerator extends MoveGenerator<HiveMove, HiveState> {

    public getListMoves(node: HiveNode): HiveMove[] {
        const dropMoves: HiveMove[] = this.getListDrops(node.gameState);
        const movesOnBoard: HiveMove[] = this.getListOfOnBoardMoves(node.gameState);
        const moves: HiveMove[] = dropMoves.concat(movesOnBoard);
        if (moves.length === 0) {
            return [HiveMove.PASS];
        }
        return moves;
    }
    private getListOfOnBoardMoves(state: HiveState): HiveMove[] {
        return HiveRules.get().getPossibleMovesOnBoard(state).toList();
    }
    public getListDrops(state: HiveState): HiveMove[] {
        const drops: HiveMove[] = [];
        const player: Player = state.getCurrentPlayer();
        const queenBee: HivePiece = new HivePiece(player, 'QueenBee');
        for (const coord of HiveRules.get().getPossibleDropLocations(state)) {
            if (HiveRules.get().mustPlaceQueenBee(state)) {
                drops.push(HiveMove.drop(queenBee, coord));
            } else {
                for (const remaining of state.remainingPieces.getPlayerPieces(state.getCurrentPlayer())) {
                    drops.push(HiveMove.drop(remaining, coord));
                }
            }
        }
        return drops;
    }
}

export class HiveHeuristic extends PlayerMetricHeuristic<HiveMove, HiveState> {

    public getMetrics(node: HiveNode): [number, number] {
        // The board value is based on the number of neighbors to the queen
        const scoreZero: number = this.queenBeeMobility(node.gameState, Player.ZERO);
        const scoreOne: number = this.queenBeeMobility(node.gameState, Player.ONE);
        return [scoreZero, scoreOne];
    }
    private queenBeeMobility(state: HiveState, player: Player): number {
        const queenBee: MGPOptional<Coord> = state.queenBeeLocation(player);
        if (queenBee.isPresent()) {
            const possibleMoves: MGPSet<HiveMoveCoordToCoord> =
                HiveRules.get().getPossibleMovesFrom(state, queenBee.get());
            return possibleMoves.size();
        } else {
            return 0;
        }
    }
}

export class HiveMinimax extends Minimax<HiveMove, HiveState> {

    public constructor() {
        super('QueenMobility Minimax', HiveRules.get(), new HiveHeuristic(), new HiveMoveGenerator());
    }
}
