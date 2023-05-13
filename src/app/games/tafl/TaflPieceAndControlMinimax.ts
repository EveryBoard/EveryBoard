import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TaflPawn } from './TaflPawn';
import { TaflState } from './TaflState';
import { TaflPieceAndInfluenceMinimax } from './TaflPieceAndInfluenceMinimax';
import { SandwichThreat } from '../../jscaip/PieceThreat';
import { TaflNode } from './TaflMinimax';
import { CoordSet } from 'src/app/utils/OptimizedSet';

export class TaflPieceAndControlMinimax extends TaflPieceAndInfluenceMinimax {

    public static SCORE_BY_THREATENED_PIECE: number = 530;

    public static SCORE_BY_SAFE_PIECE: number = (16 * TaflPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE) + 1;

    public getBoardValue(node: TaflNode): BoardValue {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new BoardValue(gameStatus.toBoardValue());
        }
        const state: TaflState = node.gameState;
        const width: number = this.ruler.config.WIDTH;
        const empty: TaflPawn = TaflPawn.UNOCCUPIED;

        let score: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of Player.PLAYERS) {
            const controlledSquares: MGPSet<Coord> = new CoordSet();
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    score += owner.getScoreModifier() * TaflPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE;
                } else {
                    score += owner.getScoreModifier() * TaflPieceAndControlMinimax.SCORE_BY_SAFE_PIECE;
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (testedCoord.isInRange(width, width) &&
                               state.getPieceAt(testedCoord) === empty)
                        {
                            controlledSquares.add(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlledSquares) {
                const controlledValue: number = this.getControlledPieceValue(controlled.x, controlled.y, width);
                score += owner.getScoreModifier() * controlledValue;
            }
        }
        return new BoardValue(score);
    }
    public getControlledPieceValue(x: number, y: number, width: number): number {
        let value: number = 1;
        if (x === 0 || x === width - 1) {
            value *= width;
        }
        if (y === 0 || y === width - 1) {
            value *= width;
        }
        /** 1 for center
          * width for border
          * width*width for corners
          */
        return value;
    }
}
