import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { PenteMove } from './PenteMove';
import { PenteState } from './PenteState';

export class PenteNode extends MGPNode<Rules<PenteMove, PenteState>,
                                       PenteMove,
                                       PenteState> {}

export class PenteRules extends Rules<PenteMove, PenteState> {

    public static readonly PENTE_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(PenteMove.isOnBoard, Utils.identity, 5);

    private static singleton: MGPOptional<PenteRules> = MGPOptional.empty();

    public static get(): PenteRules {
        if (PenteRules.singleton.isAbsent()) {
            PenteRules.singleton = MGPOptional.of(new PenteRules());
        }
        return PenteRules.singleton.get();
    }
    private constructor() {
        super(PenteState);
    }

    public isLegal(move: PenteMove, state: PenteState): MGPValidation {
        if (state.getPieceAt(move.coord).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        } else {
            return MGPValidation.SUCCESS;
        }
    }
    public applyLegalMove(move: PenteMove, state: PenteState, info: void): PenteState {
        const player: Player = state.getCurrentPlayer();
        const newBoard: PlayerOrNone[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x]= player;
        const capturedPieces: Coord[] = this.getCaptures(move.coord, state, player);
        for (const captured of capturedPieces) {
            newBoard[captured.y][captured.x] = PlayerOrNone.NONE;
        }
        const captures: [number, number] = [state.captures[0], state.captures[1]];
        captures[player.value] += capturedPieces.length;
        return new PenteState(newBoard, captures, state.turn+1);
    }
    public getCaptures(coord: Coord, state: PenteState, player: Player): Coord[] {
        const opponent: Player = player.getOpponent();
        let captures: Coord[] = [];
        for (const direction of Direction.factory.all) {
            const firstCapture: Coord = coord.getNext(direction, 1);
            const secondCapture: Coord = coord.getNext(direction, 2);
            const sandwicher: Coord = coord.getNext(direction, 3);
            if (PenteMove.isOnBoard(firstCapture) && state.getPieceAt(firstCapture) === opponent &&
                PenteMove.isOnBoard(secondCapture) && state.getPieceAt(secondCapture) === opponent &&
                PenteMove.isOnBoard(sandwicher) && state.getPieceAt(sandwicher) === player) {
                captures.push(firstCapture);
                captures.push(secondCapture);
            }
        }
        return captures;
    }
    public getGameStatus(node: PenteNode): GameStatus {
        const state: PenteState = node.gameState;
        const opponent: Player = state.getCurrentOpponent();
        if (state.captures[opponent.value] >= 10) {
            return GameStatus.getVictory(opponent);
        }
        const victoriousCoord: Coord[] = PenteRules.PENTE_HELPER.getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(opponent);
        }
        if (this.stillHaveEmptySquare(state)) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.DRAW;
        }
    }
    private stillHaveEmptySquare(state: PenteState): boolean {
        for (let y: number = 0; y < PenteState.SIZE; y++) {
            for (let x: number = 0; x < PenteState.SIZE; x++) {
                if (state.board[y][x] === PlayerOrNone.NONE) {
                    return true;
                }
            }
        }
        return false;
    }
}
