import { Player } from 'src/app/jscaip/Player';
import { SaharaMove } from './SaharaMove';
import { SaharaState } from './SaharaState';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { MGPMap } from 'src/app/utils/MGPMap';

export class SaharaHeuristic extends PlayerMetricHeuristic<SaharaMove, SaharaState> {

    public getMetrics(node: SaharaNode): MGPMap<Player, ReadonlyArray<number>> {
        const board: Table<FourStatePiece> = node.gameState.board;
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(board, Player.ONE);
        let i: number = 0;
        while (i < 6 && zeroFreedoms[i] === oneFreedoms[i]) {
            i++;
        }
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [zeroFreedoms[i % 6]] },
            { key: Player.ONE, value: [oneFreedoms[i % 6]] },
        ]);
    }

}
