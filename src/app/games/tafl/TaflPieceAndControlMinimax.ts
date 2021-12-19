import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TaflPawn } from './TaflPawn';
import { TaflState } from './TaflState';
import { TaflPieceAndInfluenceMinimax } from './TaflPieceAndInfluenceMinimax';
import { PieceThreat } from '../../jscaip/PieceThreat';
import { TaflNode } from './TaflMinimax';

export class TaflPieceAndControlMinimax extends TaflPieceAndInfluenceMinimax {

    public static SCORE_BY_THREATENED_PIECE: number = 530;

    public static SCORE_BY_SAFE_PIECE: number = (16 * TaflPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE) + 1;

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
    public getBoardValue(node: TaflNode): NodeUnheritance {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new NodeUnheritance(gameStatus.toBoardValue());
        }
        const state: TaflState = node.gameState;
        const WIDTH: number = this.ruler.config.WIDTH;
        const EMPTY: TaflPawn = TaflPawn.UNOCCUPIED;

        let score: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<PieceThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<PieceThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of [Player.ZERO, Player.ONE]) {
            const controlledSquares: MGPSet<Coord> = new MGPSet();
            for (const coord of pieceMap.get(owner).get().getCopy()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    score += owner.getScoreModifier() * TaflPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE;
                } else {
                    score += owner.getScoreModifier() * TaflPieceAndControlMinimax.SCORE_BY_SAFE_PIECE;
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (testedCoord.isInRange(WIDTH, WIDTH) &&
                               state.getPieceAt(testedCoord) === EMPTY)
                        {
                            controlledSquares.add(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlledSquares.getCopy()) {
                const controlledValue: number = TaflPieceAndControlMinimax.CONTROL_VALUE[controlled.y][controlled.x];
                score += owner.getScoreModifier() * controlledValue;
            }
        }
        return new NodeUnheritance(score);
    }
}
