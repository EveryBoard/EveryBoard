import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { EpaminondasConfig, EpaminondasNode } from './EpaminondasRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MathUtils } from 'src/app/utils/MathUtils';

export class EpaminondasHeuristic extends Heuristic<EpaminondasMove, EpaminondasState, BoardValue, EpaminondasConfig> {

    public getBoardValue(node: EpaminondasNode, _config: MGPOptional<EpaminondasConfig>): BoardValue {
        return new BoardValue(this.getPieceCountPlusRowDomination(node.gameState));
    }

    public getPieceCountPlusRowDomination(state: EpaminondasState): number[] {
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        let pieces: number = 0;
        let alignement: number = 0;
        let rowDomination: number = 0;
        let presence: number = 0;
        for (let y: number = 0; y < height; y++) {
            let row: number = 0;
            const wasPresent: number[] = [0, 0];
            for (let x: number = 0; x < width; x++) {
                const coord: Coord = new Coord(x, y);
                const player: PlayerOrNone = state.getPieceAt(coord);
                if (player.isPlayer()) {
                    const mod: number = player.getScoreModifier();
                    pieces += mod;
                    wasPresent[player.value] = mod;
                    row += mod;
                    for (const dir of [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT]) {
                        let neighbor: Coord = coord.getNext(dir, 1);
                        while (state.isOnBoard(neighbor) &&
                               state.getPieceAt(neighbor) === player)
                        {
                            alignement += mod;
                            neighbor = neighbor.getNext(dir, 1);
                        }
                    }
                }
            }
            if (row !== 0) {
                rowDomination += Math.abs(row) / row;
            }
            presence += wasPresent.reduce(MathUtils.sum);
        }
        return [pieces, rowDomination, alignement, presence];
    }

}
