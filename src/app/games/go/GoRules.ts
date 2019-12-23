import {Rules} from '../../jscaip/Rules';
import {MNode} from '../../jscaip/MNode';
import {Move} from '../../jscaip/Move';
import {MoveCoord} from '../../jscaip/MoveCoord';
import {Coord} from '../../jscaip/Coord';
import {MoveCoordAndCapture} from '../../jscaip/MoveCoordAndCapture';
import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {GoPartSlice, Pawn, Phase} from './GoPartSlice';
import {DIRECTION, ORTHOGONALES} from 'src/app/jscaip/DIRECTION';

export class GoRules extends Rules {

    static VERBOSE: boolean = false;

    static readonly pass: MoveCoordAndCapture<Coord> = new MoveCoordAndCapture<Coord>(-1, 1, []);

    static readonly passNumber: number = -1;

    isLegal(move: MoveCoord): boolean {
        return GoRules.isLegal(move, this.node.gamePartSlice as GoPartSlice).legal;
    }

    public static isLegal(move: MoveCoord, goPartSlice: GoPartSlice): LegalityStatus {
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

    private static isPass(move: MoveCoord): boolean {
        return move.equals(GoRules.pass);
    }

    private static isOccupied(move: MoveCoord, board: Pawn[][]): boolean {
        return board[move.coord.y][move.coord.x] !== Pawn.EMPTY;
    }

    public static isKo(move: MoveCoord, partSlice: GoPartSlice): boolean {
        return move.coord.equals(partSlice.getKoCoordCopy());
    }

    public static getCaptureState(move: MoveCoord, goPartSlice: GoPartSlice): CaptureState {
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
        let groupDatas: GroupDatas = {color, emptyCoords, blackCoords, whiteCoords};
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

    getListMoves(node: MNode<GoRules>): {key: Move, value: GoPartSlice}[] {
        const localVerbose = false;
        if (GoRules.VERBOSE || localVerbose) {
            console.log('getListMoves');
        }

        const choices: {key: Move, value: GoPartSlice}[] = [];

        const currentPartSlice: GoPartSlice = node.gamePartSlice as GoPartSlice; // TODO : voir si il faut pas la supprimer

        let newResultlessMove: MoveCoord;
        
        for (let y = 0; y<GoPartSlice.HEIGHT; y++) {
            for (let x = 0; x<GoPartSlice.WIDTH; x++) {
                newResultlessMove = new MoveCoord(x, y);
                let legality: LegalityStatus = GoRules.isLegal(newResultlessMove, currentPartSlice);
                if (legality.legal) {
                    let result: {resultMove: MoveCoordAndCapture<Coord>, newPartSlice: GoPartSlice} =
                        GoRules.applyLegalMove(currentPartSlice, newResultlessMove, legality.capturedCoords);
                    choices.push({key: result.resultMove, value: result.newPartSlice});
                }
            }
        }
        return choices;
    }

    private static applyLegalMove(currentPartSlice: GoPartSlice, legalMove: MoveCoord, capturedCoords: Coord[]): {resultMove: MoveCoordAndCapture<Coord>, newPartSlice: GoPartSlice} {
        if (GoRules.isPass(legalMove)) {
            return GoRules.applyPass(currentPartSlice);
        } else {
            return GoRules.applyNormalLegalMove(currentPartSlice, legalMove, capturedCoords);
        }
    }

    private static applyPass(currentPartSlice: GoPartSlice): {resultMove: MoveCoordAndCapture<Coord>, newPartSlice: GoPartSlice} {
        const resultMove: MoveCoordAndCapture<Coord> = GoRules.pass;
        const oldBoard = currentPartSlice.getCopiedBoard();
        const oldCaptured = currentPartSlice.getCapturedCopy();
        const oldTurn = currentPartSlice.turn;
        const newPartSlice: GoPartSlice = new GoPartSlice(oldBoard, oldCaptured, oldTurn + 1, null, Phase.PASSED);
        return {resultMove, newPartSlice};
    }

    private static applyNormalLegalMove(currentPartSlice: GoPartSlice, legalMove: MoveCoord, capturedCoords: Coord[]): {resultMove: MoveCoordAndCapture<Coord>, newPartSlice: GoPartSlice} {
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
        let resultMove: MoveCoordAndCapture<Coord> = new MoveCoordAndCapture<Coord>(x, y, capturedCoords);
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
        return captured[1] - captured[0];
    }

    choose(resultlessMove: MoveCoord): boolean {
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

        let result: {resultMove: MoveCoordAndCapture<Coord>, newPartSlice: GoPartSlice} =
            GoRules.applyLegalMove(currentPartSlice, resultlessMove, legality.capturedCoords);        
        const son: MNode<GoRules> = new MNode(this.node, result.resultMove, result.newPartSlice);
        this.node = son;
        return true;
    }

    public static getNewKo(moveAndResult: MoveCoordAndCapture<Coord>, newBoard: Pawn[][]): Coord {
        const captures: Coord[] = moveAndResult.getCapture();
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

    public setInitialBoard() {
        if (this.node == null) {
            this.node = MNode.getFirstNode(new GoPartSlice(GoPartSlice.getStartingBoard(), [0, 0], 0, null, Phase.PLAYING), this);
        } else {
            this.node = this.node.getInitialNode();
        }
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

    public static getCoordsOfGroup(group: GroupDatas): Coord[] {
        if (group.color === Pawn.BLACK) {
            return group.blackCoords;
        } else if (group.color === Pawn.WHITE) {
            return group.whiteCoords;
        } else {
            return group.emptyCoords;
        }
    }

    public static countains(group: GroupDatas, coord: Coord) {
        let allCoord: Coord[] = group.blackCoords.concat(group.whiteCoords.concat(group.emptyCoords));
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
        } else {
            group.emptyCoords.push(coord);
        }
        return group;
    }
}