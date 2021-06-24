import { GameStatus, Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { ReversiPartSlice } from './ReversiPartSlice';
import { Coord } from '../../jscaip/Coord';
import { Direction } from '../../jscaip/Direction';
import { ReversiMove } from './ReversiMove';
import { ReversiLegalityStatus } from './ReversiLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { assert, display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ReversiFailure } from './ReversiFailure';

export class ReversiMoveWithSwitched {
    public constructor(public readonly move: ReversiMove,
                       public readonly switched: number) {
    }
}

export class ReversiNode extends MGPNode<ReversiRules, ReversiMove, ReversiPartSlice, ReversiLegalityStatus> {}

export class ReversiRules extends Rules<ReversiMove, ReversiPartSlice, ReversiLegalityStatus> {

    public static VERBOSE: boolean = false;

    public applyLegalMove(move: ReversiMove, slice: ReversiPartSlice, status: ReversiLegalityStatus): ReversiPartSlice {
        const turn: number = slice.turn;
        const player: number = turn % 2;
        const board: number[][] = slice.getCopiedBoard();
        if (move.equals(ReversiMove.PASS)) { // if the player pass
            const sameBoardDifferentTurn: ReversiPartSlice =
                new ReversiPartSlice(board, turn + 1);
            return sameBoardDifferentTurn;
        }
        for (const s of status.switched) {
            board[s.y][s.x] = player;
        }
        board[move.coord.y][move.coord.x] = player;
        const resultingSlice: ReversiPartSlice = new ReversiPartSlice(board, turn + 1);
        return resultingSlice;
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
        return switcheds;
    }
    public static getSandwicheds(capturer: number, direction: Direction, start: Coord, board: number[][]): Coord[] {
        /* expected that 'start' is in range, and is captured
         * if we don't reach another capturer, returns []
         * else : return all the coord between start and the first 'capturer' found (exluded)
         */

        const sandwichedsCoord: Coord[] = [start]; // here we know it in range and captured
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
    public static isGameEnded(state: ReversiPartSlice): boolean {
        return this.playerCanOnlyPass(state) &&
               this.nextPlayerCantOnlyPass(state);
    }
    public getGameStatus(node: ReversiNode): GameStatus {
        const state: ReversiPartSlice = node.gamePartSlice;
        const gameIsEnded: boolean = ReversiRules.isGameEnded(state);
        if (gameIsEnded === false) {
            return GameStatus.ONGOING;
        }
        const scores: [number, number] = state.countScore();
        const diff: number = scores[1] - scores[0];
        if (diff < 0) {
            return GameStatus.ZERO_WON;
        }
        if (diff > 0) {
            return GameStatus.ONE_WON;
        }
        return GameStatus.DRAW;
    }
    public static playerCanOnlyPass(reversiPartSlice: ReversiPartSlice): boolean {
        const currentPlayerChoices: ReversiMoveWithSwitched[] = this.getListMoves(reversiPartSlice);
        // if the current player cannot start, then the part is ended
        return (currentPlayerChoices.length === 1) &&
                currentPlayerChoices[0].move.equals(ReversiMove.PASS);
    }
    public static nextPlayerCantOnlyPass(reversiPartSlice: ReversiPartSlice): boolean {
        const nextBoard: number[][] = reversiPartSlice.getCopiedBoard();
        const nextTurn: number = reversiPartSlice.turn + 1;
        const nextPartSlice: ReversiPartSlice = new ReversiPartSlice(nextBoard, nextTurn);
        return this.playerCanOnlyPass(nextPartSlice);
    }
    public static getListMoves(slice: ReversiPartSlice): ReversiMoveWithSwitched[] {
        const moves: ReversiMoveWithSwitched[] = [];

        let nextBoard: number[][];

        const player: number = slice.getCurrentPlayer().value;
        const ennemy: number = slice.getCurrentEnnemy().value;

        for (let y: number = 0; y < 8; y++) {
            for (let x: number = 0; x < 8; x++) {
                if (slice.getBoardByXY(x, y) === Player.NONE.value) {
                    // For each empty cases
                    nextBoard = slice.getCopiedBoard();
                    const ennemyNeighboors: Coord[] = ReversiPartSlice.getNeighbooringPawnLike(nextBoard, ennemy, x, y);
                    if (ennemyNeighboors.length > 0) {
                        // if one of the 8 neighbooring case is an ennemy then, there could be a switch,
                        // and hence a legal move
                        const move: ReversiMove = new ReversiMove(x, y);
                        const result: Coord[] = ReversiRules.getAllSwitcheds(move, player, nextBoard);
                        if (result.length > 0) {
                            // there was switched piece and hence, a legal move
                            for (const switched of result) {
                                assert(player !== slice.getBoardAt(switched), switched + 'was already switched!');
                                nextBoard[switched.y][switched.x] = player;
                            }
                            nextBoard[y][x] = player;
                            moves.push(new ReversiMoveWithSwitched(move, result.length));
                        }
                    }
                }
            }
        }
        if (moves.length === 0) {
            // when the user cannot start, his only move is to pass, which he cannot do otherwise
            // board unchanged, only the turn changed "pass"
            moves.push(new ReversiMoveWithSwitched(ReversiMove.PASS, 0));
        }
        return moves;
    }
    public isLegal(move: ReversiMove, slice: ReversiPartSlice): ReversiLegalityStatus {
        const turn: number = slice.turn;
        const board: number[][] = slice.getCopiedBoard();
        if (move.equals(ReversiMove.PASS)) { // if the player pass
            // let's check that pass is a legal move right now
            // if he had no choice but to pass, then passing is legal !
            // else, passing was illegal
            return {
                legal: ReversiRules.playerCanOnlyPass(slice) ?
                    MGPValidation.SUCCESS :
                    MGPValidation.failure(RulesFailure.CAN_ONLY_PASS),
                switched: null,
            };
        }
        if (board[move.coord.y][move.coord.x] !== Player.NONE.value) {
            display(ReversiRules.VERBOSE, 'ReversiRules.isLegal: non, on ne peux pas jouer sur une case occupée');
            return { legal: MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_CASE), switched: null };
        }
        const switched: Coord[] = ReversiRules.getAllSwitcheds(move, turn, board);
        display(ReversiRules.VERBOSE, 'ReversiRules.isLegal: '+ switched.length + ' element(s) switched');
        return {
            legal: (switched.length === 0) ?
                MGPValidation.failure(ReversiFailure.NO_ELEMENT_SWITCHED) : MGPValidation.SUCCESS,
            switched,
        };
    }
}
