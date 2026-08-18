import { MGPFallible, Utils } from '@everyboard/lib';

import { RulesConfig } from '../../../config/RulesConfigUtil';
import { GameNode } from '../../../jscaip/AI/GameNode';
import { Coord } from '../../../jscaip/Coord';
import { GameStatus } from '../../../jscaip/GameStatus';
import { Ordinal } from '../../../jscaip/Ordinal';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { ConfigurableRules } from '../../../jscaip/Rules';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { TableUtils } from '../../../jscaip/TableUtils';
import { Debug } from '../../../utils/Debug';

import { ReversiFailure } from './ReversiFailure';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';

export type ReversiLegalityInformation = Coord[];

export class ReversiMoveWithSwitched {

    public constructor(public readonly move: ReversiMove,
                       public readonly switched: number,
    ) {
    }
}

export class ReversiNode extends GameNode<ReversiMove, ReversiState> {}

export type ReversiConfig = RulesConfig & {

    width: number;

    height: number;

    toric: boolean;

};

export interface BoardMode {

    getNextCoord: (coord: Coord, direction: Ordinal, state: ReversiState) => Coord;

}
class RectangularBoardMode implements BoardMode {

    public getNextCoord(coord: Coord, direction: Ordinal, _: ReversiState): Coord {
        return coord.getNext(direction);
    }

}

class ToricBoardMode implements BoardMode {

    public getNextCoord(coord: Coord, direction: Ordinal, state: ReversiState): Coord {
        return coord.getNextToric(direction, state.getWidth(), state.getHeight());
    }

}

