import {Rules} from '../../jscaip/Rules';
import {MNode} from '../../jscaip/MNode';
import {Move} from '../../jscaip/Move';
import {Coord} from '../../jscaip/Coord';
import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {GoPartSlice, Pawn, Phase} from './GoPartSlice';
import {DIRECTION, ORTHOGONALES} from 'src/app/jscaip/DIRECTION';
import {GoMove} from './GoMove';
import { MGPMap } from 'src/app/collectionlib/MGPMap';

export class GoRules extends Rules {

    static VERBOSE: boolean = false;

    isLegal(move: GoMove): boolean {
        return GoRules.isLegal(move, this.node.gamePartSlice as GoPartSlice).legal;
    }

    public static isLegal(move: GoMove, goPartSlice: GoPartSlice): LegalityStatus {
        const LOCAL_VERBOSE: boolean = false;
        //if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("isLegal(" + move + ", " + goPartSlice.getCopiedBoard() + ");");
        let boardCopy: Pawn[][] = goPartSlice.getCopiedBoard();
        if (GoRules.isPass(move)) {
            return {legal: true, capturedCoords: []};
        }
        else if (GoRules.isOccupied(move, boardCopy)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " illegal ecrasement on " + goPartSlice.getCopiedBoard());
            return {legal: false, capturedCoords: null};
        }
        else if (GoRules.isKo(move, goPartSlice)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " illegal ko on " + goPartSlice.getCopiedBoard());
            return {legal: false, capturedCoords: null};
        }
        let captureState: CaptureState = GoRules.getCaptureState(move, goPartSlice);
        if (CaptureState.isCapturing(captureState)) {
            if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " legal avec capture on " + goPartSlice.getCopiedBoard());
            return {legal: true, capturedCoords: captureState.capturedCoords};
        } else {
            boardCopy[move.coord.y][move.coord.x] = goPartSlice.turn%2 === 0 ? Pawn.BLACK : Pawn.WHITE;
            let isSuicide: boolean = GoRules.getGroupDatas(move.coord, boardCopy).emptyCoords.length === 0;
            boardCopy[move.coord.y][move.coord.x] = Pawn.EMPTY;

            if (isSuicide) {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " illegal suicide on " + goPartSlice.getCopiedBoard());
                return {legal: false, capturedCoords: null};
            } else {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(move + " legal on " + goPartSlice.getCopiedBoard());
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

    public static isKo(move: GoMove, partSlice: GoPartSlice): boolean {
        return move.coord.equals(partSlice.getKoCoordCopy());
    }

    public static getCaptureState(move: GoMove, goPartSlice: GoPartSlice): CaptureState {
        const LOCAL_VERBOSE: boolean = false;
        if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("getCaptureState("+move+", " + goPartSlice.getCopiedBoard() + ")");
        let captureState: CaptureState = new CaptureState();
        let capturedInDirection: Coord[];
        for (let direction of ORTHOGONALES) {
            capturedInDirection = GoRules.getCapturedInDirection(move.coord, direction, goPartSlice);
            captureState.capturedCoords = captureState.capturedCoords.concat(capturedInDirection);
        }
        return captureState;
    }

    public static getCapturedInDirection(coord: Coord, direction: DIRECTION, goPartSlice: GoPartSlice): Coord[] {
        const LOCAL_VERBOSE: boolean = false;
        if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log(coord + " tested in " + direction.x+","+direction.y+ " for "+goPartSlice.getCopiedBoard());
        let neightbooringCoord: Coord = coord.getNext(direction);
        if (neightbooringCoord.isInRange(GoPartSlice.WIDTH, GoPartSlice.HEIGHT)) {
            let ennemi: Pawn = goPartSlice.turn%2 === 0 ? Pawn.WHITE : Pawn.BLACK;
            if (goPartSlice.getCopiedBoard()[neightbooringCoord.y][neightbooringCoord.x] === ennemi) {
                if (GoRules.VERBOSE || LOCAL_VERBOSE) console.log("un groupe pourrait être capturé");
                let neightbooringGroup: GroupDatas = GoRules.getGroupDatas(neightbooringCoord, goPartSlice.getCopiedBoard());
                let koCoord: Coord = goPartSlice.getKoCoordCopy();
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
        if (GoRules.VERBOSE) console.log(groupDatas);
        let color: number = board[coord.y][coord.x];
        groupDatas = GroupDatas.addPawn(groupDatas, coord, color);
        if (color === groupDatas.color) {
            for (let direction of ORTHOGONALES) {
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

    getListMoves(node: MNode<GoRules>): MGPMap<GoMove, GoPartSlice> {
        const localVerbose = false;
        if (GoRules.VERBOSE || localVerbose) {
            console.log('getListMoves');
        }

        const choices: MGPMap<GoMove, GoPartSlice> = new MGPMap<GoMove, GoPartSlice>();

        const currentPartSlice: GoPartSlice = node.gamePartSlice as GoPartSlice; // TODO : voir si il faut pas la supprimer

        let newResultlessMove: GoMove;
        
        for (let y = 0; y<GoPartSlice.HEIGHT; y++) {
            for (let x = 0; x<GoPartSlice.WIDTH; x++) {
                newResultlessMove = new GoMove(x, y, []);
                let legality: LegalityStatus = GoRules.isLegal(newResultlessMove, currentPartSlice);
                if (legality.legal) {
                    let result: {resultMove: GoMove, newPartSlice: GoPartSlice} =
                        GoRules.applyLegalMove(currentPartSlice, newResultlessMove, legality.capturedCoords);
                    choices.put(result.resultMove, result.newPartSlice);
                }
            }
        }
        return choices;
    }

    private static applyLegalMove(currentPartSlice: GoPartSlice, legalMove: GoMove, capturedCoords: Coord[]): {resultMove: GoMove, newPartSlice: GoPartSlice} {
        if (GoRules.isPass(legalMove)) {
            return GoRules.applyPass(currentPartSlice);
        } else {
            return GoRules.applyNormalLegalMove(currentPartSlice, legalMove, capturedCoords);
        }
    }

    private static applyPass(currentPartSlice: GoPartSlice): {resultMove: GoMove, newPartSlice: GoPartSlice} {
        const resultMove: GoMove = GoMove.pass;
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
        const newPartSlice: GoPartSlice = new GoPartSlice(oldBoard, oldCaptured, oldTurn + 1, null, newPhase);
        return {resultMove, newPartSlice};
    }

    private static applyNormalLegalMove(currentPartSlice: GoPartSlice, legalMove: GoMove, capturedCoords: Coord[]): {resultMove: GoMove, newPartSlice: GoPartSlice} {
        const x: number = legalMove.coord.x;
        const y: number = legalMove.coord.y;

        let newBoard: Pawn[][] = currentPartSlice.getCopiedBoard();
        const currentTurn: number = currentPartSlice.turn;
        const currentPlayerPawn: number = currentTurn%2 === 0 ? Pawn.BLACK : Pawn.WHITE;
        const newTurn: number = currentTurn + 1;
        newBoard[y][x] = currentPlayerPawn;
        for (let capturedCoord of capturedCoords) {
            newBoard[capturedCoord.y][capturedCoord.x] = Pawn.EMPTY;
        }
        let resultMove: GoMove = new GoMove(x, y, capturedCoords);
        let newKoCoord: Coord = GoRules.getNewKo(resultMove, newBoard);
        let newCaptured: number[] = currentPartSlice.getCapturedCopy();
        newCaptured[currentTurn % 2] += capturedCoords.length;
        let newPartSlice: GoPartSlice = new GoPartSlice(newBoard, newCaptured, newTurn, newKoCoord, Phase.PLAYING);
        return {resultMove, newPartSlice};
    }

    getBoardValue(n: MNode<GoRules>): number {
        const localVerbose = false;

        if (GoRules.VERBOSE || localVerbose) {
            console.log('GBV..');
        }
        const goPartSlice: GoPartSlice = n.gamePartSlice as GoPartSlice;
        const captured: number[] = goPartSlice.getCapturedCopy();
        // return captured[1] - captured[0];
        const goScore: number[] = GoRules.countBoardScore(goPartSlice);
        return goScore[1] - goScore[0];
    }

    choose(resultlessMove: GoMove): boolean {
        const LOCAL_VERBOSE: boolean = true;
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            const choix: MNode<GoRules> = this.node.getSonByMove(resultlessMove); // let's not doing if twice
            if (choix != null) {
                this.node = choix; // qui devient le plateau actuel
                return true;
            } // TODO: vérifier que le else ne signifie pas que ça doit retourner false
        }
        const currentPartSlice: GoPartSlice = this.node.gamePartSlice as GoPartSlice;
        const turn: number = currentPartSlice.turn;
        const player: number = turn % 2;
        const ennemy: number = (turn + 1) % 2;
        const x: number = resultlessMove.coord.x;
        const y: number = resultlessMove.coord.y;
        if (GoRules.VERBOSE || LOCAL_VERBOSE) {
            console.log('choose(' + resultlessMove.toString() + ') -> ' + ' at turn ' + turn);
        }
        const newBoard: Pawn[][] = currentPartSlice.getCopiedBoard(); // TODO: mettre code en commun avec isLegal et getListMoves
        const legality: LegalityStatus = GoRules.isLegal(resultlessMove, currentPartSlice);
        if (legality.legal === false) {
            return false;
        }

        let result: {resultMove: GoMove, newPartSlice: GoPartSlice} =
            GoRules.applyLegalMove(currentPartSlice, resultlessMove, legality.capturedCoords);        
        const son: MNode<GoRules> = new MNode(this.node, result.resultMove, result.newPartSlice);
        this.node = son;
        return true;
    }

    public static getNewKo(moveAndResult: GoMove, newBoard: Pawn[][]): Coord {
        const captures: Coord[] = moveAndResult.getCapturesCopy();
        if (captures.length === 1) {
            const captured: Coord = captures[0];
            let capturer: GroupDatas = GoRules.getGroupDatas(moveAndResult.coord, newBoard);
            if (GroupDatas.getCoordsOfGroup(capturer).length === 1 &&
                capturer.emptyCoords.length === 1 &&
                capturer.emptyCoords[0].equals(captured)) {
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

    public static countBoardScore(slice: GoPartSlice): number[] {
        const deadlessSlice: GoPartSlice = GoRules.switchDeadToScore(slice);
        const captured: number[] = deadlessSlice.getCapturedCopy();
        let emptyZones: GroupDatas[] = [];
        let whiteScore: number = captured[1];
        let blackScore: number = captured[0];
        
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
        return new GoPartSlice(switchedBoard, capturedCopy, slice.turn, slice.getKoCoordCopy(), Phase.COUNTING);
    }
}

class LegalityStatus {

    public legal: boolean;

    public capturedCoords: Coord[];
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
            throw new Error("Ce groupe contient déjà " + coord);
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