import { Rules } from "src/app/jscaip/Rules";
import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { MNode } from "src/app/jscaip/MNode";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { Player } from "src/app/jscaip/Player";
import { Coord } from "src/app/jscaip/Coord";
import { SaharaMove } from "./SaharaMove";
import { SaharaPawn } from "./SaharaPawn";
import { SaharaPartSlice } from "./SaharaPartSlice";
import { TriangularCheckerBoard } from "src/app/jscaip/TriangularCheckerboard";

abstract class SaharaNode extends MNode<SaharaRules, SaharaMove, SaharaPartSlice, LegalityStatus> {}

export class SaharaRules extends Rules<SaharaMove, SaharaPartSlice, LegalityStatus> {

    public static VERBOSE: boolean = false;

    constructor() {
        super(false);
        this.setInitialBoard();
    }
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
                const newBoard: SaharaPawn[][] = GamePartSlice.copyBiArray(board);
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
                            const farBoard: SaharaPawn[][] = GamePartSlice.copyBiArray(board);
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
    public getBoardValue(node: SaharaNode): number {
        const board: SaharaPawn[][] = node.gamePartSlice.getCopiedBoard();
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
        if (SaharaRules.VERBOSE) console.log('Legal move ' + move.toString() + ' applied');
        let board: SaharaPawn[][] = slice.getCopiedBoard();
        board[move.end.y][move.end.x] = board[move.coord.y][move.coord.x];
        board[move.coord.y][move.coord.x] = SaharaPawn.EMPTY;
        const resultingSlice: SaharaPartSlice = new SaharaPartSlice(board, slice.turn + 1);
        return {resultingMove: move, resultingSlice};
    }
    public isLegal(move: SaharaMove, slice: SaharaPartSlice): LegalityStatus {
        const movedPawn: SaharaPawn = slice.getBoardAt(move.coord);
        if (movedPawn !== slice.getCurrentPlayer().value) {
            if (SaharaRules.VERBOSE) console.log("This move is illegal because it is not the current player's turn");
            return {legal: false};
        }
        const landingCase: SaharaPawn = slice.getBoardAt(move.end);
        if (landingCase !== SaharaPawn.EMPTY) {
            if (SaharaRules.VERBOSE) console.log("This move is illegal because the landing case is not empty");
            return {legal: false};
        }
        return {legal: true};
    }
    public setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                new SaharaPartSlice(SaharaPartSlice.getStartingBoard(), 0),
                this
            );
        } else {
            this.node = this.node.getInitialNode();
        }
    }
}