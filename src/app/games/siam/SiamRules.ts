import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { SiamMove } from './SiamMove';
import { SiamState } from './SiamState';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { SiamPiece } from './SiamPiece';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { SiamFailure } from './SiamFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class SiamLegalityInformation {
    public constructor(public readonly resultingBoard: Table<SiamPiece>,
                       public readonly moved: Coord[]) {
    }
}

export class SiamNode extends MGPNode<SiamRules, SiamMove, SiamState, SiamLegalityInformation> {}

export class SiamRules extends Rules<SiamMove, SiamState, SiamLegalityInformation> {

    public static VERBOSE: boolean = false;

    public isLegal(move: SiamMove, state: SiamState): MGPFallible<SiamLegalityInformation> {
        display(SiamRules.VERBOSE, { SiamRules_isLegal: { move, state } });

        if (!move.isInsertion()) {
            const movedPiece: SiamPiece = state.getPieceAt(move.coord);
            if (!movedPiece.belongTo(state.getCurrentPlayer())) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            }
        }
        if (move.isRotation()) {
            display(SiamRules.VERBOSE, 'Move is rotation');
            return this.isLegalRotation(move, state);
        } else {
            let movingPiece: SiamPiece;
            if (move.isInsertion()) {
                display(SiamRules.VERBOSE, 'Move is insertion');
                const insertionInfo: {insertedPiece: SiamPiece, legal: MGPValidation} =
                    this.isLegalInsertion(move.coord, state);
                if (insertionInfo.legal.isFailure()) {
                    return MGPFallible.failure(insertionInfo.legal.getReason());
                }
                movingPiece = insertionInfo.insertedPiece;
            } else {
                display(SiamRules.VERBOSE, 'Move is forward');
                movingPiece = state.getPieceAt(move.coord);
            }
            return SiamRules.isLegalForwarding(move, state, movingPiece);
        }
    }
    public isLegalInsertion(coord: Coord, state: SiamState): {insertedPiece: SiamPiece, legal: MGPValidation} {
        const numberOnBoard: number = state.countPlayerPawn();
        const currentPlayer: Player = state.getCurrentPlayer();
        const legal: MGPValidation = (numberOnBoard < 5) ?
            MGPValidation.SUCCESS :
            MGPValidation.failure(SiamFailure.NO_REMAINING_PIECE_TO_INSERT());
        const insertedPiece: SiamPiece = SiamRules.getInsertedPiece(coord, currentPlayer);
        return { insertedPiece, legal };
    }
    public static getInsertedPiece(entrance: Coord, player: Player): SiamPiece {
        if (entrance.x === -1) return SiamPiece.of(Orthogonal.RIGHT, player);
        if (entrance.y === -1) return SiamPiece.of(Orthogonal.DOWN, player);
        if (entrance.x === 5) return SiamPiece.of(Orthogonal.LEFT, player);
        return SiamPiece.of(Orthogonal.UP, player);
    }
    public static isLegalForwarding(move: SiamMove, state: SiamState, firstPiece: SiamPiece)
    : MGPFallible<SiamLegalityInformation> {
        display(SiamRules.VERBOSE, { isLegalForwarding: { move: move.toString(), state, firstPiece } });

        const movedPieces: Coord[] = [];
        let movingPiece: SiamPiece = SiamPiece.of(move.landingOrientation, state.getCurrentPlayer());
        const pushingDir: Orthogonal = move.moveDirection.get();
        let landingCoord: Coord = move.coord.getNext(pushingDir);
        if (landingCoord.isInRange(5, 5) &&
            state.getPieceAt(landingCoord) !== SiamPiece.EMPTY &&
            SiamRules.isStraight(firstPiece, move) === false
        ) {
            display(SiamRules.VERBOSE,
                    'Illegal push because not straight or not pushing anything or leaving the board');
            return MGPFallible.failure(SiamFailure.ILLEGAL_PUSH());
        }
        let currentDirection: MGPOptional<Orthogonal> = MGPOptional.of(pushingDir);
        const resistingDir: Orthogonal = pushingDir.getOpposite();
        let totalForce: number = 0;
        const resultingBoard: SiamPiece[][] = state.getCopiedBoard();
        if (move.coord.isInRange(5, 5)) {
            resultingBoard[move.coord.y][move.coord.x] = SiamPiece.EMPTY;
            movedPieces.push(move.coord);
        }
        let pushingPossible: boolean = landingCoord.isInRange(5, 5) &&
                                       movingPiece !== SiamPiece.EMPTY;

        while (pushingPossible) {
            if (currentDirection.equalsValue(pushingDir)) {
                totalForce++;
            } else if (currentDirection.equalsValue(resistingDir)) {
                totalForce--;
            }
            display(SiamRules.VERBOSE, { totalForce, movingPiece, landingCoord });
            const tmpPiece: SiamPiece = resultingBoard[landingCoord.y][landingCoord.x];
            if (tmpPiece === SiamPiece.MOUNTAIN) totalForce -= 0.9;
            resultingBoard[landingCoord.y][landingCoord.x] = movingPiece;
            movedPieces.push(landingCoord);
            movingPiece = tmpPiece;
            landingCoord = landingCoord.getNext(pushingDir);
            currentDirection = movingPiece.getOptionalDirection();
            pushingPossible = landingCoord.isInRange(5, 5) &&
                              movingPiece !== SiamPiece.EMPTY &&
                              totalForce > 0;
        }
        if (landingCoord.isNotInRange(5, 5)) {
            display(SiamRules.VERBOSE, 'This movement would push ' + movingPiece + ' outside the board');

            if (currentDirection.equalsValue(pushingDir)) {
                totalForce++;
            } else if (currentDirection.equalsValue(resistingDir)) {
                totalForce--;
            }
        }
        if (totalForce <= 0) {
            display(SiamRules.VERBOSE, 'This move is an illegal push: ' + resultingBoard);
            return MGPFallible.failure(SiamFailure.NOT_ENOUGH_FORCE_TO_PUSH());
        }

        display(SiamRules.VERBOSE, 'This move is a legal push: '+resultingBoard);
        return MGPFallible.success(new SiamLegalityInformation(resultingBoard, movedPieces));
    }
    public static isStraight(piece: SiamPiece, move: SiamMove): boolean {
        const pieceDirection: Orthogonal = piece.getDirection();
        return (move.moveDirection.equalsValue(pieceDirection) &&
                pieceDirection === move.landingOrientation);
    }
    public isLegalRotation(rotation: SiamMove, state: SiamState): MGPFallible<SiamLegalityInformation> {
        display(SiamRules.VERBOSE, { isLegalRotation: { rotation, state } });

        const coord: Coord = rotation.coord;
        const currentPiece: SiamPiece = state.getPieceAt(coord);
        const currentPlayer: Player = state.getCurrentPlayer();
        if (currentPiece.getDirection() === rotation.landingOrientation) {
            return MGPFallible.failure(SiamFailure.ILLEGAL_ROTATION());
        }
        const resultingBoard: SiamPiece[][] = state.getCopiedBoard();
        resultingBoard[coord.y][coord.x] = SiamPiece.of(rotation.landingOrientation, currentPlayer);
        return MGPFallible.success(new SiamLegalityInformation(resultingBoard, [coord]));
    }
    public applyLegalMove(_move: SiamMove,
                          state: SiamState,
                          status: SiamLegalityInformation)
    : SiamState
    {
        const newBoard: Table<SiamPiece> = ArrayUtils.copyBiArray(status.resultingBoard);
        const newTurn: number = state.turn + 1;
        const resultingState: SiamState = new SiamState(newBoard, newTurn);
        return resultingState;
    }
    public static getBoardValueInfo(move: MGPOptional<SiamMove>,
                                    state: SiamState)
    : { shortestZero: number, shortestOne: number, boardValue: number }
    {
        const mountainsInfo: { rows: number[], columns: number[], nbMountain: number } =
            SiamRules.getMountainsRowsAndColumns(state);
        const mountainsRow: number[] = mountainsInfo.rows;
        const mountainsColumn: number[] = mountainsInfo.columns;

        const winner: Player = SiamRules.getWinner(state, move, mountainsInfo.nbMountain);
        if (winner === Player.NONE) {
            const pushers: { distance: number, coord: Coord}[] =
                SiamRules.getPushers(state, mountainsColumn, mountainsRow);
            let zeroShortestDistance: number = Number.MAX_SAFE_INTEGER;
            let oneShortestDistance: number = Number.MAX_SAFE_INTEGER;
            const currentPlayer: Player = state.getCurrentPlayer();
            for (const pusher of pushers) {
                if (pusher.coord.isInRange(5, 5)) {
                    const piece: SiamPiece = state.getPieceAt(pusher.coord);
                    if (piece.belongTo(Player.ZERO)) {
                        zeroShortestDistance = Math.min(zeroShortestDistance, pusher.distance);
                    } else {
                        oneShortestDistance = Math.min(oneShortestDistance, pusher.distance);
                    }
                } else {
                    if (currentPlayer === Player.ZERO) {
                        zeroShortestDistance = Math.min(zeroShortestDistance, pusher.distance);
                    } else {
                        oneShortestDistance = Math.min(oneShortestDistance, pusher.distance);
                    }
                }
            }
            const boardValue: number = SiamRules.getScoreFromShortestDistances(zeroShortestDistance,
                                                                               oneShortestDistance,
                                                                               currentPlayer);
            return { shortestZero: zeroShortestDistance, shortestOne: oneShortestDistance, boardValue };
        } else {
            // 1. victories
            if (winner === Player.ZERO) {
                return {
                    shortestZero: 0,
                    shortestOne: Number.POSITIVE_INFINITY,
                    boardValue: Number.MIN_SAFE_INTEGER,
                };
            } else {
                return {
                    shortestZero: Number.POSITIVE_INFINITY,
                    shortestOne: 0,
                    boardValue: Number.MAX_SAFE_INTEGER,
                };
            }
        }
    }
    public static getScoreFromShortestDistances(zeroShortestDistance: number,
                                                oneShortestDistance: number,
                                                currentPlayer: Player)
    : number
    {
        if (zeroShortestDistance === Number.MAX_SAFE_INTEGER) zeroShortestDistance = 6;
        if (oneShortestDistance === Number.MAX_SAFE_INTEGER) oneShortestDistance = 6;
        const zeroScore: number = 6 - zeroShortestDistance;
        const oneScore: number = 6 - oneShortestDistance;
        if (zeroScore === oneScore) {
            return currentPlayer.getScoreModifier(); // TODO think that correctly
        } else if (zeroScore > oneScore) {
            return (-10 * (zeroScore + 1)) + (oneScore + 1); // TODO think that correctly
        } else {
            return (10 * (oneScore + 1)) - (zeroScore + 1); // TODO think that correctly
        }
    }
    public static getMountainsRowsAndColumns(state: SiamState)
    : { rows: number[], columns: number[], nbMountain: number }
    {
        const rows: number[] = [];
        const columns: number[] = [];
        let nbMountain: number = 0;
        for (let y: number = 0; y<5; y++) {
            for (let x: number = 0; x<5; x++) {
                if (state.getPieceAtXY(x, y) === SiamPiece.MOUNTAIN) {
                    if (!rows.includes(y)) rows.push(y);
                    if (!columns.includes(x)) columns.push(x);
                    nbMountain++;
                }
            }
        }
        return { rows, columns, nbMountain };
    }
    public static getWinner(state: SiamState, move: MGPOptional<SiamMove>, nbMountain: number): Player {
        if (nbMountain === 2) {
            return SiamRules.getPusher(state, move.get());
        } else {
            return Player.NONE;
        }
    }
    public static getPusher(state: SiamState, finishingMove: SiamMove): Player {
        // here we will call the piece that started the move "moveStarter", obviously
        // and the piece in the right direction that was the closest to the falling mountain: the pusher

        const moveStarterCoord: Coord = finishingMove.coord;
        let moveStarterPiece: SiamPiece;
        if (moveStarterCoord.isInRange(5, 5)) {
            const moveStarterDir: Orthogonal = finishingMove.landingOrientation;
            moveStarterPiece = state.getPieceAt(moveStarterCoord.getNext(moveStarterDir));
        } else { // insertion
            moveStarterPiece = SiamRules.getInsertedPiece(moveStarterCoord, state.getCurrentOpponent());
        }
        const pushingDirection: Orthogonal = moveStarterPiece.getDirection();
        const pusherCoord: Coord = SiamRules.getPusherCoord(state, pushingDirection, moveStarterCoord);
        const winner: Player = state.getPieceAt(pusherCoord).getOwner();
        display(SiamRules.VERBOSE, moveStarterCoord.toString() + ' belong to ' + state.getCurrentOpponent().value + ', ' +
                pusherCoord.toString() + ' belong to ' + winner.value + ', ' + winner.value + ' win');
        return winner;
    }
    public static getPusherCoord(state: SiamState, pushingDirection: Orthogonal, pusher: Coord): Coord {
        let pushed: Coord = pusher.getNext(pushingDirection);
        let lastCorrectPusher: Coord = pusher;
        while (pushed.isInRange(5, 5)) {
            pusher = pushed;
            pushed = pushed.getNext(pushingDirection);
            const pushingPiece: SiamPiece = state.getPieceAt(pusher);
            // TODO: test when mountain amongst the pushers
            if (pushingPiece !== SiamPiece.MOUNTAIN && pushingPiece.getDirection() === pushingDirection) {
                lastCorrectPusher = pusher;
            }
        }
        return lastCorrectPusher;
    }
    public static getPushers(state: SiamState,
                             mountainsColumn: number[],
                             mountainsRow: number[])
    : { coord: Coord; distance: number; }[]
    {
        display(SiamRules.VERBOSE, { getPushers: { state, mountainsColumn, mountainsRow } });
        let pushers: { coord: Coord; distance: number; }[] = [];
        const lineDirections: { direction: Orthogonal, fallingCoord: Coord}[] = [];
        for (const x of mountainsColumn) {
            let direction: Orthogonal = Orthogonal.DOWN;
            let fallingCoord: Coord = new Coord(x, 4);
            lineDirections.push({ direction, fallingCoord });

            direction = Orthogonal.UP;
            fallingCoord = new Coord(x, 0);
            lineDirections.push({ direction, fallingCoord });
        }
        for (const y of mountainsRow) {
            let direction: Orthogonal = Orthogonal.LEFT;
            let fallingCoord: Coord = new Coord(0, y);
            lineDirections.push({ direction, fallingCoord });

            direction = Orthogonal.RIGHT;
            fallingCoord = new Coord(4, y);
            lineDirections.push({ direction, fallingCoord });
        }
        for (const lineDirection of lineDirections) {
            const fallingCoord: Coord = lineDirection.fallingCoord;
            const direction: Orthogonal = lineDirection.direction;

            pushers = SiamRules.addPotentialDirectionPusher(state, fallingCoord, direction, pushers);
        }
        return pushers;
    }
    public static addPotentialDirectionPusher(state: SiamState,
                                              fallingCoord: Coord,
                                              direction: Orthogonal,
                                              pushers: { coord: Coord, distance: number }[])
    : { coord: Coord, distance: number }[]
    {
        const directionClosestPusher: MGPOptional<{ distance: number, coord: Coord }> =
            SiamRules.getLineClosestPusher(state, fallingCoord, direction);
        if (directionClosestPusher.isAbsent()) {
            return pushers;
        }
        const pusher: { distance: number, coord: Coord } = directionClosestPusher.get();
        const distance: number = pusher.distance;
        display(SiamRules.VERBOSE, 'new closest challenger');
        const pusherCoord: Coord = pusher.coord;
        // find who own that pushing piece found
        pushers.push({
            coord: pusherCoord,
            distance, // : distance + malus
        });
        return pushers;
    }
    public static getLineClosestPusher(state: SiamState,
                                       fallingCoord: Coord,
                                       direction: Orthogonal)
    : MGPOptional<{ distance: number, coord: Coord }>
    {
        display(SiamRules.VERBOSE,
                { getDirectionClosestPusher: { state, fallingCoord, direction: direction.toString() } });
        const resistance: Orthogonal = direction.getOpposite();
        let currentDistance: number = 1;
        let previousPiece: SiamPiece = state.getPieceAt(fallingCoord);
        let testedCoord: Coord = fallingCoord.getCopy();
        let almostPusher: MGPOptional<Coord> = MGPOptional.empty();
        let pusherFound: boolean = false;
        let mountainEncountered: boolean = false;
        let missingForce: number = 0;
        while (testedCoord.isInRange(5, 5) && pusherFound === false) {
            const currentPiece: SiamPiece = state.getPieceAt(testedCoord);
            if (currentPiece.isEmptyOrMountain()) {
                if (currentPiece === SiamPiece.MOUNTAIN) {
                    missingForce += 0.9;
                    mountainEncountered = true;
                } else { // Encountered empty space
                    currentDistance++;
                }
            } else { // Player found
                const playerOrientation: Orthogonal = currentPiece.getDirection();
                if (playerOrientation === direction) {
                    if (mountainEncountered) {
                        missingForce -= 1; // We count her as active pusher
                        // We found a piece pushing right in the good direction
                        if (missingForce <= 0) {// And she has enough force to push
                            pusherFound = true;
                            testedCoord = testedCoord.getNext(direction);
                        }
                    }
                } else if (playerOrientation === resistance) { // We found a piece resisting the pushing direction
                    missingForce += 1;
                    if (!mountainEncountered) {
                        currentDistance++;
                    }
                } else {
                    if (mountainEncountered) {
                        almostPusher = MGPOptional.of(testedCoord.getCopy());
                        if (previousPiece !== SiamPiece.EMPTY) {
                            currentDistance++;
                        }
                    } else {
                        currentDistance++;
                    }
                }
            }
            // Still no player there, let's go back further
            previousPiece = currentPiece;
            testedCoord = testedCoord.getPrevious(direction);
        }
        if (pusherFound === false && almostPusher.isPresent()) {
            currentDistance++;
            missingForce -= 1;
            while (testedCoord.equals(almostPusher.get()) === false) {
                testedCoord = testedCoord.getNext(direction);
                currentDistance--;
            }
        }
        if (testedCoord.isNotInRange(5, 5)) {
            missingForce -= 1;
            if (state.countPlayerPawn() === 5) {
                return MGPOptional.empty();
            }
        }
        if (missingForce > 0) {
            return MGPOptional.empty();
        }
        return MGPOptional.of({ distance: currentDistance, coord: testedCoord });
    }
    public static getPushingInsertions(node: SiamNode): SiamMove[] {
        const insertions: SiamMove[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        const newMoves: SiamMove[] = []; const insertedPieces: SiamPiece[] = [];
        for (let xOrY: number = 0; xOrY<5; xOrY++) {
            newMoves.push(new SiamMove(-1, xOrY, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT));
            insertedPieces.push(SiamPiece.of(Orthogonal.RIGHT, currentPlayer));
            newMoves.push(new SiamMove(5, xOrY, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT));
            insertedPieces.push(SiamPiece.of(Orthogonal.LEFT, currentPlayer));
            newMoves.push(new SiamMove(xOrY, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN));
            insertedPieces.push(SiamPiece.of(Orthogonal.DOWN, currentPlayer));
            newMoves.push(new SiamMove(xOrY, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP));
            insertedPieces.push(SiamPiece.of(Orthogonal.UP, currentPlayer));
        }
        for (let i: number = 0; i < newMoves.length; i++) {
            const legality: MGPFallible<SiamLegalityInformation> =
                this.isLegalForwarding(newMoves[i], node.gameState, insertedPieces[i]);
            if (legality.isSuccess()) {
                insertions.push(newMoves[i]);
            }
        }
        return insertions;
    }
    public static getDerapingInsertions(node: SiamNode): SiamMove[] {
        const insertions: SiamMove[] = [];
        const currentPlayer: Player = node.gameState.getCurrentPlayer();
        let newMove: SiamMove;
        let insertedPiece: SiamPiece;
        let legality: MGPFallible<SiamLegalityInformation>;
        for (let y: number =1; y<=3; y++) {
            newMove = new SiamMove(-1, y, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.UP);
            insertedPiece = SiamPiece.of(Orthogonal.UP, currentPlayer);
            legality = this.isLegalForwarding(newMove, node.gameState, insertedPiece);
            if (legality.isSuccess()) {
                insertions.push(newMove);

                // If this insertion is legal, then the same one in an opposite landing direction will be
                newMove = new SiamMove(-1, y, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.DOWN);
                insertedPiece = SiamPiece.of(Orthogonal.DOWN, currentPlayer);
                legality = this.isLegalForwarding(newMove, node.gameState, insertedPiece);
                insertions.push(newMove);
            }

            newMove = new SiamMove(5, y, MGPOptional.of(Orthogonal.LEFT), Orthogonal.UP);
            insertedPiece = SiamPiece.of(Orthogonal.UP, currentPlayer);
            legality = this.isLegalForwarding(newMove, node.gameState, insertedPiece);
            if (legality.isSuccess()) {
                insertions.push(newMove);

                // If this insertion is legal, then the same one in an opposite landing direction will be
                newMove = new SiamMove(5, y, MGPOptional.of(Orthogonal.LEFT), Orthogonal.DOWN);
                insertedPiece = SiamPiece.of(Orthogonal.DOWN, currentPlayer);
                legality = this.isLegalForwarding(newMove, node.gameState, insertedPiece);
                insertions.push(newMove);
            }
        }
        for (let x: number = 1; x<=3; x++) {
            newMove = new SiamMove(x, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.LEFT);
            insertedPiece = SiamPiece.of(Orthogonal.LEFT, currentPlayer);
            legality = this.isLegalForwarding(newMove, node.gameState, insertedPiece);
            if (legality.isSuccess()) {
                insertions.push(newMove);

                // If this insertion is legal, then the same one in an opposite landing direction will be
                newMove = new SiamMove(x, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.RIGHT);
                insertedPiece = SiamPiece.of(Orthogonal.RIGHT, currentPlayer);
                legality = this.isLegalForwarding(newMove, node.gameState, insertedPiece);
                insertions.push(newMove);
            }

            newMove = new SiamMove(x, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.LEFT);
            insertedPiece = SiamPiece.of(Orthogonal.LEFT, currentPlayer);
            legality = this.isLegalForwarding(newMove, node.gameState, insertedPiece);
            if (legality.isSuccess()) {
                insertions.push(newMove);

                // If this insertion is legal, then the same one in an opposite landing direction will be
                newMove = new SiamMove(x, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT);
                insertedPiece = SiamPiece.of(Orthogonal.RIGHT, currentPlayer);
                legality = this.isLegalForwarding(newMove, node.gameState, insertedPiece);
                insertions.push(newMove);
            }
        }
        return insertions;
    }
    public static getCoordDirection(x: number, y: number, state: SiamState): Orthogonal {
        const coord: Coord = new Coord(x, y);
        const insertedPiece: SiamPiece = this.getInsertedPiece(coord, state.getCurrentPlayer());
        return insertedPiece.getDirection();
    }
    public getGameStatus(node: SiamNode): GameStatus {
        const mountainsInfo: { rows: number[], columns: number[], nbMountain: number } =
            SiamRules.getMountainsRowsAndColumns(node.gameState);

        const winner: Player = SiamRules.getWinner(node.gameState,
                                                   node.move,
                                                   mountainsInfo.nbMountain);
        if (winner === Player.NONE) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.getVictory(winner);
        }
    }
}
