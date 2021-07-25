import { BoardDatas } from 'src/app/jscaip/BoardDatas';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { EpaminondasGroupDatasFactory } from './EpaminondasGroupData';
import { EpaminondasLegalityStatus } from './epaminondaslegalitystatus';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasPartSlice } from './EpaminondasPartSlice';
import { EpaminondasNode, EpaminondasRules } from './EpaminondasRules';

export class PositionalEpaminondasMinimax extends Minimax<EpaminondasMove,
                                                          EpaminondasPartSlice,
                                                          EpaminondasLegalityStatus>
{

    public getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const PLAYER: Player = node.gamePartSlice.getCurrentPlayer();
        const ENNEMY: number = node.gamePartSlice.getCurrentEnnemy().value;
        const EMPTY: number = Player.NONE.value;

        let moves: EpaminondasMove[] = [];
        const slice: EpaminondasPartSlice = node.gamePartSlice;
        let move: EpaminondasMove;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const firstCoord: Coord = new Coord(x, y);
                if (slice.getBoardAt(firstCoord) === PLAYER.value) {
                    for (const direction of Direction.DIRECTIONS) {
                        let movedPieces: number = 1;
                        let nextCoord: Coord = firstCoord.getNext(direction, 1);
                        while (nextCoord.isInRange(14, 12) &&
                            slice.getBoardAt(nextCoord) === PLAYER.value)
                        {
                            movedPieces += 1;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        let stepSize: number = 1;
                        while (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            slice.getBoardAt(nextCoord) === EMPTY)
                        {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, slice);

                            stepSize++;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        if (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            slice.getBoardAt(nextCoord) === ENNEMY)
                        {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, slice);
                        }
                    }
                }
            }
        }
        return this.orderMovesByPhalanxSizeAndFilter(moves);
        // return moves;
    }
    public addMove(moves: EpaminondasMove[],
                   move: EpaminondasMove,
                   slice: EpaminondasPartSlice)
    : EpaminondasMove[]
    {
        const legality: EpaminondasLegalityStatus = EpaminondasRules.isLegal(move, slice);
        if (legality.legal.isSuccess()) {
            moves.push(move);
        }
        return moves;
    }
    public orderMovesByPhalanxSizeAndFilter(moves: EpaminondasMove[]): EpaminondasMove[] {
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.movedPieces;
        });
        if (moves.length > 40) {
            const evenMoves: EpaminondasMove[] = moves.filter((move: EpaminondasMove, index: number) => {
                return ((move.movedPieces) * Math.random()) > 1;
            });
            return evenMoves;
        }
        return moves;
    }
    public getBoardValue(node: EpaminondasNode): NodeUnheritance {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        return new NodeUnheritance(this.getPieceCountThenSupportThenAvdancement(node.gamePartSlice));
    }
    public getSumOfAvancementTimesGroupSize(state: EpaminondasPartSlice): number {
        let zeroScore: number = 0;
        let oneScore: number = 0;
        const groupDatasFactory: EpaminondasGroupDatasFactory = new EpaminondasGroupDatasFactory();
        const boardDatas: BoardDatas = BoardDatas.ofBoard(state.board, groupDatasFactory);
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const piece: number = state.getBoardByXY(x, y);
                if (piece === Player.ZERO.value) {
                    const avancement: number = Math.pow(2, 12 - y);
                    const pieceGroup: number = boardDatas.groupIndexes[y][x];
                    const pieceSupport: number = boardDatas.groups[pieceGroup].coords.length;
                    zeroScore += avancement * pieceSupport;
                } else if (piece === Player.ONE.value) {
                    const avancement: number = Math.pow(2, y + 1);
                    const pieceGroup: number = boardDatas.groupIndexes[y][x];
                    const pieceSupport: number = boardDatas.groups[pieceGroup].coords.length;
                    oneScore += avancement * pieceSupport;
                }
            }
        }
        return oneScore - zeroScore;
    }
    public getPieceCountThenSupportThenAvdancement(state: EpaminondasPartSlice): number {
        const SCORE_BY_PIECE: number = 25*13;
        const SCORE_BY_ALIGNEMENT: number = 13;
        let total: number = 0;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const coord: Coord = new Coord(x, y);
                const player: Player = Player.of(state.getBoardAt(coord));
                if (player !== Player.NONE) {
                    let avancement: number; // entre 0 et 11
                    let dirs: Direction[];
                    if (player === Player.ZERO) {
                        avancement = 12 - y;
                        dirs = [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT];
                    } else {
                        avancement = y + 1;
                        dirs = [Direction.DOWN_LEFT, Direction.DOWN, Direction.DOWN_RIGHT];
                    }
                    const mod: number = player.getScoreModifier();
                    total += avancement * mod;
                    total += SCORE_BY_PIECE * mod;
                    for (const dir of dirs) {
                        let neighboor: Coord = coord.getNext(dir, 1);
                        while (neighboor.isInRange(14, 12) &&
                               state.getBoardAt(neighboor) === player.value)
                        {
                            total += mod * SCORE_BY_ALIGNEMENT;
                            neighboor = neighboor.getNext(dir, 1);
                        }
                    }
                }
            }
        }
        return total;
    }
}
