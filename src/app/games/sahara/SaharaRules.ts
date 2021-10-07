import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from './SaharaMove';
import { SaharaState } from './SaharaState';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { TriangularGameState } from 'src/app/jscaip/TriangularGameState';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { SaharaFailure } from './SaharaFailure';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

export class SaharaNode extends MGPNode<SaharaRules, SaharaMove, SaharaState> {}

export class SaharaRules extends Rules<SaharaMove, SaharaState> {

    public static VERBOSE: boolean = false;

    public static getStartingCoords(board: FourStatePiece[][], player: Player): Coord[] {
        const startingCoords: Coord[] = [];
        for (let y: number = 0; y<SaharaState.HEIGHT; y++) {
            for (let x: number = 0; x<SaharaState.WIDTH; x++) {
                if (board[y][x].value === player.value) {
                    startingCoords.push(new Coord(x, y));
                }
            }
        }
        return startingCoords;
    }
    public static getBoardValuesFor(board: FourStatePiece[][], player: Player): number[] {
        const playersPiece: Coord[] = SaharaRules.getStartingCoords(board, player);
        const playerFreedoms: number[] = [];
        for (const piece of playersPiece) {
            const freedoms: number =
                TriangularGameState.getEmptyNeighboors(board, piece, FourStatePiece.EMPTY).length;
            if (freedoms === 0) {
                return [0];
            }
            playerFreedoms.push(freedoms);
        }
        return playerFreedoms.sort((a: number, b: number) => a - b);
    }
    public applyLegalMove(move: SaharaMove,
                          state: SaharaState,
                          _status: LegalityStatus)
    : SaharaState
    {
        display(SaharaRules.VERBOSE, 'Legal move ' + move.toString() + ' applied');
        const board: FourStatePiece[][] = state.getCopiedBoard();
        board[move.end.y][move.end.x] = board[move.coord.y][move.coord.x];
        board[move.coord.y][move.coord.x] = FourStatePiece.EMPTY;
        const resultingState: SaharaState = new SaharaState(board, state.turn + 1);
        return resultingState;
    }
    public isLegal(move: SaharaMove, state: SaharaState): LegalityStatus {
        const movedPawn: FourStatePiece = state.getPieceAt(move.coord);
        if (movedPawn.value !== state.getCurrentPlayer().value) {
            return { legal: MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_ENEMY_PIECE()) };
        }
        const landingCase: FourStatePiece = state.getPieceAt(move.end);
        if (landingCase !== FourStatePiece.EMPTY) {
            return { legal: MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE()) };
        }
        const commonNeighboor: MGPOptional<Coord> = TriangularCheckerBoard.getCommonNeighboor(move.coord, move.end);
        if (commonNeighboor.isPresent()) {
            if (state.getPieceAt(commonNeighboor.get()) === FourStatePiece.EMPTY) {
                return { legal: MGPValidation.SUCCESS };
            } else {
                return { legal: MGPValidation.failure(SaharaFailure.CAN_ONLY_REBOUND_ON_EMPTY_SPACE()) };
            }
        } else {
            return { legal: MGPValidation.SUCCESS };
        }
    }
    public getGameStatus(node: SaharaNode): GameStatus {
        const board: FourStatePiece[][] = node.gameState.getCopiedBoard();
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ONE);
        return SaharaRules.getGameStatusFromFreedoms(zeroFreedoms, oneFreedoms);
    }
    public static getGameStatusFromFreedoms(zeroFreedoms: number[], oneFreedoms: number[]): GameStatus {
        if (zeroFreedoms[0] === 0) {
            return GameStatus.ONE_WON;
        } else if (oneFreedoms[0] === 0) {
            return GameStatus.ZERO_WON;
        }
        return GameStatus.ONGOING;
    }
}
