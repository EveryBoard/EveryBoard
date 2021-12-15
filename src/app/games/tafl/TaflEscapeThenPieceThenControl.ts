import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { SandwichThreat } from 'src/app/jscaip/PieceThreat';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { TaflPawn } from './TaflPawn';
import { TaflState } from './TaflState';
import { TaflPieceAndControlMinimax } from './TaflPieceAndControlMinimax';
import { TaflNode } from './TaflMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class TaflEscapeThenPieceAndControlMinimax extends TaflPieceAndControlMinimax {

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

        let safeScore: number = 0;
        let threatenedScore: number = 0;
        let controlScore: number = 0;
        const pieceMap: MGPMap<Player, MGPSet<Coord>> = this.getPiecesMap(state);
        const threatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.getThreatMap(state, pieceMap);
        const filteredThreatMap: MGPMap<Coord, MGPSet<SandwichThreat>> = this.filterThreatMap(threatMap, state);
        for (const owner of [Player.ZERO, Player.ONE]) {
            const controlledSquares: MGPSet<Coord> = new MGPSet();
            for (const coord of pieceMap.get(owner).get().getCopy()) {
                if (filteredThreatMap.get(coord).isPresent()) {
                    threatenedScore += owner.getScoreModifier();
                } else {
                    safeScore += owner.getScoreModifier();
                    for (const dir of Orthogonal.ORTHOGONALS) {
                        let testedCoord: Coord = coord.getNext(dir, 1);
                        while (testedCoord.isInRange(WIDTH, WIDTH) && state.getPieceAt(testedCoord) === EMPTY) {
                            controlledSquares.add(testedCoord);
                            testedCoord = testedCoord.getNext(dir, 1);
                        }
                    }
                }
            }
            for (const controlled of controlledSquares.getCopy()) {
                const controlledValue: number =
                    TaflPieceAndControlMinimax.CONTROL_VALUE[controlled.y][controlled.x];
                controlScore += owner.getScoreModifier() * controlledValue;
            }
        }
        const stepForEscape: number = this.getStepForEscape(state);
        return new NodeUnheritance((stepForEscape * 531 * 17 * 17) +
                                   (safeScore * 531 * 17) +
                                   (threatenedScore * 531) +
                                   controlScore);
    }
    public getStepForEscape(state: TaflState): number {
        const king: Coord = this.ruler.getKingCoord(state).get();
        return this._getStepForEscape(state, 1, [king], []).getOrElse(Number.MAX_SAFE_INTEGER);
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
