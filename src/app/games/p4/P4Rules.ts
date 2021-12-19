import { Direction } from '../../jscaip/Direction';
import { Coord } from '../../jscaip/Coord';
import { GameStatus, Rules } from '../../jscaip/Rules';
import { SCORE } from '../../jscaip/SCORE';
import { MGPNode } from '../../jscaip/MGPNode';
import { P4State } from './P4State';
import { Player } from 'src/app/jscaip/Player';
import { assert, display } from 'src/app/utils/utils';
import { P4Move } from './P4Move';
import { Table } from 'src/app/utils/ArrayUtils';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { P4Failure } from './P4Failure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPMap } from 'src/app/utils/MGPMap';

export class P4Node extends MGPNode<P4Rules, P4Move, P4State> {}

export class P4Rules extends Rules<P4Move, P4State> {

    public static VERBOSE: boolean = false;

    public static getVictoriousCoords(state: P4State): Coord[] {
        const coords: Coord[] = [];
        for (let x: number = 0; x < 7; x++) {
            for (let y: number = 5; y !== -1 && state.board[y][x] !== Player.NONE; y--) {
                const caseScore: number = P4Rules.getCaseScore(state.board, new Coord(x, y));
                if (caseScore === Player.ZERO.getVictoryValue() ||
                    caseScore === Player.ONE.getVictoryValue())
                {
                    coords.push(new Coord(x, y));
                }
            }
        }
        return coords;
    }
    private static getBoardValueFromScratch(state: P4State): NodeUnheritance {
        display(P4Rules.VERBOSE, { P4Rules_getBoardValueFromScratch: { state } });
        let score: number = 0;

        for (let x: number = 0; x < 7; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 5; y !== -1 && state.board[y][x] !== Player.NONE; y--) {
                // while we haven't reached the top or an empty case
                const tmpScore: number = P4Rules.getCaseScore(state.board, new Coord(x, y));
                if (MGPNode.getScoreStatus(tmpScore) !== SCORE.DEFAULT) {
                    // if we find a pre-victory
                    display(P4Rules.VERBOSE, { preVictoryOrVictory: { state, tmpScore, coord: { x, y } } });
                    return new NodeUnheritance(tmpScore); // we return it
                    // TODO check that PRE_VICTORY does not overwrite VICTORY in this case
                    // It seems possible to have a pre victory on one column, and a victory on the next
                }
                score += tmpScore;
            }
        }
        return new NodeUnheritance(score);
    }
    public static getLowestUnoccupiedCase(board: Table<Player>, x: number): number {
        let y: number = 0;
        while (y < 6 && board[y][x] === Player.NONE) {
            y++;
        }
        return y - 1;
    }
    public static getNumberOfFreeSpacesAndAllies(board: Table<Player>,
                                                 i: Coord,
                                                 dir: Direction,
                                                 opponent: Player,
                                                 ally: Player): [number, number] {
        /*
       * for a square i(iX, iY) containing an ally
       * we go through the board from i in the direction d(dX, dY)
       * and until a maximal distance of 3 cases
       */

        let freeSpaces: number = 0; // the number of aligned free square
        let allies: number = 0; // the number of alligned allies
        let allAlliesAreSideBySide: boolean = true;
        let coord: Coord = new Coord(i.x + dir.x, i.y + dir.y);
        while (coord.isInRange(7, 6) && freeSpaces !== 3) {
            // while we're on the board
            const currentCase: Player = board[coord.y][coord.x];
            if (currentCase === opponent) {
                return [freeSpaces, allies];
            }
            if (currentCase === ally && allAlliesAreSideBySide) {
                allies++;
            } else {
                allAlliesAreSideBySide = false; // we stop counting the allies on this line
            }
            // as soon as there is a hole
            if (currentCase !== opponent && currentCase !== ally) {
                // TODO: this condition was not there before, check that it makes sense (but the body was there)
                freeSpaces++;
            }
            coord = coord.getNext(dir);
        }
        return [freeSpaces, allies];
    }
    private static getOpponent(board: Table<Player>, coord: Coord): Player {
        const c: Player = board[coord.y][coord.x];
        assert(c !== Player.NONE, 'getOpponent should not be called with Player.NONE');
        return (c === Player.ONE) ? Player.ZERO : Player.ONE;
    }
    public static getCaseScore(board: Table<Player>, coord: Coord): number {
        display(P4Rules.VERBOSE, 'getCaseScore(board, ' + coord.x + ', ' + coord.y + ') called');
        display(P4Rules.VERBOSE, board);
        assert(board[coord.y][coord.x] !== Player.NONE, 'getCaseScore should not be called on an empty case');

        let score: number = 0; // final result, count the theoretical victorys possibility

        const opponent: Player = P4Rules.getOpponent(board, coord);
        const ally: Player = board[coord.y][coord.x];

        const distByDirs: MGPMap<Direction, number> = new MGPMap();
        const alliesByDirs: MGPMap<Direction, number> = new MGPMap();

        for (const dir of Direction.DIRECTIONS) {
            const tmpData: [number, number] = P4Rules.getNumberOfFreeSpacesAndAllies(board, coord, dir, opponent, ally);
            distByDirs.set(dir, tmpData[0]);
            alliesByDirs.set(dir, tmpData[1]);
        }

        for (const dir of [Direction.UP, Direction.UP_RIGHT, Direction.RIGHT, Direction.DOWN_RIGHT]) {
            // for each pair of opposite directions
            const lineAllies: number = alliesByDirs.get(dir).get() + alliesByDirs.get(dir.getOpposite()).get();
            if (lineAllies > 2) {
                display(P4Rules.VERBOSE, { text:
                    'there is some kind of victory here (' + coord.x + ', ' + coord.y + ')' + '\n' +
                    'line allies : ' + lineAllies + '\n',
                board,
                });
                return ally.getVictoryValue();
            }

            const lineDist: number = distByDirs.get(dir).get() + distByDirs.get(dir.getOpposite()).get();
            if (lineDist === 3) {
                score += 2;
            } else if (lineDist > 3) {
                score += lineDist - 2;
            }
        }
        return score * ally.getScoreModifier();
    }
    public static getListMoves(node: P4Node): P4Move[] {
        display(P4Rules.VERBOSE, { context: 'P4Rules.getListMoves', node });

        // should be called only if the game is not over
        const originalState: P4State = node.gameState;
        const moves: P4Move[] = [];

        for (let x: number = 0; x < 7; x++) {
            if (originalState.getPieceAtXY(x, 0) === Player.NONE) {
                const move: P4Move = P4Move.of(x);
                moves.push(move);
            }
        }
        return moves;
    }
    public static getBoardValue(state: P4State): NodeUnheritance {
        display(P4Rules.VERBOSE, {
            text: 'P4Rules.getBoardValue called',
            board: state.getCopiedBoard(),
        });
        return P4Rules.getBoardValueFromScratch(state);
    }
    public applyLegalMove(move: P4Move, state: P4State, _status: void): P4State
    {
        const x: number = move.x;
        const board: Player[][] = state.getCopiedBoard();
        const y: number = P4Rules.getLowestUnoccupiedCase(board, x);

        const turn: number = state.turn;

        board[y][x] = state.getCurrentPlayer();

        const resultingState: P4State = new P4State(board, turn+1);
        return resultingState;
    }
    public isLegal(move: P4Move, state: P4State): MGPFallible<void> {
        display(P4Rules.VERBOSE, { context: 'P4Rules.isLegal', move: move.toString(), state });
        if (state.getPieceAtXY(move.x, 0) !== Player.NONE) {
            return MGPFallible.failure(P4Failure.COLUMN_IS_FULL());
        }
        return MGPFallible.success(undefined);
    }
    public getGameStatus(node: P4Node): GameStatus {
        const state: P4State = node.gameState;
        for (let x: number = 0; x < 7; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 5; y !== -1 && state.board[y][x] !== Player.NONE; y--) {
                // while we haven't reached the top or an empty case
                const tmpScore: number = P4Rules.getCaseScore(state.board, new Coord(x, y));
                if (MGPNode.getScoreStatus(tmpScore) === SCORE.VICTORY) {
                    return GameStatus.getVictory(state.getCurrentOpponent());
                }
            }
        }
        return state.turn === 42 ? GameStatus.DRAW : GameStatus.ONGOING;
    }
}
