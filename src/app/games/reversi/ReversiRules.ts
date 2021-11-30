import { GameStatus, Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { ReversiState } from './ReversiState';
import { Coord } from '../../jscaip/Coord';
import { Direction } from '../../jscaip/Direction';
import { ReversiMove } from './ReversiMove';
import { Player } from 'src/app/jscaip/Player';
import { assert, display } from 'src/app/utils/utils';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ReversiFailure } from './ReversiFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';


export type ReversiLegalityInformation = Coord[];

export class ReversiMoveWithSwitched {

    public constructor(public readonly move: ReversiMove,
                       public readonly switched: number) {
    }
}

export class ReversiNode extends MGPNode<ReversiRules, ReversiMove, ReversiState, ReversiLegalityInformation> {}

export class ReversiRules extends Rules<ReversiMove, ReversiState, ReversiLegalityInformation> {

    public static VERBOSE: boolean = false;

    public static getGameStatus(node: ReversiNode): GameStatus {
        const state: ReversiState = node.gameState;
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
    public applyLegalMove(move: ReversiMove, state: ReversiState, switched: ReversiLegalityInformation): ReversiState {
        const turn: number = state.turn;
        const player: Player = state.getCurrentPlayer();
        const board: Player[][] = state.getCopiedBoard();
        if (move.equals(ReversiMove.PASS)) { // if the player pass
            const sameBoardDifferentTurn: ReversiState =
                new ReversiState(board, turn + 1);
            return sameBoardDifferentTurn;
        }
        for (const s of switched) {
            board[s.y][s.x] = player;
        }
        board[move.coord.y][move.coord.x] = player;
        const resultingState: ReversiState = new ReversiState(board, turn + 1);
        return resultingState;
    }
    public static getAllSwitcheds(move: ReversiMove, player: Player, board: Player[][]): Coord[] {
        // try the move, do it if legal, and return the switched pieces
        const switcheds: Coord[] = [];
        const OPPONENT: Player = player.getOpponent();

        for (const direction of Direction.DIRECTIONS) {
            const firstCase: Coord = move.coord.getNext(direction);
            if (firstCase.isInRange(ReversiState.BOARD_WIDTH, ReversiState.BOARD_HEIGHT)) {
                if (board[firstCase.y][firstCase.x] === OPPONENT) {
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
    public static getSandwicheds(capturer: Player, direction: Direction, start: Coord, board: Player[][]): Coord[] {
        /* expected that 'start' is in range, and is captured
         * if we don't reach another capturer, returns []
         * else : return all the coord between start and the first 'capturer' found (exluded)
         */

        const sandwichedsCoord: Coord[] = [start]; // here we know it in range and captured
        let testedCoord: Coord = start.getNext(direction);
        while (testedCoord.isInRange(ReversiState.BOARD_WIDTH, ReversiState.BOARD_HEIGHT)) {
            const testedCoordContent: Player = board[testedCoord.y][testedCoord.x];
            if (testedCoordContent === capturer) {
                // we found a sandwicher, in range, in this direction
                return sandwichedsCoord;
            }
            if (testedCoordContent === Player.NONE) {
                // we found the emptyness before a capturer, so there won't be a next case
                return [];
            } // we found a switched/captured
            sandwichedsCoord.push(testedCoord); // we add it
            testedCoord = testedCoord.getNext(direction); // next loop will observe the next
        }
        return []; // we found the end of the board before we found     the newt pawn like 'searchedPawn'
    }
    public static isGameEnded(state: ReversiState): boolean {
        return this.playerCanOnlyPass(state) &&
               this.nextPlayerCantOnlyPass(state);
    }
    public getGameStatus(node: ReversiNode): GameStatus {
        return ReversiRules.getGameStatus(node);
    }
    public static playerCanOnlyPass(reversiState: ReversiState): boolean {
        const currentPlayerChoices: ReversiMoveWithSwitched[] = this.getListMoves(reversiState);
        // if the current player cannot start, then the part is ended
        return (currentPlayerChoices.length === 1) &&
                currentPlayerChoices[0].move.equals(ReversiMove.PASS);
    }
    public static nextPlayerCantOnlyPass(reversiState: ReversiState): boolean {
        const nextBoard: Player[][] = reversiState.getCopiedBoard();
        const nextTurn: number = reversiState.turn + 1;
        const nextState: ReversiState = new ReversiState(nextBoard, nextTurn);
        return this.playerCanOnlyPass(nextState);
    }
    public static getListMoves(state: ReversiState): ReversiMoveWithSwitched[] {
        const moves: ReversiMoveWithSwitched[] = [];

        let nextBoard: Player[][];

        const player: Player = state.getCurrentPlayer();
        const opponent: Player = state.getCurrentOpponent();

        for (let y: number = 0; y < 8; y++) {
            for (let x: number = 0; x < 8; x++) {
                if (state.getPieceAtXY(x, y) === Player.NONE) {
                    // For each empty cases
                    nextBoard = state.getCopiedBoard();
                    const opponentNeighboors: Coord[] = ReversiState.getNeighbooringPawnLike(nextBoard, opponent, x, y);
                    if (opponentNeighboors.length > 0) {
                        // if one of the 8 neighbooring case is an opponent then, there could be a switch,
                        // and hence a legal move
                        const move: ReversiMove = new ReversiMove(x, y);
                        const result: Coord[] = ReversiRules.getAllSwitcheds(move, player, nextBoard);
                        if (result.length > 0) {
                            // there was switched piece and hence, a legal move
                            for (const switched of result) {
                                assert(player !== state.getPieceAt(switched), switched + 'was already switched!');
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
    public isLegal(move: ReversiMove, state: ReversiState): MGPFallible<ReversiLegalityInformation> {
        const board: Player[][] = state.getCopiedBoard();
        if (move.equals(ReversiMove.PASS)) { // if the player passes
            // let's check that pass is a legal move right now
            // if there was no choice but to pass, then passing is legal!
            // else, passing was illegal
            if (ReversiRules.playerCanOnlyPass(state)) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(RulesFailure.MUST_PASS());
            }
        }
        if (board[move.coord.y][move.coord.x] !== Player.NONE) {
            display(ReversiRules.VERBOSE, 'ReversiRules.isLegal: you cannot play on a busy case');
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        const switched: Coord[] = ReversiRules.getAllSwitcheds(move, state.getCurrentPlayer(), board);
        display(ReversiRules.VERBOSE, 'ReversiRules.isLegal: '+ switched.length + ' element(s) switched');
        if (switched.length === 0) {
            return MGPFallible.failure(ReversiFailure.NO_ELEMENT_SWITCHED());
        } else {
            return MGPFallible.success(switched);
        }
    }
}
