import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { EpaminondasConfig, EpaminondasNode } from './EpaminondasRules';
import { Heuristic } from 'src/app/jscaip/Minimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class EpaminondasHeuristic extends Heuristic<EpaminondasMove, EpaminondasState, BoardValue, EpaminondasConfig> {

    public getBoardValue(node: EpaminondasNode, _config: MGPOptional<EpaminondasConfig>): BoardValue {
        const boardValue: number = this.getPieceCountPlusRowDomination(node.gameState);
        return new BoardValue(boardValue);
    }

    public getPieceCountPlusRowDomination(state: EpaminondasState): number {
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        const SCORE_BY_PIECE: number = width * 13 * 11;
        const SCORE_BY_ROW_DOMINATION: number = 2;
        const SCORE_BY_PRESENCE: number = 1;
        const SCORE_BY_ALIGNEMENT: number = 1;
        let total: number = 0;
        for (let y: number = 0; y < height; y++) {
            let row: number = 0;
            const wasPresent: number[] = [0, 0];
            for (let x: number = 0; x < width; x++) {
                const coord: Coord = new Coord(x, y);
                const player: PlayerOrNone = state.getPieceAt(coord);
                if (player.isPlayer()) {
                    const mod: number = player.getScoreModifier();
                    total += SCORE_BY_PIECE * mod;
                    wasPresent[player.getValue()] = mod;
                    row += mod;
                    for (const dir of [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT]) {
                        let neighbor: Coord = coord.getNext(dir, 1);
                        while (state.isOnBoard(neighbor) &&
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
