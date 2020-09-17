import { Rules } from "src/app/jscaip/Rules";
import { SiamMove } from "../siammove/SiamMove";
import { SiamPartSlice } from "../SiamPartSlice";
import { MNode } from "src/app/jscaip/MNode";
import { SiamPiece } from "../SiamPiece";
import { Player } from "src/app/jscaip/Player";
import { Coord } from "src/app/jscaip/coord/Coord";
import { Orthogonale, Direction } from "src/app/jscaip/DIRECTION";
import { SiamLegalityStatus } from "../SiamLegalityStatus";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";

abstract class _SiamRules extends Rules<SiamMove, SiamPartSlice, SiamLegalityStatus> {}

export abstract class SiamNode extends MNode<_SiamRules, SiamMove, SiamPartSlice, SiamLegalityStatus> {}

export class SiamRules extends _SiamRules {

    public static VERBOSE: boolean = false;

    private static readonly ILLEGAL: SiamLegalityStatus = {legal: false, resultingBoard: null};

    public static display(verbose: boolean, message: any) {
        if (verbose) console.log(message);
    }
    constructor() {
        super(true); // TODO: ALL RULES ARE NOW PEARED
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
        SiamRules.display(SiamRules.VERBOSE, { SiamRules_isLegal: { move, slice }});

        if (move.isForward()) {
            let movingPiece: number;
            if (SiamMove.isInsertion(move)) {
                SiamRules.display(SiamRules.VERBOSE, "Move is insertion");
                let insertionInfo: {insertedPiece: number, legal: boolean} =
                    this.isLegalInsertion(move.coord, slice);
                if (insertionInfo.legal === false) return SiamRules.ILLEGAL;
                movingPiece = insertionInfo.insertedPiece;
            } else {
                SiamRules.display(SiamRules.VERBOSE, "Move is forward");
                movingPiece = slice.getBoardAt(move.coord);
            }
            return this.isLegalForwarding(move, slice, movingPiece);
        } else {
            SiamRules.display(SiamRules.VERBOSE, "Move is rotation");
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
        let insertedPiece: number = SiamRules.getInsertedPiece(coord, currentPlayer).value;
        return {insertedPiece, legal};
    }
    public static getInsertedPiece(entrance: Coord, player: Player): SiamPiece {
        if (entrance.x === -1) return SiamPiece.of(Orthogonale.RIGHT, player);
        if (entrance.y === -1) return SiamPiece.of(Orthogonale.DOWN, player);
        if (entrance.x === 5) return SiamPiece.of(Orthogonale.LEFT, player);
        if (entrance.y === 5) return SiamPiece.of(Orthogonale.UP, player);
        throw new Error("Cannot get insertedPiece of a coord inside the board");
    }
    public isLegalForwarding(move: SiamMove, slice: SiamPartSlice, firstPiece: number): SiamLegalityStatus {
        SiamRules.display(SiamRules.VERBOSE, { isLegalForwarding: {move, slice, firstPiece }});

        if (SiamPiece.belongTo(firstPiece, slice.getCurrentEnnemy())) {
            SiamRules.display(SiamRules.VERBOSE, "Piece dont belong to current player");
            return SiamRules.ILLEGAL;
        }
        let movingPiece: number = SiamPiece.of(move.landingOrientation, slice.getCurrentPlayer()).value;
        const pushingDir: Orthogonale = move.moveDirection.get();
        let landingCoord: Coord = move.coord.getNext(pushingDir);
        if (landingCoord.isInRange(5, 5) &&
            slice.getBoardAt(landingCoord) !== SiamPiece.EMPTY.value &&
            SiamRules.isStraight(firstPiece, move) === false
        ) {
            return SiamRules.ILLEGAL;
        }
        let currentDirection: Orthogonale = pushingDir;
        const resistingDir: Orthogonale = pushingDir.getOpposite();
        let totalForce: number = 0;
        let resultingBoard: number[][] = slice.getCopiedBoard();
        if (move.coord.isInRange(5, 5)) {
            resultingBoard[move.coord.y][move.coord.x] = SiamPiece.EMPTY.value;
        }
        let pushingPossible: boolean = landingCoord.isInRange(5, 5) &&
                                       movingPiece !== SiamPiece.EMPTY.value

        while (pushingPossible) {
            if (Direction.equals(pushingDir, currentDirection))
                totalForce++;
            else if (Direction.equals(resistingDir, currentDirection))
                totalForce--;
                SiamRules.display(SiamRules.VERBOSE, {totalForce, movingPiece, landingCoord});
            const tmpPiece: number = resultingBoard[landingCoord.y][landingCoord.x];
            if (tmpPiece === SiamPiece.MOUNTAIN.value) totalForce -= 0.9;
            resultingBoard[landingCoord.y][landingCoord.x] = movingPiece;
            movingPiece = tmpPiece;
            landingCoord = landingCoord.getNext(pushingDir);
            currentDirection = SiamPiece.getNullableDirection(movingPiece);
            pushingPossible = landingCoord.isInRange(5, 5) &&
                              movingPiece !== SiamPiece.EMPTY.value &&
                              totalForce > 0;
        }
        if (landingCoord.isNotInRange(5, 5)) {
            SiamRules.display(SiamRules.VERBOSE, "This movement would push " + movingPiece + " outside the board");

            if (Direction.equals(pushingDir, currentDirection))
                totalForce++;
            else if (Direction.equals(resistingDir, currentDirection))
                totalForce--;
        }
        if (totalForce <= 0) {
            SiamRules.display(SiamRules.VERBOSE, "This move is an illegal push: " + resultingBoard);
            return SiamRules.ILLEGAL;
        }

        SiamRules.display(SiamRules.VERBOSE, "This move is a legal push: "+resultingBoard);
        return {legal: true, resultingBoard};
    }
    public static isStraight(piece: number, move: SiamMove): boolean {
        const siamPiece: SiamPiece = SiamPiece.decode(piece);
        const pieceDirection: Orthogonale = siamPiece.getDirection();
        return (pieceDirection === move.moveDirection.getOrNull() &&
                pieceDirection === move.landingOrientation);
    }
    public isLegalRotation(rotation: SiamMove, slice: SiamPartSlice): SiamLegalityStatus {
        SiamRules.display(SiamRules.VERBOSE, { isLegalRotation: { rotation, slice }});

        let c: Coord = rotation.coord;
        let currentPiece: number = slice.getBoardAt(c);
        let currentPlayer: Player = slice.getCurrentPlayer();
        if (!SiamPiece.belongTo(currentPiece, currentPlayer)) {
            SiamRules.display(SiamRules.VERBOSE, "Piece dont belong to current player");
            return {legal: false, resultingBoard: null};
        } else {
            if (SiamPiece.getDirection(currentPiece) === rotation.landingOrientation) {
                return { legal: false, resultingBoard: null};
            }
            let resultingBoard: number[][] = slice.getCopiedBoard();
            resultingBoard[c.y][c.x] = SiamPiece.of(rotation.landingOrientation, currentPlayer).value;
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
    public getBoardValue(move: SiamMove, slice: SiamPartSlice): number {
        // 1. victories
        const mountainList: Coord[] = this.getMountainsCoords(slice);
        const winner: Player = this.getWinner(slice, move, mountainList);
        if (winner === Player.NONE) {
            const closestPushers: { distance: number, closestPushers: Coord[]} =
                this.getClosestPushers(slice, mountainList);
            if (closestPushers.closestPushers.length === 0) {
                return 0;
            } else {
                let zeroPusher: number = 0;
                let onePusher: number = 0;
                for (let pusher of closestPushers.closestPushers) {
                    const owner: Player = SiamPiece.getOwner(slice.getBoardAt(pusher));
                    if (owner === Player.ZERO) {
                        zeroPusher++;
                    } else {
                        onePusher++;
                    }
                }
                return (onePusher - zeroPusher) * (6 - closestPushers.distance);
            }
        } else {
            return winner === Player.ZERO ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
        }
    }
    public getMountainsCoords(slice: SiamPartSlice): Coord[] {
        const mountainsCoord: Coord[] = [];
        for (let y=0; y<5; y++) {
            for (let x=0; x<5; x++) {
                if (slice.getBoardByXY(x, y) === SiamPiece.MOUNTAIN.value) {
                    mountainsCoord.push(new Coord(x, y));
                }
            }
        }
        return mountainsCoord;
    }
    public getWinner(slice: SiamPartSlice, move: SiamMove, mountainList: Coord[]): Player {
        if (mountainList.length === 2) {
            return this.getPusher(slice, move);
        } else {
            return Player.NONE;
        }
    }
    public getPusher(slice: SiamPartSlice, finishingMove: SiamMove): Player {
        // here we will call the piece that started the move "moveStarter", obviously
        // and the piece in the right direction that was the closest to the falling mountain: the pusher

        const moveStarterCoord: Coord = finishingMove.coord;
        let moveStarterPiece: number;
        if (moveStarterCoord.isInRange(5, 5)) {
            const moveStarterDir: Direction = finishingMove.landingOrientation;
            moveStarterPiece = slice.getBoardAt(moveStarterCoord.getNext(moveStarterDir));
        } else { // insertion
            moveStarterPiece = SiamRules.getInsertedPiece(moveStarterCoord, slice.getCurrentEnnemy()).value;
        }
        const pushingDirection: Orthogonale = SiamPiece.getDirection(moveStarterPiece);
        const pusherCoord: Coord = this.getPusherCoord(slice, pushingDirection, moveStarterCoord);
        const winner: Player = SiamPiece.getOwner(slice.getBoardAt(pusherCoord));
        SiamRules.display(SiamRules.VERBOSE, moveStarterCoord.toString() + " belong to " + slice.getCurrentEnnemy().value + ", "
                        + pusherCoord.toString() + " belong to " + winner.value + ", " + winner.value + " win");
        return winner;
    }
    public getPusherCoord(slice: SiamPartSlice, pushingDirection: Orthogonale, pusher: Coord): Coord {
        let pushed: Coord = pusher.getNext(pushingDirection);
        let lastCorrectPusher: Coord = pusher;
        while (pushed.isInRange(5, 5)) {
            pusher = pushed;
            pushed = pushed.getNext(pushingDirection);
            const pushingPiece: SiamPiece = SiamPiece.decode(slice.getBoardAt(pusher));
            if (pushingPiece !== SiamPiece.MOUNTAIN && pushingPiece.getDirection() === pushingDirection) {
                lastCorrectPusher = pusher;
            }
        }
        return lastCorrectPusher;
    }
    public getClosestPushers(slice: SiamPartSlice, mountainList: Coord[]): { distance: number, closestPushers: Coord[]} {
        let maximalDistance: number = 5;
        let closestPushers: Coord[] = [];
        for(let mountain of mountainList) {
            for (let direction of Orthogonale.ORTHOGONALES) {
                const directionClosestPusher: { distance: number, coord: Coord } =
                    this.getDirectionClosestPusher(slice, mountain, direction, maximalDistance);
                if (directionClosestPusher.distance < maximalDistance) {
                    // console.log("for " + direction.toString() + " of " + mountain.toString())
                    // console.log( { maximalDistanceCreatedBy: directionClosestPusher})
                    maximalDistance = directionClosestPusher.distance;
                    closestPushers = [directionClosestPusher.coord];
                } else if (directionClosestPusher.distance === maximalDistance) {
                    // console.log("for " + direction.toString() + " of " + mountain.toString())
                    // console.log( { maximalDistanceAddedFor: directionClosestPusher})
                    closestPushers.push(directionClosestPusher.coord)
                }
            }
        }
        return { distance: maximalDistance, closestPushers };
    }
    public getDirectionClosestPusher(
        slice: SiamPartSlice,
        mountain: Coord,
        direction: Orthogonale,
        maximalDistance: number)
        : { distance: number, coord: Coord }
    {
        let currentDistance: number = this.getDistanceFromMountainToBoard(mountain, direction.getOpposite());
        let testedCoord: Coord = mountain.getNext(direction);
        let pusherFound: boolean = false;
        while (testedCoord.isInRange(5, 5) &&
               (currentDistance <= maximalDistance) &&
               (pusherFound === false))
        {
            const currentPiece: number = slice.getBoardAt(testedCoord);
            if (currentPiece === SiamPiece.MOUNTAIN.value) { // No one can push that, no pusher
                // Mountain will be considered pusher with infinite distance
                currentDistance = Number.MAX_SAFE_INTEGER;
            } else if (currentPiece === SiamPiece.EMPTY.value) { // Still empty place, let's go back further
                testedCoord = testedCoord.getNext(direction);
                currentDistance++;
            } else { // Pusher found
                pusherFound = true;
            }
        }
        if (testedCoord.isNotInRange(5, 5)) {
            // Potential player from outside the board will for now not be taken in account (hence "Infinite")
            currentDistance = Number.MAX_SAFE_INTEGER;
        }
        return { distance: currentDistance, coord: testedCoord };
    }
    public getDistanceFromMountainToBoard(mountain: Coord, direction: Orthogonale): number {
        switch (direction) {
            case Orthogonale.UP:    return mountain.y + 1;
            case Orthogonale.RIGHT: return 5 - mountain.x;
            case Orthogonale.DOWN:  return 5 - mountain.y;
            case Orthogonale.LEFT:  return mountain.x + 1;
        }
    }
    public getListMoves(node: SiamNode): MGPMap<SiamMove, SiamPartSlice> {
        const moves: MGPMap<SiamMove, SiamPartSlice> = new MGPMap<SiamMove, SiamPartSlice>();
        const turn: number = node.gamePartSlice.turn;
        const currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let c: number;
        let legality: SiamLegalityStatus;
        // all 20 pushing insertion
        moves.putAll(this.getPushingInsertions(node));
        // all 24 deraping insertion
        moves.putAll(this.getDerapingInsertions(node));
        for (let y=0; y<5; y++) {
            for (let x=0; x<5; x++) {
                c = node.gamePartSlice.getBoardByXY(x, y);
                if (SiamPiece.belongTo(c, currentPlayer)) {
                    const currentOrientation: Orthogonale = SiamPiece.getDirection(c);
                    for (let orthogonal of Orthogonale.ORTHOGONALES) {
                        // three rotation
                        if (orthogonal !== currentOrientation) {
                            const newBoard: number[][] = node.gamePartSlice.getCopiedBoard();
                            const newMove: SiamMove = new SiamMove(x, y, MGPOptional.empty(), orthogonal);
                            newBoard[y][x] = SiamPiece.of(orthogonal, currentPlayer).value;
                            const newSlice: SiamPartSlice = new SiamPartSlice(newBoard, turn + 1);
                            moves.set(newMove, newSlice);
                        }
                        for (let orientation of Orthogonale.ORTHOGONALES) {
                            const forwardMove: SiamMove = new SiamMove(x, y, MGPOptional.of(orthogonal), orientation);
                            legality = this.isLegalForwarding(forwardMove, node.gamePartSlice, c);
                            if (legality.legal) {
                                const forwardSlice: SiamPartSlice = new SiamPartSlice(legality.resultingBoard, turn + 1);
                                moves.set(forwardMove, forwardSlice);
                            }
                        }
                    }
                }
            }
        }
        SiamRules.display(SiamRules.VERBOSE, {getListMovesResult: moves});
        return moves;
    }
    public getPushingInsertions(node: SiamNode): MGPMap<SiamMove, SiamPartSlice> {
        const insertions: MGPMap<SiamMove, SiamPartSlice> = new MGPMap<SiamMove, SiamPartSlice>();
        let currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let newTurn = node.gamePartSlice.turn + 1;
        let newMove: SiamMove; let insertedPiece: number; let newSlice: SiamPartSlice;
        let legality: SiamLegalityStatus;
        for (let y=0; y<5; y++) {
            newMove = new SiamMove(-1, y, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.RIGHT);
            insertedPiece = SiamPiece.of(Orthogonale.RIGHT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(5, y, MGPOptional.of(Orthogonale.LEFT), Orthogonale.LEFT);
            insertedPiece = SiamPiece.of(Orthogonale.LEFT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }
        }
        for (let x=0; x<5; x++) {
            newMove = new SiamMove(x, -1, MGPOptional.of(Orthogonale.DOWN), Orthogonale.DOWN);
            insertedPiece = SiamPiece.of(Orthogonale.DOWN, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(x, 5, MGPOptional.of(Orthogonale.UP), Orthogonale.DOWN);
            insertedPiece = SiamPiece.of(Orthogonale.UP, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }
        }
        return insertions;
    }
    public getDerapingInsertions(node: SiamNode): MGPMap<SiamMove, SiamPartSlice> {
        const insertions: MGPMap<SiamMove, SiamPartSlice> = new MGPMap<SiamMove, SiamPartSlice>();
        let currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let newTurn = node.gamePartSlice.turn + 1;
        let newMove: SiamMove; let insertedPiece: number; let newSlice: SiamPartSlice;
        let legality: SiamLegalityStatus;
        for (let y=1; y<=3; y++) {
            newMove = new SiamMove(-1, y, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.UP);
            insertedPiece = SiamPiece.of(Orthogonale.RIGHT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(-1, y, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.DOWN);
            insertedPiece = SiamPiece.of(Orthogonale.RIGHT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(5, y, MGPOptional.of(Orthogonale.LEFT), Orthogonale.UP);
            insertedPiece = SiamPiece.of(Orthogonale.LEFT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(5, y, MGPOptional.of(Orthogonale.LEFT), Orthogonale.DOWN);
            insertedPiece = SiamPiece.of(Orthogonale.LEFT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }
        }
        for (let x=1; x<=3; x++) {
            newMove = new SiamMove(x, -1, MGPOptional.of(Orthogonale.DOWN), Orthogonale.LEFT);
            insertedPiece = SiamPiece.of(Orthogonale.DOWN, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(x, -1, MGPOptional.of(Orthogonale.DOWN), Orthogonale.RIGHT);
            insertedPiece = SiamPiece.of(Orthogonale.DOWN, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(x, 5, MGPOptional.of(Orthogonale.UP), Orthogonale.LEFT);
            insertedPiece = SiamPiece.of(Orthogonale.UP, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }

            newMove = new SiamMove(x, 5, MGPOptional.of(Orthogonale.UP), Orthogonale.RIGHT);
            insertedPiece = SiamPiece.of(Orthogonale.UP, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal) {
                newSlice = new SiamPartSlice(legality.resultingBoard, newTurn);
                insertions.set(newMove, newSlice);
            }
        }
        return insertions;
    }
    public static getCoordDirection(x: number, y: number, slice: SiamPartSlice): Orthogonale {
        const coord: Coord = new Coord(x, y);
        let direction: Orthogonale;
        if (coord.isInRange(5, 5)) {
            const piece: number = slice.getBoardAt(coord);
            direction = SiamPiece.getDirection(piece);
        } else {
            const insertedPiece: SiamPiece = this.getInsertedPiece(coord, slice.getCurrentPlayer());
            direction = insertedPiece.getDirection();
        }
        return direction;
    }
}