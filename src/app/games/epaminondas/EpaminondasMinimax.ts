import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Minimax } from 'src/app/jscaip/Minimax';
import { EpaminondasLegalityInformation, EpaminondasNode, EpaminondasRules } from './EpaminondasRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GameStatus } from 'src/app/jscaip/GameStatus';

export class EpaminondasMinimax extends Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation> {

    public static getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const opponent: Player = node.gameState.getCurrentOpponent();
        const empty: PlayerOrNone = PlayerOrNone.NONE;

        let moves: EpaminondasMove[] = [];
        const state: EpaminondasState = node.gameState;
        let move: EpaminondasMove;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const firstCoord: Coord = new Coord(x, y);
                if (state.getPieceAt(firstCoord) === player) {
                    for (const direction of Direction.DIRECTIONS) {
                        let movedPieces: number = 1;
                        let nextCoord: Coord = firstCoord.getNext(direction, 1);
                        while (nextCoord.isInRange(14, 12) &&
                            state.getPieceAt(nextCoord) === player) {
                            movedPieces += 1;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        let stepSize: number = 1;
                        while (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            state.getPieceAt(nextCoord) === empty) {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, state);

                            stepSize++;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        if (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            state.getPieceAt(nextCoord) === opponent) {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, state);
                        }
                    }
                }
            }
        }
        return moves;
    }
    public static addMove(moves: EpaminondasMove[],
                          move: EpaminondasMove,
                          state: EpaminondasState)
    : EpaminondasMove[]
    {
        const legality: MGPFallible<EpaminondasLegalityInformation> = EpaminondasRules.isLegal(move, state);
        if (legality.isSuccess()) {
            moves.push(move);
        }
        return moves;
    }
    public getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const moves: EpaminondasMove[] = EpaminondasMinimax.getListMoves(node);
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.stepSize; // Best for normal, might not be best for others!
        });
        return moves;
    }
    public getBoardValue(node: EpaminondasNode): BoardValue {
        const gameStatus: GameStatus = EpaminondasRules.get().getGameStatus(node);
        if (gameStatus.isEndGame) {
            return gameStatus.toBoardValue();
        }
        return new BoardValue(this.getPieceCountPlusRowDomination(node.gameState));
    }
    public getPieceCountPlusRowDomination(state: EpaminondasState): number {
        const SCORE_BY_PIECE: number = 14*13*11;
        const SCORE_BY_ROW_DOMINATION: number = 2;
        const SCORE_BY_PRESENCE: number = 1;
        const SCORE_BY_ALIGNEMENT: number = 1;
        let total: number = 0;
        for (let y: number = 0; y < 12; y++) {
            let row: number = 0;
            const wasPresent: number[] = [0, 0];
            for (let x: number = 0; x < 14; x++) {
                const coord: Coord = new Coord(x, y);
                const player: PlayerOrNone = state.getPieceAt(coord);
                if (player.isPlayer()) {
                    const mod: number = player.getScoreModifier();
                    total += SCORE_BY_PIECE * mod;
                    wasPresent[player.value] = mod;
                    row += mod;
                    for (const dir of [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT]) {
                        let neighbor: Coord = coord.getNext(dir, 1);
                        while (neighbor.isInRange(14, 12) &&
                               state.getPieceAt(neighbor) === player)
                        {
                            total += mod * SCORE_BY_ALIGNEMENT;
                            neighbor = neighbor.getNext(dir, 1);
                        }
                    }
                }
            }
            if (row !== 0) {
                total += (Math.abs(row) / row) * SCORE_BY_ROW_DOMINATION;
            }
            total += wasPresent.reduce((sum: number, newElement: number) => sum + newElement) * SCORE_BY_PRESENCE;
        }
        return total;
    }
}
