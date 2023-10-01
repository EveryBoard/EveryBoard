import { Rules } from '../../jscaip/Rules';
import { GameNode } from 'src/app/jscaip/GameNode';
import { ReversiState } from './ReversiState';
import { Coord } from '../../jscaip/Coord';
import { Direction } from '../../jscaip/Direction';
import { ReversiMove } from './ReversiMove';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Utils } from 'src/app/utils/utils';
import { Debug } from 'src/app/utils/utils';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ReversiFailure } from './ReversiFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';


export type ReversiLegalityInformation = Coord[];

export class ReversiMoveWithSwitched {

    public constructor(public readonly move: ReversiMove,
                       public readonly switched: number) {
    }
}

export class ReversiNode extends GameNode<ReversiMove, ReversiState> {}

@Debug.log
export class ReversiRules extends Rules<ReversiMove, ReversiState, ReversiLegalityInformation> {

    private static singleton: MGPOptional<ReversiRules> = MGPOptional.empty();

    public static get(): ReversiRules {
        if (ReversiRules.singleton.isAbsent()) {
            ReversiRules.singleton = MGPOptional.of(new ReversiRules());
        }
        return ReversiRules.singleton.get();
    }

    private constructor() {
        super();
    }

    public getInitialState(): ReversiState {
        return ReversiState.getInitialState();
    }

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
        const board: PlayerOrNone[][] = state.getCopiedBoard();
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
    public static getAllSwitcheds(move: ReversiMove, player: Player, board: PlayerOrNone[][]): Coord[] {
        // try the move, do it if legal, and return the switched pieces
        const switcheds: Coord[] = [];
        const opponent: Player = player.getOpponent();

        for (const direction of Direction.DIRECTIONS) {
            const firstSpace: Coord = move.coord.getNext(direction);
            if (ReversiState.isOnBoard(firstSpace)) {
                if (board[firstSpace.y][firstSpace.x] === opponent) {
                    // let's test this direction
                    const switchedInDir: Coord[] = ReversiRules.getSandwicheds(player, direction, firstSpace, board);
                    for (const switched of switchedInDir) {
                        switcheds.push(switched);
                    }
                }
            }
        }
        return switcheds;
    }
    public static getSandwicheds(capturer: Player,
                                 direction: Direction,
                                 start: Coord,
                                 board: PlayerOrNone[][])
    : Coord[]
    {
        /* expected that 'start' is in range, and is captured
         * if we don't reach another capturer, returns []
         * else : return all the coord between start and the first 'capturer' found (exluded)
         */

        const sandwichedsCoord: Coord[] = [start]; // here we know it in range and captured
        let testedCoord: Coord = start.getNext(direction);
        while (ReversiState.isOnBoard(testedCoord)) {
            const testedCoordContent: PlayerOrNone = board[testedCoord.y][testedCoord.x];
            if (testedCoordContent === capturer) {
                // we found a sandwicher, in range, in this direction
                return sandwichedsCoord;
            }
            if (testedCoordContent === PlayerOrNone.NONE) {
                // we found the emptyness before a capturer, so there won't be a next space
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
        const nextBoard: PlayerOrNone[][] = reversiState.getCopiedBoard();
        const nextTurn: number = reversiState.turn + 1;
        const nextState: ReversiState = new ReversiState(nextBoard, nextTurn);
        return this.playerCanOnlyPass(nextState);
    }
    public static getListMoves(state: ReversiState): ReversiMoveWithSwitched[] {
        const moves: ReversiMoveWithSwitched[] = [];

        let nextBoard: PlayerOrNone[][];

        const player: Player = state.getCurrentPlayer();
        const opponent: Player = state.getCurrentOpponent();

        for (let y: number = 0; y < 8; y++) {
            for (let x: number = 0; x < 8; x++) {
                if (state.getPieceAtXY(x, y) === PlayerOrNone.NONE) {
                    // For each empty spaces
                    nextBoard = state.getCopiedBoard();
                    const opponentNeighbors: Coord[] = ReversiState.getNeighboringPawnLike(nextBoard, opponent, x, y);
                    if (opponentNeighbors.length > 0) {
                        // if one of the 8 neighboring space is an opponent then, there could be a switch,
                        // and hence a legal move
                        const move: ReversiMove = new ReversiMove(x, y);
                        const result: Coord[] = ReversiRules.getAllSwitcheds(move, player, nextBoard);
                        if (result.length > 0) {
                            // there was switched piece and hence, a legal move
                            for (const switched of result) {
                                Utils.assert(player !== state.getPieceAt(switched), switched + 'was already switched!');
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
            // When the user cannot start, his only move is to pass, which he cannot do otherwise
            // board unchanged, only the turn changed "pass"
            moves.push(new ReversiMoveWithSwitched(ReversiMove.PASS, 0));
        }
        return moves;
    }
    public isLegal(move: ReversiMove, state: ReversiState): MGPFallible<ReversiLegalityInformation> {
        if (move.equals(ReversiMove.PASS)) { // if the player passes
            // let's check that pass is a legal move right now
            // if there was no choice but to pass, then passing is legal!
            // else, passing was illegal
            if (ReversiRules.playerCanOnlyPass(state)) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(RulesFailure.CANNOT_PASS());
            }
        }
        if (state.getPieceAt(move.coord).isPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        const board: PlayerOrNone[][] = state.getCopiedBoard();
        const switched: Coord[] = ReversiRules.getAllSwitcheds(move, state.getCurrentPlayer(), board);
        if (switched.length === 0) {
            return MGPFallible.failure(ReversiFailure.NO_ELEMENT_SWITCHED());
        } else {
            return MGPFallible.success(switched);
        }
    }
}
