import {Rules} from '../../jscaip/Rules';
import {MNode} from '../../jscaip/MNode';
import {Move} from '../../jscaip/Move';
import {MoveCoord} from '../../jscaip/MoveCoord';
import {Coord} from '../../jscaip/Coord';
import {MoveCoordAndCapture} from '../../jscaip/MoveCoordAndCapture';
import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {GoPartSlice, Pawn} from './GoPartSlice';
import { DIRECTION, ORTHOGONALES } from 'src/app/jscaip/DIRECTION';

export class GoRules extends Rules {

    public static isLegal(move: MoveCoord, goPartSlice: GoPartSlice): LegalityStatus {
        let board: number[][] = goPartSlice.getCopiedBoard();
        if (GoRules.isOccupied(move, board) || GoRules.isKo(move, goPartSlice)) {
            return {legal: false, capturedCoords: null};
        }
        let captureState: CaptureState = GoRules.getCaptureState(move, goPartSlice);
        if (CaptureState.isCapturing(captureState)) {
            return {legal: true, capturedCoords: captureState.capturedCoords};
        } else {
            let isSuicide: boolean = GoRules.getGroupDatas(move.coord, board).emptyCoords.length === 0;
            if (isSuicide) {
                return {legal: false, capturedCoords: null};
            } else {
                return {legal: true, capturedCoords: []};
            }
        }
    }

    private static isOccupied(move: MoveCoord, board: Pawn[][]): boolean {
        return board[move.coord.y][move.coord.x] === Pawn.EMPTY;
    }

    public static isKo(move: MoveCoord, partSlice: GoPartSlice): boolean {
        return partSlice.getKoCoordCopy().equals(move.coord);
    }

    public static getCaptureState(move: MoveCoord, goPartSlice: GoPartSlice): CaptureState {
        let captureState: CaptureState = new CaptureState();
        let capturedInDirection: Coord[];
        for (let direction of ORTHOGONALES) {
            capturedInDirection = GoRules.getCapturedInDirection(move.coord, direction, goPartSlice);
            captureState.capturedCoords = captureState.capturedCoords.concat(capturedInDirection);
        }
        return captureState;
    }

    public static getCapturedInDirection(coord: Coord, direction: DIRECTION, goPartSlice: GoPartSlice): Coord[] {
        let neightbooringCoord: Coord = coord.getNext(direction);
        let koCoord: Coord = goPartSlice.getKoCoordCopy();
        if (neightbooringCoord.isInRange(GoPartSlice.WIDTH, GoPartSlice.HEIGHT)) {
            let neightbooringGroup: GroupDatas = GoRules.getGroupDatas(neightbooringCoord, goPartSlice.getCopiedBoard());
            if (GoRules.isCapturableGroup(neightbooringGroup, koCoord)) {
                return GroupDatas.getCoordsOfGroup(neightbooringGroup);
            }
        } else {
            return [];
        }
    }

    public static isCapturableGroup(groupDatas: GroupDatas, koCoord: Coord): boolean {
        if (groupDatas.color !== Pawn.EMPTY && groupDatas.emptyCoords.length === 1) {
            return !groupDatas.emptyCoords[0].equals(koCoord); // Ko Rules Block Capture
        } else {
            return false;
        }
    }

    public static getGroupDatas(coord: Coord, board: Pawn[][]): GroupDatas {
        let coords: Coord[] = [];
        let color: number = board[coord.y][coord.x];
        let emptyCoords: Coord[] = [];
        let blackCoords: Coord[] = [];
        let whiteCoords: Coord[] = [];
        let groupDatas: GroupDatas = {color, emptyCoords, blackCoords, whiteCoords};
        return GoRules._getGroupDatas(coord, board, groupDatas);
    }

    private static _getGroupDatas(coord: Coord, board: Pawn[][], groupDatas: GroupDatas): GroupDatas {
        let stone: number = board[coord.y][coord.x];
        groupDatas = GroupDatas.addPawn(groupDatas, coord, stone);
        if (stone === groupDatas.color) {
            for (let direction of ORTHOGONALES) {
                let nextCoord: Coord = coord.getNext(direction);
                let testedCoords: Coord[] = groupDatas.blackCoords
                                    .concat(groupDatas.whiteCoords
                                    .concat(groupDatas.emptyCoords));
                if (!testedCoords.includes(nextCoord)) {
                    groupDatas = GoRules._getGroupDatas(nextCoord, board, groupDatas);
                }
            }
        }
        return groupDatas; 
    }

