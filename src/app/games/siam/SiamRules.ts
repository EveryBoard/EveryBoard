import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { SiamMove } from './SiamMove';
import { SiamState } from './SiamState';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { SiamPiece } from './SiamPiece';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { display } from 'src/app/utils/utils';
import { SiamFailure } from './SiamFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { assert } from 'src/app/utils/assert';

export class SiamLegalityInformation {
    public constructor(public readonly resultingBoard: Table<SiamPiece>,
                       public readonly moved: Coord[]) {
    }
}

export class SiamNode extends MGPNode<SiamRules, SiamMove, SiamState, SiamLegalityInformation> {}

export class SiamRules extends Rules<SiamMove, SiamState, SiamLegalityInformation> {

    private static singleton: MGPOptional<SiamRules> = MGPOptional.empty();
    public static get(): SiamRules {
        if (SiamRules.singleton.isAbsent()) {
            SiamRules.singleton = MGPOptional.of(new SiamRules());
        }
        return SiamRules.singleton.get();
    }

    private constructor() {
        super(SiamState);
    }

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
            return this.isLegalForwarding(move, state, movingPiece);
        }
    }
    public isLegalInsertion(coord: Coord, state: SiamState): {insertedPiece: SiamPiece, legal: MGPValidation} {
        const numberOnBoard: number = state.countCurrentPlayerPawn();
        const currentPlayer: Player = state.getCurrentPlayer();
        const legal: MGPValidation = (numberOnBoard < 5) ?
            MGPValidation.SUCCESS :
            MGPValidation.failure(SiamFailure.NO_REMAINING_PIECE_TO_INSERT());
        const insertedPiece: SiamPiece = this.getInsertedPiece(coord, currentPlayer);
        return { insertedPiece, legal };
    }
    public getInsertedPiece(entrance: Coord, player: Player): SiamPiece {
        if (entrance.x === -1) return SiamPiece.of(Orthogonal.RIGHT, player);
        if (entrance.y === -1) return SiamPiece.of(Orthogonal.DOWN, player);
        if (entrance.x === 5) return SiamPiece.of(Orthogonal.LEFT, player);
        return SiamPiece.of(Orthogonal.UP, player);
    }
    public isLegalForwarding(move: SiamMove, state: SiamState, firstPiece: SiamPiece)
    : MGPFallible<SiamLegalityInformation> {
        display(SiamRules.VERBOSE, { isLegalForwarding: { move: move.toString(), state, firstPiece } });

        assert(firstPiece !== SiamPiece.MOUNTAIN && firstPiece !== SiamPiece.EMPTY, 'forwarding must be done with player piece');

        const movedPieces: Coord[] = [];
        let movingPiece: SiamPiece = SiamPiece.of(move.landingOrientation, state.getCurrentPlayer());
        const pushingDir: Orthogonal = move.direction.get();
        let landingCoord: Coord = move.coord.getNext(pushingDir);
        if (landingCoord.isInRange(5, 5) &&
            state.getPieceAt(landingCoord) !== SiamPiece.EMPTY &&
            this.isStraight(firstPiece, move) === false
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
    public isStraight(piece: SiamPiece, move: SiamMove): boolean {
        const pieceDirection: Orthogonal = piece.getDirection();
        return (move.direction.equalsValue(pieceDirection) &&
                pieceDirection === move.landingOrientation);
    }
    public isLegalRotation(rotation: SiamMove, state: SiamState): MGPFallible<SiamLegalityInformation> {
        display(SiamRules.VERBOSE, { isLegalRotation: { rotation, state } });

        const coord: Coord = rotation.coord;
        const currentPiece: SiamPiece = state.getPieceAt(coord);
        const currentPlayer: Player = state.getCurrentPlayer();
        if (currentPiece.getDirection() === rotation.landingOrientation) {
            return MGPFallible.failure(SiamFailure.MUST_MOVE_OR_ROTATE());
        }
        const resultingBoard: SiamPiece[][] = state.getCopiedBoard();
        resultingBoard[coord.y][coord.x] = SiamPiece.of(rotation.landingOrientation, currentPlayer);
        return MGPFallible.success(new SiamLegalityInformation(resultingBoard, [coord]));
    }
    public applyLegalMove(_move: SiamMove, state: SiamState, status: SiamLegalityInformation): SiamState {
        const newBoard: Table<SiamPiece> = ArrayUtils.copyBiArray(status.resultingBoard);
        const newTurn: number = state.turn + 1;
        const resultingState: SiamState = new SiamState(newBoard, newTurn);
        return resultingState;
    }
    public getBoardValueInfo(move: MGPOptional<SiamMove>, state: SiamState)
    : { shortestZero: number, shortestOne: number, boardValue: number }
    {
        const mountainsInfo: { rows: number[], columns: number[], nbMountain: number } =
            this.getMountainsRowsAndColumns(state);
        const mountainsRow: number[] = mountainsInfo.rows;
        const mountainsColumn: number[] = mountainsInfo.columns;

        const winner: PlayerOrNone = this.getWinner(state, move, mountainsInfo.nbMountain);
        if (winner.isPlayer()) { // 1. victories
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
        } else {
            const pushers: { distance: number, coord: Coord}[] =
                this.getPushers(state, mountainsColumn, mountainsRow);
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
            const boardValue: number =
                this.getScoreFromShortestDistances(zeroShortestDistance, oneShortestDistance, currentPlayer);
            return { shortestZero: zeroShortestDistance, shortestOne: oneShortestDistance, boardValue };
        }
    }
    public getScoreFromShortestDistances(zeroShortestDistance: number,
                                         oneShortestDistance: number,
                                         currentPlayer: Player)
    : number
    {
        if (zeroShortestDistance === Number.MAX_SAFE_INTEGER) zeroShortestDistance = 6;
        if (oneShortestDistance === Number.MAX_SAFE_INTEGER) oneShortestDistance = 6;
        const zeroScore: number = 6 - zeroShortestDistance;
        const oneScore: number = 6 - oneShortestDistance;
        if (zeroScore === oneScore) {
            return currentPlayer.getScoreModifier();
        } else if (zeroScore > oneScore) {
            return (-10 * (zeroScore + 1)) + (oneScore + 1);
        } else {
            return (10 * (oneScore + 1)) - (zeroScore + 1);
        }
    }
    public getMountainsRowsAndColumns(state: SiamState)
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
    public getWinner(state: SiamState, move: MGPOptional<SiamMove>, nbMountain: number): PlayerOrNone {
        if (nbMountain === 2) {
            return this.getPusher(state, move.get());
        } else {
            return PlayerOrNone.NONE;
        }
    }
    public getPusher(state: SiamState, finishingMove: SiamMove): PlayerOrNone {
        // here we will call the piece that started the move "moveStarter", obviously
        // and the piece in the right direction that was the closest to the falling mountain: the pusher

        const moveStarterCoord: Coord = finishingMove.coord;
        let moveStarterPiece: SiamPiece;
        if (moveStarterCoord.isInRange(5, 5)) {
            const moveStarterDir: Orthogonal = finishingMove.landingOrientation;
            moveStarterPiece = state.getPieceAt(moveStarterCoord.getNext(moveStarterDir));
        } else { // insertion
            moveStarterPiece = this.getInsertedPiece(moveStarterCoord, state.getCurrentOpponent());
        }
        const pushingDirection: Orthogonal = moveStarterPiece.getDirection();
        const pusherCoord: Coord = this.getPusherCoord(state, pushingDirection, moveStarterCoord);
        const winner: PlayerOrNone = state.getPieceAt(pusherCoord).getOwner();
        display(SiamRules.VERBOSE, moveStarterCoord.toString() + ' belong to ' + state.getCurrentOpponent().value + ', ' +
                pusherCoord.toString() + ' belong to ' + winner.value + ', ' + winner.value + ' win');
        return winner;
    }
    public getPusherCoord(state: SiamState, pushingDirection: Orthogonal, pusher: Coord): Coord {
        let pushed: Coord = pusher.getNext(pushingDirection);
        let lastCorrectPusher: Coord = pusher;
        while (pushed.isInRange(5, 5)) {
            pusher = pushed;
            pushed = pushed.getNext(pushingDirection);
            const pushingPiece: SiamPiece = state.getPieceAt(pusher);
            if (pushingPiece !== SiamPiece.MOUNTAIN && pushingPiece.getDirection() === pushingDirection) {
                lastCorrectPusher = pusher;
            }
        }
        return lastCorrectPusher;
    }
    public getPushers(state: SiamState,
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

            pushers = this.addPotentialDirectionPusher(state, fallingCoord, direction, pushers);
        }
        return pushers;
    }
    public addPotentialDirectionPusher(state: SiamState,
                                       fallingCoord: Coord,
                                       direction: Orthogonal,
                                       pushers: { coord: Coord, distance: number }[])
    : { coord: Coord, distance: number }[]
    {
        const directionClosestPusher: MGPOptional<{ distance: number, coord: Coord }> =
            this.getLineClosestPusher(state, fallingCoord, direction);
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
    public getLineClosestPusher(state: SiamState,
                                fallingCoord: Coord,
                                direction: Orthogonal)
    : MGPOptional<{ distance: number, coord: Coord }>
    {
        display(SiamRules.VERBOSE,
                { getDirectionClosestPusher: { state, fallingCoord, direction: direction.toString() } });
        const resistance: Orthogonal = direction.getOpposite();
        let currentDistance: number = 1;
        let previousPiece: SiamPiece = state.getPieceAt(fallingCoord);
        let testedCoord: Coord = fallingCoord;
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
                        almostPusher = MGPOptional.of(testedCoord);
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
            if (state.countCurrentPlayerPawn() === 5) {
                return MGPOptional.empty();
            }
        }
        if (missingForce > 0) {
            return MGPOptional.empty();
        }
        return MGPOptional.of({ distance: currentDistance, coord: testedCoord });
    }
    public getInsertions(state: SiamState): SiamMove[] {
        let moves: SiamMove[] = [];
        for (let xOrY: number = 1; xOrY < 4; xOrY++) {
            moves = moves.concat(this.getInsertionsAt(state, 0, xOrY));
            moves = moves.concat(this.getInsertionsAt(state, 4, xOrY));
            moves = moves.concat(this.getInsertionsAt(state, xOrY, 0));
            moves = moves.concat(this.getInsertionsAt(state, xOrY, 4));
        }
        moves = moves.concat(this.getInsertionsAt(state, 0, 0));
        moves = moves.concat(this.getInsertionsAt(state, 0, 4));
        moves = moves.concat(this.getInsertionsAt(state, 4, 0));
        moves = moves.concat(this.getInsertionsAt(state, 4, 4));
        return moves;
    }
    public getInsertionsAt(state: SiamState, x: number, y: number): SiamMove[] {
        const moves: SiamMove[] = [];
        for (const direction of Orthogonal.ORTHOGONALS) {
            const entrance: Coord = new Coord(x, y).getPrevious(direction);
            if (entrance.isNotInRange(5, 5)) {
                for (const orientation of Orthogonal.ORTHOGONALS) {
                    const move: MGPFallible<SiamMove> =
                        SiamMove.of(entrance.x, entrance.y, MGPOptional.of(direction), orientation);
                    assert(move.isSuccess(), 'SiamRules.getInsertionsAt should only construct valid insertions');
                    const legality: MGPFallible<SiamLegalityInformation> = this.isLegal(move.get(), state);
                    if (legality.isSuccess()) {
                        moves.push(move.get());
                    }
                }
            }
        }
        return moves;
    }
    public getMovesFrom(state: SiamState, piece: SiamPiece, x: number, y: number): SiamMove[] {
        const coord: Coord = new Coord(x, y);
        // Three rotations
        let moves: SiamMove[] = this.getRotationMovesAt(coord, piece);

        for (const direction of Orthogonal.ORTHOGONALS) {
            // All legal forward moves
            const landingCoord: Coord = coord.getNext(direction);
            moves = moves.concat(this.getForwardMovesBetween(state, coord, landingCoord));
        }
        return moves;
    }
    public getMovesBetween(state: SiamState, piece: SiamPiece, start: Coord, end: Coord): SiamMove[] {
        if (start.equals(end)) {
            return this.getRotationMovesAt(start, piece);
        } else {
            const directionOpt: MGPFallible<Orthogonal> = Orthogonal.factory.fromMove(start, end);
            if (directionOpt.isSuccess() && start.getDistance(end) === 1) {
                return this.getForwardMovesBetween(state, start, end);
            } else {
                // There are no possible moves here
                return [];
            }
        }
    }
    public getRotationMovesAt(coord: Coord, piece: SiamPiece): SiamMove[] {
        const moves: SiamMove[] = [];
        const currentOrientation: Orthogonal = piece.getDirection();
        for (const direction of Orthogonal.ORTHOGONALS) {
            if (direction !== currentOrientation) {
                const newMove: SiamMove = SiamMove.of(coord.x, coord.y, MGPOptional.empty(), direction).get();
                moves.push(newMove);
            }
        }
        return moves;
    }
    public getForwardMovesBetween(state: SiamState,
                                  start: Coord,
                                  end: Coord)
    : SiamMove[]
    {
        const moves: SiamMove[] = [];
        let orientations: ReadonlyArray<Orthogonal>;
        const direction: Orthogonal = Orthogonal.factory.fromMove(start, end).get();
        const piece: SiamPiece = state.getPieceAt(start);
        if (end.isInRange(5, 5)) {
            orientations = Orthogonal.ORTHOGONALS;
        } else {
            orientations = [direction];
        }
        for (const orientation of orientations) {
            const move: SiamMove = SiamMove.of(start.x, start.y, MGPOptional.of(direction), orientation).get();
            const legality: MGPFallible<SiamLegalityInformation> = this.isLegalForwarding(move, state, piece);
            if (legality.isSuccess()) {
                moves.push(move);
            }
        }
        return moves;
    }
    public getGameStatus(node: SiamNode): GameStatus {
        const mountainsInfo: { rows: number[], columns: number[], nbMountain: number } =
            this.getMountainsRowsAndColumns(node.gameState);

        const winner: PlayerOrNone = this.getWinner(node.gameState, node.move, mountainsInfo.nbMountain);
        if (winner.isPlayer()) {
            return GameStatus.getVictory(winner);
        } else {
            return GameStatus.ONGOING;
        }
    }
}
