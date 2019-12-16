import {Rules} from '../../jscaip/Rules';
import {MNode} from '../../jscaip/MNode';
import {Move} from '../../jscaip/Move';
import {MoveCoord} from '../../jscaip/MoveCoord';
import {Coord} from '../../jscaip/Coord';
import {MoveCoordAndCapture} from '../../jscaip/MoveCoordAndCapture';
import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {GoPartSlice} from './GoPartSlice';
import { DIRECTION, ORTHOGONALES } from 'src/app/jscaip/DIRECTION';

export class GoRules extends Rules {

    public static isLegal(move: MoveCoord, turn: number, partSlice: GoPartSlice): LegalityStatus {
        let board: number[][] = partSlice.getBoardCopy();
        if (GoRules.isOccupied(move, board)) {
            return {legal: false, capturedDirs: null};
        }
        let captureState: CaptureState = GoRules.getCaptureState(move, board);
        if (CaptureState.isCapturing(captureState)) {
            if (GoRules.isKo(move, partSlice)) {
                return {legal: false, capturedDirs: null};
            } else {
                return {legal: true, capturedDirs: captureState.capturedDirections};
            }
        } else {
            let isSuicide: boolean = GoRules.countFreedoms(move.coord, board).freedoms === 0;
            if (isSuicide) {
                return {legal: false, capturedDirs: null};
            } else {
                return {legal: true, capturedDirs: []};
            }
        }
    }

    private static isOccupied(move: MoveCoord, board: number[][]): boolean {
        return board[move.coord.y][move.coord.x] === GoPartSlice.EMPTY;
    }

    public static getCaptureState(move: MoveCoord, board: number[][]): CaptureState {
        let captureState: CaptureState = new CaptureState();
        for (let direction of ORTHOGONALES) {
            if (GoRules.isCapturingDirection(move.coord, direction, board)) {
                captureState.capturedDirections.push(direction);
            }
        }
        return captureState;
    }

    public static isCapturingDirection(coord: Coord, direction: DIRECTION, board: number[][]): boolean {
        let neightbooringCoord: Coord = coord.getNext(direction);
        if (neightbooringCoord.isInRange(GoRules.WIDTH, GoRules.HEIGHT)) {
            return GoRules.isCapturableCoord(neightbooringCoord, board);
        } else {
            return false;
        }
    }

    public static readonly WIDTH: number = 19;

    public static readonly HEIGHT: number = 19;

    public static isCapturableCoord(coord: Coord, board: number[][]): boolean {
        return GoRules.countFreedoms(coord, board).freedoms === 1
    }

    public static countFreedoms(coord: Coord, board: number[][]): FreedomDatas {
        let testedCoords: Coord[] = [];
        let freedoms: number = 0;
        let freedomDatas: FreedomDatas = {freedoms, testedCoords};
        let groupColor: number = board[coord.y][coord.x];
        return GoRules._countFreedoms(coord, board, groupColor, freedomDatas);
    }

    private static _countFreedoms(coord: Coord, board: number[][], groupColor: number, freedomsData: FreedomDatas): FreedomDatas {
        freedomsData.testedCoords.push(coord);
        let stone: number = board[coord.y][coord.x];
        if (stone === GoPartSlice.EMPTY) {
            freedomsData.freedoms++;
        } else if (stone === groupColor) {
            for (let direction of ORTHOGONALES) {
                let nextCoord = coord.getNext(direction);
                if (!freedomsData.testedCoords.includes(nextCoord)) {
                    freedomsData = GoRules._countFreedoms(nextCoord, board, groupColor, freedomsData);
                }
            }
        }
        return freedomsData; 
    }

    public static isKo(move: MoveCoord, partSlice: GoPartSlice): boolean {
        return partSlice.getKoCoord().equals(move.coord);
    }

    getListMoves(node: MNode<GoRules>): {key: Move, value: GamePartSlice}[] {
        const localVerbose = false;
        if (GoRules.VERBOSE || localVerbose) {
            console.log('getListMoves');
        }

        const choices: {key: Move, value: GamePartSlice}[] = [];
        const turn: number = node.gamePartSlice.turn;
        const player: number = turn % 2;
        let move: MoveCoord;
        let currentPartSlice: GoPartSlice = node.gamePartSlice as GoPartSlice; // TODO : voir si il faut pas la supprimer
        let goPartSlice: GoPartSlice;

        for (let y = 0; y<GoRules.HEIGHT; y++) {
            for (let x = 0; x<GoRules.WIDTH; x++) {
                move = new MoveCoord(x, y);
                let legality: LegalityStatus = GoRules.isLegal(move, turn, goPartSlice);
                if (legality.legal) {
                    // TODO modify board (put new, remove killed)
                    
                    goPartSlice = new GoPartSlice()
                    // TODO set as new move
                    // TODO set board back to normal
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

        const player: number = n.gamePartSlice.turn % 2;
        const ennemy = (player + 1) % 2;
        const GoPartSlice: GoPartSlice = n.gamePartSlice as GoPartSlice;
        const captured: number[] = GoPartSlice.captured;
        const c1 = captured[1];
        const c0 = captured[0];
        const board: number[][] = n.gamePartSlice.getCopiedBoard();
        if (GoRules.isStarving(player, board)) { // TODO tester de l'enlever
            if (!GoRules.canDistribute(ennemy, board)) {
                return (c0 > c1) ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
            }
        }

        if (c1 > 24) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (c0 > 24) {
            return Number.MIN_SAFE_INTEGER;
        }
        return c1 - c0;
    }

    choose(resultlessMove: MoveCoord): boolean {
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            const choix: MNode<GoRules> = this.node.getSonByMove(resultlessMove); // let's not doing if twice
            if (choix != null) {
                this.node = choix; // qui devient le plateau actuel
                return true;
            }
        }
        const turn: number = this.node.gamePartSlice.turn;
        const player = turn % 2;
        const ennemy = (turn + 1) % 2;
        const x: number = resultlessMove.coord.x;
        const y: number = resultlessMove.coord.y;
        if (GoRules.VERBOSE) {
            console.log('choose(' + resultlessMove.toString() + ') -> ' + ' at turn ' + turn);
        }
        const board: number[][] = this.node.gamePartSlice.getCopiedBoard();
        const moveResult: number[] = GoRules.isLegal(
            resultlessMove,
            this.node.gamePartSlice.turn,
            board);
        if (moveResult[0] === -1) {
            return false;
        }

        const moveAndResult = new MoveCoordAndCapture(x, y, moveResult);
        const GoPartSlice: GoPartSlice = this.node.gamePartSlice as GoPartSlice;
        const captured: number[] = GoPartSlice.getCapturedCopy();

        captured[player] += moveResult[player];
        captured[ennemy] += moveResult[ennemy];

        const newPartSlice: GoPartSlice = new GoPartSlice(board, turn + 1, captured);
        const son: MNode<GoRules> = new MNode(this.node, moveAndResult, newPartSlice);
        this.node = son;
        return true;
    }

    public setInitialBoard() {
        if (this.node == null) {
            this.node = MNode.getFirstNode(new GoPartSlice(GoPartSlice.getStartingBoard(), 0, [0, 0]), this);
        } else {
            this.node = this.node.getInitialNode();
        }
    }
}

class LegalityStatus {

    public legal: boolean;

    public capturedDirs: DIRECTION[];
}

class CaptureState {

    public capturedDirections: DIRECTION[] = [];

    public static isCapturing(captureState: CaptureState): boolean {
        return captureState.capturedDirections.length !== 0;
    }
}

class FreedomDatas {

    public freedoms: number;

    public testedCoords: Coord[];
}