    getListMoves(node: MNode<GoRules>): {key: Move, value: GamePartSlice}[] {
        const localVerbose = false;
        if (GoRules.VERBOSE || localVerbose) {
            console.log('getListMoves');
        }

        const choices: {key: Move, value: GamePartSlice}[] = [];

        const currentTurn: number = node.gamePartSlice.turn;
        const currentPlayerPawn: number = currentTurn%2 === 0 ? Pawn.BLACK : Pawn.WHITE;
        const currentPartSlice: GoPartSlice = node.gamePartSlice as GoPartSlice; // TODO : voir si il faut pas la supprimer

        const newTurn: number = currentTurn + 1;
        let newResultlessMove: MoveCoord;
        let newPartSlice: GoPartSlice;
        let newMove: MoveCoordAndCapture<Coord>;
        let newCaptured: number[];
        let newBoard: Pawn[][];
        let newKoCoord: Coord;

        for (let y = 0; y<GoPartSlice.HEIGHT; y++) {
            for (let x = 0; x<GoPartSlice.WIDTH; x++) {
                newResultlessMove = new MoveCoord(x, y);
                let legality: LegalityStatus = GoRules.isLegal(newResultlessMove, currentPartSlice);
                if (legality.legal) {
                    newBoard = currentPartSlice.getCopiedBoard();
                    newBoard[y][x] = currentPlayerPawn;
                    for (let capturedCoord of legality.capturedCoords) {
                        newBoard[capturedCoord.y][capturedCoord.x] == Pawn.EMPTY;
                    }
                    newKoCoord = GoRules.getNewKo(newMove, newBoard);
                    newMove = new MoveCoordAndCapture<Coord>(x, y, legality.capturedCoords);
                    newCaptured = currentPartSlice.getCapturedCopy();
                    newCaptured[currentTurn % 2] += legality.capturedCoords.length;
                    newPartSlice = new GoPartSlice(newBoard, newCaptured, newTurn, newKoCoord);
                    choices.push({key: newMove, value: newPartSlice});
                }
            }
        }
        return choices;
    }

    static VERBOSE = false;

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
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            const choix: MNode<GoRules> = this.node.getSonByMove(resultlessMove); // let's not doing if twice
            if (choix != null) {
                this.node = choix; // qui devient le plateau actuel
                return true;
            } // TODO: vérifier que le else ne signifie pas que ça doit retourner false
        }
        const goPartSlice: GoPartSlice = this.node.gamePartSlice as GoPartSlice;
        const turn: number = goPartSlice.turn;
        const player: number = turn % 2;
        const ennemy: number = (turn + 1) % 2;
        const x: number = resultlessMove.coord.x;
        const y: number = resultlessMove.coord.y;
        if (GoRules.VERBOSE) {
            console.log('choose(' + resultlessMove.toString() + ') -> ' + ' at turn ' + turn);
        }
        const board: Pawn[][] = goPartSlice.getCopiedBoard();
        const legalityStatus: LegalityStatus = GoRules.isLegal(resultlessMove, goPartSlice);
        if (legalityStatus.legal === false) {
            return false;
        }
        const capturedCoords: Coord[] = legalityStatus.capturedCoords;
        const moveAndResult = new MoveCoordAndCapture<Coord>(x, y, capturedCoords);
        const captured: number[] = goPartSlice.getCapturedCopy();
        const koCoord: Coord = GoRules.getNewKo(moveAndResult, board);

        captured[player] += capturedCoords.length;

        const newPartSlice: GoPartSlice = new GoPartSlice(board, captured, turn + 1, koCoord);
        const son: MNode<GoRules> = new MNode(this.node, moveAndResult, newPartSlice);
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
            this.node = MNode.getFirstNode(new GoPartSlice(GoPartSlice.getStartingBoard(), [0, 0], 0, null), this);
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

    public static addPawn(group: GroupDatas, coord: Coord, color: Pawn): GroupDatas {
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