import { Rules } from "src/app/jscaip/Rules";
import { SiamMove, SiamMoveNature } from "./SiamMove";
import { SiamPartSlice } from "./SiamPartSlice";
import { MNode } from "src/app/jscaip/MNode";
import { SiamPiece } from "./SiamPiece";
import { Player } from "src/app/jscaip/Player";
import { Coord } from "src/app/jscaip/Coord";
import { Orthogonale, Direction } from "src/app/jscaip/DIRECTION";
import { SiamLegalityStatus } from "./SiamLegalityStatus";
import { MGPMap } from "src/app/collectionlib/MGPMap";

abstract class _SiamRules extends Rules<SiamMove, SiamPartSlice, SiamLegalityStatus> {}

abstract class _SiamNode extends MNode<_SiamRules, SiamMove, SiamPartSlice, SiamLegalityStatus> {}

export class SiamRules extends _SiamRules {

    private static readonly ILLEGAL: SiamLegalityStatus = {legal: false, resultingBoard: null};

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
        if (SiamMove.isForward(move)) {
            let movingPiece: number;
            if (SiamMove.isInsertion(move)) {
                let insertionInfo: {insertedPiece: number, legal: boolean} =
                    this.isLegalInsertion(move.coord, slice);
                if (insertionInfo.legal === false) return SiamRules.ILLEGAL;
                movingPiece = insertionInfo.insertedPiece;
            } else {
                movingPiece = slice.getBoardAt(move.coord);
            }
            return this.isLegalForwarding(move, slice, movingPiece);
        } else {
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
        let resultingBoard: number[][] = slice.getCopiedBoard();
        let currentCoord: Coord = move.coord;
        let currentPiece: number = firstPiece;
        if (!SiamPiece.belongTo(currentPiece, slice.getCurrentPlayer())) {
            return SiamRules.ILLEGAL;
        }
        let previousPiece: number = SiamPiece.EMPTY.value;
        const pushingDir: Direction = SiamPiece.getNullableDirection(currentPiece);
        let currentDirection: Direction = pushingDir;
        const resistingDir: Direction = Direction.getOpposite(pushingDir);
        let lineFullyMoved : boolean;
        let resisting: number = 0;
        let pushing: number = 0;
        do {
            if (Direction.equals(pushingDir, currentDirection)) 
                pushing++;
            else if (Direction.equals(resistingDir, currentDirection)) 
                resisting++;
            resultingBoard[currentCoord.y][currentCoord.x] = previousPiece;
            previousPiece = currentPiece;
            currentCoord = currentCoord.getNext(pushingDir);
            currentPiece = slice.getBoardAt(currentCoord);
            currentDirection = SiamPiece.getNullableDirection(currentPiece);
            lineFullyMoved = !currentCoord.isInRange(5, 5) || currentPiece === SiamPiece.EMPTY.value;
        } while (!lineFullyMoved);
        if (pushing > resisting) {
            return {legal: true, resultingBoard};
        } else {
            return SiamRules.ILLEGAL;
        }
    }
    public isLegalRotation(rotation: SiamMove, slice: SiamPartSlice): SiamLegalityStatus {
        let c: Coord = rotation.coord;
        let currentPiece: number = slice.getBoardAt(c);
        if (!SiamPiece.belongTo(currentPiece, slice.getCurrentPlayer())) {
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
    public getBoardValue(node: _SiamNode): number {
        // 1. victories
        const victory: number = this.getVictory(node);
        if (victory != null) return victory;
        // 2. pre-victories
        throw new Error("Method not implemented.");
    }
    public getVictory(node: _SiamNode): number | null {
        if (this.countMountains(node.gamePartSlice) === 2) {
            const pusher: Player = this.getPusher(node, node.move);
            return pusher === Player.ZERO ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
        } else {
            return null;
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
    public getPusher(node: _SiamNode, finishingMove: SiamMove): Player {
        const moveStart: Coord = finishingMove.coord;
        const previousSlice: SiamPartSlice = node.mother.gamePartSlice;
        const pushingDirection: Orthogonale = SiamPiece.getDirection(previousSlice.getBoardAt(moveStart));
        const pusherCoord: Coord = this.getPusherCoord(pushingDirection, moveStart);
        return SiamPiece.getOwner(node.gamePartSlice.getBoardAt(pusherCoord));
    }
    public getPusherCoord(pushingDirection: Orthogonale, pushingCoord: Coord): Coord {
        let pusher: Coord = pushingCoord.getNext(pushingDirection);
        let pushed: Coord = pusher.getNext(pushingDirection);
        do {
            pusher = pushed;
            pushed = pushed.getNext(pushingDirection);
        } while (pushed.isInRange(5, 5));
        return pusher;
    }
    public getListMoves(node: _SiamNode): MGPMap<SiamMove, SiamPartSlice> {
        const moves: MGPMap<SiamMove, SiamPartSlice> = new MGPMap<SiamMove, SiamPartSlice>();
        const newTurn: number = node.gamePartSlice.turn;
        let newBoard: number[][];
        const currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let c: number; let newMove: SiamMove; let newSlice: SiamPartSlice;
        let legality: SiamLegalityStatus;
        // all insertion  0 to 20
        moves.putAll(this.getInsertions(node));
        for (let y=0; y<5; y++) {
            for (let x=0; x<5; x++) {
                c = node.gamePartSlice.getBoardByXY(x, y);
                if (SiamPiece.belongTo(c, currentPlayer)) {
                    newBoard = node.gamePartSlice.getCopiedBoard();
                    newMove = new SiamMove(x, y, SiamMoveNature.ANTI_CLOCKWISE);
                    newBoard[y][x] = SiamPiece.rotate(c, SiamMoveNature.ANTI_CLOCKWISE);
                    newSlice = new SiamPartSlice(newBoard, newTurn);
                    moves.put(newMove, newSlice);

                    newMove = new SiamMove(x, y, SiamMoveNature.CLOCKWISE);
                    newBoard[y][x] = SiamPiece.rotate(c, SiamMoveNature.CLOCKWISE);
                    newSlice = new SiamPartSlice(newBoard, newTurn);
                    moves.put(newMove, newSlice);

                    newMove = new SiamMove(x, y, SiamMoveNature.FORWARD);
                    legality = this.isLegalForwarding(newMove, node.gamePartSlice, c);
                    if (legality.legal) {
                        newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                        moves.put(newMove, newSlice);
                    }
                }
            }
        }
        return moves;
    }
    public getInsertions(node: _SiamNode): MGPMap<SiamMove, SiamPartSlice> {
        const insertions: MGPMap<SiamMove, SiamPartSlice> = new MGPMap<SiamMove, SiamPartSlice>();
        let currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let newTurn = node.gamePartSlice.turn;
        let newMove: SiamMove; let insertedPiece: number; let newSlice: SiamPartSlice;
        let legality: SiamLegalityStatus;
        for (let y=0; y<5; y++) {
            newMove = new SiamMove(-1, y, SiamMoveNature.FORWARD);
            insertedPiece = SiamPiece.of(Orthogonale.RIGHT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.put(newMove, newSlice);
            }

            newMove = new SiamMove(5, y, SiamMoveNature.FORWARD);
            insertedPiece = SiamPiece.of(Orthogonale.LEFT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.put(newMove, newSlice);
            }
        }
        for (let x=0; x<5; x++) {
            newMove = new SiamMove(x, -1, SiamMoveNature.FORWARD);
            insertedPiece = SiamPiece.of(Orthogonale.DOWN, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.put(newMove, newSlice);
            }

            newMove = new SiamMove(x, 5, SiamMoveNature.FORWARD);
            insertedPiece = SiamPiece.of(Orthogonale.UP, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.put(newMove, newSlice);
            }
        }
        return insertions;
    }
}