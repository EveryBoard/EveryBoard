import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { SiamMove } from './SiamMove';
import { SiamConfig, SiamNode, SiamRules } from './SiamRules';
import { SiamState } from './SiamState';
import { Player } from 'src/app/jscaip/Player';
import { SiamPiece } from './SiamPiece';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class SiamHeuristic extends Heuristic<SiamMove, SiamState, BoardValue, SiamConfig> {

    public getBoardValue(node: SiamNode, config: MGPOptional<SiamConfig>): BoardValue {
        const boardValueInfo: { shortestZero: number, shortestOne: number, boardValue: number } =
            this.getBoardValueInfo(node.gameState, config.get());
        return new BoardValue([boardValueInfo.boardValue]);
    }

    private getBoardValueInfo(state: SiamState, config: SiamConfig)
    : { shortestZero: number, shortestOne: number, boardValue: number }
    {
        const mountainsInfo: { rows: number[], columns: number[], nbMountain: number } =
            SiamRules.get().getMountainsRowsAndColumns(state);
        const mountainsRow: number[] = mountainsInfo.rows;
        const mountainsColumn: number[] = mountainsInfo.columns;

        const pushers: { distance: number, coord: Coord}[] =
            SiamRules.get().getPushers(state, mountainsColumn, mountainsRow, config);
        let zeroShortestDistance: number = Number.MAX_SAFE_INTEGER;
        let oneShortestDistance: number = Number.MAX_SAFE_INTEGER;
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
