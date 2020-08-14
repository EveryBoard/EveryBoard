import {Rules} from '../../../jscaip/Rules';
import {MNode} from '../../../jscaip/MNode';
import {Coord} from '../../../jscaip/coord/Coord';
import {GoPartSlice, Phase, GoPiece} from '../GoPartSlice';
import {Direction, Orthogonale} from 'src/app/jscaip/DIRECTION';
import {GoMove} from '../gomove/GoMove';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { GoLegalityStatus } from '../GoLegalityStatus';
import { Player } from 'src/app/jscaip/Player';

abstract class GoNode extends MNode<GoRules, GoMove, GoPartSlice, GoLegalityStatus> {}

export class GoRules extends Rules<GoMove, GoPartSlice, GoLegalityStatus> {

    public static VERBOSE: boolean = false;

    constructor() {
        super(true);
        this.node = MNode.getFirstNode(
            new GoPartSlice(GoPartSlice.getStartingBoard(), [0, 0], 0, null, Phase.PLAYING),
            this
        );
    }
    public isLegal(move: GoMove, slice: GoPartSlice): GoLegalityStatus {
        return GoRules.isLegal(move, slice);
    }
    public static isLegal(move: GoMove, slice: GoPartSlice): GoLegalityStatus {
        const LOCAL_VERBOSE: boolean = false;

        if (GoRules.isPass(move)) {
            const playing: boolean = slice.phase === Phase.PLAYING;
            const passed: boolean = slice.phase === Phase.PASSED;
            if (GoRules.VERBOSE || LOCAL_VERBOSE) {
                const message: string = (playing || passed) ? " forbid" : " allowed";
                console.log("GoRules.isLegal at" + slice.phase + message + " passing on " + slice.getCopiedBoard());
            }
            return {legal: playing || passed, capturedCoords: []};
        } else if (GoRules.isAccept(move)) {
            const counting: boolean = slice.phase === Phase.COUNTING;
            const accept: boolean = slice.phase === Phase.ACCEPT;
            if (GoRules.VERBOSE || LOCAL_VERBOSE) {
                const message: string = (counting || accept) ? " legal" : "illegal";
                console.log("GoRules.isLegal: move is GoMove.ACCEPT, hence, it is " + message);
            }
            return {legal: counting || accept, capturedCoords: []};
        }
        if (GoRules.isOccupied(move.coord, slice.getCopiedBoardGoPiece())) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("GoRules.isLegal: move is marking");
            const legal: boolean = GoRules.isLegalDeadMarking(move, slice);
            return { legal, capturedCoords: []};
        } else {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("GoRules.isLegal: move is normal stuff: " + move.toString());
            return GoRules.isLegalNormalMove(move, slice);
        }
    }
    private static isPass(move: GoMove): boolean {
        return move.equals(GoMove.PASS);
    }
    private static isAccept(move: GoMove): boolean {
        return move.equals(GoMove.ACCEPT);
    }
    private static isDeadMarking(move: GoMove, slice: GoPartSlice): boolean {
        if (slice.phase === Phase.PLAYING || slice.phase === Phase.PASSED)
            return false;
        if (slice.getBoardAtGoPiece(move.coord) === GoPiece.EMPTY)
            return false;
        return true;
    }
    private static isLegalDeadMarking(move: GoMove, slice: GoPartSlice): boolean {
        return GoRules.isOccupied(move.coord, slice.getCopiedBoardGoPiece()) &&
               (slice.phase === Phase.COUNTING || slice.phase === Phase.ACCEPT);
    }
    private static isLegalNormalMove(move: GoMove, slice: GoPartSlice): GoLegalityStatus {
        const LOCAL_VERBOSE: boolean = false;

        let boardCopy: GoPiece[][] = slice.getCopiedBoardGoPiece();
        if (GoRules.isOccupied(move.coord, boardCopy)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("GoRules.isLegalNormalMove: " + move + " illegal ecrasement on " + slice.getCopiedBoard());
            return GoLegalityStatus.ILLEGAL;
        }
        else if (GoRules.isKo(move, slice)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("GoRules.isLegalNormalMove: " + move + " illegal ko on " + slice.getCopiedBoard());
            return GoLegalityStatus.ILLEGAL;
        }
        let captureState: CaptureState = GoRules.getCaptureState(move, slice);
        if (CaptureState.isCapturing(captureState)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("GoRules.isLegalNormalMove: " + move + " legal avec capture on " + slice.getCopiedBoard());
            return {legal: true, capturedCoords: captureState.capturedCoords};
        } else {
            boardCopy[move.coord.y][move.coord.x] = slice.turn%2 === 0 ? GoPiece.BLACK : GoPiece.WHITE;
            let isSuicide: boolean = GroupDatas.getGroupDatas(move.coord, boardCopy).emptyCoords.length === 0;
            boardCopy[move.coord.y][move.coord.x] = GoPiece.EMPTY;

            if (isSuicide) {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("GoRules.isLegalNormalMove: " + move + " illegal suicide on " + slice.getCopiedBoard());
                return GoLegalityStatus.ILLEGAL;
            } else {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("GoRules.isLegalNormalMove: " + move + " legal on " + slice.getCopiedBoard());
                return {legal: true, capturedCoords: []};
            }
        }
    }
    private static isOccupied(coord: Coord, board: GoPiece[][]): boolean {
        return board[coord.y][coord.x] !== GoPiece.EMPTY;
    }
    public static isKo(move: GoMove, slice: GoPartSlice): boolean {
        return move.coord.equals(slice.koCoord);
    }
    public static getCaptureState(move: GoMove, goPartSlice: GoPartSlice): CaptureState {
        const LOCAL_VERBOSE: boolean = false;
        if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("GoRules.getCaptureState(" + move + ", " + goPartSlice.getCopiedBoard() + ")");
        let captureState: CaptureState = new CaptureState();
        let capturedInDirection: Coord[];
        for (let direction of Orthogonale.ORTHOGONALES) {
            capturedInDirection = GoRules.getCapturedInDirection(move.coord, direction, goPartSlice);
            captureState.capturedCoords = captureState.capturedCoords.concat(capturedInDirection);
        }
        return captureState;
    }
    public static getCapturedInDirection(coord: Coord, direction: Direction, slice: GoPartSlice): Coord[] {
        const LOCAL_VERBOSE: boolean = false;
        let copiedBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        let neightbooringCoord: Coord = coord.getNext(direction);
        if (neightbooringCoord.isInRange(GoPartSlice.WIDTH, GoPartSlice.HEIGHT)) {
            let ennemi: GoPiece = slice.turn%2 === 0 ? GoPiece.WHITE : GoPiece.BLACK;
            if (copiedBoard[neightbooringCoord.y][neightbooringCoord.x] === ennemi) {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("un groupe pourrait être capturé");
                let neightbooringGroup: GroupDatas = GroupDatas.getGroupDatas(neightbooringCoord, copiedBoard);
                let koCoord: Coord = slice.koCoord;
                if (GoRules.isCapturableGroup(neightbooringGroup, koCoord)) {
                    if (GoRules.VERBOSE || LOCAL_VERBOSE) {
                        console.log({ neightbooringGroupCoord: neightbooringGroup.getCoords(),
                                      message: "is capturable" });
                    }
                    return neightbooringGroup.getCoords();
                }
            }
        }
        return [];
    }
    public static isCapturableGroup(groupDatas: GroupDatas, koCoord: Coord): boolean {
        if (groupDatas.color !== GoPiece.EMPTY && groupDatas.emptyCoords.length === 1) {
            return !groupDatas.emptyCoords[0].equals(koCoord); // Ko Rules Block Capture
        } else {
            return false;
        }
    }
    public getListMoves(node: GoNode): MGPMap<GoMove, GoPartSlice> {
        const LOCAL_VERBOSE: boolean = false;
        if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log('GoRules.getListMoves');

        const currentSlice: GoPartSlice = node.gamePartSlice;
        const playingMoves: MGPMap<GoMove, GoPartSlice> = GoRules.getPlayingMovesList(currentSlice);
        if (currentSlice.phase === Phase.PLAYING ||
            currentSlice.phase === Phase.PASSED) {

            playingMoves.set(GoMove.PASS, GoRules.applyPass(currentSlice).resultingSlice);
            return playingMoves;
        } else if (currentSlice.phase === Phase.COUNTING ||
                   currentSlice.phase === Phase.ACCEPT) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log('GoRules.getListMoves in counting phase');
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

        // console.log("Counting for board: ");
        // console.table(currentSlice.getCopiedBoard());

        const markAllAsDead: (pawn: GoPiece) => GoPiece = (pawn: GoPiece) => {
            if (pawn === GoPiece.BLACK) return GoPiece.DEAD_BLACK;
            if (pawn === GoPiece.WHITE) return GoPiece.DEAD_WHITE;
            else return pawn;
        };
        const allDeadBoard: GoPiece[][] = GoRules.mapBoard(currentSlice.getCopiedBoardGoPiece(), markAllAsDead);

        let emptyGroups: GroupDatas[] = GoRules.getGroupsDatasWhere(allDeadBoard, (pawn: GoPiece) => pawn === GoPiece.EMPTY);
        let monoWrappedEmptyGroups: GroupDatas[] = GoRules.getMonoWrappedEmptyGroup(emptyGroups);

        const correctBoard: GoPiece[][] = GoRules.setAliveUniqueWrapper(allDeadBoard, monoWrappedEmptyGroups);
        // console.log("correct board: ");
        // console.table(correctBoard);

        const groupsData: GroupDatas[] = GoRules.getGroupsDatasWhere(correctBoard, (pawn: GoPiece) => pawn !== GoPiece.EMPTY);

        for (let group of groupsData) {
            let coord: Coord = group.getCoords()[0];
            // console.log(coord.toString() + " of " + group.color);
            let correctContent: GoPiece = correctBoard[coord.y][coord.x];
            let actualContent: GoPiece = currentSlice.getBoardAtGoPiece(coord);
            if (actualContent !== correctContent) {
                // console.log(actualContent + " should be " + correctContent);
                const move: GoMove = new GoMove(coord.x, coord.y);
                const resultingSlice: GoPartSlice = GoRules.applyDeadMarkingMove(move, currentSlice).resultingSlice;
                choices.set(move, resultingSlice);
                return choices;
            }
        }
        return choices;
    }
    public static getMonoWrappedEmptyGroup(emptyGroups: GroupDatas[]): GroupDatas[] {
        return emptyGroups.filter(currentGroup => currentGroup.isMonoWrapped());
    }
    public static mapBoard(board: GoPiece[][], mapper: (pawn: GoPiece) => GoPiece): GoPiece[][] {
        for (let y: number = 0; y < GoPartSlice.HEIGHT; y++) {
            for (let x: number = 0; x < GoPartSlice.WIDTH; x++) {
                board[y][x] = mapper(board[y][x]);
            }
        }
        return board;
    }
    public static isCoordDead(coord: Coord, board: GoPiece[][]): boolean {
        const pawn: GoPiece = board[coord.y][coord.x];
        return GoRules.isPawnDead(pawn);
    }
    public static isPawnDead(pawn: GoPiece): boolean { // TODO: Pawn.isDead()
        return pawn === GoPiece.DEAD_BLACK ||
               pawn === GoPiece.DEAD_WHITE;
    }
    public static setAliveUniqueWrapper(allDeadBoard: GoPiece[][], monoWrappedEmptyGroups: GroupDatas[]): GoPiece[][] {
        // console.log("GoRules.setAliveUniqueWrapper");
        // console.table(allDeadBoard);
        // console.log(monoWrappedEmptyGroups);
        let resultBoard: GoPiece[][] = allDeadBoard;
        let aliveCoords: Coord[];
        for (let monoWrappedEmptyGroup of monoWrappedEmptyGroups) {
            aliveCoords = monoWrappedEmptyGroup.deadBlackCoords.concat(monoWrappedEmptyGroup.deadWhiteCoords);
            // console.log("so those are the group that must be put alive");
            // console.log(aliveCoords);
            for (let aliveCoord of aliveCoords) {
                if (GoRules.isCoordDead(aliveCoord, resultBoard)) {
                    // console.log("One dead group to set alive: ", aliveCoord);
                    resultBoard = GoRules.switchAliveness(aliveCoord, resultBoard).resultingBoard;
                } // else console.log(aliveCoord + " is already alive");
            }
        }
        // console.table(resultBoard);
        return resultBoard;
    }
    public static getPlayingMovesList(currentSlice: GoPartSlice): MGPMap<GoMove, GoPartSlice> {
        const choices: MGPMap<GoMove, GoPartSlice> = new MGPMap<GoMove, GoPartSlice>();

        let newMove: GoMove;

        for (let y = 0; y<GoPartSlice.HEIGHT; y++) {
            for (let x = 0; x<GoPartSlice.WIDTH; x++) {
                newMove = new GoMove(x, y);
                if (currentSlice.getBoardAtGoPiece(newMove.coord) === GoPiece.EMPTY) {
                    let legality: GoLegalityStatus = GoRules.isLegal(newMove, currentSlice);
                    if (legality.legal) {
                        let result: {resultingMove: GoMove, resultingSlice: GoPartSlice} =
                            GoRules.applyLegalMove(newMove, currentSlice, legality);
                        choices.set(result.resultingMove, result.resultingSlice);
                    }
                }
            }
        }
        return choices;
    }
    public applyLegalMove(legalMove: GoMove, slice: GoPartSlice, status: GoLegalityStatus): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        return GoRules.applyLegalMove(legalMove, slice, status);
    }
    public static applyLegalMove(legalMove: GoMove, slice: GoPartSlice, status: GoLegalityStatus): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        if (GoRules.VERBOSE) console.log("GoRules.applyLegalMove: " + legalMove + " at " + slice.turn + "th turn");
        if (GoRules.isPass(legalMove)) {
            if (GoRules.VERBOSE) console.log("GoRules.applyLegalMove: isPass");
            return GoRules.applyPass(slice);
        } else if (GoRules.isAccept(legalMove)) {
            if (GoRules.VERBOSE) console.log("GoRules.applyLegalMove: isAccept");
            return GoRules.applyAccept(slice);
        } else if (GoRules.isDeadMarking(legalMove, slice)) {
            if (GoRules.VERBOSE) console.log("GoRules.applyLegalMove: isDeadMarking");
            return GoRules.applyDeadMarkingMove(legalMove, slice);
        } else {
            if (GoRules.VERBOSE) console.log("GoRules.applyLegalMove: else it is normal move");
            return GoRules.applyNormalLegalMove(slice, legalMove, status);
        }
    }
    private static applyPass(slice: GoPartSlice): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        const resultingMove: GoMove = GoMove.PASS;
        const oldBoard = slice.getCopiedBoardGoPiece();
        const oldCaptured = slice.getCapturedCopy();
        const oldTurn = slice.turn;
        let newPhase: Phase;
        if (slice.phase === Phase.PASSED) {
            newPhase = Phase.COUNTING;
        } else if (slice.phase === Phase.PLAYING) {
            newPhase = Phase.PASSED;
        } else {
            throw new Error("Cannot pass in counting phase!");
        }
        const resultingSlice: GoPartSlice = new GoPartSlice(oldBoard, oldCaptured, oldTurn + 1, null, newPhase);
        return {resultingMove, resultingSlice};
    }
    private static applyAccept(slice: GoPartSlice): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        if (slice.phase === Phase.PLAYING)
            throw new Error("Cannot accept in PLAYING Phase");
        if (slice.phase === Phase.PASSED)
            throw new Error("Cannot accept in PASSED Phase");
        const resultingMove: GoMove = GoMove.ACCEPT;
        if (slice.phase === Phase.COUNTING) {
            const resultingSlice: GoPartSlice = new GoPartSlice(slice.getCopiedBoardGoPiece(),
                                                                slice.getCapturedCopy(),
                                                                slice.turn + 1,
                                                                null,
                                                                Phase.ACCEPT);
            return { resultingMove, resultingSlice };
        } else if (slice.phase === Phase.ACCEPT) {
            const resultingSlice: GoPartSlice = new GoPartSlice(slice.getCopiedBoardGoPiece(),
                                                                slice.getCapturedCopy(),
                                                                slice.turn + 1,
                                                                null,
                                                                Phase.FINISHED);
            return { resultingMove, resultingSlice };
        }
    }
    private static applyNormalLegalMove(currentPartSlice: GoPartSlice, legalMove: GoMove, status: GoLegalityStatus): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        const x: number = legalMove.coord.x;
        const y: number = legalMove.coord.y;

        let newBoard: GoPiece[][] = GoRules.setAliveAllPawns(currentPartSlice.getCopiedBoardGoPiece());
        const currentTurn: number = currentPartSlice.turn;
        const currentPlayerPawn: number = currentTurn%2 === 0 ? GoPiece.BLACK.value : GoPiece.WHITE.value;
        const newTurn: number = currentTurn + 1;
        newBoard[y][x] = GoPiece.of(currentPlayerPawn);
        const capturedCoords: Coord[] = status.capturedCoords;
        for (let capturedCoord of capturedCoords) {
            newBoard[capturedCoord.y][capturedCoord.x] = GoPiece.EMPTY;
        }
        let resultingMove: GoMove = new GoMove(x, y);
        let newKoCoord: Coord = GoRules.getNewKo(resultingMove, newBoard, capturedCoords);
        let newCaptured: number[] = currentPartSlice.getCapturedCopy();
        newCaptured[currentTurn % 2] += capturedCoords.length;
        let resultingSlice: GoPartSlice = new GoPartSlice(newBoard, newCaptured, newTurn, newKoCoord, Phase.PLAYING);
        return {resultingMove, resultingSlice};
    }
    private static setAliveAllPawns(board: GoPiece[][]): GoPiece[][] {
        const setAlivePawn: (pawn: GoPiece) => GoPiece = (pawn: GoPiece) => {
            if (pawn === GoPiece.DEAD_BLACK) return GoPiece.BLACK;
            if (pawn === GoPiece.DEAD_WHITE) return GoPiece.WHITE;
            else return pawn;
        }
        return GoRules.mapBoard(board, setAlivePawn);
    }
    private static applyDeadMarkingMove(legalMove: GoMove, slice: GoPartSlice): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        let switchedBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        const capturedCopy: number[] = slice.getCapturedCopy();
        const result: { resultingBoard: GoPiece[][], resultingCaptures: number[] } =
            GoRules.switchAliveness(legalMove.coord, switchedBoard);
        const newCaptures: number[] = [ capturedCopy[0] + result.resultingCaptures[0],
                                       capturedCopy[1] + result.resultingCaptures[1]];
        const resultingSlice: GoPartSlice =
            new GoPartSlice(result.resultingBoard, newCaptures, slice.turn + 1, null, Phase.COUNTING);
        return { resultingMove: legalMove, resultingSlice };
    }
    public getBoardValue(n: GoNode): number {
        const LOCAL_VERBOSE: boolean = false;

        if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log('GoRules.getBoardValue');

        const goPartSlice: GoPartSlice = n.gamePartSlice;

        const goScore: number[] = this.countBoardScore(goPartSlice);
        return goScore[1] - goScore[0];
    }
    public static getNewKo(move: GoMove, newBoard: GoPiece[][], captures: Coord[]): Coord {
        if (captures.length === 1) {
            const captured: Coord = captures[0];
            const capturerCoord: Coord = move.coord;
            const capturer: number = newBoard[capturerCoord.y][capturerCoord.x].value;
            let capturersInfo: GroupDatas = GroupDatas.getGroupDatas(capturerCoord, newBoard);
            let capturersFreedoms: Coord[] = capturersInfo.emptyCoords;
            let capturersGroup: Coord[] = GoPiece.pieceBelongTo(capturer, Player.ZERO) ? capturersInfo.blackCoords : capturersInfo.whiteCoords;
            if (capturersFreedoms.length === 1 &&
                capturersFreedoms[0].equals(captured) &&
                capturersGroup.length === 1) {
                return captured;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    public setInitialBoard() {
        if (this.node == null) {
            this.node = MNode.getFirstNode(new GoPartSlice(GoPartSlice.getStartingBoard(), [0, 0], 0, null, Phase.PLAYING), this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
    public countBoardScore(slice: GoPartSlice): number[] {
        const deadlessSlice: GoPartSlice = GoRules.switchDeadToScore(slice);
        let emptyZones: GroupDatas[] = GoRules.getEmptyZones(deadlessSlice);

        const captured: number[] = deadlessSlice.getCapturedCopy();
        let blackScore: number = captured[0];
        let whiteScore: number = captured[1];
        for (let emptyZone of emptyZones) {
            if (emptyZone.blackCoords.length === 0) {
                // white territory
                whiteScore += emptyZone.emptyCoords.length;
            } else if (emptyZone.whiteCoords.length === 0) {
                blackScore += emptyZone.emptyCoords.length;
            }
        }
        return [blackScore, whiteScore];
    }
    public static getEmptyZones(deadlessSlice: GoPartSlice): GroupDatas[] {
        return GoRules.getGroupsDatasWhere(deadlessSlice.getCopiedBoardGoPiece(), (pawn: GoPiece) => pawn === GoPiece.EMPTY);
    }
    public static getGroupsDatasWhere(board: GoPiece[][], condition: (pawn: GoPiece) => boolean): GroupDatas[] {
        let groups: GroupDatas[] = [];
        let coord: Coord;
        let group: GroupDatas;
        let currentCase: GoPiece;
        for (let y: number = 0; y < GoPartSlice.WIDTH; y++) {
            for (let x: number = 0; x < GoPartSlice.HEIGHT; x++) {
                coord = new Coord(x, y);
                currentCase = board[y][x];
                if (condition(currentCase)) {
                    if (!groups.some(currentGroup => currentGroup.selfCountains(coord))) {
                        group = GroupDatas.getGroupDatas(coord, board);
                        groups.push(group);
                    }
                }
            }
        }
        return groups;
    }
    public static switchDeadToScore(slice: GoPartSlice): GoPartSlice {
        // console.log("GoRules.switchDeadToScore");
        const captured: number[] = slice.getCapturedCopy();
        let whiteScore: number = captured[1];
        let blackScore: number = captured[0];
        let currentCase: GoPiece;
        let newBoard: GoPiece[][] = slice.getCopiedBoardGoPiece();
        for (let y: number = 0; y < GoPartSlice.WIDTH; y++) {
            for (let x: number = 0; x < GoPartSlice.HEIGHT; x++) {
                currentCase = newBoard[y][x];
                if (currentCase === GoPiece.DEAD_BLACK) {
                    whiteScore++;
                    newBoard[y][x] = GoPiece.EMPTY;
                } else if (currentCase === GoPiece.DEAD_WHITE) {
                    blackScore++;
                    newBoard[y][x] = GoPiece.EMPTY;
                }
            }
        }
        const newCaptured: number[] = [blackScore, whiteScore];
        const newTurn: number = slice.turn + 1;
        return new GoPartSlice(newBoard, newCaptured, newTurn, null, Phase.COUNTING);
    }
    private static switchAliveness(groupCoord: Coord, switchedBoard: GoPiece[][]): { resultingBoard: GoPiece[][], resultingCaptures: number[] } {
        // console.log("GoRules.switchAliveness");
        let switchedPiece: GoPiece = switchedBoard[groupCoord.y][groupCoord.x];
        if (switchedPiece === GoPiece.EMPTY) {
            throw new Error("Can't switch emptyness aliveness");
        }
        let group: GroupDatas = GroupDatas.getGroupDatas(groupCoord, switchedBoard);
        const resultingCaptures: number[] = [0, 0];
        if (group.color === GoPiece.DEAD_BLACK) {
            resultingCaptures[1] -= group.deadBlackCoords.length;
            for (let deadBlackCoord of group.deadBlackCoords) {
                switchedBoard[deadBlackCoord.y][deadBlackCoord.x] = GoPiece.BLACK;
            }
        } else if (group.color === GoPiece.DEAD_WHITE) {
            resultingCaptures[0] -= group.deadWhiteCoords.length;
            for (let deadWhiteCoord of group.deadWhiteCoords) {
                switchedBoard[deadWhiteCoord.y][deadWhiteCoord.x] = GoPiece.WHITE;
            }
        } else if (group.color === GoPiece.WHITE) {
            resultingCaptures[0] += group.whiteCoords.length;
            for (let whiteCoord of group.whiteCoords) {
                switchedBoard[whiteCoord.y][whiteCoord.x] = GoPiece.DEAD_WHITE;
            }
        } else if (group.color === GoPiece.BLACK) {
            resultingCaptures[1] += group.blackCoords.length;
            for (let blackCoord of group.blackCoords) {
                switchedBoard[blackCoord.y][blackCoord.x] = GoPiece.DEAD_BLACK;
            }
        }

        return { resultingBoard: switchedBoard, resultingCaptures };
    }
}

class CaptureState {

    public capturedCoords: Coord[] = [];

    public static isCapturing(captureState: CaptureState): boolean {
        return captureState.capturedCoords.length > 0;
    }
}

export class GroupDatas {

    public static VERBOSE: boolean = false;

    constructor(public color: GoPiece,
                public emptyCoords: Coord[],
                public blackCoords: Coord[],
                public whiteCoords: Coord[],
                public deadBlackCoords: Coord[],
                public deadWhiteCoords: Coord[]) {
    }
    public static getGroupDatas(coord: Coord, board: GoPiece[][]): GroupDatas {
        if (GroupDatas.VERBOSE) console.log("GroupDatas.getGroupDatas("+coord+", "+board+")");
        let color: GoPiece = board[coord.y][coord.x];
        let groupDatas: GroupDatas = new GroupDatas(color, [], [], [], [], []);
        return GroupDatas._getGroupDatas(coord, board, groupDatas);
    }
    private static _getGroupDatas(coord: Coord, board: GoPiece[][], groupDatas: GroupDatas): GroupDatas {
        if (GroupDatas.VERBOSE) console.log("GroupDatas._getGroupDatas: ", groupDatas, coord);
        let color: GoPiece = board[coord.y][coord.x];
        groupDatas.addPawn(coord, color);
        if (color === groupDatas.color) {
            for (let direction of Orthogonale.ORTHOGONALES) {
                let nextCoord: Coord = coord.getNext(direction);
                if (nextCoord.isInRange(GoPartSlice.WIDTH, GoPartSlice.HEIGHT)) {
                    if (!groupDatas.countains(nextCoord)) {
                        groupDatas = GroupDatas._getGroupDatas(nextCoord, board, groupDatas);
                    }
                }
            }
        }
        return groupDatas;
    }
    public getCoords(): Coord[] {
        if (this.color === GoPiece.BLACK) {
            return this.blackCoords;
        } else if (this.color === GoPiece.WHITE) {
            return this.whiteCoords;
        } else if (this.color === GoPiece.DEAD_BLACK) {
            return this.deadBlackCoords;
        } else if (this.color === GoPiece.DEAD_WHITE) {
            return this.deadWhiteCoords;
        } else {
            return this.emptyCoords;
        }
    }
    public countains(coord: Coord): boolean {
        let allCoords: Coord[] = this.blackCoords
                        .concat(this.whiteCoords
                        .concat(this.emptyCoords
                        .concat(this.deadBlackCoords
                        .concat(this.deadWhiteCoords))));
        return allCoords.some(c => c.equals(coord));
    }
    public selfCountains(coord: Coord): boolean {
        const ownCoords: Coord[] = this.getCoords();
        return ownCoords.some(c => c.equals(coord));
    }
    public addPawn(coord: Coord, color: GoPiece) {
        if (this.countains(coord)) {
            throw new Error("Ce groupe contient déjà " + coord);
        }
        if (color === GoPiece.BLACK) {
            this.blackCoords = GroupDatas.insertAsEntryPoint(this.blackCoords, coord);
        } else if (color === GoPiece.WHITE) {
            this.whiteCoords = GroupDatas.insertAsEntryPoint(this.whiteCoords, coord);
        } else if (color === GoPiece.DEAD_BLACK) {
            this.deadBlackCoords = GroupDatas.insertAsEntryPoint(this.deadBlackCoords, coord);
        } else if (color === GoPiece.DEAD_WHITE) {
            this.deadWhiteCoords = GroupDatas.insertAsEntryPoint(this.deadWhiteCoords, coord);
        } else if (color === GoPiece.EMPTY){
            this.emptyCoords = GroupDatas.insertAsEntryPoint(this.emptyCoords, coord);
        } else {
            throw new Error("Cette couleur de pion de Go n'existe pas: " + color);
        }
    }
    public static insertAsEntryPoint(list: Coord[], coord: Coord): Coord[] {
        if (list.length === 0) {
            return [coord];
        } else {
            const first: Coord = list[0];
            if (coord.compareTo(first) < 0) {
                return [coord].concat(list);
            } else {
                return list.concat([coord]);
            }
        }
    }
    public isMonoWrapped(): boolean {
        // If a group is empty, we assign him 1, else 2
        // If only the group of the group and the group of his wrapper are filled, result will be 2*2*1*1*1
        const emptyWrapper: number = this.emptyCoords.length === 0 ? 1 : 2;
        const blackWrapper: number = this.blackCoords.length === 0 ? 1 : 2;
        const whiteWrapper: number = this.whiteCoords.length === 0 ? 1 : 2;
        const deadBlackWrapper: number = this.deadBlackCoords.length === 0 ? 1 : 2;
        const deadWhiteWrapper: number = this.deadWhiteCoords.length === 0 ? 1 : 2;
        return (emptyWrapper * blackWrapper * whiteWrapper * deadBlackWrapper * deadWhiteWrapper) === 4;
    }
    public getNeighboorsEntryPoint(): Coord[] {
        const neighboorsEntryPoint: Coord[] = [];
        if (this.color !== GoPiece.EMPTY && this.emptyCoords.length > 0)
            neighboorsEntryPoint.push(this.emptyCoords[0]);
        if (this.color !== GoPiece.BLACK && this.blackCoords.length > 0)
            neighboorsEntryPoint.push(this.blackCoords[0]);
        if (this.color !== GoPiece.WHITE && this.whiteCoords.length > 0)
            neighboorsEntryPoint.push(this.whiteCoords[0]);
        if (this.color !== GoPiece.DEAD_BLACK && this.deadBlackCoords.length > 0)
            neighboorsEntryPoint.push(this.deadBlackCoords[0]);
        if (this.color !== GoPiece.DEAD_WHITE && this.deadWhiteCoords.length > 0)
            neighboorsEntryPoint.push(this.deadWhiteCoords[0]);
        console.log("Neighboors EP of " + this.color.value + ": " + JSON.stringify(neighboorsEntryPoint));
        return neighboorsEntryPoint;
    }
}
export class GroupInfos { // TODO: might absorb and delete GroupDatas ??

    public constructor(
        readonly coords: ReadonlyArray<Coord>,
        readonly neighboorsEP: ReadonlyArray<Coord>
    ) {}
}