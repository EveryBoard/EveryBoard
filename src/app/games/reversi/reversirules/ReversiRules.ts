import {Rules} from '../../../jscaip/Rules';
import {MNode} from '../../../jscaip/MNode';
import {ReversiPartSlice} from '../ReversiPartSlice';
import {Coord} from '../../../jscaip/coord/Coord';
import {Direction} from '../../../jscaip/DIRECTION';
import { ReversiMove } from '../reversimove/ReversiMove';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { ReversiLegalityStatus } from '../ReversiLegalityStatus';
import { Player } from 'src/app/jscaip/Player';

abstract class ReversiNode extends MNode<ReversiRules, ReversiMove, ReversiPartSlice, ReversiLegalityStatus> {}

export class ReversiRules extends Rules<ReversiMove, ReversiPartSlice, ReversiLegalityStatus> {

    public static VERBOSE: boolean = false;

    constructor() {
        super(false);
        this.node = MNode.getFirstNode(
            new ReversiPartSlice(ReversiPartSlice.getStartingBoard(), 0),
            this
        );
    }
    public applyLegalMove(move: ReversiMove, slice: ReversiPartSlice, status: ReversiLegalityStatus): { resultingMove: ReversiMove; resultingSlice: ReversiPartSlice; } {
        const turn: number = slice.turn;
        const player: number = turn % 2;
        const board: number[][] = slice.getCopiedBoard();
        if (move.equals(ReversiMove.pass)) { // if the player pass
            // let's check that pass is a legal move right now
            if (ReversiRules.playerCanOnlyPass(slice)) {
                // if he had no choice but to pass, then passing is legal !
                const sameBoardDifferentTurn: ReversiPartSlice =
                    new ReversiPartSlice(board, turn + 1);
                return {resultingMove: move, resultingSlice: sameBoardDifferentTurn};
            }
        }
        for (const s of status.switched) {
            board[s.y][s.x] = player;
        }
        board[move.coord.y][move.coord.x] = player;
        const resultingSlice: ReversiPartSlice = new ReversiPartSlice(board, turn + 1);
        return {resultingMove: move, resultingSlice};
    }
    public static getAllSwitcheds(move: ReversiMove, turn: number, board: number[][]): Coord[] {
        // try the move, do it if legal, and return the switched pieces
        const switcheds: Coord[] = [];
        let player: number = Player.ZERO.value;
        let ennemy: number = Player.ONE.value;
        if (turn % 2 === 1) {
            player = Player.ONE.value;
            ennemy = Player.ZERO.value;
        }
        // console.log(player + ' essaye de capturer');
        for (const direction of Direction.DIRECTIONS) {
            const firstCase: Coord = move.coord.getNext(direction);
            if (firstCase.isInRange(ReversiPartSlice.BOARD_WIDTH, ReversiPartSlice.BOARD_HEIGHT)) {
                if (board[firstCase.y][firstCase.x] === ennemy) {
                    // let's test this direction
                    const switchedInDir: Coord[] = ReversiRules.getSandwicheds(player, direction, firstCase, board);
                    for (const switched of switchedInDir) {
                        switcheds.push(switched);
                    }
                }
            }
        }
        // console.log(move + ' : switched : ' + switcheds);
        return switcheds;
    }
    public static getSandwicheds(capturer: number, direction: Direction, start: Coord, board: number[][]): Coord[] {
        /* expected that 'start' is in range, and is captured
         * if we don't reach another capturer, returns []
         * else : return all the coord between start and the first 'capturer' found (exluded)
         */

        const sandwichedsCoord = [start]; // here we know it in range and captured
        let testedCoord: Coord = start.getNext(direction);
        while (testedCoord.isInRange(ReversiPartSlice.BOARD_WIDTH, ReversiPartSlice.BOARD_HEIGHT)) {
            const testedCoordContent: number = board[testedCoord.y][testedCoord.x];
            if (testedCoordContent === capturer) {
                // we found a sandwicher, in range, in this direction
                return sandwichedsCoord;
            }
            if (testedCoordContent === Player.NONE.value) {
                // we found the emptyness before a capturer, so there won't be a next case
                return [];
            } // we found a switched/captured
            sandwichedsCoord.push(testedCoord); // we add it
            testedCoord = testedCoord.getNext(direction); // next loop will observe the next
        }
        return []; // we found the end of the board before we found     the newt pawn like 'searchedPawn'
    }
    public static isGameEnded(reversiPartSlice: ReversiPartSlice): boolean {
        return this.playerCanOnlyPass(reversiPartSlice)
            && this.nextPlayerCantOnlyPass(reversiPartSlice);
    }
    public static playerCanOnlyPass(reversiPartSlice: ReversiPartSlice): boolean {
        const currentPlayerChoices: MGPMap<ReversiMove, ReversiPartSlice> = this.getListMoves(reversiPartSlice);
        // if the current player cannot start, then the part is ended
        return (currentPlayerChoices.size() === 1) &&
               currentPlayerChoices.getByIndex(0).key.equals(ReversiMove.pass);
    }
    public static nextPlayerCantOnlyPass(reversiPartSlice: ReversiPartSlice): boolean {
        const nextBoard: number[][] = reversiPartSlice.getCopiedBoard();
        const nextTurn: number = reversiPartSlice.turn + 1;
        const nextPartSlice: ReversiPartSlice = new ReversiPartSlice(nextBoard, nextTurn);
        return this.playerCanOnlyPass(nextPartSlice);
    }
    public static getListMoves(slice: ReversiPartSlice): MGPMap<ReversiMove, ReversiPartSlice> {
        const listMoves: MGPMap<ReversiMove, ReversiPartSlice> = new MGPMap<ReversiMove, ReversiPartSlice>();

        let moveAppliedPartSlice: ReversiPartSlice;
        let nextBoard: number[][];
        const nextTurn: number = slice.turn + 1;

        const player: number = slice.getCurrentPlayer().value;
        const ennemy: number = slice.getCurrentEnnemy().value;

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (slice.board[y][x] === Player.NONE.value) {
                    // For each empty cases
                    nextBoard = slice.getCopiedBoard();
                    const ennemyNeighboors = ReversiPartSlice.getNeighbooringPawnLike(nextBoard, ennemy, x, y);
                    if (ennemyNeighboors.length > 0) {
                        // if one of the 8 neighbooring case is an ennemy then, there could be a switch, and hence a legal move
                        const move: ReversiMove = new ReversiMove(x, y);
                        const result: Coord[] = ReversiRules.getAllSwitcheds(move, player, nextBoard);
                        if (result.length > 0) {
                            // there was switched piece and hence, a legal move
                            for (const switched of result) {
                                if (player === slice.board[switched.y][switched.x]) {
                                    alert(switched + 'was already switched!');
                                }
                                nextBoard[switched.y][switched.x] = player;
                            }
                            nextBoard[y][x] = player;
                            moveAppliedPartSlice = new ReversiPartSlice(nextBoard, nextTurn);
                            listMoves.set(move, moveAppliedPartSlice);
                        }
                    }
                }
            }
        }
        if (listMoves.size() === 0) {
            // when the user cannot start, his only move is to pass, which he cannot do otherwise
            // board unchanged, only the turn changed "pass"
            // console.log('f91 The user can do nothing but pass at turn ' + (nextTurn - 1));
            moveAppliedPartSlice = new ReversiPartSlice(slice.getCopiedBoard(), nextTurn);
            listMoves.set(ReversiMove.pass, moveAppliedPartSlice);
        }
        return listMoves;
    }
    public isLegal(move: ReversiMove): ReversiLegalityStatus {
        const reversiPartSlice: ReversiPartSlice = this.node.gamePartSlice;
        const turn: number = this.node.gamePartSlice.turn;
        const board: number[][] = reversiPartSlice.getCopiedBoard();
        if (move.equals(ReversiMove.pass)) { // if the player pass
            // let's check that pass is a legal move right now
            // if he had no choice but to pass, then passing is legal !
            // else, passing was illegal
            return {legal: ReversiRules.playerCanOnlyPass(reversiPartSlice), switched: null};
        }
        if (board[move.coord.y][move.coord.x] !== Player.NONE.value) {
            if (ReversiRules.VERBOSE) console.log("ReversiRules.isLegal: non, on ne peux pas jouer sur une case occup�e");
            return {legal: false, switched: null};
        }
        const switched: Coord[] = ReversiRules.getAllSwitcheds(move, turn, board);
        if (ReversiRules.VERBOSE) console.log("ReversiRules.isLegal: "+ switched.length + " element(s) switched");
        return {legal: (switched.length !== 0), switched};
    }
    public getBoardValue(n: ReversiNode): number {
        const reversiPartSlice: ReversiPartSlice = n.gamePartSlice;
        const board: number[][] = n.gamePartSlice.getCopiedBoard();
        let player0Count = 0;
        let player1Count = 0;
        for (let y = 0; y < ReversiPartSlice.BOARD_HEIGHT; y++) {
            for (let x = 0; x < ReversiPartSlice.BOARD_WIDTH; x++) {
                const verticalBorder: boolean = (x === 0) || (x === ReversiPartSlice.BOARD_WIDTH - 1);
                const horizontalBorder: boolean = (y === 0) || (y === ReversiPartSlice.BOARD_HEIGHT - 1);
                const locationValue: number = (verticalBorder ? 4 : 1) * (horizontalBorder ? 4 : 1);
                if (board[y][x] === Player.ZERO.value) {
                    player0Count += locationValue;
                }
                if (board[y][x] === Player.ONE.value) {
                    player1Count += locationValue;
                }
            }
        }
        const diff: number = player1Count - player0Count;
        if (ReversiRules.isGameEnded(reversiPartSlice)) {
            if (diff < 0) { // player 0 won
                return Number.MIN_SAFE_INTEGER;
            }
            if (diff > 0) { // player 1 won
                return Number.MAX_SAFE_INTEGER;
            }
            // else : equality
        }
        return diff;
    }
    public getListMoves(n: ReversiNode): MGPMap<ReversiMove, ReversiPartSlice> {
        return ReversiRules.getListMoves(n.gamePartSlice);
    }
    public setInitialBoard(): void {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                new ReversiPartSlice(ReversiPartSlice.getStartingBoard(), 0),
                this
            );
        } else {
            this.node = this.node.getInitialNode();
        }
    }
}