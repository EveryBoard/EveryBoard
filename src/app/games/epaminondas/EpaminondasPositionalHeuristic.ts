import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Heuristic } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasConfig, EpaminondasNode } from './EpaminondasRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class EpaminondasPositionalHeuristic
    extends Heuristic<EpaminondasMove, EpaminondasState, BoardValue, EpaminondasConfig>
{

    public getBoardValue(node: EpaminondasNode, _config: MGPOptional<EpaminondasConfig>): BoardValue {
        return new BoardValue(this.getPieceCountThenSupportThenAdvancement(node.gameState));
    }

    private getPieceCountThenSupportThenAdvancement(state: EpaminondasState): number {
        const width: number = state.getWidth();
        const height: number = state.getHeight();
        const MAX_ADVANCEMENT_SCORE_TOTAL: number = 28 * width;
        const SCORE_BY_ALIGNEMENT: number = MAX_ADVANCEMENT_SCORE_TOTAL + 1; // OLDLY 13
        const MAX_NUMBER_OF_ALIGNEMENT: number = (24*16) + (4*15);
        const SCORE_BY_PIECE: number = (MAX_NUMBER_OF_ALIGNEMENT * SCORE_BY_ALIGNEMENT) + 1; // OLDLY 25*13
        let total: number = 0;
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const player: PlayerOrNone = coordAndContent.content;
            if (player.isPlayer()) {
                let avancement: number; // between 0 and 11
                let dirs: Direction[];
                if (player === Player.ZERO) {
                    avancement = height - coord.y;
                    dirs = [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT];
                } else {
                    avancement = coord.y + 1;
                    dirs = [Direction.DOWN_LEFT, Direction.DOWN, Direction.DOWN_RIGHT];
                }
                const mod: number = player.getScoreModifier();
                total += avancement * mod;
                total += SCORE_BY_PIECE * mod;
                for (const dir of dirs) {
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
        return total;
    }

}
