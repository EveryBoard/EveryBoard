import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { SandwichThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TaflPawn } from './TaflPawn';
import { TaflState } from './TaflState';
import { TaflPieceAndControlMinimax } from './TaflPieceAndControlMinimax';
import { TaflNode } from './TaflMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { assert } from 'src/app/utils/assert';

type Metrics = {
    safeScore: number,
    threatenedScore: number,
    controlScore: number,
}

export class TaflEscapeThenPieceAndControlMinimax extends TaflPieceAndControlMinimax {

    public static SCORE_BY_THREATENED_PIECE: number = 961; // (4*11*11) + (4*9*11) + (9*9);

    public static SCORE_BY_SAFE_PIECE: number = (16 * TaflPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE) + 1;

    public getBoardValue(node: TaflNode): BoardValue {
        const gameStatus: GameStatus = this.ruler.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return new BoardValue(gameStatus.toBoardValue());
        }
        const state: TaflState = node.gameState;
        const width: number = this.ruler.config.WIDTH;
        const empty: TaflPawn = TaflPawn.UNOCCUPIED;

        const metrics: Metrics = { safeScore: 0, threatenedScore: 0, controlScore: 0 };
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of Player.PLAYERS) {
            const controlledSquares: MGPSet<Coord> = new CoordSet();
            for (const coord of pieceMap.get(owner).get()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    metrics.threatenedScore += owner.getScoreModifier();
                } else {
                    metrics.safeScore += owner.getScoreModifier();
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (testedCoord.isInRange(width, width) && state.getPieceAt(testedCoord) === empty) {
                            controlledSquares.add(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlledSquares) {
                const controlledValue: number = this.getControlledPieceValue(controlled.x, controlled.y, width);
                metrics.controlScore += owner.getScoreModifier() * controlledValue;
            }
        }
        const defender: Player = state.getPieceAt(this.ruler.getKingCoord(state).get()).getOwner() as Player;
        const stepForEscape: number = this.getStepForEscape(state) * defender.getScoreModifier();
        if (stepForEscape === -1) {
            return new BoardValue(defender.getOpponent().getPreVictory());
        }
        const maxControl: number = TaflEscapeThenPieceAndControlMinimax.SCORE_BY_THREATENED_PIECE;
        assert(metrics.controlScore <= maxControl, 'Control Score should be bellow ' + maxControl + ', got ' + metrics.controlScore);
        assert(metrics.threatenedScore <= 16, 'Threatened Score should be bellow 16, got ' + metrics.threatenedScore);
        assert(metrics.safeScore <= 16, 'Safe Score should be bellow 16, got ' + metrics.threatenedScore);
        return new BoardValue((-1 * stepForEscape * (maxControl + 1) * 17 * 17) +
                              (metrics.safeScore * (maxControl + 1) * 17) +
                              (metrics.threatenedScore * (maxControl + 1)) +
                              metrics.controlScore);
    }
    public getStepForEscape(state: TaflState): number {
        const king: Coord = this.ruler.getKingCoord(state).get();
        return this._getStepForEscape(state, 1, [king], []).getOrElse(-1);
    }
    public _getStepForEscape(state: TaflState,
                             step: number,
                             previousGen: Coord[],
                             handledCoords: Coord[])
    : MGPOptional<number>
    {
        const nextGen: Coord[] = this.getNextGen(state, previousGen, handledCoords);

        if (nextGen.length === 0) {
            // not found:
            return MGPOptional.empty();
        }
        if (nextGen.some((coord: Coord) => this.ruler.isExternalThrone(coord))) {
            return MGPOptional.of(step);
        } else {
            step++;
            handledCoords.push(...nextGen);
            return this._getStepForEscape(state, step, nextGen, handledCoords);
        }
    }
    public getNextGen(state: TaflState, previousGen: Coord[], handledCoords: Coord[]): Coord[] {
        const newGen: Coord[] = [];
        for (const piece of previousGen) {
            for (const dir of Orthogonal.ORTHOGONALS) {
                let landing: Coord = piece.getNext(dir, 1);
                while (landing.isInRange(this.ruler.config.WIDTH, this.ruler.config.WIDTH) &&
                       state.getPieceAt(landing) === TaflPawn.UNOCCUPIED)
                {
                    if (handledCoords.every((coord: Coord) => coord.equals(landing) === false)) {
                        // coord is new
                        newGen.push(landing);
                    }
                    landing = landing.getNext(dir, 1);
                }
            }
        }
        return newGen;
    }
}
