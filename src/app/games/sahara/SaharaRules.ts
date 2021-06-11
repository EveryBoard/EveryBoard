import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaMove } from './SaharaMove';
import { SaharaPawn } from './SaharaPawn';
import { SaharaPartSlice } from './SaharaPartSlice';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { TriangularGameState } from 'src/app/jscaip/TriangularGameState';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { SaharaFailure } from './SaharaFailure';

export class SaharaNode extends MGPNode<SaharaRules, SaharaMove, SaharaPartSlice> {}

export class SaharaRules extends Rules<SaharaMove, SaharaPartSlice> {

    public static VERBOSE: boolean = false;

    public static getStartingCoords(board: SaharaPawn[][], player: Player): Coord[] {
        const startingCoords: Coord[] = [];
        for (let y: number = 0; y<SaharaPartSlice.HEIGHT; y++) {
            for (let x: number = 0; x<SaharaPartSlice.WIDTH; x++) {
                if (board[y][x] === player.value) {
                    startingCoords.push(new Coord(x, y));
                }
            }
        }
        return startingCoords;
    }
    public static getBoardValuesFor(board: SaharaPawn[][], player: Player): number[] {
        const playersPiece: Coord[] = SaharaRules.getStartingCoords(board, player);
        const playerFreedoms: number[] = [];
        for (const piece of playersPiece) {
            const freedoms: number = TriangularGameState.getEmptyNeighboors(board, piece, SaharaPawn.EMPTY).length;
            if (freedoms === 0) {
                return [0];
            }
            playerFreedoms.push(freedoms);
        }
        return playerFreedoms.sort((a: number, b: number) => a - b);
    }
    public applyLegalMove(move: SaharaMove,
                          slice: SaharaPartSlice,
                          status: LegalityStatus)
    : SaharaPartSlice
    {
        display(SaharaRules.VERBOSE, 'Legal move ' + move.toString() + ' applied');
        const board: SaharaPawn[][] = slice.getCopiedBoard();
        board[move.end.y][move.end.x] = board[move.coord.y][move.coord.x];
        board[move.coord.y][move.coord.x] = SaharaPawn.EMPTY;
        const resultingSlice: SaharaPartSlice = new SaharaPartSlice(board, slice.turn + 1);
        return resultingSlice;
    }
    public isLegal(move: SaharaMove, slice: SaharaPartSlice): LegalityStatus {
        const movedPawn: SaharaPawn = slice.getBoardAt(move.coord);
        if (movedPawn !== slice.getCurrentPlayer().value) {
            display(SaharaRules.VERBOSE, 'This move is illegal because it is not the current player\'s turn.');
            return { legal: MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_ENNEMY_PIECE) };
        }
        const landingCase: SaharaPawn = slice.getBoardAt(move.end);
        if (landingCase !== SaharaPawn.EMPTY) {
            return { legal: MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_CASE) };
        }
        const commonNeighboor: MGPOptional<Coord> = TriangularCheckerBoard.getCommonNeighboor(move.coord, move.end);
        if (commonNeighboor.isPresent()) {
            if (slice.getBoardAt(commonNeighboor.get()) === SaharaPawn.EMPTY) {
                return { legal: MGPValidation.SUCCESS };
            } else {
                return { legal: MGPValidation.failure(SaharaFailure.CAN_ONLY_REBOUNCE_ON_EMPTY_CASE) };
            }
        } else {
            return { legal: MGPValidation.SUCCESS };
        }
    }
    public getGameStatus(node: SaharaNode): GameStatus {
        const board: SaharaPawn[][] = node.gamePartSlice.getCopiedBoard();
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
