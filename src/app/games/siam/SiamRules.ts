import { Rules } from "src/app/jscaip/Rules";
import { SiamMove, SiamMoveNature } from "./SiamMove";
import { SiamPartSlice } from "./SiamPartSlice";
import { MNode } from "src/app/jscaip/MNode";
import { SiamPiece } from "./SiamPiece";
import { Player } from "src/app/jscaip/Player";
import { Coord } from "src/app/jscaip/Coord";
import { Orthogonale, Direction } from "src/app/jscaip/DIRECTION";
import { SiamLegalityStatus } from "./SiamLegalityStatus";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";

abstract class _SiamRules extends Rules<SiamMove, SiamPartSlice, SiamLegalityStatus> {}

abstract class SiamNode extends MNode<_SiamRules, SiamMove, SiamPartSlice, SiamLegalityStatus> {}

export class SiamRules extends _SiamRules {

    public static VERBOSE: boolean = false;

    private static readonly ILLEGAL: SiamLegalityStatus = {legal: false, resultingBoard: null};

    constructor() {
        super(false);
        this.node = MNode.getFirstNode(
            new SiamPartSlice(SiamPartSlice.getStartingBoard(), 0),
            this
        );
    }
    public setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                new SiamPartSlice(SiamPartSlice.getStartingBoard(), 0),
                this
            );
        } else {
            this.node = this.node.getInitialNode();
        }
    }
    public isLegal(move: SiamMove, slice: SiamPartSlice): SiamLegalityStatus {
        if (SiamRules.VERBOSE) {
            console.log("SiamRules.isLegal");
            console.log(move.toString());
            console.log(slice.board)
        }
        if (SiamMove.isForward(move)) {
            let movingPiece: number;
            if (SiamMove.isInsertion(move)) {
                if (SiamRules.VERBOSE) console.log("Move is insertion");
                let insertionInfo: {insertedPiece: number, legal: boolean} =
                    this.isLegalInsertion(move.coord, slice);
                if (insertionInfo.legal === false) return SiamRules.ILLEGAL;
                movingPiece = insertionInfo.insertedPiece;
            } else {
                if (SiamRules.VERBOSE) console.log("Move is forward");
                movingPiece = slice.getBoardAt(move.coord);
            }
            return this.isLegalForwarding(move, slice, movingPiece);
        } else {
            if (SiamRules.VERBOSE) console.log("Move is rotation");
            return this.isLegalRotation(move, slice);
        }
    }
    public isLegalInsertion(coord: Coord, slice: SiamPartSlice): {insertedPiece: number, legal: boolean} {
        const board: number[][] = slice.getCopiedBoard();
        let numberOnBoard: number = 0;
        const currentPlayer: Player = slice.getCurrentPlayer();
        board.forEach(line => line.forEach(c => {
            if (SiamPiece.belongTo(c, currentPlayer)) {
                numberOnBoard++;
            }
        }));
        let legal: boolean = (numberOnBoard < 5);
        let insertedPiece: number = this.getInsertedPiece(coord, currentPlayer);
        return {insertedPiece, legal};
    }
    public getInsertedPiece(entrance: Coord, player: Player) {
        if (entrance.x === -1) return SiamPiece.of(Orthogonale.RIGHT, player).value;
        if (entrance.y === -1) return SiamPiece.of(Orthogonale.DOWN, player).value;
        if (entrance.x === 5) return SiamPiece.of(Orthogonale.LEFT, player).value;
        if (entrance.y === 5) return SiamPiece.of(Orthogonale.UP, player).value;
        throw new Error("Cannot get insertedPiece of a coord inside the board");
    }
    public isLegalForwarding(move: SiamMove, slice: SiamPartSlice, firstPiece: number): SiamLegalityStatus {
        if (SiamRules.VERBOSE) console.log("isLegalForwarding with:");
        if (SiamRules.VERBOSE) console.log({move: move.toString(), board: slice.board, firstPiece: SiamPiece.decode(firstPiece).toString()});
        let movingPiece: number = firstPiece;
        if (!SiamPiece.belongTo(firstPiece, slice.getCurrentPlayer())) {
            if (SiamRules.VERBOSE) console.log("Piece dont belong to current player");
            return SiamRules.ILLEGAL;
        }
        const pushingDir: Orthogonale = SiamPiece.getDirection(movingPiece);
        let landingCoord: Coord = move.coord.getNext(pushingDir);
        let currentDirection: Orthogonale = pushingDir;
        const resistingDir: Orthogonale = Orthogonale.getOpposite(pushingDir);
        let nbMountains: number = 0;
        let resisting: number = 0;
        let pushing: number = 0;
        let resultingBoard: number[][] = slice.getCopiedBoard();
        if (move.coord.isInRange(5, 5)) {
            resultingBoard[move.coord.y][move.coord.x] = SiamPiece.EMPTY.value;
        }
        while(landingCoord.isInRange(5, 5) && movingPiece !== SiamPiece.EMPTY.value) {
            if (Direction.equals(pushingDir, currentDirection))
                pushing++;
            else if (Direction.equals(resistingDir, currentDirection))
                resisting++;
            if (SiamRules.VERBOSE) console.log({pushing, resisting, movingPiece});
            const tmpPiece: number = resultingBoard[landingCoord.y][landingCoord.x];
            if (tmpPiece === SiamPiece.MOUNTAIN.value) nbMountains++;
            resultingBoard[landingCoord.y][landingCoord.x] = movingPiece;
            movingPiece = tmpPiece;
            landingCoord = landingCoord.getNext(pushingDir);
            currentDirection = SiamPiece.getNullableDirection(movingPiece);
        }
        if (pushing > resisting && nbMountains < 2) {
            if (SiamRules.VERBOSE) console.log("This move is a legal push: "+resultingBoard);
            return {legal: true, resultingBoard};
        } else {
            return SiamRules.ILLEGAL;
        }
    }
    public isLegalRotation(rotation: SiamMove, slice: SiamPartSlice): SiamLegalityStatus {
        if (SiamRules.VERBOSE) {
            console.log("isLegalRotation");
            console.log(rotation.toString());
            console.log(slice.board);
        }
        let c: Coord = rotation.coord;
        let currentPiece: number = slice.getBoardAt(c);
        if (!SiamPiece.belongTo(currentPiece, slice.getCurrentPlayer())) {
            if (SiamRules.VERBOSE) console.log("Piece dont belong to current player");
            return {legal: false, resultingBoard: null};
        } else {
            let resultingBoard: number[][] = slice.getCopiedBoard();
            resultingBoard[c.y][c.x] = SiamPiece.rotate(currentPiece, rotation.nature);
            return {legal: true, resultingBoard};
        }
    }
    public applyLegalMove(move: SiamMove, slice: SiamPartSlice, status: SiamLegalityStatus): { resultingMove: SiamMove; resultingSlice: SiamPartSlice} {
        const resultingMove: SiamMove = move;
        const newBoard: number[][] = status.resultingBoard;
        const newTurn: number = slice.turn + 1;
        const resultingSlice: SiamPartSlice = new SiamPartSlice(newBoard, newTurn);
        return {resultingMove, resultingSlice};
    }
    public getBoardValue(node: SiamNode): number {
        // 1. victories
        const winner: Player = this.getWinner(node);
        if (winner == Player.NONE) return 0;
        // 2. TODO: pre-victories
        return winner == Player.ZERO ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
    }
    public getWinner(node: SiamNode): Player {
        if (this.countMountains(node.gamePartSlice) === 2) {
            return this.getPusher(node, node.move);
        } else {
            return Player.NONE;
        }
    }
    public countMountains(slice: SiamPartSlice): number {
        const board: number[][] = slice.getCopiedBoard();
        let nbMountains: number = 0;
        for (let y=0; y<5; y++) {
            for (let x=0; x<5; x++) {
                if (board[y][x] === SiamPiece.MOUNTAIN.value) {
                    nbMountains++;
                }
            }
        }
        return nbMountains;
    }
    public getPusher(node: SiamNode, finishingMove: SiamMove): Player {
        // here we will call the piece that started the move "moveStarter", obviously
        // and the piece that was the closest to the falling mountain: the pusher
        const moveStarterCoord: Coord = finishingMove.coord;
        const previousSlice: SiamPartSlice = node.mother.gamePartSlice;
        let moveStarterPiece: number;
        if (moveStarterCoord.isInRange(5, 5)) {
            moveStarterPiece = previousSlice.getBoardAt(moveStarterCoord);
        } else { // insertion
            moveStarterPiece = this.getInsertedPiece(moveStarterCoord, previousSlice.getCurrentPlayer());
        }
        const pushingDirection: Orthogonale = SiamPiece.getDirection(moveStarterPiece);
        const pusherCoord: Coord = this.getPusherCoord(pushingDirection, moveStarterCoord);
        const winner: Player = SiamPiece.getOwner(node.gamePartSlice.getBoardAt(pusherCoord));
        if (SiamRules.VERBOSE)
            console.log(moveStarterCoord.toString() + " belong to " + node.mother.gamePartSlice.getCurrentPlayer().value + ", "
                      + pusherCoord.toString() + " belong to " + winner.value + ", "
                      + winner.value + " win");
        return winner;
    }
    public getPusherCoord(pushingDirection: Orthogonale, pusher: Coord): Coord {
        let pushed: Coord = pusher.getNext(pushingDirection);
        while (pushed.isInRange(5, 5)) {
            pusher = pushed;
            pushed = pushed.getNext(pushingDirection);
        }
        return pusher;
    }
    public getListMoves(node: SiamNode): MGPMap<SiamMove, SiamPartSlice> {
        const moves: MGPMap<SiamMove, SiamPartSlice> = new MGPMap<SiamMove, SiamPartSlice>();
        const turn: number = node.gamePartSlice.turn;
        const currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let c: number;
        let legality: SiamLegalityStatus;
        // all insertion 0 to 20
        moves.putAll(this.getInsertions(node));
        for (let y=0; y<5; y++) {
            for (let x=0; x<5; x++) {
                c = node.gamePartSlice.getBoardByXY(x, y);
                if (SiamPiece.belongTo(c, currentPlayer)) {
                    const antiClockwiseBoard: number[][] = node.gamePartSlice.getCopiedBoard();
                    const antiClockwiseMove: SiamMove = new SiamMove(x, y, SiamMoveNature.ANTI_CLOCKWISE);
                    antiClockwiseBoard[y][x] = SiamPiece.rotate(c, SiamMoveNature.ANTI_CLOCKWISE);
                    const antiClockwiseSlice: SiamPartSlice = new SiamPartSlice(antiClockwiseBoard, turn + 1);
                    moves.set(antiClockwiseMove, antiClockwiseSlice);

                    const clockwiseBoard: number[][] = node.gamePartSlice.getCopiedBoard();
                    const clockwiseMove: SiamMove = new SiamMove(x, y, SiamMoveNature.CLOCKWISE);
                    clockwiseBoard[y][x] = SiamPiece.rotate(c, SiamMoveNature.CLOCKWISE);
                    const clockwiseSlice: SiamPartSlice = new SiamPartSlice(clockwiseBoard, turn + 1);
                    moves.set(clockwiseMove, clockwiseSlice);

                    const forwardMove: SiamMove = new SiamMove(x, y, SiamMoveNature.FORWARD);
                    legality = this.isLegalForwarding(forwardMove, node.gamePartSlice, c);
                    if (legality.legal) {
                        const forwardSlice: SiamPartSlice = new SiamPartSlice(legality.resultingBoard, turn + 1);
                        moves.set(forwardMove, forwardSlice);
                    }
                }
            }
        }
        if (SiamRules.VERBOSE) console.log({getListMovesResult: moves});
        return moves;
    }
    public getInsertions(node: SiamNode): MGPMap<SiamMove, SiamPartSlice> {
        const insertions: MGPMap<SiamMove, SiamPartSlice> = new MGPMap<SiamMove, SiamPartSlice>();
        let currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let newTurn = node.gamePartSlice.turn + 1;
        let newMove: SiamMove; let insertedPiece: number; let newSlice: SiamPartSlice;
        let legality: SiamLegalityStatus;
        for (let y=0; y<5; y++) {
            newMove = new SiamMove(-1, y, SiamMoveNature.FORWARD);
            insertedPiece = SiamPiece.of(Orthogonale.RIGHT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(5, y, SiamMoveNature.FORWARD);
            insertedPiece = SiamPiece.of(Orthogonale.LEFT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }
        }
        for (let x=0; x<5; x++) {
            newMove = new SiamMove(x, -1, SiamMoveNature.FORWARD);
            insertedPiece = SiamPiece.of(Orthogonale.DOWN, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(x, 5, SiamMoveNature.FORWARD);
            insertedPiece = SiamPiece.of(Orthogonale.UP, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }
        }
        return insertions;
    }
}