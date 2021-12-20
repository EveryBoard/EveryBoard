import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GoState, Phase, GoPiece } from './GoState';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { GoMove } from './GoMove';
import { Player } from 'src/app/jscaip/Player';
import { GoGroupDatas } from './GoGroupsDatas';
import { assert, display, Utils } from 'src/app/utils/utils';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { Coord } from 'src/app/jscaip/Coord';
import { GoGroupDatasFactory } from './GoGroupDatasFactory';
import { GoFailure } from './GoFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export type GoLegalityInformation = Coord[];

export class GoNode extends MGPNode<GoRules, GoMove, GoState, GoLegalityInformation> {}

export class GoRules extends Rules<GoMove, GoState, GoLegalityInformation> {

    public static VERBOSE: boolean = false;

    public static isLegal(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE ||LOCAL_VERBOSE, { isLegal: { move, state } });

        if (GoRules.isPass(move)) {
            const playing: boolean = state.phase === Phase.PLAYING;
            const passed: boolean = state.phase === Phase.PASSED;
            display(GoRules.VERBOSE ||LOCAL_VERBOSE,
                    'GoRules.isLegal at ' + state.phase + ((playing || passed) ? ' forbid' : ' allowed') +
                ' passing on ' + state.getCopiedBoard());
            if (playing || passed) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE());
            }
        } else if (GoRules.isAccept(move)) {
            const counting: boolean = state.phase === Phase.COUNTING;
            const accept: boolean = state.phase === Phase.ACCEPT;
            if (counting || accept) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE());
            }
        }
        if (GoRules.isOccupied(move.coord, state.getCopiedBoard())) {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegal: move is marking');
            const legal: boolean = GoRules.isLegalDeadMarking(move, state);
            if (legal) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.OCCUPIED_INTERSECTION());
            }
        } else {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegal: move is normal stuff: ' + move.toString());
            return GoRules.isLegalNormalMove(move, state);
        }
    }
    public static getNewKo(move: GoMove, newBoard: GoPiece[][], captures: Coord[]): MGPOptional<Coord> {
        if (captures.length === 1) {
            const captured: Coord = captures[0];
            const capturerCoord: Coord = move.coord;
            const capturer: GoPiece = newBoard[capturerCoord.y][capturerCoord.x];
            const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
            const capturersInfo: GoGroupDatas =
                goGroupDatasFactory.getGroupDatas(capturerCoord, newBoard) as GoGroupDatas;
            const capturersFreedoms: Coord[] = capturersInfo.emptyCoords;
            const capturersGroup: Coord[] =
                GoPiece.pieceBelongTo(capturer, Player.ZERO) ? capturersInfo.blackCoords : capturersInfo.whiteCoords;
            if (capturersFreedoms.length === 1 &&
                capturersFreedoms[0].equals(captured) &&
                capturersGroup.length === 1) {
                return MGPOptional.of(captured);
            }
        }
        return MGPOptional.empty();
    }
    public static markTerritoryAndCount(state: GoState): GoState {
        display(GoRules.VERBOSE, { markTerritoryAndCount: { state } });
        const resultingBoard: GoPiece[][] = state.getCopiedBoard();
        const emptyZones: GoGroupDatas[] = GoRules.getTerritoryLikeGroup(state);
        const captured: number[] = state.getCapturedCopy();

        for (const emptyZone of emptyZones) {
            const pointMaker: GoPiece = emptyZone.getWrapper();
            if (pointMaker === GoPiece.WHITE) {
                // white territory
                captured[1] += emptyZone.emptyCoords.length;
                for (const territory of emptyZone.getCoords()) {
                    resultingBoard[territory.y][territory.x] = GoPiece.WHITE_TERRITORY;
                }
            } else {
                assert(pointMaker === GoPiece.BLACK, 'territory should be wrapped by black or white, not by ' + pointMaker.toString());
                // black territory
                captured[0] += emptyZone.emptyCoords.length;
                for (const territory of emptyZone.getCoords()) {
                    resultingBoard[territory.y][territory.x] = GoPiece.BLACK_TERRITORY;
                }
            }
        }
        return new GoState(resultingBoard, captured, state.turn, state.koCoord, state.phase);
    }
    public static removeAndSubstractTerritory(state: GoState): GoState {
        const resultingBoard: GoPiece[][] = state.getCopiedBoard();
        const captured: number[] = state.getCapturedCopy();
        let currentPiece: GoPiece;
        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[0].length; x++) {
                currentPiece = resultingBoard[y][x];
                if (currentPiece === GoPiece.BLACK_TERRITORY) {
                    resultingBoard[y][x] = GoPiece.EMPTY;
                    captured[0] = captured[0] - 1;
                } else if (currentPiece === GoPiece.WHITE_TERRITORY) {
                    resultingBoard[y][x] = GoPiece.EMPTY;
                    captured[1] = captured[1] - 1;
                }
            }
        }
        return new GoState(resultingBoard, captured, state.turn, state.koCoord, state.phase);
    }
    public static getEmptyZones(deadlessState: GoState): GoGroupDatas[] {
        return GoRules.getGroupsDatasWhere(deadlessState.getCopiedBoard(), (pawn: GoPiece) => pawn.isEmpty());
    }
    public static getGroupsDatasWhere(board: GoPiece[][], condition: (pawn: GoPiece) => boolean): GoGroupDatas[] {
        const groups: GoGroupDatas[] = [];
        let coord: Coord;
        let group: GoGroupDatas;
        let currentCase: GoPiece;
        const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                coord = new Coord(x, y);
                currentCase = board[y][x];
                if (condition(currentCase)) {
                    if (!groups.some((currentGroup: GoGroupDatas) => currentGroup.selfContains(coord))) {
                        group = goGroupDatasFactory.getGroupDatas(coord, board) as GoGroupDatas;
                        groups.push(group);
                    }
                }
            }
        }
        return groups;
    }
    public static addDeadToScore(state: GoState): number[] {
        const captured: number[] = state.getCapturedCopy();
        let whiteScore: number = captured[1];
        let blackScore: number = captured[0];
        let currentCase: GoPiece;
        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[0].length; x++) {
                currentCase = state.getPieceAtXY(x, y);
                if (currentCase === GoPiece.DEAD_BLACK) {
                    whiteScore++;
                } else if (currentCase === GoPiece.DEAD_WHITE) {
                    blackScore++;
                }
            }
        }
        return [blackScore, whiteScore];
    }
    public static switchAliveness(groupCoord: Coord, switchedState: GoState): GoState {
        const switchedBoard: GoPiece[][] = switchedState.getCopiedBoard();
        const switchedPiece: GoPiece = switchedBoard[groupCoord.y][groupCoord.x];
        assert(switchedPiece.isEmpty() === false, `Can't switch emptyness aliveness`);

        const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
        const group: GoGroupDatas = goGroupDatasFactory.getGroupDatas(groupCoord, switchedBoard) as GoGroupDatas;
        const captured: number[] = switchedState.getCapturedCopy();
        switch (group.color) {
            case GoPiece.DEAD_BLACK:
                captured[1] -= 2 * group.deadBlackCoords.length;
                for (const deadBlackCoord of group.deadBlackCoords) {
                    switchedBoard[deadBlackCoord.y][deadBlackCoord.x] = GoPiece.BLACK;
                }
                break;
            case GoPiece.DEAD_WHITE:
                captured[0] -= 2 * group.deadWhiteCoords.length;
                for (const deadWhiteCoord of group.deadWhiteCoords) {
                    switchedBoard[deadWhiteCoord.y][deadWhiteCoord.x] = GoPiece.WHITE;
                }
                break;
            case GoPiece.WHITE:
                captured[0] += 2 * group.whiteCoords.length;
                for (const whiteCoord of group.whiteCoords) {
                    switchedBoard[whiteCoord.y][whiteCoord.x] = GoPiece.DEAD_WHITE;
                }
                break;
            default:
                Utils.expectToBe(group.color, GoPiece.BLACK);
                captured[1] += 2 * group.blackCoords.length;
                for (const blackCoord of group.blackCoords) {
                    switchedBoard[blackCoord.y][blackCoord.x] = GoPiece.DEAD_BLACK;
                }
                break;
        }
        return new GoState(switchedBoard,
                           captured,
                           switchedState.turn,
                           switchedState.koCoord,
                           switchedState.phase);
    }
    public static getGameStatus(node: GoNode): GameStatus {
        const state: GoState = node.gameState;
        if (state.phase === Phase.FINISHED) {
            if (state.captured[0] > state.captured[1]) {
                return GameStatus.ZERO_WON;
            } else if (state.captured[1] > state.captured[0]) {
                return GameStatus.ONE_WON;
            } else {
                return GameStatus.DRAW;
            }
        } else {
            return GameStatus.ONGOING;
        }
    }
    private static isPass(move: GoMove): boolean {
        return move.equals(GoMove.PASS);
    }
    private static isAccept(move: GoMove): boolean {
        return move.equals(GoMove.ACCEPT);
    }
    private static isLegalDeadMarking(move: GoMove, state: GoState): boolean {
        return GoRules.isOccupied(move.coord, state.getCopiedBoard()) &&
               (state.phase === Phase.COUNTING || state.phase === Phase.ACCEPT);
    }
    private static isLegalNormalMove(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {

        const boardCopy: GoPiece[][] = state.getCopiedBoard();
        if (GoRules.isKo(move, state)) {
            return MGPFallible.failure(GoFailure.ILLEGAL_KO());
        }
        if ([Phase.COUNTING, Phase.ACCEPT].includes(state.phase)) {
            state = GoRules.resurrectStones(state);
        }
        const captureState: CaptureState = GoRules.getCaptureState(move, state);
        if (CaptureState.isCapturing(captureState)) {
            return MGPFallible.success(captureState.capturedCoords);
        } else {
            boardCopy[move.coord.y][move.coord.x] = state.turn%2 === 0 ? GoPiece.BLACK : GoPiece.WHITE;
            const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
            const goGroupsDatas: GoGroupDatas =
                goGroupDatasFactory.getGroupDatas(move.coord, boardCopy) as GoGroupDatas;
            const isSuicide: boolean = goGroupsDatas.emptyCoords.length === 0;
            boardCopy[move.coord.y][move.coord.x] = GoPiece.EMPTY;

            if (isSuicide) {
                return MGPFallible.failure(GoFailure.CANNOT_COMMIT_SUICIDE());
            } else {
                return MGPFallible.success([]);
            }
        }
    }
    private static isOccupied(coord: Coord, board: Table<GoPiece>): boolean {
        return board[coord.y][coord.x].isOccupied();
    }
    public static isKo(move: GoMove, state: GoState): boolean {
        if (state.koCoord.isPresent()) {
            return move.coord.equals(state.koCoord.get());
        } else {
            return false;
        }
    }
    public static getCaptureState(move: GoMove, state: GoState): CaptureState {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE ||LOCAL_VERBOSE, { getCaptureState: { move, state } });
        const captureState: CaptureState = new CaptureState();
        let capturedInDirection: Coord[];
        for (const direction of Orthogonal.ORTHOGONALS) {
            capturedInDirection = GoRules.getCapturedInDirection(move.coord, direction, state);
            if (capturedInDirection.length > 0 &&
                captureState.capturedCoords.every((coord: Coord) => !capturedInDirection[0].equals(coord))) {
                captureState.capturedCoords = captureState.capturedCoords.concat(capturedInDirection);
            }
        }
        return captureState;
    }
    public static getCapturedInDirection(coord: Coord, direction: Orthogonal, state: GoState): Coord[] {
        const LOCAL_VERBOSE: boolean = false;
        const copiedBoard: GoPiece[][] = state.getCopiedBoard();
        const neightbooringCoord: Coord = coord.getNext(direction);
        if (neightbooringCoord.isInRange(state.board[0].length, state.board.length)) {
            const opponent: GoPiece = state.turn%2 === 0 ? GoPiece.WHITE : GoPiece.BLACK;
            if (copiedBoard[neightbooringCoord.y][neightbooringCoord.x] === opponent) {
                display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'a group could be captured');
                const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
                const neightbooringGroup: GoGroupDatas =
                    goGroupDatasFactory.getGroupDatas(neightbooringCoord, copiedBoard) as GoGroupDatas;
                const koCoord: MGPOptional<Coord> = state.koCoord;
                if (GoRules.isCapturableGroup(neightbooringGroup, koCoord)) {
                    display(GoRules.VERBOSE || LOCAL_VERBOSE, {
                        neightbooringGroupCoord: neightbooringGroup.getCoords(),
                        message: 'is capturable',
                    });
                    return neightbooringGroup.getCoords();
                }
            }
        }
        return [];
    }
    public static isCapturableGroup(groupDatas: GoGroupDatas, koCoord: MGPOptional<Coord>): boolean {
        if (groupDatas.color.isOccupied() && groupDatas.emptyCoords.length === 1) {
            return koCoord.equalsValue(groupDatas.emptyCoords[0]) === false; // Ko Rules Block Capture
        } else {
            return false;
        }
    }
    public static getTerritoryLikeGroup(state: GoState): GoGroupDatas[] {
        const emptyGroups: GoGroupDatas[] = GoRules.getEmptyZones(state);
        return emptyGroups.filter((currentGroup: GoGroupDatas) => currentGroup.isMonoWrapped());
    }
    private static applyPass(state: GoState): GoState {
        const oldBoard: GoPiece[][] = state.getCopiedBoard();
        const oldCaptured: number[] = state.getCapturedCopy();
        const oldTurn: number = state.turn;
        let newPhase: Phase;
        let resultingState: GoState;
        if (state.phase === Phase.PASSED) {
            newPhase = Phase.COUNTING;
            resultingState = new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
            resultingState = GoRules.markTerritoryAndCount(resultingState);
        } else {
            assert(state.phase === Phase.PLAYING, 'Cannot pass in counting phase!');
            newPhase = Phase.PASSED;
            resultingState = new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
        }
        return resultingState;
    }
    private static applyLegalAccept(state: GoState): GoState {
        const countingBoard: GoPiece[][] = state.getCopiedBoard();
        let phase: Phase;
        if (state.phase === Phase.COUNTING) {
            phase = Phase.ACCEPT;
        } else {
            phase = Phase.FINISHED;
        }
        return new GoState(countingBoard,
                           state.getCapturedCopy(),
                           state.turn + 1,
                           MGPOptional.empty(),
                           phase);
    }
    private static applyNormalLegalMove(currentState: GoState,
                                        legalMove: GoMove,
                                        capturedCoords: GoLegalityInformation)
    : GoState
    {
        display(GoRules.VERBOSE, { applyNormalLegal: { currentState, legalMove, status } });
        let state: GoState;
        if ([Phase.COUNTING, Phase.ACCEPT].includes(currentState.phase)) {
            state = GoRules.resurrectStones(currentState);
        } else {
            state = currentState.copy();
        }
        const x: number = legalMove.coord.x;
        const y: number = legalMove.coord.y;

        const newBoard: GoPiece[][] = state.getCopiedBoard();
        const currentTurn: number = state.turn;
        const currentPlayer: GoPiece = GoPiece.ofPlayer(state.getCurrentPlayer());
        const newTurn: number = currentTurn + 1;
        newBoard[y][x] = currentPlayer;
        for (const capturedCoord of capturedCoords) {
            newBoard[capturedCoord.y][capturedCoord.x] = GoPiece.EMPTY;
        }
        const newKoCoord: MGPOptional<Coord> = GoRules.getNewKo(legalMove, newBoard, capturedCoords);
        const newCaptured: number[] = state.getCapturedCopy();
        newCaptured[currentPlayer.player.value] += capturedCoords.length;
        return new GoState(newBoard, newCaptured, newTurn, newKoCoord, Phase.PLAYING);
    }
    public static resurrectStones(state: GoState): GoState {
        for (let y: number = 0; y < state.board.length; y++) {
            for (let x: number = 0; x < state.board[0].length; x++) {
                if (state.getPieceAtXY(x, y).isDead()) {
                    state = GoRules.switchAliveness(new Coord(x, y), state);
                }
            }
        }
        return GoRules.removeAndSubstractTerritory(state);
    }
    private static applyDeadMarkingMove(legalMove: GoMove,
                                        state: GoState)
    : GoState
    {
        display(GoRules.VERBOSE, { applyDeadMarkingMove: { legalMove, state } });
        const territorylessState: GoState = GoRules.removeAndSubstractTerritory(state);
        const switchedState: GoState = GoRules.switchAliveness(legalMove.coord, territorylessState);
        const resultingState: GoState =
            new GoState(switchedState.getCopiedBoard(),
                        switchedState.getCapturedCopy(),
                        switchedState.turn + 1,
                        MGPOptional.empty(),
                        Phase.COUNTING);
        return GoRules.markTerritoryAndCount(resultingState);
    }
    public isLegal(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {
        return GoRules.isLegal(move, state);
    }
    public applyLegalMove(legalMove: GoMove, state: GoState, status: GoLegalityInformation): GoState
    {
        display(GoRules.VERBOSE, { applyLegalMove: { legalMove, state, status } });
        if (GoRules.isPass(legalMove)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isPass');
            return GoRules.applyPass(state);
        } else if (GoRules.isAccept(legalMove)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isAccept');
            return GoRules.applyLegalAccept(state);
        } else if (GoRules.isLegalDeadMarking(legalMove, state)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isDeadMarking');
            return GoRules.applyDeadMarkingMove(legalMove, state);
        } else {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: else it is normal move');
            return GoRules.applyNormalLegalMove(state, legalMove, status);
        }
    }
    public getGameStatus(node: GoNode): GameStatus {
        return GoRules.getGameStatus(node);
    }
}
class CaptureState {
    public capturedCoords: Coord[] = [];

    public static isCapturing(captureState: CaptureState): boolean {
        return captureState.capturedCoords.length > 0;
    }
}

