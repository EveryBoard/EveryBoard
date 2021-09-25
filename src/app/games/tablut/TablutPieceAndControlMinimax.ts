import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TablutCase } from './TablutCase';
import { TablutState } from './TablutState';
import { TablutPieceAndInfluenceMinimax } from './TablutPieceAndInfluenceMinimax';
import { PieceThreat } from '../../jscaip/PieceThreat';
import { TablutNode, TablutRules } from './TablutRules';
import { TablutRulesConfig } from './TablutRulesConfig';

export class TablutPieceAndControlMinimax extends TablutPieceAndInfluenceMinimax {

    public static SCORE_BY_THREATENED_PIECE: number = 530;

    public static SCORE_BY_SAFE_PIECE: number = (16 * TablutPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE) + 1;

    public static CONTROL_VALUE: NumberTable = [
        [64, 8, 8, 8, 8, 8, 8, 8, 64],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [8, 1, 1, 1, 1, 1, 1, 1, 8],
        [64, 8, 8, 8, 8, 8, 8, 8, 64],
    ];
    public getBoardValue(node: TablutNode): NodeUnheritance {
        const gameStatus: GameStatus = TablutRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const state: TablutState = node.gameState;
        const WIDTH: number = TablutRulesConfig.WIDTH;
        const EMPTY: TablutCase = TablutCase.UNOCCUPIED;

        let score: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<PieceThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<PieceThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of [Player.ZERO, Player.ONE]) {
            const controlleds: MGPSet<Coord> = new MGPSet();
            for (const coord of pieceMap.get(owner).get().getCopy()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    score += owner.getScoreModifier() * TablutPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE;
                } else {
                    score += owner.getScoreModifier() * TablutPieceAndControlMinimax.SCORE_BY_SAFE_PIECE;
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (testedCoord.isInRange(WIDTH, WIDTH) &&
                               state.getBoardAt(testedCoord) === EMPTY)
                        {
                            controlleds.add(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlleds.getCopy()) {
                const controlledValue: number = TablutPieceAndControlMinimax.CONTROL_VALUE[controlled.y][controlled.x];
                score += owner.getScoreModifier() * controlledValue;
            }
        }
        return new NodeUnheritance(score);
    }
}