@Debug.log
export abstract class AbstractReversiRules extends ConfigurableRules<ReversiMove,
                                                                     ReversiState,
                                                                     ReversiConfig,
                                                                     ReversiLegalityInformation>
{

    private readonly toricBoardMode: BoardMode = new ToricBoardMode();

    private readonly rectangularBoardMode: BoardMode = new RectangularBoardMode();

    private getBoardMode(config: ReversiConfig): BoardMode {
        if (config.toric) {
            return this.toricBoardMode;
        } else {
            return this.rectangularBoardMode;
        }
    }

    public override getInitialState(config: ReversiConfig): ReversiState {
        const board: PlayerOrNone[][] = TableUtils.create(config.width, config.height, PlayerOrNone.NONE);
        const downRightCenter: Coord = new Coord(Math.floor(config.width / 2), Math.floor(config.height / 2));
        board[downRightCenter.y - 1][downRightCenter.x - 1] = Player.ZERO;
        board[downRightCenter.y][downRightCenter.x] = Player.ZERO;
        board[downRightCenter.y - 1][downRightCenter.x] = Player.ONE;
        board[downRightCenter.y][downRightCenter.x - 1] = Player.ONE;
        return new ReversiState(board, 0);
    }

    public override applyLegalMove(move: ReversiMove,
                                   state: ReversiState,
                                   _: ReversiConfig,
                                   info: ReversiLegalityInformation)
    : ReversiState
    {
        const turn: number = state.turn;
        const player: Player = state.getCurrentPlayer();
        const board: PlayerOrNone[][] = state.getCopiedBoard();
        if (move.equals(ReversiMove.PASS)) { // if the player pass
            const sameBoardDifferentTurn: ReversiState =
                new ReversiState(board, turn + 1);
            return sameBoardDifferentTurn;
        }
        for (const s of info) {
            board[s.y][s.x] = player;
        }
        board[move.coord.y][move.coord.x] = player;
        const resultingState: ReversiState = new ReversiState(board, turn + 1);
        return resultingState;
    }

    public getAllSwitchedCoords(
        move: ReversiMove,
        player: Player,
        state: ReversiState,
        config: ReversiConfig,
    ): Coord[] {
        // try the move, do it if legal, and return the switched pieces
        const switcheds: Coord[] = [];
        const opponent: Player = player.getOpponent();

        const boardMode: BoardMode = this.getBoardMode(config);
        for (const direction of Ordinal.ORDINALS) {
            const firstSpace: Coord = boardMode.getNextCoord(move.coord, direction, state);
            if (state.hasPieceAt(firstSpace, opponent)) {
                // let's test this direction
                const switchedInDir: Coord[] = this.getSandwicheds(player, direction, firstSpace, state, config);
                for (const switched of switchedInDir) {
                    switcheds.push(switched);
                }
            }
        }
        return switcheds;
    }

    public getSandwicheds(capturer: Player,
                          direction: Ordinal,
                          start: Coord,
                          state: ReversiState,
                          config: ReversiConfig,
    ) : Coord[] {
        /**
          * expected that 'start' is in range, and is captured
          * if we don't reach another capturer, returns []
          * else : return all the coord between start and the first 'capturer' found (exluded)
          */
        const boardMode: BoardMode = this.getBoardMode(config);
        const sandwichedsCoord: Coord[] = [start]; // here we know it in range and captured
        let testedCoord: Coord = boardMode.getNextCoord(start, direction, state);
        while (state.isOnBoard(testedCoord) && testedCoord.equals(start) === false) {
            const testedCoordContent: PlayerOrNone = state.getPieceAt(testedCoord);
            if (testedCoordContent === capturer) {
                // we found a sandwicher, in range, in this direction
                return sandwichedsCoord;
            } else if (testedCoordContent.isNone()) {
                // we found the emptyness before a capturer, so there won't be a next space
                return [];
            } else {
                // we found a switched/captured
                sandwichedsCoord.push(testedCoord); // we add it
                testedCoord = boardMode.getNextCoord(testedCoord, direction, state);
            }
        }
        return []; // we found the end of the board before we found the new piece like 'searchedPawn'
    }

    public isGameEnded(state: ReversiState, config: ReversiConfig): boolean {
        return this.playerCanOnlyPass(state, config) &&
               this.nextPlayerCanOnlyPass(state, config);
    }

    public override getGameStatus(node: ReversiNode, config: ReversiConfig): GameStatus {
        const state: ReversiState = node.gameState;
        const gameIsEnded: boolean = this.isGameEnded(state, config);
        if (gameIsEnded === false) {
            return GameStatus.ONGOING;
        }
        const scores: PlayerNumberMap = state.countScore();
        const diff: number = scores.get(Player.ONE) - scores.get(Player.ZERO);
        if (diff < 0) {
            return GameStatus.ZERO_WON;
        }
        if (diff > 0) {
            return GameStatus.ONE_WON;
        }
        return GameStatus.DRAW;
    }

    public playerCanOnlyPass(state: ReversiState, config: ReversiConfig): boolean {
        const currentPlayerChoices: ReversiMoveWithSwitched[] = this.getListMoves(state, config);
        // if the current player cannot start, then the part is ended
        return (currentPlayerChoices.length === 1) &&
                currentPlayerChoices[0].move.equals(ReversiMove.PASS);
    }

    public nextPlayerCanOnlyPass(reversiState: ReversiState, config: ReversiConfig): boolean {
        const nextBoard: PlayerOrNone[][] = reversiState.getCopiedBoard();
        const nextTurn: number = reversiState.turn + 1;
        const nextState: ReversiState = new ReversiState(nextBoard, nextTurn);
        return this.playerCanOnlyPass(nextState, config);
    }

    public getListMoves(state: ReversiState, config: ReversiConfig): ReversiMoveWithSwitched[] {
        const moves: ReversiMoveWithSwitched[] = [];
        const player: Player = state.getCurrentPlayer();
        const opponent: Player = state.getCurrentOpponent();
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            if (state.getPieceAt(coord).isNone()) {
                // For each empty spaces
                const opponentNeighbors: Coord[] = state.getNeighboringPawnLike(opponent, coord);
                if (opponentNeighbors.length > 0) {
                    // if one of the 8 neighboring space is an opponent then, there could be a switch,
                    // and hence a legal move
                    const move: ReversiMove = new ReversiMove(coord.x, coord.y);
                    const result: Coord[] = this.getAllSwitchedCoords(move, player, state, config);
                    if (result.length > 0) {
                        // there was switched piece and hence, a legal move
                        for (const switched of result) {
                            Utils.assert(player !== state.getPieceAt(switched), switched + 'was already switched!');
                        }
                        moves.push(new ReversiMoveWithSwitched(move, result.length));
                    }
                }
            }
        }
        if (moves.length === 0) {
            // When the user cannot move, their only move is to pass, which they cannot do otherwise
            // The board remains unchanged, only the turn changed, and the move is a "pass"
            moves.push(new ReversiMoveWithSwitched(ReversiMove.PASS, 0));
        }
        return moves;
    }

    public override isLegal(move: ReversiMove, state: ReversiState, config: ReversiConfig)
    : MGPFallible<ReversiLegalityInformation>
    {
        if (move.equals(ReversiMove.PASS)) { // if the player passes
            // let's check that pass is a legal move right now
            // if there was no choice but to pass, then passing is legal!
            // else, passing was illegal
            if (this.playerCanOnlyPass(state, config)) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(RulesFailure.CANNOT_PASS());
            }
        }
        if (state.getPieceAt(move.coord).isPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        const switched: Coord[] = this.getAllSwitchedCoords(move, state.getCurrentPlayer(), state, config);
        if (switched.length === 0) {
            return MGPFallible.failure(ReversiFailure.NO_ELEMENT_SWITCHED());
        } else {
            return MGPFallible.success(switched);
        }
    }

}
