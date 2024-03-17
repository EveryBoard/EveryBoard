import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { RectanglzMove } from './RectanglzMove';
import { RectanglzState } from './RectanglzState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Rules } from 'src/app/jscaip/Rules';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { TableUtils } from 'src/app/utils/ArrayUtils';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';

export class RectanglzNode extends GameNode<RectanglzMove, RectanglzState> {}

export class RectanglzRules extends Rules<RectanglzMove, RectanglzState> {

    private static singleton: MGPOptional<RectanglzRules> = MGPOptional.empty();

    public static get(): RectanglzRules {
        if (RectanglzRules.singleton.isAbsent()) {
            RectanglzRules.singleton = MGPOptional.of(new RectanglzRules());
        }
        return RectanglzRules.singleton.get();
    }

    public override getInitialState(): RectanglzState {
        const width: number = 8;
        const height: number = 8;
        const board: PlayerOrNone[][] = TableUtils.create(width, height, PlayerOrNone.NONE);
        board[0][0] = Player.ZERO;
        board[height - 1][width - 1] = Player.ZERO;
        board[height - 1][0] = Player.ONE;
        board[0][width - 1] = Player.ONE;
        return new RectanglzState(board, 0);
    }

    public override isLegal(move: RectanglzMove, state: RectanglzState): MGPValidation {
        const opponent: Player = state.getCurrentOpponent();
        const start: PlayerOrNone = state.getPieceAt(move.getStart());
        if (start === opponent) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        if (start.isNone()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        const landing: PlayerOrNone = state.getPieceAt(move.getEnd());
        if (landing.isNone()) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
    }

    public override applyLegalMove(move: RectanglzMove, state: RectanglzState): RectanglzState {
        const start: Coord = move.getStart();
        const end: Coord = move.getEnd();
        const moveDistance: number = start.getDistanceToward(end);
        const player: Player = state.getCurrentPlayer();
        const opponent: Player = state.getCurrentOpponent();
        let resultingState: RectanglzState = state.setPieceAt(end, player);
        if (moveDistance > 1) {
            resultingState = resultingState.setPieceAt(start, PlayerOrNone.NONE);
        }
        for (const direction of Direction.DIRECTIONS) {
            const neighbor: Coord = end.getNext(direction, 1);
            if (resultingState.isOnBoard(neighbor) &&
                resultingState.getPieceAt(neighbor) === opponent)
            {
                resultingState = resultingState.setPieceAt(neighbor, player);
            }
        }
        return new RectanglzState(resultingState.board, resultingState.turn + 1);
    }

    public getGameStatus(node: RectanglzNode, _config: NoConfig): GameStatus {
        const state: RectanglzState = node.gameState;
        const currentPlayer: Player = state.getCurrentPlayer();
        if (this.canPlayerMove(state, currentPlayer)) {
            return GameStatus.ONGOING;
        } else {
            return this.getDominantPlayerVictory(state);
        }
    }

    private canPlayerMove(state: RectanglzState, player: Player): boolean {
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content.equals(player)) {
                if (this.canCoordMove(state, coordAndContent.coord)) {
                    return true;
                }
            }
        }
        return false;
    }

    private canCoordMove(state: RectanglzState, coord: Coord): boolean {
        const sizeOfStep: number = 2;
        for (let y: number = -sizeOfStep; y < sizeOfStep; y++) {
            for (let x: number = -sizeOfStep; x < sizeOfStep; x++) {
                const landingCoord: Coord = new Coord(coord.x + x, coord.y + y);
                if (state.isOnBoard(landingCoord) && state.getPieceAt(landingCoord).isNone()) {
                    return true;
                }
            }
        }
        return false;
    }

    public getPossiblesMoves(state: RectanglzState, coord: Coord): RectanglzMove[] {
        const sizeOfStep: number = 2;
        const moves: RectanglzMove[] = [];
        for (let y: number = -sizeOfStep; y <= sizeOfStep; y++) {
            for (let x: number = -sizeOfStep; x <= sizeOfStep; x++) {
                const landingCoord: Coord = new Coord(coord.x + x, coord.y + y);
                if (state.isOnBoard(landingCoord) && state.getPieceAt(landingCoord).isNone()) {
                    moves.push(RectanglzMove.from(coord, landingCoord).get());
                }
            }
        }
        return moves;
    }

    private getDominantPlayerVictory(state: RectanglzState): GameStatus {
        const winner: PlayerOrNone = state.getDominantPlayer();
        if (winner.isPlayer()) {
            return GameStatus.getVictory(winner);
        } else {
            return GameStatus.DRAW;
        }
    }

}
