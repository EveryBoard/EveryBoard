import { Rules } from '../../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Coord } from '../../../jscaip/coord/Coord';
import { GoPartSlice, Phase, GoPiece } from '../go-part-slice/GoPartSlice';
import { Direction, Orthogonal } from 'src/app/jscaip/Direction';
import { GoMove } from '../go-move/GoMove';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { GoLegalityStatus } from '../GoLegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { GroupDatas } from '../group-datas/GroupDatas';
import { display } from 'src/app/utils/utils/utils';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

abstract class GoNode extends MGPNode<GoRules, GoMove, GoPartSlice, GoLegalityStatus> {}

export class GoRules extends Rules<GoMove, GoPartSlice, GoLegalityStatus> {

    public static readonly CANNOT_PASS_AFTER_PASSED_PHASE: MGPValidation = MGPValidation.failure(
        'We are nor in playing nor in passed phase, you must mark stone as dead or alive or accept current board.');
    public static readonly CANNOT_ACCEPT_BEFORE_COUNTING_PHRASE: MGPValidation = MGPValidation.failure(
        'not countig or not accept');

    public static VERBOSE: boolean = false;

    public isLegal(move: GoMove, slice: GoPartSlice): GoLegalityStatus {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE ||LOCAL_VERBOSE, { isLegal: { move, slice } });

