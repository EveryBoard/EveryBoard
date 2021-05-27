import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { SiamMove } from './SiamMove';
import { SiamPartSlice } from './SiamPartSlice';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { SiamPiece } from './SiamPiece';
import { Player } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { SiamLegalityStatus } from './SiamLegalityStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { SiamFailure } from './SiamFailure';

abstract class _SiamRules extends Rules<SiamMove, SiamPartSlice, SiamLegalityStatus> {}

export abstract class SiamNode extends MGPNode<_SiamRules, SiamMove, SiamPartSlice, SiamLegalityStatus> {}

export class SiamRules extends _SiamRules {

    public static VERBOSE: boolean = false;

    public isLegal(move: SiamMove, slice: SiamPartSlice): SiamLegalityStatus {
        display(SiamRules.VERBOSE, { SiamRules_isLegal: { move, slice } });

        if (!move.isInsertion()) {
            const movedPiece: number = slice.getBoardAt(move.coord);
            if (!SiamPiece.belongTo(movedPiece, slice.getCurrentPlayer())) {
                return SiamLegalityStatus.failure('piece does not belong to current player');
            }
        }
        if (move.isRotation()) {
            display(SiamRules.VERBOSE, 'Move is rotation');
            return this.isLegalRotation(move, slice);
        } else {
            let movingPiece: number;
            if (move.isInsertion()) {
                display(SiamRules.VERBOSE, 'Move is insertion');
                const insertionInfo: {insertedPiece: number, legal: MGPValidation} =
                    this.isLegalInsertion(move.coord, slice);
                if (insertionInfo.legal.isFailure()) return { legal: insertionInfo.legal, resultingBoard: null };
                movingPiece = insertionInfo.insertedPiece;
            } else {
                display(SiamRules.VERBOSE, 'Move is forward');
                movingPiece = slice.getBoardAt(move.coord);
            }
            return SiamRules.isLegalForwarding(move, slice, movingPiece);
        }
    }
    public isLegalInsertion(coord: Coord, slice: SiamPartSlice): {insertedPiece: number, legal: MGPValidation} {
        const numberOnBoard: number = slice.countPlayerPawn();
        const currentPlayer: Player = slice.getCurrentPlayer();
        const legal: MGPValidation = (numberOnBoard < 5) ?
            MGPValidation.SUCCESS :
            MGPValidation.failure('Vous ne pouvez plus insérer, toutes vos pièces sont déjà sur le plateau!');
        const insertedPiece: number = SiamRules.getInsertedPiece(coord, currentPlayer).value;
        return { insertedPiece, legal };
    }
    public static getInsertedPiece(entrance: Coord, player: Player): SiamPiece {
        if (entrance.x === -1) return SiamPiece.of(Orthogonal.RIGHT, player);
        if (entrance.y === -1) return SiamPiece.of(Orthogonal.DOWN, player);
        if (entrance.x === 5) return SiamPiece.of(Orthogonal.LEFT, player);
        return SiamPiece.of(Orthogonal.UP, player);
    }
    public static isLegalForwarding(move: SiamMove, slice: SiamPartSlice, firstPiece: number): SiamLegalityStatus {
        display(SiamRules.VERBOSE, { isLegalForwarding: { move: move.toString(), slice, firstPiece } });

        let movingPiece: number = SiamPiece.of(move.landingOrientation, slice.getCurrentPlayer()).value;
        const pushingDir: Orthogonal = move.moveDirection.get();
        let landingCoord: Coord = move.coord.getNext(pushingDir);
        if (landingCoord.isInRange(5, 5) &&
            slice.getBoardAt(landingCoord) !== SiamPiece.EMPTY.value &&
            SiamRules.isStraight(firstPiece, move) === false
        ) {
            display(SiamRules.VERBOSE,
                    'Illegal push because not straight or not pushing anything or leaving the board');
            return SiamLegalityStatus.failure(SiamFailure.ILLEGAL_PUSH);
        }
        let currentDirection: Orthogonal = pushingDir;
        const resistingDir: Orthogonal = pushingDir.getOpposite();
        let totalForce: number = 0;
        const resultingBoard: number[][] = slice.getCopiedBoard();
        if (move.coord.isInRange(5, 5)) {
            resultingBoard[move.coord.y][move.coord.x] = SiamPiece.EMPTY.value;
        }
        let pushingPossible: boolean = landingCoord.isInRange(5, 5) &&
                                       movingPiece !== SiamPiece.EMPTY.value;

        while (pushingPossible) {
            if (pushingDir.equals(currentDirection)) {
                totalForce++;
            } else if (resistingDir.equals(currentDirection)) {
                totalForce--;
            }
            display(SiamRules.VERBOSE, { totalForce, movingPiece, landingCoord });
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
            display(SiamRules.VERBOSE, 'This movement would push ' + movingPiece + ' outside the board');

            if (pushingDir.equals(currentDirection)) {
                totalForce++;
            } else if (resistingDir.equals(currentDirection)) {
                totalForce--;
            }
        }
        if (totalForce <= 0) {
            display(SiamRules.VERBOSE, 'This move is an illegal push: ' + resultingBoard);
            return SiamLegalityStatus.failure('Move is an illegal push');
        }

        display(SiamRules.VERBOSE, 'This move is a legal push: '+resultingBoard);
        return { legal: MGPValidation.SUCCESS, resultingBoard };
    }
    public static isStraight(piece: number, move: SiamMove): boolean {
        const siamPiece: SiamPiece = SiamPiece.decode(piece);
        const pieceDirection: Orthogonal = siamPiece.getDirection();
        return (pieceDirection === move.moveDirection.getOrNull() &&
                pieceDirection === move.landingOrientation);
    }
    public isLegalRotation(rotation: SiamMove, slice: SiamPartSlice): SiamLegalityStatus {
        display(SiamRules.VERBOSE, { isLegalRotation: { rotation, slice } });

        const c: Coord = rotation.coord;
        const currentPiece: number = slice.getBoardAt(c);
        const currentPlayer: Player = slice.getCurrentPlayer();
        if (SiamPiece.getDirection(currentPiece) === rotation.landingOrientation) {
            return { legal: MGPValidation.failure('wrong rotation direction'), resultingBoard: null };
        }
        const resultingBoard: number[][] = slice.getCopiedBoard();
        resultingBoard[c.y][c.x] = SiamPiece.of(rotation.landingOrientation, currentPlayer).value;
        return { legal: MGPValidation.SUCCESS, resultingBoard };
    }
    public applyLegalMove(move: SiamMove,
                          slice: SiamPartSlice,
                          status: SiamLegalityStatus)
    : SiamPartSlice
    {
        const newBoard: number[][] = status.resultingBoard;
        const newTurn: number = slice.turn + 1;
        const resultingSlice: SiamPartSlice = new SiamPartSlice(newBoard, newTurn);
        return resultingSlice;
    }
    public static getBoardValueInfo(move: SiamMove,
                                    slice: SiamPartSlice)
    : { shortestZero: number, shortestOne: number, boardValue: number }
    {
        const mountainsInfo: { rows: number[], columns: number[], nbMountain: number } =
            SiamRules.getMountainsRowsAndColumns(slice);
        const mountainsRow: number[] = mountainsInfo.rows;
        const mountainsColumn: number[] = mountainsInfo.columns;

        const winner: Player = SiamRules.getWinner(slice, move, mountainsInfo.nbMountain);
        if (winner === Player.NONE) {
            const pushers: { distance: number, coord: Coord}[] =
                SiamRules.getPushers(slice, mountainsColumn, mountainsRow);
            let zeroShortestDistance: number = Number.MAX_SAFE_INTEGER;
            let oneShortestDistance: number = Number.MAX_SAFE_INTEGER;
            const currentPlayer: Player = slice.getCurrentPlayer();
            for (const pusher of pushers) {
                if (pusher.coord.isInRange(5, 5)) {
                    const piece: number = slice.getBoardAt(pusher.coord);
                    if (SiamPiece.belongTo(piece, Player.ZERO)) {
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
    public static getMountainsRowsAndColumns(slice: SiamPartSlice)
    : { rows: number[], columns: number[], nbMountain: number }
    {
        const rows: number[] = [];
        const columns: number[] = [];
        let nbMountain: number = 0;
        for (let y: number = 0; y<5; y++) {
            for (let x: number = 0; x<5; x++) {
                if (slice.getBoardByXY(x, y) === SiamPiece.MOUNTAIN.value) {
                    if (!rows.includes(y)) rows.push(y);
                    if (!columns.includes(x)) columns.push(x);
                    nbMountain++;
                }
            }
        }
        return { rows, columns, nbMountain };
    }
    public static getWinner(slice: SiamPartSlice, move: SiamMove, nbMountain: number): Player {
        if (nbMountain === 2) {
            return SiamRules.getPusher(slice, move);
        } else {
            return Player.NONE;
        }
    }
    public static getPusher(slice: SiamPartSlice, finishingMove: SiamMove): Player {
        // here we will call the piece that started the move "moveStarter", obviously
        // and the piece in the right direction that was the closest to the falling mountain: the pusher

        const moveStarterCoord: Coord = finishingMove.coord;
        let moveStarterPiece: number;
        if (moveStarterCoord.isInRange(5, 5)) {
            const moveStarterDir: Orthogonal = finishingMove.landingOrientation;
            moveStarterPiece = slice.getBoardAt(moveStarterCoord.getNext(moveStarterDir));
        } else { // insertion
            moveStarterPiece = SiamRules.getInsertedPiece(moveStarterCoord, slice.getCurrentEnnemy()).value;
        }
        const pushingDirection: Orthogonal = SiamPiece.getDirection(moveStarterPiece);
        const pusherCoord: Coord = SiamRules.getPusherCoord(slice, pushingDirection, moveStarterCoord);
        const winner: Player = SiamPiece.getOwner(slice.getBoardAt(pusherCoord));
        display(SiamRules.VERBOSE, moveStarterCoord.toString() + ' belong to ' + slice.getCurrentEnnemy().value + ', ' +
                pusherCoord.toString() + ' belong to ' + winner.value + ', ' + winner.value + ' win');
        return winner;
    }
    public static getPusherCoord(slice: SiamPartSlice, pushingDirection: Orthogonal, pusher: Coord): Coord {
        let pushed: Coord = pusher.getNext(pushingDirection);
        let lastCorrectPusher: Coord = pusher;
        while (pushed.isInRange(5, 5)) {
            pusher = pushed;
            pushed = pushed.getNext(pushingDirection);
            const pushingPiece: SiamPiece = SiamPiece.decode(slice.getBoardAt(pusher));
            // TODO: test when mountain amongst the pushers
            if (pushingPiece !== SiamPiece.MOUNTAIN && pushingPiece.getDirection() === pushingDirection) {
                lastCorrectPusher = pusher;
            }
        }
        return lastCorrectPusher;
    }
    public static getPushers(slice: SiamPartSlice,
                             mountainsColumn: number[],
                             mountainsRow: number[])
    : { coord: Coord; distance: number; }[]
    {
        display(SiamRules.VERBOSE, { getPushers: { slice, mountainsColumn, mountainsRow } });
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

            pushers = SiamRules.addPotentialDirectionPusher(slice, fallingCoord, direction, pushers);
        }
        return pushers;
    }
    public static addPotentialDirectionPusher(slice: SiamPartSlice,
                                              fallingCoord: Coord,
                                              direction: Orthogonal,
                                              pushers: { coord: Coord, distance: number }[])
    : { coord: Coord, distance: number }[]
    {
        const directionClosestPusher: MGPOptional<{ distance: number, coord: Coord }> =
            SiamRules.getLineClosestPusher(slice, fallingCoord, direction);
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
    public static getLineClosestPusher(slice: SiamPartSlice,
                                       fallingCoord: Coord,
                                       direction: Orthogonal)
    : MGPOptional<{ distance: number, coord: Coord }>
    {
        display(SiamRules.VERBOSE,
                { getDirectionClosestPusher: { slice, fallingCoord, direction: direction.toString() } });
        const resistance: Orthogonal = direction.getOpposite();
        let currentDistance: number = 1;
        let previousPiece: number = slice.getBoardAt(fallingCoord);
        let testedCoord: Coord = fallingCoord.getCopy();
        let almostPusher: Coord;
        let pusherFound: boolean = false;
        let mountainEncountered: boolean = false;
        let missingForce: number = 0;
        while (testedCoord.isInRange(5, 5) && pusherFound === false) {
            const currentPiece: number = slice.getBoardAt(testedCoord);
            display(SiamRules.VERBOSE, { testedCoord: testedCoord.toString(), currentDistance, currentPiece });
            if (SiamPiece.isEmptyOrMountain(currentPiece)) {
                if (currentPiece === SiamPiece.MOUNTAIN.value) {
                    display(SiamRules.VERBOSE, 'found mountain');
                    missingForce += 0.9;
                    mountainEncountered = true;
                } else { // Encountered empty case
                    display(SiamRules.VERBOSE, 'found empty place');
                    currentDistance++;
                }
            } else { // Player found
                const playerOrientation: Orthogonal = SiamPiece.getDirection(currentPiece);
                if (playerOrientation === direction) {
                    if (mountainEncountered) {
                        missingForce -= 1; // We count her as active pusher
                        // We found a piece pushing right in the good direction
                        if (missingForce > 0) { // But she can't push by herself
                            display(SiamRules.VERBOSE, 'found WEEAAK pushing player');
                            // weakPusher are the one counsidered as winner in case of victory, whoever played
                        } else { // And she has enough force to push
                            display(SiamRules.VERBOSE, 'found STRRRONG pushing player at ' + testedCoord.toString());
                            pusherFound = true;
                            testedCoord = testedCoord.getNext(direction);
                        }
                    } else {
                        display(SiamRules.VERBOSE, 'found pushing player that might be pushed out before the mountain');
                    }
                } else if (playerOrientation === resistance) {
                    display(SiamRules.VERBOSE, 'found resisting player');
                    // We found a piece resisting the pushing direction
                    missingForce += 1;
                    if (!mountainEncountered) {
                        display(SiamRules.VERBOSE, 'he his before the mountain, we\'ll have to push longer');
                        currentDistance++;
                    }
                } else {
                    display(SiamRules.VERBOSE, 'found a sideway almost-pusher');
                    if (mountainEncountered) {
                        almostPusher = testedCoord.getCopy();
                        if (previousPiece !== SiamPiece.EMPTY.value) {
                            display(SiamRules.VERBOSE, 'his orientation will slow him down');
                            currentDistance++;
                        }
                    } else {
                        currentDistance++;
                        display(SiamRules.VERBOSE, 'he\'ll get pushed out before the mountain');
                    }
                }
            }
            // Still no player there, let's go back further
            previousPiece = currentPiece;
            testedCoord = testedCoord.getPrevious(direction);
        }
        display(SiamRules.VERBOSE, { testedCoord: testedCoord.toString(), loopResultingDistance: currentDistance });
        if (pusherFound === false && almostPusher != null) {
            currentDistance++;
            missingForce -= 1;
            display(SiamRules.VERBOSE, 'no pusher found but found one sideway guy');
            while (testedCoord.equals(almostPusher) === false) {
                display(SiamRules.VERBOSE, 'he was one piece backward');
                testedCoord = testedCoord.getNext(direction);
                currentDistance--;
            }
        }
        if (testedCoord.isNotInRange(5, 5)) {
            missingForce -= 1;
            display(SiamRules.VERBOSE, 'we end up out of the board');
            if (slice.countPlayerPawn() === 5) {
                display(SiamRules.VERBOSE, 'and we cannot insert');
                return MGPOptional.empty();
            }
        }
        if (missingForce > 0) {
            display(SiamRules.VERBOSE, 'we end up with not enough force to push');
            return MGPOptional.empty();
        }
        return MGPOptional.of({ distance: currentDistance, coord: testedCoord });
    }
    public static getPushingInsertions(node: SiamNode): SiamMove[] {
        const insertions: SiamMove[] = [];
        const currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        const newMoves: SiamMove[] = []; const insertedPieces: number[] = [];
        for (let xOrY: number = 0; xOrY<5; xOrY++) {
            newMoves.push(new SiamMove(-1, xOrY, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT));
            insertedPieces.push(SiamPiece.of(Orthogonal.RIGHT, currentPlayer).value);
            newMoves.push(new SiamMove(5, xOrY, MGPOptional.of(Orthogonal.LEFT), Orthogonal.LEFT));
            insertedPieces.push(SiamPiece.of(Orthogonal.LEFT, currentPlayer).value);
            newMoves.push(new SiamMove(xOrY, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.DOWN));
            insertedPieces.push(SiamPiece.of(Orthogonal.DOWN, currentPlayer).value);
            newMoves.push(new SiamMove(xOrY, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.UP));
            insertedPieces.push(SiamPiece.of(Orthogonal.UP, currentPlayer).value);
        }
        let legality: SiamLegalityStatus;
        for (let i: number = 0; i < newMoves.length; i++) {
            legality = this.isLegalForwarding(newMoves[i], node.gamePartSlice, insertedPieces[i]);
            if (legality.legal.isSuccess()) {
                insertions.push(newMoves[i]);
            }
        }
        return insertions;
    }
    public static getDerapingInsertions(node: SiamNode): SiamMove[] {
        const insertions: SiamMove[] = [];
        const currentPlayer: Player = node.gamePartSlice.getCurrentPlayer();
        let newMove: SiamMove; let insertedPiece: number;
        let legality: SiamLegalityStatus;
        for (let y: number =1; y<=3; y++) {
            newMove = new SiamMove(-1, y, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.UP);
            insertedPiece = SiamPiece.of(Orthogonal.UP, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal.isSuccess()) {
                insertions.push(newMove);

                // If this insertion is legal, then the same one in an opposite landing direction will be
                newMove = new SiamMove(-1, y, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.DOWN);
                insertedPiece = SiamPiece.of(Orthogonal.DOWN, currentPlayer).value;
                legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
                insertions.push(newMove);
            }

            newMove = new SiamMove(5, y, MGPOptional.of(Orthogonal.LEFT), Orthogonal.UP);
            insertedPiece = SiamPiece.of(Orthogonal.UP, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal.isSuccess()) {
                insertions.push(newMove);

                // If this insertion is legal, then the same one in an opposite landing direction will be
                newMove = new SiamMove(5, y, MGPOptional.of(Orthogonal.LEFT), Orthogonal.DOWN);
                insertedPiece = SiamPiece.of(Orthogonal.DOWN, currentPlayer).value;
                legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
                insertions.push(newMove);
            }
        }
        for (let x: number = 1; x<=3; x++) {
            newMove = new SiamMove(x, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.LEFT);
            insertedPiece = SiamPiece.of(Orthogonal.LEFT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal.isSuccess()) {
                insertions.push(newMove);

                // If this insertion is legal, then the same one in an opposite landing direction will be
                newMove = new SiamMove(x, -1, MGPOptional.of(Orthogonal.DOWN), Orthogonal.RIGHT);
                insertedPiece = SiamPiece.of(Orthogonal.RIGHT, currentPlayer).value;
                legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
                insertions.push(newMove);
            }

            newMove = new SiamMove(x, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.LEFT);
            insertedPiece = SiamPiece.of(Orthogonal.LEFT, currentPlayer).value;
            legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
            if (legality.legal.isSuccess()) {
                insertions.push(newMove);

                // If this insertion is legal, then the same one in an opposite landing direction will be
                newMove = new SiamMove(x, 5, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT);
                insertedPiece = SiamPiece.of(Orthogonal.RIGHT, currentPlayer).value;
                legality = this.isLegalForwarding(newMove, node.gamePartSlice, insertedPiece);
                insertions.push(newMove);
            }
        }
        return insertions;
    }
    public static getCoordDirection(x: number, y: number, slice: SiamPartSlice): Orthogonal {
        const coord: Coord = new Coord(x, y);
        const insertedPiece: SiamPiece = this.getInsertedPiece(coord, slice.getCurrentPlayer());
        return insertedPiece.getDirection();
    }
    public getGameStatus(node: SiamNode): GameStatus {
        const mountainsInfo: { rows: number[], columns: number[], nbMountain: number } =
            SiamRules.getMountainsRowsAndColumns(node.gamePartSlice);

        const winner: Player = SiamRules.getWinner(node.gamePartSlice, node.move, mountainsInfo.nbMountain);
        if (winner === Player.NONE) {
            return GameStatus.ONGOING;
        } else {
            return GameStatus.getVictory(winner);
        }
    }
}
