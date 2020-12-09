import { Rules } from "src/app/jscaip/Rules";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { MGPNode } from "src/app/jscaip/mgpnode/MGPNode";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { Player } from "src/app/jscaip/Player";
import { Coord } from "src/app/jscaip/coord/Coord";
import { SaharaMove } from "../saharamove/SaharaMove";
import { SaharaPawn } from "../SaharaPawn";
import { SaharaPartSlice } from "../SaharaPartSlice";
import { TriangularCheckerBoard } from "src/app/jscaip/TriangularCheckerBoard";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { MGPValidation } from "src/app/collectionlib/mgpvalidation/MGPValidation";
import { display } from "src/app/collectionlib/utils";

abstract class SaharaNode extends MGPNode<SaharaRules, SaharaMove, SaharaPartSlice, LegalityStatus> {}

export class SaharaRules extends Rules<SaharaMove, SaharaPartSlice, LegalityStatus> {

    public static VERBOSE: boolean = false;

    public getListMoves(node: SaharaNode): MGPMap<SaharaMove, SaharaPartSlice> {
        const moves: MGPMap<SaharaMove, SaharaPartSlice> = new MGPMap<SaharaMove, SaharaPartSlice>();
        const board: SaharaPawn[][] = node.gamePartSlice.getCopiedBoard();
        const newTurn: number = node.gamePartSlice.turn + 1;
        const player: Player = node.gamePartSlice.getCurrentPlayer();
        const startingCoords: Coord[] = this.getStartingCoords(board, player);
        for (let start of startingCoords) {
            const neighboors: Coord[] = this.getEmptyNeighboors(board, start);
            for (let neighboor of neighboors) {
                const newMove: SaharaMove = new SaharaMove(start, neighboor);
                board[neighboor.y][neighboor.x] = board[start.y][start.x];
                board[start.y][start.x] = SaharaPawn.EMPTY;
                const newBoard: SaharaPawn[][] = ArrayUtils.copyBiArray(board);
                const newSlice: SaharaPartSlice = new SaharaPartSlice(newBoard, newTurn);
                moves.set(newMove, newSlice);

                const upwardTriangle: boolean = (neighboor.y + neighboor.x)%2 === 0;
                if (upwardTriangle) {
                    const farNeighboors: Coord[] = this.getEmptyNeighboors(board, neighboor);
                    for (let farNeighboor of farNeighboors) {
                        if (!farNeighboor.equals(start)) {
                            const farMove: SaharaMove = new SaharaMove(start, farNeighboor);
                            board[farNeighboor.y][farNeighboor.x] = board[neighboor.y][neighboor.x];
                            board[neighboor.y][neighboor.x] = SaharaPawn.EMPTY;
                            const farBoard: SaharaPawn[][] = ArrayUtils.copyBiArray(board);
                            const farSlice: SaharaPartSlice = new SaharaPartSlice(farBoard, newTurn);
                            moves.set(farMove, farSlice);

                            board[neighboor.y][neighboor.x] = board[farNeighboor.y][farNeighboor.x]
                            board[farNeighboor.y][farNeighboor.x] = SaharaPawn.EMPTY;
                        }
                    }
                }
                board[start.y][start.x] = board[neighboor.y][neighboor.x];
                board[neighboor.y][neighboor.x] = SaharaPawn.EMPTY;
            }
        }
        return moves;
    }
    public getStartingCoords(board: SaharaPawn[][], player: Player): Coord[] {
        const startingCoords: Coord[] = [];
        for (let y = 0; y<SaharaPartSlice.HEIGHT; y++) {
            for (let x = 0; x<SaharaPartSlice.WIDTH; x++) {
                if (board[y][x] === player.value) {
                    startingCoords.push(new Coord(x, y));
                }
            }
        }
        return startingCoords;
    }
    public getEmptyNeighboors(board: SaharaPawn[][], coord: Coord): Coord[] {
        const neighboors: Coord[] = [];
        for (let neighboor of TriangularCheckerBoard.getNeighboors(coord)) {
            if (neighboor.isInRange(SaharaPartSlice.WIDTH, SaharaPartSlice.HEIGHT) &&
                (board[neighboor.y][neighboor.x] === SaharaPawn.EMPTY)) {
                neighboors.push(neighboor);
            }
        }
        return neighboors;
    }
    public getBoardValue(move: SaharaMove, slice: SaharaPartSlice): number {
        const board: SaharaPawn[][] = slice.getCopiedBoard();
        const zeroFreedoms: number[] = this.getBoardValuesFor(board, Player.ZERO);
        const oneFreedoms: number[] = this.getBoardValuesFor(board, Player.ONE);
        if (zeroFreedoms[0] === 0) return Number.MAX_SAFE_INTEGER;
        if (oneFreedoms[0] === 0) return Number.MIN_SAFE_INTEGER;
        let i: number = 0;
        while (i<6 && zeroFreedoms[i]===oneFreedoms[i]) {
            i++;
        }
        return oneFreedoms[i%6] - zeroFreedoms[i%6];
    }
    public getBoardValuesFor(board: SaharaPawn[][], player: Player): number[] {
        const playersPiece: Coord[] = this.getStartingCoords(board, player);
        const playerFreedoms = [];
        for (let piece of playersPiece) {
            playerFreedoms.push(this.getEmptyNeighboors(board, piece).length);
        }
        return playerFreedoms.sort((a: number, b: number) => a-b);
    }
    public applyLegalMove(move: SaharaMove, slice: SaharaPartSlice, status: LegalityStatus): { resultingMove: SaharaMove; resultingSlice: SaharaPartSlice; } {
        display(SaharaRules.VERBOSE, 'Legal move ' + move.toString() + ' applied');
        let board: SaharaPawn[][] = slice.getCopiedBoard();
        board[move.end.y][move.end.x] = board[move.coord.y][move.coord.x];
        board[move.coord.y][move.coord.x] = SaharaPawn.EMPTY;
        const resultingSlice: SaharaPartSlice = new SaharaPartSlice(board, slice.turn + 1);
        return {resultingMove: move, resultingSlice};
    }
    public isLegal(move: SaharaMove, slice: SaharaPartSlice): LegalityStatus {
        const movedPawn: SaharaPawn = slice.getBoardAt(move.coord);
        if (movedPawn !== slice.getCurrentPlayer().value) {
            display(SaharaRules.VERBOSE, "This move is illegal because it is not the current player's turn.");
            return {legal: MGPValidation.failure("move pawned not owned by current player")};
        }
        const landingCase: SaharaPawn = slice.getBoardAt(move.end);
        if (landingCase !== SaharaPawn.EMPTY) {
            display(SaharaRules.VERBOSE, "This move is illegal because the landing case is not empty.");
            return {legal: MGPValidation.failure("landing case is not empty")};
        }
        const commonNeighboor: MGPOptional<Coord> = TriangularCheckerBoard.getCommonNeighboor(move.coord, move.end);
        if (commonNeighboor.isPresent()) {
            if (slice.getBoardAt(commonNeighboor.get()) === SaharaPawn.EMPTY) {
                return {legal: MGPValidation.SUCCESS};
            } else {
                return {legal: MGPValidation.failure("common neighbor not empty")};
            }
        } else {
            return {legal: MGPValidation.SUCCESS};
        }
    }
}
