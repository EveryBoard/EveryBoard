import { Player } from '@everyboard/games';

import { BoardValue } from '../../jscaip/AI/BoardValue';
import { Heuristic } from '../../jscaip/AI/Heuristic';
import { Coord } from '../../jscaip/Coord';

import { SiamMove } from './SiamMove';
import { SiamPiece } from './SiamPiece';
import { SiamConfig, SiamNode, SiamRules } from './SiamRules';
import { SiamState } from './SiamState';

export class SiamHeuristic extends Heuristic<SiamMove, SiamState, BoardValue, SiamConfig> {

    public getBoardValue(node: SiamNode, config: SiamConfig): BoardValue {
        const boardValueInfo: { shortestZero: number; shortestOne: number; boardValue: number } =
            this.getBoardValueInfo(node.gameState, config);
        return BoardValue.of(boardValueInfo.boardValue);
    }

    private getBoardValueInfo(state: SiamState, config: SiamConfig)
    : { shortestZero: number; shortestOne: number; boardValue: number }
    {
        const mountainsInfo: { rows: number[]; columns: number[]; nbMountain: number } =
            SiamRules.get().getMountainsRowsAndColumns(state);
        const mountainsRow: number[] = mountainsInfo.rows;
        const mountainsColumn: number[] = mountainsInfo.columns;

        const pushers: { distance: number; coord: Coord}[] =
            SiamRules.get().getPushers(state, mountainsColumn, mountainsRow, config);
        let zeroShortestDistance: number = Number.POSITIVE_INFINITY;
        let oneShortestDistance: number = Number.POSITIVE_INFINITY;
        const currentPlayer: Player = state.getCurrentPlayer();
        for (const pusher of pushers) {
            if (state.isOnBoard(pusher.coord)) {
                const piece: SiamPiece = state.getPieceAt(pusher.coord);
                if (piece.belongsTo(Player.ZERO)) {
                    zeroShortestDistance = Math.min(zeroShortestDistance, pusher.distance);
                } else {
                    oneShortestDistance = Math.min(oneShortestDistance, pusher.distance);
                }
            } else {
                if (currentPlayer === Player.ZERO) {
                    zeroShortestDistance = Math.min(zeroShortestDistance, pusher.distance);
                } else {
                    oneShortestDistance = Math.min(oneShortestDistance, pusher.distance);
                }
            }
        }
        const boardValue: number =
            SiamRules.get().getScoreFromShortestDistances(zeroShortestDistance, oneShortestDistance, currentPlayer);
        return { shortestZero: zeroShortestDistance, shortestOne: oneShortestDistance, boardValue };
    }

}