        if (GoRules.isPass(move)) {
            const playing: boolean = slice.phase === Phase.PLAYING;
            const passed: boolean = slice.phase === Phase.PASSED;
            display(
                GoRules.VERBOSE ||LOCAL_VERBOSE,
                'GoRules.isLegal at ' + slice.phase + ((playing || passed) ? ' forbid' : ' allowed') +
                ' passing on ' + slice.getCopiedBoard());
            return {
                legal: (playing || passed) ? MGPValidation.SUCCESS : GoRules.CANNOT_PASS_AFTER_PASSED_PHASE,
                capturedCoords: [],
            };
        } else if (GoRules.isAccept(move)) {
            const counting: boolean = slice.phase === Phase.COUNTING;
            const accept: boolean = slice.phase === Phase.ACCEPT;
            display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.isLegal: move is GoMove.ACCEPT, hence, it is ' + ((counting || accept) ? ' legal' : 'illegal'));
            return {
                legal: (counting || accept) ? MGPValidation.SUCCESS : GoRules.CANNOT_ACCEPT_BEFORE_COUNTING_PHRASE,
                capturedCoords: [],
            };
        }
        if (GoRules.isOccupied(move.coord, slice.getCopiedBoardGoPiece())) {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegal: move is marking');
            const legal: boolean = GoRules.isLegalDeadMarking(move, slice);
            return { legal: legal ? MGPValidation.SUCCESS : Rules.MUST_CLICK_ON_EMPTY_CASE, capturedCoords: [] };
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
        const LOCAL_VERBOSE: boolean = false;

        const boardCopy: GoPiece[][] = slice.getCopiedBoardGoPiece();
        if (GoRules.isOccupied(move.coord, boardCopy)) {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegalNormalMove: ' + move + ' illegal ecrasement on ' + slice.getCopiedBoard());
            return GoLegalityStatus.failure('illegal ecrasement');
        } else if (GoRules.isKo(move, slice)) {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegalNormalMove: ' + move + ' illegal ko on ' + slice.getCopiedBoard());
            return GoLegalityStatus.failure('illegal ko');
        }
        if ([Phase.COUNTING, Phase.ACCEPT].includes(slice.phase)) {
            slice = GoRules.resurectStones(slice);
        }
        const captureState: CaptureState = GoRules.getCaptureState(move, slice);
        if (CaptureState.isCapturing(captureState)) {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegalNormalMove: ' + move + ' legal avec capture on ' + slice.getCopiedBoard());
            return { legal: MGPValidation.SUCCESS, capturedCoords: captureState.capturedCoords };
        } else {
            boardCopy[move.coord.y][move.coord.x] = slice.turn%2 === 0 ? GoPiece.BLACK : GoPiece.WHITE;
            const isSuicide: boolean = GroupDatas.getGroupDatas(move.coord, boardCopy).emptyCoords.length === 0;
            boardCopy[move.coord.y][move.coord.x] = GoPiece.EMPTY;

            if (isSuicide) {
                display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegalNormalMove: ' + move + ' illegal suicide on ' + slice.getCopiedBoard());
                return GoLegalityStatus.failure('illegal suicide');
            } else {
                display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.isLegalNormalMove: ' + move + ' legal on ' + slice.getCopiedBoard());
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
                captureState.capturedCoords.every((coord) => !capturedInDirection[0].equals(coord))) {
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
                display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'un groupe pourrait être capturé');
                const neightbooringGroup: GroupDatas = GroupDatas.getGroupDatas(neightbooringCoord, copiedBoard);
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
    public static isCapturableGroup(groupDatas: GroupDatas, koCoord: MGPOptional<Coord>): boolean {
        if (groupDatas.color.isOccupied() && groupDatas.emptyCoords.length === 1) {
            return !groupDatas.emptyCoords[0].equals(koCoord.getOrNull()); // Ko Rules Block Capture
        } else {
            return false;
        }
    }
    public getListMoves(node: GoNode): MGPMap<GoMove, GoPartSlice> {
        const LOCAL_VERBOSE: boolean = false;
        display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.getListMoves');

        const currentSlice: GoPartSlice = node.gamePartSlice;
        const playingMoves: MGPMap<GoMove, GoPartSlice> = this.getPlayingMovesList(currentSlice);
        if (currentSlice.phase === Phase.PLAYING ||
            currentSlice.phase === Phase.PASSED) {
            playingMoves.set(GoMove.PASS, GoRules.applyPass(currentSlice).resultingSlice);
            return playingMoves;
        } else if (currentSlice.phase === Phase.COUNTING ||
                   currentSlice.phase === Phase.ACCEPT) {
            display(GoRules.VERBOSE ||LOCAL_VERBOSE, 'GoRules.getListMoves in counting phase');
            const markingMoves: MGPMap<GoMove, GoPartSlice> = this.getCountingMovesList(currentSlice);
            if (markingMoves.size() === 0) {
                markingMoves.set(GoMove.ACCEPT, GoRules.applyAccept(currentSlice).resultingSlice);
            }
            return markingMoves;
        } else {
            return new MGPMap<GoMove, GoPartSlice>();
        }
    }
    public getCountingMovesList(currentSlice: GoPartSlice): MGPMap<GoMove, GoPartSlice> {
        const choices: MGPMap<GoMove, GoPartSlice> = new MGPMap<GoMove, GoPartSlice>();

        // 1. put all to dead
        // 2. find all mono-wrapped empty group
        // 3. set alive their unique wrapper
        // 4. list the remaining "entry points" of dead group
        // 5. remove the entry points which on the true actual board are link to an already dead group
        // 6. return that list of alive group that AI consider dead

        const markAllAsDead: (pawn: GoPiece) => GoPiece = (pawn: GoPiece) => {
            if (pawn === GoPiece.BLACK) return GoPiece.DEAD_BLACK;
            if (pawn === GoPiece.WHITE) return GoPiece.DEAD_WHITE;
            if (pawn.isTerritory()) {
                return GoPiece.EMPTY;
            } else {
                return pawn;
            }
        };
        const allDeadBoard: GoPiece[][] = GoRules.mapBoard(currentSlice.getCopiedBoardGoPiece(), markAllAsDead);
        const allDeadSlice: GoPartSlice = new GoPartSlice(allDeadBoard,
                                                          currentSlice.getCapturedCopy(),
                                                          currentSlice.turn,
                                                          currentSlice.koCoord,
                                                          currentSlice.phase);
        const territoryLikeGroups: GroupDatas[] = GoRules.getTerritoryLikeGroup(allDeadSlice);

        const correctBoard: GoPiece[][] = GoRules.setAliveUniqueWrapper(allDeadSlice, territoryLikeGroups);

        const groupsData: GroupDatas[] =
            GoRules.getGroupsDatasWhere(correctBoard, (pawn: GoPiece) => pawn !== GoPiece.EMPTY);

        for (const group of groupsData) {
            const coord: Coord = group.getCoords()[0];
            const correctContent: GoPiece = correctBoard[coord.y][coord.x];
            const actualContent: GoPiece = currentSlice.getBoardAtGoPiece(coord);
            if (actualContent !== correctContent) {
                const move: GoMove = new GoMove(coord.x, coord.y);
                const resultingSlice: GoPartSlice = GoRules.applyDeadMarkingMove(move, currentSlice).resultingSlice;
                choices.set(move, resultingSlice);
                return choices;
            }
        }
        return choices;
    }
    public static getTerritoryLikeGroup(slice: GoPartSlice): GroupDatas[] {
        const emptyGroups: GroupDatas[] = GoRules.getEmptyZones(slice);
        return emptyGroups.filter((currentGroup) => currentGroup.isMonoWrapped());
    }
    public static mapBoard(board: GoPiece[][], mapper: (pawn: GoPiece) => GoPiece): GoPiece[][] {
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                board[y][x] = mapper(board[y][x]);
            }
        }
        return board;
    }
    public static setAliveUniqueWrapper(allDeadSlice: GoPartSlice, monoWrappedEmptyGroups: GroupDatas[]): GoPiece[][] {
        let resultSlice: GoPartSlice = allDeadSlice.copy();
        let aliveCoords: Coord[];
        for (const monoWrappedEmptyGroup of monoWrappedEmptyGroups) {
            aliveCoords = monoWrappedEmptyGroup.deadBlackCoords.concat(monoWrappedEmptyGroup.deadWhiteCoords);
            for (const aliveCoord of aliveCoords) {
                if (resultSlice.isDead(aliveCoord)) {
                    resultSlice = GoRules.switchAliveness(aliveCoord, resultSlice);
                }
            }
        }
        return resultSlice.getCopiedBoardGoPiece();
    }
    public getPlayingMovesList(slice: GoPartSlice): MGPMap<GoMove, GoPartSlice> {
        const choices: MGPMap<GoMove, GoPartSlice> = new MGPMap<GoMove, GoPartSlice>();
        let newMove: GoMove;

        for (let y: number = 0; y < slice.board.length; y++) {
            for (let x: number = 0; x < slice.board[0].length; x++) {
                newMove = new GoMove(x, y);
                if (slice.getBoardAtGoPiece(newMove.coord) === GoPiece.EMPTY) {
                    const legality: GoLegalityStatus = this.isLegal(newMove, slice);
                    if (legality.legal.isSuccess()) {
                        const result: {resultingMove: GoMove, resultingSlice: GoPartSlice} =
                            this.applyLegalMove(newMove, slice, legality);
                        choices.set(result.resultingMove, result.resultingSlice);
                    }
                }
            }
        }
        return choices;
    }
    public applyLegalMove(
        legalMove: GoMove,
        slice: GoPartSlice,
        status: GoLegalityStatus): {resultingMove: GoMove, resultingSlice: GoPartSlice}
    {
        display(GoRules.VERBOSE, { applyLegalMove: { legalMove, slice, status } });
        if (GoRules.isPass(legalMove)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isPass');
            return GoRules.applyPass(slice);
        } else if (GoRules.isAccept(legalMove)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isAccept');
            return GoRules.applyAccept(slice);
        } else if (GoRules.isLegalDeadMarking(legalMove, slice)) {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: isDeadMarking');
            return GoRules.applyDeadMarkingMove(legalMove, slice);
        } else {
            display(GoRules.VERBOSE, 'GoRules.applyLegalMove: else it is normal move');
            return GoRules.applyNormalLegalMove(slice, legalMove, status);
        }
    }
    private static applyPass(slice: GoPartSlice): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        const resultingMove: GoMove = GoMove.PASS;
        const oldBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        const oldCaptured: number[] = slice.getCapturedCopy();
        const oldTurn: number = slice.turn;
        let newPhase: Phase;
        let resultingSlice: GoPartSlice;
        if (slice.phase === Phase.PASSED) {
            newPhase = Phase.COUNTING;
            resultingSlice = new GoPartSlice(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
            resultingSlice = GoRules.markTerritoryAndCount(resultingSlice);
        } else if (slice.phase === Phase.PLAYING) {
            newPhase = Phase.PASSED;
            resultingSlice = new GoPartSlice(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
        } else {
            throw new Error('Cannot pass in counting phase!');
        }
        return { resultingMove, resultingSlice };
    }
    private static applyAccept(slice: GoPartSlice): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        if (slice.phase === Phase.PLAYING) {
            throw new Error('Cannot accept in PLAYING Phase');
        }
        if (slice.phase === Phase.PASSED) {
            throw new Error('Cannot accept in PASSED Phase');
        }
        const resultingMove: GoMove = GoMove.ACCEPT;
        if (slice.phase === Phase.COUNTING) {
            const countingBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
            const resultingSlice: GoPartSlice = new GoPartSlice(countingBoard,
                                                                slice.getCapturedCopy(),
                                                                slice.turn + 1,
                                                                MGPOptional.empty(),
                                                                Phase.ACCEPT);
            return { resultingMove, resultingSlice };
        } else if (slice.phase === Phase.ACCEPT) {
            const resultingSlice: GoPartSlice = new GoPartSlice(slice.getCopiedBoardGoPiece(),
                                                                slice.getCapturedCopy(),
                                                                slice.turn + 1,
                                                                MGPOptional.empty(),
                                                                Phase.FINISHED);
            return { resultingMove, resultingSlice };
        }
    }
    private static applyNormalLegalMove(
        currentPartSlice: GoPartSlice,
        legalMove: GoMove,
        status: GoLegalityStatus): {resultingMove: GoMove, resultingSlice: GoPartSlice}
    {
        display(GoRules.VERBOSE, { applyNormalLegal: { currentPartSlice, legalMove, status } });
        let slice: GoPartSlice;
        if ([Phase.COUNTING, Phase.ACCEPT].includes(currentPartSlice.phase)) {
            slice = GoRules.resurectStones(currentPartSlice);
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
        const resultingMove: GoMove = new GoMove(x, y);
        const newKoCoord: MGPOptional<Coord> = GoRules.getNewKo(resultingMove, newBoard, capturedCoords);
        const newCaptured: number[] = slice.getCapturedCopy();
        newCaptured[currentPlayer] += capturedCoords.length;
        const resultingSlice: GoPartSlice = new GoPartSlice(newBoard, newCaptured, newTurn, newKoCoord, Phase.PLAYING);
        return { resultingMove, resultingSlice };
    }
    public static resurectStones(slice: GoPartSlice): GoPartSlice {
        for (let y: number = 0; y < slice.board.length; y++) {
            for (let x: number = 0; x < slice.board[0].length; x++) {
                if (slice.getBoardByXYGoPiece(x, y).isDead()) {
                    slice = GoRules.switchAliveness(new Coord(x, y), slice);
                }
            }
        }
        return GoRules.removeAndSubstractTerritory(slice);
    }
    private static applyDeadMarkingMove(
        legalMove: GoMove,
        slice: GoPartSlice): {resultingMove: GoMove, resultingSlice: GoPartSlice}
    {
        display(GoRules.VERBOSE, { applyDeadMarkingMove: { legalMove, slice } });
        const territorylessSlice: GoPartSlice = GoRules.removeAndSubstractTerritory(slice);
        const switchedSlice: GoPartSlice = GoRules.switchAliveness(legalMove.coord, territorylessSlice);
        let resultingSlice: GoPartSlice =
            new GoPartSlice(switchedSlice.getCopiedBoardGoPiece(),
                            switchedSlice.getCapturedCopy(),
                            switchedSlice.turn + 1,
                            MGPOptional.empty(),
                            Phase.COUNTING);
        resultingSlice = GoRules.markTerritoryAndCount(resultingSlice);
        return { resultingMove: legalMove, resultingSlice };
    }
    public getBoardValue(move: GoMove, slice: GoPartSlice): number {
        const LOCAL_VERBOSE: boolean = false;

        display(GoRules.VERBOSE || LOCAL_VERBOSE, 'GoRules.getBoardValue');

        const goPartSlice: GoPartSlice = GoRules.markTerritoryAndCount(slice);

        const goScore: number[] = goPartSlice.getCapturedCopy();
        const goKilled: number[] = GoRules.getDeadStones(goPartSlice);
        // TODO: add counted territory here
        return (goScore[1] + (2*goKilled[0])) - (goScore[0] + (2*goKilled[1]));
    }
    public static getNewKo(move: GoMove, newBoard: GoPiece[][], captures: Coord[]): MGPOptional<Coord> {
        if (captures.length === 1) {
            const captured: Coord = captures[0];
            const capturerCoord: Coord = move.coord;
            const capturer: GoPiece = newBoard[capturerCoord.y][capturerCoord.x];
            const capturersInfo: GroupDatas = GroupDatas.getGroupDatas(capturerCoord, newBoard);
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
        const emptyZones: GroupDatas[] = GoRules.getTerritoryLikeGroup(slice);
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
    public static getEmptyZones(deadlessSlice: GoPartSlice): GroupDatas[] {
        return GoRules.getGroupsDatasWhere(deadlessSlice.getCopiedBoardGoPiece(), (pawn: GoPiece) => pawn.isEmpty());
    }
    public static getGroupsDatasWhere(board: GoPiece[][], condition: (pawn: GoPiece) => boolean): GroupDatas[] {
        const groups: GroupDatas[] = [];
        let coord: Coord;
        let group: GroupDatas;
        let currentCase: GoPiece;
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                coord = new Coord(x, y);
                currentCase = board[y][x];
                if (condition(currentCase)) {
                    if (!groups.some((currentGroup) => currentGroup.selfCountains(coord))) {
                        group = GroupDatas.getGroupDatas(coord, board);
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
    private static switchAliveness(groupCoord: Coord, switchedSlice: GoPartSlice): GoPartSlice {
        const switchedBoard: GoPiece[][] = switchedSlice.getCopiedBoardGoPiece();
        const switchedPiece: GoPiece = switchedBoard[groupCoord.y][groupCoord.x];
        if (switchedPiece.isEmpty()) {
            throw new Error('Can\'t switch emptyness aliveness');
        }
        const group: GroupDatas = GroupDatas.getGroupDatas(groupCoord, switchedBoard);
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
}
class CaptureState {
    public capturedCoords: Coord[] = [];

    public static isCapturing(captureState: CaptureState): boolean {
        return captureState.capturedCoords.length > 0;
    }
}
export class GroupInfos { // TODO: might absorb and delete GroupDatas ??
    public constructor(
        readonly coords: ReadonlyArray<Coord>,
        readonly neighboorsEP: ReadonlyArray<Coord>,
    ) {}
}
