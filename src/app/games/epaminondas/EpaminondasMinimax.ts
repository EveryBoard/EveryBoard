import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { EpaminondasLegalityInformation, EpaminondasNode, EpaminondasRules } from './EpaminondasRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';

export class EpaminondasMoveGenerator extends MoveGenerator<EpaminondasMove, EpaminondasState> {

    public getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const moves: EpaminondasMove[] = this.getUnorderedListMoves(node);
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.stepSize; // Best for normal, might not be best for others!
        });
        return moves;
    }
    public getUnorderedListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const opponent: Player = node.gameState.getCurrentOpponent();
        const empty: PlayerOrNone = PlayerOrNone.NONE;

        let moves: EpaminondasMove[] = [];
        const state: EpaminondasState = node.gameState;
        for (const coordAndContent of state.getCoordsAndContents()) {
            const firstCoord: Coord = coordAndContent.coord;
            if (coordAndContent.content === player) {
                let move: EpaminondasMove;
                for (const direction of Direction.DIRECTIONS) {
                    let movedPieces: number = 1;
                    let nextCoord: Coord = firstCoord.getNext(direction, 1);
                    while (EpaminondasState.isOnBoard(nextCoord) &&
                           state.getPieceAt(nextCoord) === player)
                    {
                        movedPieces += 1;
                        nextCoord = nextCoord.getNext(direction, 1);
                    }
                    let stepSize: number = 1;
                    while (EpaminondasState.isOnBoard(nextCoord) &&
                           stepSize <= movedPieces &&
                           state.getPieceAt(nextCoord) === empty)
                    {
                        move = new EpaminondasMove(firstCoord.x, firstCoord.y, movedPieces, stepSize, direction);
                        moves = this.addMove(moves, move, state);
                        stepSize++;
                        nextCoord = nextCoord.getNext(direction, 1);
                    }
                    if (EpaminondasState.isOnBoard(nextCoord) &&
                        stepSize <= movedPieces &&
                        state.getPieceAt(nextCoord) === opponent)
                    {
                        move = new EpaminondasMove(firstCoord.x, firstCoord.y, movedPieces, stepSize, direction);
                        moves = this.addMove(moves, move, state);
                    }
                }
            }
        }
        return moves;
    }
    public addMove(moves: EpaminondasMove[], move: EpaminondasMove, state: EpaminondasState): EpaminondasMove[] {
        const legality: MGPFallible<EpaminondasLegalityInformation> = EpaminondasRules.isLegal(move, state);
        if (legality.isSuccess()) {
            moves.push(move);
        }
        return moves;
    }
}

export class EpaminondasHeuristic extends Heuristic<EpaminondasMove, EpaminondasState> {

    public getBoardValue(node: EpaminondasNode): BoardValue {
        return new BoardValue(this.getPieceCountPlusRowDomination(node.gameState));
    }
    public getPieceCountPlusRowDomination(state: EpaminondasState): number {
        const SCORE_BY_PIECE: number = EpaminondasState.WIDTH * 13 * 11;
        const SCORE_BY_ROW_DOMINATION: number = 2;
        const SCORE_BY_PRESENCE: number = 1;
        const SCORE_BY_ALIGNEMENT: number = 1;
        let total: number = 0;
        for (let y: number = 0; y < EpaminondasState.HEIGHT; y++) {
            let row: number = 0;
            const wasPresent: number[] = [0, 0];
            for (let x: number = 0; x < EpaminondasState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const player: PlayerOrNone = state.getPieceAt(coord);
                if (player.isPlayer()) {
                    const mod: number = player.getScoreModifier();
                    total += SCORE_BY_PIECE * mod;
                    wasPresent[player.value] = mod;
                    row += mod;
                    for (const dir of [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT]) {
                        let neighbor: Coord = coord.getNext(dir, 1);
                        while (EpaminondasState.isOnBoard(neighbor) &&
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

export class EpaminondasMinimax extends Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation> {

    public constructor() {
        super('Minimax', EpaminondasRules.get(), new EpaminondasHeuristic(), new EpaminondasMoveGenerator());
    }
}
