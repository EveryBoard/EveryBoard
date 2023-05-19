import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
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
        this.captureIfNeeded(move.coord, newBoard, player);
        return new PenteState(newBoard, state.turn+1);
    }
    private captureIfNeeded(coord: Coord, board: PlayerOrNone[][], player: Player): void {
        const opponent: Player = player.getOpponent();
        for (const direction of Direction.factory.all) {
            const firstCapture: Coord = coord.getNext(direction, 1);
            const secondCapture: Coord = coord.getNext(direction, 2);
            const sandwicher: Coord = coord.getNext(direction, 3);
            if (PenteMove.isOnBoard(firstCapture) && board[firstCapture.y][firstCapture.x] === opponent &&
                PenteMove.isOnBoard(secondCapture) && board[secondCapture.y][secondCapture.x] === opponent &&
                PenteMove.isOnBoard(sandwicher) && board[sandwicher.y][sandwicher.x] === player) {
                board[firstCapture.y][firstCapture.x] = PlayerOrNone.NONE;
                board[secondCapture.y][secondCapture.x] = PlayerOrNone.NONE;
            }
        }
    }
    public getGameStatus(node: PenteNode): GameStatus {
        const state: PenteState = node.gameState;
        const victoriousCoord: Coord[] = PenteRules.PENTE_HELPER.getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
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
