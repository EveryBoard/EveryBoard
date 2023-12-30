import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TeekoHeuristic } from './TeekoHeuristic';
import { TeekoConfig, TeekoNode, TeekoRules } from './TeekoRules';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';

export class TeekoSquareThenAlignementHeuristic extends TeekoHeuristic {

    public getBoardValue(node: TeekoNode, _config: MGPOptional<TeekoConfig>): BoardValue {
        const alignmentPossibilities: number = TeekoRules.TEEKO_HELPER.getBoardValue(node.gameState).metrics[0];
        const squarePossibilities: { score: number; victoriousCoords: Coord[] } =
            TeekoRules.get().getSquareInfo(node.gameState);
        return BoardValue.multiMetric([
            squarePossibilities.score,
            alignmentPossibilities,
        ]);
    }
}
