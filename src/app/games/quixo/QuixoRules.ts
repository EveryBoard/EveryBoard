import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { QuixoConfig, QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Utils } from 'src/app/utils/utils';
import { MGPSet } from 'src/app/utils/MGPSet';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { QuixoFailure } from './QuixoFailure';
import { MGPMap } from 'src/app/utils/MGPMap';
import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { TableUtils } from 'src/app/utils/ArrayUtils';

export class QuixoNode extends GameNode<QuixoMove, QuixoState> {}

export class QuixoRules extends ConfigurableRules<QuixoMove, QuixoState, QuixoConfig> {

    private static singleton: MGPOptional<QuixoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<QuixoConfig> =
        new RulesConfigDescription<QuixoConfig>({
            name: (): string => $localize`Quixo`,
            config: {
                width: new NumberConfig(5, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
                height: new NumberConfig(5, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(1, 99)),
            },
        });

    public static readonly QUIXO_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(Utils.identity, 5);

    public static getVerticalCoords(node: QuixoNode): Coord[] {
        const currentOpponent: Player = node.gameState.getCurrentOpponent();
        const verticalCoords: Coord[] = [];
        const state: QuixoState = node.gameState;
        for (let y: number = 0; y < state.getHeight(); y++) {
            if (state.getPieceAtXY(0, y) !== currentOpponent) {
                verticalCoords.push(new Coord(0, y));
            }
            if (state.getPieceAtXY(state.getWidth() - 1, y) !== currentOpponent) {
                verticalCoords.push(new Coord(state.getWidth() - 1, y));
            }
        }
        return verticalCoords;
    }

    public static getHorizontalCenterCoords(node: QuixoNode): Coord[] {
        const currentOpponent: Player = node.gameState.getCurrentOpponent();
        const horizontalCenterCoords: Coord[] = [];
        const state: QuixoState = node.gameState;
        for (let x: number = 1; x < state.getWidth() - 1; x++) {
            if (state.getPieceAtXY(x, 0) !== currentOpponent) {
                horizontalCenterCoords.push(new Coord(x, 0));
            }
            if (state.getPieceAtXY(x, state.getHeight() - 1) !== currentOpponent) {
                horizontalCenterCoords.push(new Coord(x, state.getHeight() - 1));
            }
        }
        return horizontalCenterCoords;
    }

    public static getLinesSums(state: QuixoState): {[player: number]: {[lineType: string]: MGPMap<number, number>}} {
        const sums: {[player: number]: {[lineType: string]: MGPMap<number, number>}} = {};
        sums[Player.ZERO.value] = {
            columns: new MGPMap<number, number>(),
            rows: new MGPMap<number, number>(),
            ascendingDiagonal: new MGPMap<number, number>(),
            descendingDiagonal: new MGPMap<number, number>(),
        };
        sums[Player.ONE.value] = {
            columns: new MGPMap<number, number>(),
            rows: new MGPMap<number, number>(),
            ascendingDiagonal: new MGPMap<number, number>(),
            descendingDiagonal: new MGPMap<number, number>(),
        };
        for (const coordAndContent of state.getCoordsAndContents()) {
            const content: PlayerOrNone = coordAndContent.content;
            const x: number = coordAndContent.coord.x;
            const y: number = coordAndContent.coord.y;
            if (content.isPlayer()) {
                const c: number = content.value;
                const previousColumn: number = sums[c].columns.get(x).getOrElse(0);
                sums[c].columns.put(x, previousColumn + 1);
                const previousRow: number = sums[c].rows.get(y).getOrElse(0);
                sums[c].rows.put(y, previousRow + 1);
                const previousAscendingDiagonal: number = sums[c].ascendingDiagonal.get(x + y).getOrElse(0);
                sums[c].ascendingDiagonal.put(x + y, previousAscendingDiagonal + 1);
                const previousDescendingDiagonal: number = sums[c].descendingDiagonal.get(x - y).getOrElse(0);
                sums[c].descendingDiagonal.put(x - y, previousDescendingDiagonal + 1);
            }
        }
        return sums;
    }

    public static getVictoriousCoords(state: QuixoState): Coord[] {
        return QuixoRules.QUIXO_HELPER.getVictoriousCoord(state);
    }

    public static getFullestLine(playerLinesInfo: {[lineType: string]: MGPMap<number, number>}): number {
        let linesScores: number[] = playerLinesInfo.columns.listValues();
        linesScores = linesScores.concat(playerLinesInfo.rows.listValues());
        linesScores = linesScores.concat(playerLinesInfo.ascendingDiagonal.listValues());
        linesScores = linesScores.concat(playerLinesInfo.descendingDiagonal.listValues());
        return Math.max(...linesScores);
    }

    public static get(): QuixoRules {
        if (QuixoRules.singleton.isAbsent()) {
            QuixoRules.singleton = MGPOptional.of(new QuixoRules());
        }
        return QuixoRules.singleton.get();
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<QuixoConfig>> {
        return MGPOptional.of(QuixoRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getInitialState(config: MGPOptional<QuixoConfig>): QuixoState {
        const initialBoard: PlayerOrNone[][] = TableUtils.create(config.get().width,
                                                                 config.get().height,
                                                                 PlayerOrNone.NONE);
        return new QuixoState(initialBoard, 0);
    }

    public getPossibleDirections(state: QuixoState, coord: Coord): Orthogonal[] {
        const possibleDirections: Orthogonal[] = [];
        if (coord.x !== 0) possibleDirections.push(Orthogonal.LEFT);
        if (coord.y !== 0) possibleDirections.push(Orthogonal.UP);
        if (coord.x !== (state.getWidth() - 1)) possibleDirections.push(Orthogonal.RIGHT);
        if (coord.y !== (state.getHeight() - 1)) possibleDirections.push(Orthogonal.DOWN);
        return possibleDirections;
    }

    public isValidCoord(state: QuixoState, coord: Coord): MGPValidation {
        Utils.assert(state.isOnBoard(coord),
                     'Invalid coord for QuixoMove: ' + coord.toString() + ' is outside the board.');
        if (coord.x !== 0 &&
            coord.x !== (state.getWidth() - 1) &&
            coord.y !== 0 &&
            coord.y !== (state.getHeight() - 1))
        {
            return MGPValidation.failure(QuixoFailure.NO_INSIDE_CLICK());
        }
        return MGPValidation.SUCCESS;
    }

    private assertDirectionValidity(move: QuixoMove, state: QuixoState): void {
        const x: number = move.coord.x;
        const y: number = move.coord.y;
        const direction: Orthogonal = move.direction;
        Utils.assert(x !== (state.getWidth() - 1) || direction !== Orthogonal.RIGHT,
                     `Invalid direction: pawn on the right side can't be moved to the right.`);
        Utils.assert(y !== (state.getHeight() - 1) || direction !== Orthogonal.DOWN,
                     `Invalid direction: pawn on the bottom side can't be moved down.`);
        Utils.assert(x !== 0 || direction !== Orthogonal.LEFT,
                     `Invalid direction: pawn on the left side can't be moved to the left.`);
        Utils.assert(y !== 0 || direction !== Orthogonal.UP,
                     `Invalid direction: pawn on the top side can't be moved up.`);
    }

    public override applyLegalMove(move: QuixoMove, state: QuixoState, _config: MGPOptional<QuixoConfig>, _info: void)
    : QuixoState
    {
        return state.applyLegalMove(move);
    }

    public override isLegal(move: QuixoMove, state: QuixoState): MGPValidation {
        const coordValidity: MGPValidation = this.isValidCoord(state, move.coord);
        if (coordValidity.isFailure()) {
            return coordValidity;
        }
        this.assertDirectionValidity(move, state);
        if (state.getPieceAt(move.coord) === state.getCurrentOpponent()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public getGameStatus(node: QuixoNode): GameStatus {
        const state: QuixoState = node.gameState;
        const victoriousCoord: Coord[] = QuixoRules.QUIXO_HELPER.getVictoriousCoord(state);
        const unreducedWinners: PlayerOrNone[] = victoriousCoord.map((coord: Coord) => state.getPieceAt(coord));
        const winners: MGPSet<PlayerOrNone> = new MGPSet(unreducedWinners);
        if (winners.size() === 0) {
            return GameStatus.ONGOING;
        } else if (winners.size() === 1) {
            return GameStatus.getVictory(winners.getAnyElement().get() as Player);
        } else {
            return GameStatus.getVictory(state.getCurrentPlayer());
        }
    }

}
