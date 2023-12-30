import { Player } from 'src/app/jscaip/Player';
import { SaharaMove } from './SaharaMove';
import { SaharaState } from './SaharaState';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';

export class SaharaHeuristic extends PlayerMetricHeuristic<SaharaMove, SaharaState> {

    public getMetrics(node: SaharaNode): PlayerNumberTable {
        const board: Table<FourStatePiece> = node.gameState.board;
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ONE);
        return PlayerNumberTable.of(zeroFreedoms, oneFreedoms);
    }

}
