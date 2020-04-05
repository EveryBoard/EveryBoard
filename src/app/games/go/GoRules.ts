import {Rules} from '../../jscaip/Rules';
import {MNode} from '../../jscaip/MNode';
import {Coord} from '../../jscaip/Coord';
import {GoPartSlice, Pawn, Phase} from './GoPartSlice';
import {Direction, Orthogonale} from 'src/app/jscaip/DIRECTION';
import {GoMove} from './GoMove';
import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { GoLegalityStatus } from './GoLegalityStatus';

export class GoRules extends Rules<GoMove, GoPartSlice, GoLegalityStatus> {

    static VERBOSE: boolean = false;

    constructor() {
        super();
        this.node = MNode.getFirstNode(
            new GoPartSlice(GoPartSlice.getStartingBoard(), [0, 0], 0, null, Phase.PLAYING),
            this
        );
    }

    public isLegal(move: GoMove, slice: GoPartSlice): GoLegalityStatus {
        const LOCAL_VERBOSE: boolean = false;
        const ILLEGAL: GoLegalityStatus = {legal: false, capturedCoords: null};

        let boardCopy: Pawn[][] = slice.getCopiedBoard();
        if (GoRules.isPass(move)) {
            return {legal: slice.phase !== Phase.COUNTING, capturedCoords: []};
        }
        else if (GoRules.isOccupied(move, boardCopy)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " illegal ecrasement on " + slice.getCopiedBoard());
            return ILLEGAL;
        }
        else if (GoRules.isKo(move, slice)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " illegal ko on " + slice.getCopiedBoard());
            return ILLEGAL;
        }
        let captureState: CaptureState = GoRules.getCaptureState(move, slice);
        if (CaptureState.isCapturing(captureState)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " legal avec capture on " + slice.getCopiedBoard());
            return {legal: true, capturedCoords: captureState.capturedCoords};
        } else {
            boardCopy[move.coord.y][move.coord.x] = slice.turn%2 === 0 ? Pawn.BLACK : Pawn.WHITE;
            let isSuicide: boolean = GoRules.getGroupDatas(move.coord, boardCopy).emptyCoords.length === 0;
            boardCopy[move.coord.y][move.coord.x] = Pawn.EMPTY;

            if (isSuicide) {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " illegal suicide on " + slice.getCopiedBoard());
                return ILLEGAL;
            } else {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " legal on " + slice.getCopiedBoard());
                return {legal: true, capturedCoords: []};
            }
        }
    }

    private static isPass(move: GoMove): boolean {
        return move.equals(GoMove.pass);
    }

    private static isOccupied(move: GoMove, board: Pawn[][]): boolean {
        return board[move.coord.y][move.coord.x] !== Pawn.EMPTY;
    }

    public static isKo(move: GoMove, slice: GoPartSlice): boolean {
        return move.coord.equals(slice.koCoord);
    }

    public static getCaptureState(move: GoMove, goPartSlice: GoPartSlice): CaptureState {
        const LOCAL_VERBOSE: boolean = false;
        if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("getCaptureState("+move+", " + goPartSlice.getCopiedBoard() + ")");
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
        let copiedBoard: number[][] = slice.getCopiedBoard();
        if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(coord + " tested in " + direction.x+","+direction.y+ " for "+copiedBoard);
        let neightbooringCoord: Coord = coord.getNext(direction);
        if (neightbooringCoord.isInRange(GoPartSlice.WIDTH, GoPartSlice.HEIGHT)) {
            let ennemi: Pawn = slice.turn%2 === 0 ? Pawn.WHITE : Pawn.BLACK;
            if (copiedBoard[neightbooringCoord.y][neightbooringCoord.x] === ennemi) {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("un groupe pourrait �tre captur�");
                let neightbooringGroup: GroupDatas = GoRules.getGroupDatas(neightbooringCoord, copiedBoard);
                let koCoord: Coord = slice.koCoord;
                if (GoRules.isCapturableGroup(neightbooringGroup, koCoord)) {
                    if (GoRules.VERBOSE || LOCAL_VERBOSE) {
                        console.log(neightbooringGroup);
                        console.log("is capturable")
                        console.log(GroupDatas.getCoordsOfGroup(neightbooringGroup));
                    }
                    return GroupDatas.getCoordsOfGroup(neightbooringGroup);
                }
            }
        }
        return [];
    }

    public static isCapturableGroup(groupDatas: GroupDatas, koCoord: Coord): boolean {
        if (groupDatas.color !== Pawn.EMPTY && groupDatas.emptyCoords.length === 1) {
            return !groupDatas.emptyCoords[0].equals(koCoord); // Ko Rules Block Capture
        } else {
            return false;
        }
    }

    public static getGroupDatas(coord: Coord, board: Pawn[][]): GroupDatas {
        if (GoRules.VERBOSE) console.log("getGroupDatas("+coord+", "+board+")");
        let color: number = board[coord.y][coord.x];
        let emptyCoords: Coord[] = [];
        let blackCoords: Coord[] = [];
        let whiteCoords: Coord[] = [];
        let deadWhiteCoords: Coord[] = [];
        let deadBlackCoords: Coord[] = [];
        let groupDatas: GroupDatas = {color, emptyCoords, blackCoords, whiteCoords, deadWhiteCoords, deadBlackCoords};
        return GoRules._getGroupDatas(coord, board, groupDatas);
    }

    private static _getGroupDatas(coord: Coord, board: Pawn[][], groupDatas: GroupDatas): GroupDatas {
        // if (GoRules.VERBOSE) console.log(groupDatas);
        let color: number = board[coord.y][coord.x];
        groupDatas = GroupDatas.addPawn(groupDatas, coord, color);
        if (color === groupDatas.color) {
            for (let direction of Orthogonale.ORTHOGONALES) {
                let nextCoord: Coord = coord.getNext(direction);
                if (nextCoord.isInRange(GoPartSlice.WIDTH, GoPartSlice.HEIGHT)) {
                    if (!GroupDatas.countains(groupDatas, nextCoord)) {
                        groupDatas = GoRules._getGroupDatas(nextCoord, board, groupDatas);
                    }
                }
            }
        }
        return groupDatas;
    }

    public getListMoves(node: MNode<GoRules, GoMove, GoPartSlice, GoLegalityStatus>): MGPMap<GoMove, GoPartSlice> {
        const localVerbose = false;
        if (GoRules.VERBOSE || localVerbose) console.log('getListMoves');

        const choices: MGPMap<GoMove, GoPartSlice> = new MGPMap<GoMove, GoPartSlice>();

        const currentSlice: GoPartSlice = node.gamePartSlice;

        let newResultlessMove: GoMove;

        for (let y = 0; y<GoPartSlice.HEIGHT; y++) {
            for (let x = 0; x<GoPartSlice.WIDTH; x++) {
                newResultlessMove = new GoMove(x, y);
                let legality: GoLegalityStatus = this.isLegal(newResultlessMove, currentSlice);
                if (legality.legal) {
                    let result: {resultingMove: GoMove, resultingSlice: GoPartSlice} =
                        this.applyLegalMove(newResultlessMove, currentSlice, legality);
                    choices.put(result.resultingMove, result.resultingSlice);
                }
            }
        }
        return choices;
    }

    public applyLegalMove(legalMove: GoMove, currentPartSlice: GoPartSlice, status: GoLegalityStatus): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        if (GoRules.isPass(legalMove)) {
            return GoRules.applyPass(currentPartSlice);
        } else {
            return GoRules.applyNormalLegalMove(currentPartSlice, legalMove, status);
        }
    }

    private static applyPass(currentPartSlice: GoPartSlice): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        const resultingMove: GoMove = GoMove.pass;
        const oldBoard = currentPartSlice.getCopiedBoard();
        const oldCaptured = currentPartSlice.getCapturedCopy();
        const oldTurn = currentPartSlice.turn;
        let newPhase: Phase;
        if (currentPartSlice.phase === Phase.PASSED) {
            newPhase = Phase.COUNTING;
        } else if (currentPartSlice.phase === Phase.PLAYING) {
            newPhase = Phase.PASSED;
        } else {
            throw new Error("Cannot pass in counting phase!");
        }
        const resultingSlice: GoPartSlice = new GoPartSlice(oldBoard, oldCaptured, oldTurn + 1, null, newPhase);
        return {resultingMove, resultingSlice};
    }

    private static applyNormalLegalMove(currentPartSlice: GoPartSlice, legalMove: GoMove, status: GoLegalityStatus): {resultingMove: GoMove, resultingSlice: GoPartSlice} {
        const x: number = legalMove.coord.x;
        const y: number = legalMove.coord.y;

        let newBoard: Pawn[][] = currentPartSlice.getCopiedBoard();
        const currentTurn: number = currentPartSlice.turn;
        const currentPlayerPawn: number = currentTurn%2 === 0 ? Pawn.BLACK : Pawn.WHITE;
        const newTurn: number = currentTurn + 1;
        newBoard[y][x] = currentPlayerPawn;
        const capturedCoords: Coord[] = status.capturedCoords;
        for (let capturedCoord of capturedCoords) {
            newBoard[capturedCoord.y][capturedCoord.x] = Pawn.EMPTY;
        }
        let resultingMove: GoMove = new GoMove(x, y);
        let newKoCoord: Coord = GoRules.getNewKo(resultingMove, newBoard, capturedCoords);
        let newCaptured: number[] = currentPartSlice.getCapturedCopy();
        newCaptured[currentTurn % 2] += capturedCoords.length;
        let resultingSlice: GoPartSlice = new GoPartSlice(newBoard, newCaptured, newTurn, newKoCoord, Phase.PLAYING);
        return {resultingMove, resultingSlice};
    }

    public getBoardValue(n: MNode<GoRules, GoMove, GoPartSlice, GoLegalityStatus>): number {
        const localVerbose = false;

        if (GoRules.VERBOSE || localVerbose) console.log('GBV..');

        const goPartSlice: GoPartSlice = n.gamePartSlice;
        const captured: number[] = goPartSlice.getCapturedCopy();

        const goScore: number[] = this.countBoardScore(goPartSlice);
        return goScore[1] - goScore[0];
    }

    public static getNewKo(move: GoMove, newBoard: Pawn[][], captures: Coord[]): Coord {
        if (captures.length === 1) {
            const captured: Coord = captures[0];
            const capturer: Coord = move.coord;
            let capturerInfo: GroupDatas = GoRules.getGroupDatas(capturer, newBoard);
            let capturerFreedom: Coord[] = capturerInfo.emptyCoords;
            if (capturerFreedom.length === 1 && capturerFreedom[0].equals(captured)) {
                return captured;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public setInitialBoard() { // TODO: make generic and unherited
        if (this.node == null) {
            this.node = MNode.getFirstNode(new GoPartSlice(GoPartSlice.getStartingBoard(), [0, 0], 0, null, Phase.PLAYING), this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }

    public countBoardScore(slice: GoPartSlice): number[] {
        const deadlessSlice: GoPartSlice = GoRules.switchDeadToScore(slice);
        const captured: number[] = deadlessSlice.getCapturedCopy();
        let emptyZones: GroupDatas[] = [];
        let blackScore: number = captured[0];
        let whiteScore: number = captured[1];

        let board: Pawn[][] = deadlessSlice.getCopiedBoard();

        let coord: Coord;
        let group: GroupDatas;
        let currentCase: Pawn;
        for (let y: number = 0; y < GoPartSlice.WIDTH; y++) {
            for (let x: number = 0; x < GoPartSlice.HEIGHT; x++) {
                coord = new Coord(x, y);
                currentCase = board[y][x];
                if (currentCase === Pawn.EMPTY) {
                    if (!emptyZones.some(group => GroupDatas.countains(group, coord))) {
                        group = GoRules.getGroupDatas(coord, board);
                        emptyZones.push(group);
                    }
                }
            }
        }
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

    private static switchDeadToScore(slice: GoPartSlice): GoPartSlice {
        const captured: number[] = slice.getCapturedCopy();
        let whiteScore: number = captured[1];
        let blackScore: number = captured[0];
        let coord: Coord;
        let currentCase: Pawn;
        let newBoard: Pawn[][] = slice.getCopiedBoard();
        for (let y: number = 0; y < GoPartSlice.WIDTH; y++) {
            for (let x: number = 0; x < GoPartSlice.HEIGHT; x++) {
                coord = new Coord(x, y);
                currentCase = newBoard[y][x];
                if (currentCase === Pawn.DEAD_BLACK) {
                    whiteScore++;
                    newBoard[y][x] = Pawn.EMPTY;
                } else if (currentCase === Pawn.DEAD_WHITE) {
                    blackScore++;
                    newBoard[y][x] = Pawn.EMPTY;
                }
            }
        }
        const newCaptured: number[] = [blackScore, whiteScore];
        const newTurn: number = slice.turn;
        return new GoPartSlice(newBoard, newCaptured, newTurn, null, Phase.COUNTING);
    }

    private static switchAliveness(slice: GoPartSlice, groupCoord: Coord): GoPartSlice {
        let switchedBoard: Pawn[][] = slice.getCopiedBoard();
        let switchedPiece: Pawn = slice.getBoardByXY(groupCoord.x, groupCoord.y);
        if (switchedPiece === Pawn.EMPTY) {
            throw new Error("Can't switch emptyness aliveness");
        }
        let group: GroupDatas = GoRules.getGroupDatas(groupCoord, slice.getCopiedBoard());
        let capturedCopy: number[] = slice.getCapturedCopy();
        if (group.color === Pawn.DEAD_BLACK) {
            capturedCopy[1] -= group.deadBlackCoords.length;
            for (let deadBlackCoord of group.deadBlackCoords) {
                switchedBoard[deadBlackCoord.y][deadBlackCoord.x] = Pawn.BLACK;
            }
        } else if (group.color === Pawn.DEAD_WHITE) {
            capturedCopy[0] -= group.deadWhiteCoords.length;
            for (let deadWhiteCoord of group.deadWhiteCoords) {
                switchedBoard[deadWhiteCoord.y][deadWhiteCoord.x] = Pawn.WHITE;
            }
        } else if (group.color === Pawn.WHITE) {
            capturedCopy[0] += group.whiteCoords.length;
            for (let whiteCoord of group.whiteCoords) {
                switchedBoard[whiteCoord.y][whiteCoord.x] = Pawn.DEAD_WHITE;
            }
        } else if (group.color === Pawn.BLACK) {
            capturedCopy[1] += group.blackCoords.length;
            for (let blackCoord of group.blackCoords) {
                switchedBoard[blackCoord.y][blackCoord.x] = Pawn.DEAD_BLACK;
            }
        }
        return new GoPartSlice(switchedBoard, capturedCopy, slice.turn, slice.koCoord.getCopy(), Phase.COUNTING);
    }

    private static switchNonCapturingGroupToDead(slice: GoPartSlice): GoPartSlice {
        throw new Error("unimplemented shit");
    }
}

class CaptureState {

    public capturedCoords: Coord[] = [];

    public static isCapturing(captureState: CaptureState): boolean {
        return captureState.capturedCoords.length > 0;
    }
}

class GroupDatas {

    public color: Pawn;

    public emptyCoords: Coord[];

    public blackCoords: Coord[];

    public whiteCoords: Coord[];

    public deadBlackCoords: Coord[];

    public deadWhiteCoords: Coord[];

    public static getCoordsOfGroup(group: GroupDatas): Coord[] {
        if (group.color === Pawn.BLACK) {
            return group.blackCoords;
        } else if (group.color === Pawn.WHITE) {
            return group.whiteCoords;
        } else if (group.color === Pawn.DEAD_BLACK) {
            return group.deadBlackCoords;
        } else if (group.color === Pawn.DEAD_WHITE) {
            return group.deadWhiteCoords;
        } else {
            return group.emptyCoords;
        }
    }

    public static countains(group: GroupDatas, coord: Coord) {
        let allCoord: Coord[] = group.blackCoords
                        .concat(group.whiteCoords
                        .concat(group.emptyCoords
                        .concat(group.deadBlackCoords
                        .concat(group.deadWhiteCoords))));
        return allCoord.some(c => c.equals(coord));
    }

    public static addPawn(group: GroupDatas, coord: Coord, color: Pawn): GroupDatas {
        if (GroupDatas.countains(group, coord)) {
            throw new Error("Ce groupe contient d�j� " + coord);
        }
        if (color === Pawn.BLACK) {
            group.blackCoords.push(coord);
        } else if (color === Pawn.WHITE) {
            group.whiteCoords.push(coord);
        } else if (color === Pawn.DEAD_BLACK) {
            group.deadBlackCoords.push(coord);
        } else if (color === Pawn.DEAD_WHITE) {
            group.deadWhiteCoords.push(coord);
        } else if (color === Pawn.EMPTY){
            group.emptyCoords.push(coord);
        } else {
            throw new Error("Cette couleur de pion de Go n'existe pas");
        }
        return group;
    }
}