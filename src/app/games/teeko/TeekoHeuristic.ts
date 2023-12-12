import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { TeekoMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { TeekoConfig, TeekoNode, TeekoRules } from './TeekoRules';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export abstract class TeekoHeuristic extends Heuristic<TeekoMove, TeekoState, BoardValue, TeekoConfig> {}

export class TeekoSquarePlusAlignmentHeuristic extends TeekoHeuristic {

    public getBoardValue(node: TeekoNode, _config: MGPOptional<TeekoConfig>): BoardValue {
        const alignmentPossibilities: number = TeekoRules.TEEKO_HELPER.getBoardValue(node.gameState).value[0];
        const squarePossibilities: { score: number; victoriousCoords: Coord[] } =
            TeekoRules.get().getSquareInfo(node.gameState);
        return BoardValue.of(squarePossibilities.score + alignmentPossibilities);
    }
}

export class TeekoSquareThenAlignementHeuristic extends TeekoHeuristic {

    public getBoardValue(node: TeekoNode, _config: MGPOptional<TeekoConfig>): BoardValue {
        const alignmentPossibilities: number = TeekoRules.TEEKO_HELPER.getBoardValue(node.gameState).value[0];
        const squarePossibilities: { score: number; victoriousCoords: Coord[] } =
            TeekoRules.get().getSquareInfo(node.gameState);
        return BoardValue.multiMetric([
            squarePossibilities.score,
            alignmentPossibilities,
        ]);
    }
}
