
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GoPartSlice, Phase, GoPiece } from './GoPartSlice';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { GoMove } from './GoMove';
import { GoLegalityStatus } from './GoLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { GoGroupDatas } from './GoGroupsDatas';
import { assert, display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { Coord } from 'src/app/jscaip/Coord';
import { GoGroupDatasFactory } from './GoGroupDatasFactory';
import { GoFailure } from './GoFailure';

export abstract class GoNode extends MGPNode<GoRules, GoMove, GoPartSlice, GoLegalityStatus> {}

export class GoRules extends Rules<GoMove, GoPartSlice, GoLegalityStatus> {

    public static VERBOSE: boolean = false;

    public static isLegal(move: GoMove, slice: GoPartSlice): GoLegalityStatus {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE ||LOCAL_VERBOSE, { isLegal: { move, slice } });

        if (GoRules.isPass(move)) {
            const playing: boolean = slice.phase === Phase.PLAYING;
            const passed: boolean = slice.phase === Phase.PASSED;
            display(GoRules.VERBOSE ||LOCAL_VERBOSE,
                    'GoRules.isLegal at ' + slice.phase + ((playing || passed) ? ' forbid' : ' allowed') +
                    ' passing on ' + slice.getCopiedBoard());
            return {
                legal: (playing || passed) ? MGPValidation.SUCCESS :
                    MGPValidation.failure(GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE()),
                capturedCoords: [],
            };
        } else if (GoRules.isAccept(move)) {
            const counting: boolean = slice.phase === Phase.COUNTING;
            const accept: boolean = slice.phase === Phase.ACCEPT;
            return {
                legal: (counting || accept) ? MGPValidation.SUCCESS :
                    MGPValidation.failure(GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE()),
                capturedCoords: [],
            };
        }
        if (GoRules.isOccupied(move.coord, slice.getCopiedBoardGoPiece())) {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegal: move is marking');
            const legal: boolean = GoRules.isLegalDeadMarking(move, slice);
            return {
                legal: legal ? MGPValidation.SUCCESS : MGPValidation.failure(GoFailure.OCCUPIED_INTERSECTION()),
                capturedCoords: [],
            };
        } else {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegal: move is normal stuff: ' + move.toString());
            return GoRules.isLegalNormalMove(move, slice);
        }
    }
    private static isPass(move: GoMove): boolean {
        return move.equals(GoMove.PASS);
    }
    private static isAccept(move: GoMove): boolean {
        return move.equals(GoMove.ACCEPT);
    }
    private static isLegalDeadMarking(move: GoMove, slice: GoPartSlice): boolean {
        return GoRules.isOccupied(move.coord, slice.getCopiedBoardGoPiece()) &&
               (slice.phase === Phase.COUNTING || slice.phase === Phase.ACCEPT);
    }
    private static isLegalNormalMove(move: GoMove, slice: GoPartSlice): GoLegalityStatus {

        const boardCopy: GoPiece[][] = slice.getCopiedBoardGoPiece();
        if (GoRules.isKo(move, slice)) {
            return GoLegalityStatus.failure(GoFailure.ILLEGAL_KO());
        }
        if ([Phase.COUNTING, Phase.ACCEPT].includes(slice.phase)) {
            slice = GoRules.resurrectStones(slice);
        }
        const captureState: CaptureState = GoRules.getCaptureState(move, slice);
        if (CaptureState.isCapturing(captureState)) {
            return { legal: MGPValidation.SUCCESS, capturedCoords: captureState.capturedCoords };
        } else {
            boardCopy[move.coord.y][move.coord.x] = slice.turn%2 === 0 ? GoPiece.BLACK : GoPiece.WHITE;
            const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
            const goGroupsDatas: GoGroupDatas =
                goGroupDatasFactory.getGroupDatas(move.coord, boardCopy) as GoGroupDatas;
            const isSuicide: boolean = goGroupsDatas.emptyCoords.length === 0;
            boardCopy[move.coord.y][move.coord.x] = GoPiece.EMPTY;

            if (isSuicide) {
                return GoLegalityStatus.failure(GoFailure.CANNOT_COMMIT_SUICIDE());
            } else {
                return { legal: MGPValidation.SUCCESS, capturedCoords: [] };
            }
        }
    }
    private static isOccupied(coord: Coord, board: Table<GoPiece>): boolean {
        return board[coord.y][coord.x].isOccupied();
    }
    public static isKo(move: GoMove, slice: GoPartSlice): boolean {
        if (slice.koCoord.isPresent()) {
            return move.coord.equals(slice.koCoord.get());
        } else {
            return false;
        }
    }
    public static getCaptureState(move: GoMove, slice: GoPartSlice): CaptureState {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE ||LOCAL_VERBOSE, { getCaptureState: { move, slice } });
        const captureState: CaptureState = new CaptureState();
        let capturedInDirection: Coord[];
        for (const direction of Orthogonal.ORTHOGONALS) {
            capturedInDirection = GoRules.getCapturedInDirection(move.coord, direction, slice);
            if (capturedInDirection.length > 0 &&
                captureState.capturedCoords.every((coord: Coord) => !capturedInDirection[0].equals(coord))) {
                captureState.capturedCoords = captureState.capturedCoords.concat(capturedInDirection);
            }
        }
        return captureState;
    }
    public static getCapturedInDirection(coord: Coord, direction: Orthogonal, slice: GoPartSlice): Coord[] {
        const LOCAL_VERBOSE: boolean = false;
        const copiedBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        const neightbooringCoord: Coord = coord.getNext(direction);
        if (neightbooringCoord.isInRange(slice.board[0].length, slice.board.length)) {
            const ennemi: GoPiece = slice.turn%2 === 0 ? GoPiece.WHITE : GoPiece.BLACK;
            if (copiedBoard[neightbooringCoord.y][neightbooringCoord.x] === ennemi) {
                display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'a group could be captured');
                const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
                const neightbooringGroup: GoGroupDatas =
                    goGroupDatasFactory.getGroupDatas(neightbooringCoord, copiedBoard) as GoGroupDatas;
                const koCoord: MGPOptional<Coord> = slice.koCoord;
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
            return !groupDatas.emptyCoords[0].equals(koCoord.getOrNull()); // Ko Rules Block Capture
        } else {
            return false;
        }
    }
    public static getTerritoryLikeGroup(slice: GoPartSlice): GoGroupDatas[] {
        const emptyGroups: GoGroupDatas[] = GoRules.getEmptyZones(slice);
        return emptyGroups.filter((currentGroup: GoGroupDatas) => currentGroup.isMonoWrapped());
    }
    private static applyPass(slice: GoPartSlice): GoPartSlice {
        const oldBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        const oldCaptured: number[] = slice.getCapturedCopy();
        const oldTurn: number = slice.turn;
        let newPhase: Phase;
        let resultingSlice: GoPartSlice;
        if (slice.phase === Phase.PASSED) {
            newPhase = Phase.COUNTING;
            resultingSlice = new GoPartSlice(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
            resultingSlice = GoRules.markTerritoryAndCount(resultingSlice);
        } else {
            assert(slice.phase === Phase.PLAYING, 'Cannot pass in counting phase!');
            newPhase = Phase.PASSED;
            resultingSlice = new GoPartSlice(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
        }
        return resultingSlice;
    }
    private static applyLegalAccept(slice: GoPartSlice): GoPartSlice {
        const countingBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        let phase: Phase;
        if (slice.phase === Phase.COUNTING) {
            phase = Phase.ACCEPT;
        } else {
            phase = Phase.FINISHED;
        }
        return new GoPartSlice(countingBoard,
                               slice.getCapturedCopy(),
                               slice.turn + 1,
                               MGPOptional.empty(),
                               phase);
    }
    private static applyNormalLegalMove(currentPartSlice: GoPartSlice,
                                        legalMove: GoMove,
                                        status: GoLegalityStatus)
    : GoPartSlice
    {
        display(GoRules.VERBOSE, { applyNormalLegal: { currentPartSlice, legalMove, status } });
        let slice: GoPartSlice;
        if ([Phase.COUNTING, Phase.ACCEPT].includes(currentPartSlice.phase)) {
            slice = GoRules.resurrectStones(currentPartSlice);
        } else {
            slice = currentPartSlice.copy();
        }
        const x: number = legalMove.coord.x;
        const y: number = legalMove.coord.y;

        const newBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        const currentTurn: number = slice.turn;
        const currentPlayer: number = currentTurn%2 === 0 ? GoPiece.BLACK.value : GoPiece.WHITE.value;
        const newTurn: number = currentTurn + 1;
        newBoard[y][x] = GoPiece.of(currentPlayer);
        const capturedCoords: Coord[] = status.capturedCoords;
        for (const capturedCoord of capturedCoords) {
            newBoard[capturedCoord.y][capturedCoord.x] = GoPiece.EMPTY;
        }
        const newKoCoord: MGPOptional<Coord> = GoRules.getNewKo(legalMove, newBoard, capturedCoords);
        const newCaptured: number[] = slice.getCapturedCopy();
        newCaptured[currentPlayer] += capturedCoords.length;
        return new GoPartSlice(newBoard, newCaptured, newTurn, newKoCoord, Phase.PLAYING);
    }
    public static resurrectStones(slice: GoPartSlice): GoPartSlice {
        for (let y: number = 0; y < slice.board.length; y++) {
            for (let x: number = 0; x < slice.board[0].length; x++) {
                if (slice.getBoardByXYGoPiece(x, y).isDead()) {
                    slice = GoRules.switchAliveness(new Coord(x, y), slice);
                }
            }
        }
        return GoRules.removeAndSubstractTerritory(slice);
    }
    private static applyDeadMarkingMove(legalMove: GoMove,
                                        slice: GoPartSlice)
    : GoPartSlice
    {
        display(GoRules.VERBOSE, { applyDeadMarkingMove: { legalMove, slice } });
        const territorylessSlice: GoPartSlice = GoRules.removeAndSubstractTerritory(slice);
        const switchedSlice: GoPartSlice = GoRules.switchAliveness(legalMove.coord, territorylessSlice);
        const resultingSlice: GoPartSlice =
            new GoPartSlice(switchedSlice.getCopiedBoardGoPiece(),
                            switchedSlice.getCapturedCopy(),
                            switchedSlice.turn + 1,
                            MGPOptional.empty(),
                            Phase.COUNTING);
        return GoRules.markTerritoryAndCount(resultingSlice);
    }
    public isLegal(move: GoMove, slice: GoPartSlice): GoLegalityStatus {
        return GoRules.isLegal(move, slice);
    }
    public applyLegalMove(legalMove: GoMove,
                          slice: GoPartSlice,
                          status: GoLegalityStatus)
    : GoPartSlice
    {
        display(GoRules.VERBOSE, { applyLegalMove: { legalMove, slice, status } });
        if (GoRules.isPass(legalMove)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isPass');
            return GoRules.applyPass(slice);
        } else if (GoRules.isAccept(legalMove)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isAccept');
            return GoRules.applyLegalAccept(slice);
        } else if (GoRules.isLegalDeadMarking(legalMove, slice)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isDeadMarking');
            return GoRules.applyDeadMarkingMove(legalMove, slice);
        } else {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: else it is normal move');
            return GoRules.applyNormalLegalMove(slice, legalMove, status);
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
    public static markTerritoryAndCount(slice: GoPartSlice): GoPartSlice {
        display(GoRules.VERBOSE, { markTerritoryAndCount: { slice } });
        const resultingBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        const emptyZones: GoGroupDatas[] = GoRules.getTerritoryLikeGroup(slice);
        const captured: number[] = slice.getCapturedCopy();

        for (const emptyZone of emptyZones) {
            const pointMaker: GoPiece = emptyZone.getWrapper();
            if (pointMaker === GoPiece.WHITE) {
                // white territory
                captured[1] += emptyZone.emptyCoords.length;
                for (const territory of emptyZone.getCoords()) {
                    resultingBoard[territory.y][territory.x] = GoPiece.WHITE_TERRITORY;
                }
            } else if (pointMaker === GoPiece.BLACK) {
                // black territory
                captured[0] += emptyZone.emptyCoords.length;
                for (const territory of emptyZone.getCoords()) {
                    resultingBoard[territory.y][territory.x] = GoPiece.BLACK_TERRITORY;
                }
            }
        }
        return new GoPartSlice(resultingBoard, captured, slice.turn, slice.koCoord, slice.phase);
    }
    public static getDeadStones(slice: GoPartSlice): number[] {
        const killed: number[] = [0, 0];
        for (let y: number = 0; y < slice.board.length; y++) {
            for (let x: number = 0; x < slice.board[0].length; x++) {
                const piece: number = slice.getBoardByXY(x, y);
                if (piece === GoPiece.DEAD_BLACK.value) {
                    killed[0] = killed[0] + 1;
                } else if (piece === GoPiece.DEAD_WHITE.value) {
                    killed[1] = killed[1] + 1;
                }
            }
        }
        return killed;
    }
    public static removeAndSubstractTerritory(slice: GoPartSlice): GoPartSlice {
        const resultingBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        const captured: number[] = slice.getCapturedCopy();
        let currentPiece: GoPiece;
        for (let y: number = 0; y < slice.board.length; y++) {
            for (let x: number = 0; x < slice.board[0].length; x++) {
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
        return new GoPartSlice(resultingBoard, captured, slice.turn, slice.koCoord, slice.phase);
    }
    public static getEmptyZones(deadlessSlice: GoPartSlice): GoGroupDatas[] {
        return GoRules.getGroupsDatasWhere(deadlessSlice.getCopiedBoardGoPiece(), (pawn: GoPiece) => pawn.isEmpty());
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
                    if (!groups.some((currentGroup: GoGroupDatas) => currentGroup.selfCountains(coord))) {
                        group = goGroupDatasFactory.getGroupDatas(coord, board) as GoGroupDatas;
                        groups.push(group);
                    }
                }
            }
        }
        return groups;
    }
    public static addDeadToScore(slice: GoPartSlice): number[] {
        const captured: number[] = slice.getCapturedCopy();
        let whiteScore: number = captured[1];
        let blackScore: number = captured[0];
        let currentCase: GoPiece;
        for (let y: number = 0; y < slice.board.length; y++) {
            for (let x: number = 0; x < slice.board[0].length; x++) {
                currentCase = slice.getBoardByXYGoPiece(x, y);
                if (currentCase === GoPiece.DEAD_BLACK) {
                    whiteScore++;
                } else if (currentCase === GoPiece.DEAD_WHITE) {
                    blackScore++;
                }
            }
        }
        return [blackScore, whiteScore];
    }
    public static switchAliveness(groupCoord: Coord, switchedSlice: GoPartSlice): GoPartSlice {
        const switchedBoard: GoPiece[][] = switchedSlice.getCopiedBoardGoPiece();
        const switchedPiece: GoPiece = switchedBoard[groupCoord.y][groupCoord.x];
        if (switchedPiece.isEmpty()) {
            throw new Error(`Can't switch emptyness aliveness`);
        }
        const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
        const group: GoGroupDatas = goGroupDatasFactory.getGroupDatas(groupCoord, switchedBoard) as GoGroupDatas;
        const captured: number[] = switchedSlice.getCapturedCopy();
        if (group.color === GoPiece.DEAD_BLACK) {
            captured[1] -= 2 * group.deadBlackCoords.length;
            for (const deadBlackCoord of group.deadBlackCoords) {
                switchedBoard[deadBlackCoord.y][deadBlackCoord.x] = GoPiece.BLACK;
            }
        } else if (group.color === GoPiece.DEAD_WHITE) {
            captured[0] -= 2 * group.deadWhiteCoords.length;
            for (const deadWhiteCoord of group.deadWhiteCoords) {
                switchedBoard[deadWhiteCoord.y][deadWhiteCoord.x] = GoPiece.WHITE;
            }
        } else if (group.color === GoPiece.WHITE) {
            captured[0] += 2 * group.whiteCoords.length;
            for (const whiteCoord of group.whiteCoords) {
                switchedBoard[whiteCoord.y][whiteCoord.x] = GoPiece.DEAD_WHITE;
            }
        } else if (group.color === GoPiece.BLACK) {
            captured[1] += 2 * group.blackCoords.length;
            for (const blackCoord of group.blackCoords) {
                switchedBoard[blackCoord.y][blackCoord.x] = GoPiece.DEAD_BLACK;
            }
        }
        return new GoPartSlice(switchedBoard,
                               captured,
                               switchedSlice.turn,
                               switchedSlice.koCoord,
                               switchedSlice.phase);
    }
    public getGameStatus(node: GoNode): GameStatus {
        const state: GoPartSlice = node.gamePartSlice;
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
}
class CaptureState {
    public capturedCoords: Coord[] = [];

    public static isCapturing(captureState: CaptureState): boolean {
        return captureState.capturedCoords.length > 0;
    }
}

