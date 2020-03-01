import { Rules } from "src/app/jscaip/Rules";
import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { MNode } from "src/app/jscaip/MNode";
import { MGPMap } from "src/app/collectionlib/MGPMap";
import { Player } from "src/app/jscaip/Player";
import { Coord } from "src/app/jscaip/Coord";
import { MoveCoordToCoord } from "src/app/jscaip/MoveCoordToCoord";

export class SaharaMove extends MoveCoordToCoord {

    public static decode(encodedMove: number): SaharaMove {
        const ey: number = encodedMove%6;
        encodedMove -= ey;
        encodedMove /= 6;
        const ex: number = encodedMove%11;
        encodedMove -= ex;
        encodedMove /=11;
        const sy: number = encodedMove%6;
        encodedMove -= sy;
        encodedMove /= 6;
        const sx: number = encodedMove;
        return new SaharaMove(new Coord(sx, sy), new Coord(ex, ey));
    }
    public static checkDistanceAndLocation(start: Coord, end: Coord) {
        const dx: number = Math.abs(start.x - end.x);
        const dy: number = Math.abs(start.y - end.y);
        const distance: number = dx+dy;
        if (distance > 2) throw new Error("Maximal distance for SaharaMove is 2, got " + distance);
        if (distance === 1) {
            const fakeNeighboors: Coord = TriangularCheckerBoard.getFakeNeighboors(start);
            if (end.equals(fakeNeighboors)) throw new Error(start.toString() + " and " + end.toString() + " are not neighboors");
        } else {
            if ((start.x + start.y)%2 === 0) throw new Error("Can only bounce twice when started on a white triangle");
            if (start.x === start.y) throw new Error(start.toString() + " and " + end.toString() + " have no intermediary neighboors");
        }
    }
    constructor(start: Coord, end: Coord) {
        if (!start.isInRange(SaharaPartSlice.WIDTH, SaharaPartSlice.HEIGHT))
            throw new Error("Move must start inside the board not at "+start.toString());
        if (!end.isInRange(SaharaPartSlice.WIDTH, SaharaPartSlice.HEIGHT))
            throw new Error("Move must end inside the board not at "+start.toString());
        SaharaMove.checkDistanceAndLocation(start, end); 
        super(start, end);
    }
    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof SaharaMove)) return false;
        const other: SaharaMove = o as SaharaMove;
        if (!other.coord.equals(this.coord)) return false;
        if (!other.end.equals(this.end)) return false;
        return true;
    }
    public toString(): String {
        return "SaharaMove(" + this.coord + "->" + this.end + ")";
    }
    public encode(): number {
        const ey: number = this.end.y;
        const ex: number = this.end.x;
        const sy: number = this.coord.y;
        const sx: number = this.coord.x;
        return (6*11*6*sx) + (11*6*sy) + (6*ex) + ey;
    }
    public decode(encodedMove: number): SaharaMove {
        return SaharaMove.decode(encodedMove);
    }
}
export enum SaharaPawn {
    BLACK = Player.ZERO.value,
    WHITE = Player.ONE.value,
    EMPTY = Player.NONE.value,
    NONE = 3
}
export class SaharaPartSlice extends GamePartSlice {

    public static HEIGHT: number = 6;

    public static WIDTH: number = 11;

    public static getStartingBoard(): number[][] {
        const NONE: number = SaharaPawn.NONE;
        const BLACK: number = SaharaPawn.BLACK;
        const WHITE: number = SaharaPawn.WHITE;
        const EMPTY: number = SaharaPawn.EMPTY;
        return [
            [ NONE,  NONE, BLACK, WHITE, EMPTY, EMPTY, EMPTY, BLACK, WHITE,  NONE,  NONE],
            [ NONE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,  NONE],
            [WHITE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BLACK],
            [BLACK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, WHITE],
            [ NONE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY,  NONE],
            [ NONE,  NONE, WHITE, BLACK, EMPTY, EMPTY, EMPTY, WHITE, BLACK,  NONE,  NONE]
        ];
    }
}
export class TriangularCheckerBoard {

    public static getNeighboors(c: Coord): Coord[] {
        let neighboors: Coord[];
        const left: Coord = new Coord(c.x - 1, c.y);
        const right: Coord = new Coord(c.x + 1, c.y);
        if ((c.x + c.y)%2 === 1) {
            const up: Coord = new Coord(c.x, c.y - 1);
            neighboors = [left, right, up];
        } else {
            const down: Coord = new Coord(c.x, c.y + 1);
            neighboors = [left, right, down];
        }
        return neighboors;
    }
    public static getFakeNeighboors(c: Coord): Coord {
        if ((c.x + c.y)%2 ===1) return new Coord(c.x, c.y + 1); // DOWN
        return new Coord(c.x, c.y - 1); // UP
    }
}
export class SaharaNode extends MNode<Rules<SaharaMove, SaharaPartSlice, LegalityStatus>, SaharaMove, SaharaPartSlice, LegalityStatus> {
}
export class SaharaRules extends Rules<SaharaMove, SaharaPartSlice, LegalityStatus> {

    public static VERBOSE: boolean = false;

    constructor() {
        super();
        this.node = MNode.getFirstNode(
            new SaharaPartSlice(SaharaPartSlice.getStartingBoard(), 0),
            this
        );
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
                moves.put(newMove, newSlice);

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
                            moves.put(farMove, farSlice);

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