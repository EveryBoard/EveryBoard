import { MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { BooleanConfig, EnumConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord, CoordFailure } from '../../jscaip/Coord';
import { DirectionFailure } from '../../jscaip/Direction';
import { GameStatus } from '../../jscaip/GameStatus';
import { MoveCoordToCoord } from '../../jscaip/MoveCoordToCoord';
import { Ordinal } from '../../jscaip/Ordinal';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerMap } from '../../jscaip/PlayerMap';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesConfig } from '../../jscaip/RulesConfigUtil';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { Table, TableUtils } from '../../jscaip/TableUtils';
import { Localized } from '../../utils/LocaleUtils';
import { MGPValidators } from '../../utils/MGPValidator';

import { QuebecCastlesDrop, QuebecCastlesMove, QuebecCastlesTranslation } from './QuebecCastlesMove';
import { QuebecCastlesState } from './QuebecCastlesState';

export class QuebecCastlesFailure {

    public static readonly INVALID_INVADER_DISTANCE: (distance: number) => string = (distance: number) => $localize`Move distance must be 2 for invader, not ${ distance }`;

    public static readonly INVALID_DEFENDER_DISTANCE: (distance: number) => string = (distance: number) => $localize`Move distance must be 1 for defender, not ${ distance }`;

    public static readonly MUST_DROP_IN_YOUR_TERRITORY: Localized = () => $localize`You must drop in your own territory`;

    public static readonly CANNOT_DROP_IN_MOVE_PHASE: Localized = () => $localize`You cannot drop in move phase`;

    public static readonly CANNOT_MOVE_IN_DROP_PHASE: Localized = () => $localize`You cannot move in drop phase`;

    public static readonly MUST_DROP_ALL_YOUR_PIECES: Localized = () => $localize`You must drop all your pieces`;

    public static readonly MUST_DROP_ALL_YOUR_REMAINING_PIECES: Localized = () => $localize`You must drop all your remaining pieces, not more not less`;

    public static readonly CANNOT_DROP_THAT_MANY_PIECES: Localized = () => $localize`You cannot drop that many pieces`;

    public static readonly MUST_DROP_ONE_BY_ONE: Localized = () => $localize`You must drop pieces one by one`;

    public static readonly CANNOT_LAND_OR_DROP_IN_YOUR_CASTLE: Localized = () => $localize`You cannot land or drop on your castle`;

    public static readonly PLACE_ONLY_ONE_CASTLE: Localized = () => $localize`You must only place your castle`;

    public static readonly CANNOT_PUT_THAT_MANY_PIECE_IN_THERE_FOR_INVADER: (max: number, line: number) => string = (max: number, line: number) => $localize`If you have ${ line } line(s), you can only have ${ max } pieces (as invader)`;

    public static readonly CANNOT_PUT_THAT_MANY_PIECE_IN_THERE_FOR_DEFENDER: (max: number, line: number) => string = (max: number, line: number) => $localize`If you have ${ line } line(s), you can only have ${ max } pieces (as defender)`;

    public static readonly TOO_MANY_LINES_FOR_TERRITORY: Localized = () => $localize`Too many lines for territory, your opponent lines would merge with yours!`;

}

export type DropMode = 'AUTO' | 'PIECE_BY_PIECE' | 'BY_BATCH'

export const DropModes: Record<DropMode, Localized> = {
    'AUTO': () => $localize`Automatic`,
    'PIECE_BY_PIECE': () => $localize`Piece by piece`,
    'BY_BATCH': () => $localize`By batch`,
};

export type QuebecCastlesConfig = RulesConfig & {

    width: number;

    height: number;

    linesForTerritory: number;

    invaders: number;

    defenders: number;

    isRhombic: boolean;

    playersPlaceCastle: boolean;

    dropMode: DropMode;

}

export class QuebecCastlesNode extends GameNode<QuebecCastlesMove, QuebecCastlesState> { }

export class QuebecCastlesRules extends ConfigurableRules<QuebecCastlesMove, QuebecCastlesState, QuebecCastlesConfig> {

    private static singleton: MGPOptional<QuebecCastlesRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription <QuebecCastlesConfig> =
        new RulesConfigDescription<QuebecCastlesConfig>(
            {
                name: (): string => $localize`Quebec Castles`,
                config: {
                    width: new NumberConfig(9, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(2, 20)),
                    height: new NumberConfig(9, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(2, 20)),
                    linesForTerritory: new NumberConfig(5, () => $localize`Lines for territory`, MGPValidators.range(1, 10)),
                    invaders: new NumberConfig(14, () => $localize`Number of invaders`, MGPValidators.range(1, 123456)),
                    defenders: new NumberConfig(9, () => $localize`Number of defenders`, MGPValidators.range(1, 123456)),
                    isRhombic: new BooleanConfig(true, () => $localize`Is Rhombic`),
                    playersPlaceCastle: new BooleanConfig(false, () => $localize`Place castle yourself`),
                    dropMode: new EnumConfig('AUTO', () => $localize`Drop mode`, DropModes),
                },
                validators: [
                    QuebecCastlesRules.enoughLineForTerritory,
                    QuebecCastlesRules.enoughPlaceForDefenders,
                    QuebecCastlesRules.enoughPlaceForInvaders,
                ],
            },
        );

    private static enoughLineForTerritory(config: QuebecCastlesConfig): MGPValidation {
        let height: number;
        if (config.isRhombic) {
            height = config.width + config.height - 2;
        } else {
            height = config.height;
        }
        if (config.linesForTerritory < (height / 2)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(QuebecCastlesFailure.TOO_MANY_LINES_FOR_TERRITORY());
        }
    }

    private static enoughPlaceForInvaders(config: QuebecCastlesConfig): MGPValidation {
        return QuebecCastlesRules.isThereEnoughPlaceForPiece(Player.ZERO, config, config.invaders);
    }

    private static enoughPlaceForDefenders(config: QuebecCastlesConfig): MGPValidation {
        return QuebecCastlesRules.isThereEnoughPlaceForPiece(Player.ONE, config, config.defenders);
    }

    public static get(): QuebecCastlesRules {
        if (QuebecCastlesRules.singleton.isAbsent()) {
            QuebecCastlesRules.singleton = MGPOptional.of(new QuebecCastlesRules());
        }
        return QuebecCastlesRules.singleton.get();
    }

    private static isThereEnoughPlaceForPiece(player: Player, config: QuebecCastlesConfig, numberOfPiece: number)
    : MGPValidation
    {
        // Got to subtract 1 as the castle is not included
        const spaceForPiece: number = QuebecCastlesRules.get().getValidDropCoords(player, config).length - 1;
        if (spaceForPiece < numberOfPiece) {
            const line: number = config.linesForTerritory;
            const failure: string = player === Player.ZERO ?
                QuebecCastlesFailure.CANNOT_PUT_THAT_MANY_PIECE_IN_THERE_FOR_INVADER(spaceForPiece, line) :
                QuebecCastlesFailure.CANNOT_PUT_THAT_MANY_PIECE_IN_THERE_FOR_DEFENDER(spaceForPiece, line);
            return MGPValidation.failure(failure);
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<QuebecCastlesConfig>> {
        return MGPOptional.of(QuebecCastlesRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getInitialState(optionalConfig: MGPOptional<QuebecCastlesConfig>): QuebecCastlesState {
        const config: QuebecCastlesConfig = optionalConfig.get();
        const castles: PlayerMap<MGPOptional<Coord>> = this.getCastles(config);
        const board: Table<PlayerOrNone> = TableUtils.create(config.width, config.height, PlayerOrNone.NONE);
        let state: QuebecCastlesState = new QuebecCastlesState(board, 0, castles);
        if (config.dropMode === 'AUTO' && config.playersPlaceCastle === false) {
            state = this.fillBoard(state, config);
        }
        return state;
    }

    private getCastles(config: QuebecCastlesConfig): PlayerMap<MGPOptional<Coord>> {
        if (config.playersPlaceCastle) {
            const empty: MGPOptional<Coord> = MGPOptional.empty();
            return PlayerMap.ofValues(empty, empty);
        } else {
            const upperLeft: MGPOptional<Coord> = MGPOptional.of(new Coord(0, 0));
            const bottomRight: MGPOptional<Coord> = MGPOptional.of(new Coord(config.width - 1, config.height - 1));
            return PlayerMap.ofValues(bottomRight, upperLeft);
        }
    }

    private fillBoard(state: QuebecCastlesState, config: QuebecCastlesConfig): QuebecCastlesState {
        state = this.fillBoardFor(Player.ONE, state, config);
        state = this.fillBoardFor(Player.ZERO, state, config);
        return state;
    }

    private fillBoardFor(player: Player, state: QuebecCastlesState, config: QuebecCastlesConfig): QuebecCastlesState {
        const initialCoords: Coord[] = this.getInitialCoords(player, state, config);
        for (const coord of initialCoords) {
            state = state.setPieceAt(coord, player);
        }
        return state;
    }

    private getLineDirectionAndIndex(player: Player, config: QuebecCastlesConfig)
    : { lineDirection: number, lineToFillIndex: number }
    {
        const lineToFillRange: { min: number, max: number } = this.getLegalRangeIndex(player, config);
        if (player === Player.ZERO) {
            return { lineDirection: -1, lineToFillIndex: lineToFillRange.max };
        } else {
            return { lineDirection: 1, lineToFillIndex: lineToFillRange.min };
        }
    }

    private getLineFirstCoord(line: Coord[], pieceToDrop: number): { coord: Coord, skipCenter: boolean } {
        const availableSpaceEvenness: boolean = line.length % 2 === 0;
        const remainingSpace: number = line.length - pieceToDrop;
        const skipCenter: boolean = availableSpaceEvenness === false && (pieceToDrop % 2 === 0);
        const indexStart: number = Math.floor(remainingSpace / 2);
        const coord: Coord = line[indexStart]; // start on middle part that is on the right
        return { coord, skipCenter };
    }

    public getInitialCoords(player: Player, state: QuebecCastlesState, config: QuebecCastlesConfig): Coord[] {
        let pieceToDrop: number = this.getNumberOfPieces(player, config);
        const coordDirection: Ordinal = config.isRhombic ? Ordinal.UP_RIGHT : Ordinal.RIGHT;
        let { lineDirection, lineToFillIndex } = this.getLineDirectionAndIndex(player, config);
        const coords: Coord[] = [];
        while (pieceToDrop > 0) {
            const availableSpaceAtLine: Coord[] =
                this.getAvailableSpacesAtLine(lineToFillIndex, state, config);
            if (pieceToDrop < availableSpaceAtLine.length) {
                let { coord, skipCenter } = this.getLineFirstCoord(availableSpaceAtLine, pieceToDrop);
                coords.push(coord);
                pieceToDrop--;
                const center: Coord = availableSpaceAtLine[Math.floor(availableSpaceAtLine.length / 2)];
                while (pieceToDrop > 0) {
                    coord = coord.getNext(coordDirection, 1);
                    if (skipCenter && coord.equals(center)) {
                        coord = coord.getNext(coordDirection, 1);
                    }
                    coords.push(coord);
                    pieceToDrop--;
                }
            } else {
                coords.push(...availableSpaceAtLine);
                pieceToDrop -= availableSpaceAtLine.length;
            }
            lineToFillIndex += lineDirection;
        }
        return coords;
    }

    private getAvailableSpacesAtLine(line: number, state: QuebecCastlesState, config: QuebecCastlesConfig): Coord[] {
        let defaultAvailableSpace: number;
        let coord: Coord;
        let direction: Ordinal;
        const coords: Coord[] = [];
        if (config.isRhombic) {
            const xMax: number = config.width - 1;
            const yMax: number = config.height - 1;
            const max: number = xMax + yMax;
            defaultAvailableSpace = Math.min(line + 1, max + 1 - line);
            const xInitial: number = Math.max(line - yMax, 0);
            const yInitial: number = Math.min(line, yMax);
            coord = new Coord(xInitial, yInitial);
            direction = Ordinal.UP_RIGHT;
        } else {
            defaultAvailableSpace = config.width;
            coord = new Coord(0, line);
            direction = Ordinal.RIGHT;
        }
        while (defaultAvailableSpace > 0) {
            if (state.isCastleAt(coord) === false) {
                coords.push(coord);
            }
            coord = coord.getNext(direction);
            defaultAvailableSpace--;
        }
        return coords;
    }

    public isDropPhase(state: QuebecCastlesState, config: QuebecCastlesConfig): boolean {
        return this.getExpectedDropsThisTurn(state, config) > 0;
    }

    public override isLegal(move: QuebecCastlesMove,
                            state: QuebecCastlesState,
                            optionalConfig: MGPOptional<QuebecCastlesConfig>)
    : MGPValidation
    {
        const config: QuebecCastlesConfig = optionalConfig.get();
        if (this.isDropPhase(state, config)) {
            return this.isLegalDrop(move, state, config);
        } else {
            return this.isLegalTranslation(move, state);
        }
    }

    public getExpectedDropsThisTurn(state: QuebecCastlesState, config: QuebecCastlesConfig): number {
        switch (config.dropMode) {
            case 'PIECE_BY_PIECE':
                const totalPieceToDrop: number = config.defenders + config.invaders;
                if (state.turn < totalPieceToDrop) {
                    return this.getExpectedDropsThisTurnForPieceByPiece(state, config);
                } else {
                    return 0;
                }
            case 'BY_BATCH':
                return this.getExpectedDropsThisTurnForBatch(state, config);
            default:
                if (this.mustPlaceCastle(state, config)) {
                    return 1;
                } else {
                    return 0;
                }
        }
    }

    private getExpectedDropsThisTurnForPieceByPiece(state: QuebecCastlesState, config: QuebecCastlesConfig): number {
        if (this.mustPlaceCastle(state, config)) {
            return 1;
        }
        const totalPieceToDrop: number = config.defenders + config.invaders;
        const totalPieceDropped: number = state.countPieceOnBoard(Player.ZERO) + state.countPieceOnBoard(Player.ONE);
        if (totalPieceDropped === totalPieceToDrop) {
            return 0;
        }
        Utils.assert(state.turn < totalPieceToDrop, 'getExpectedDropsThisTurnForPieceByPiece should not be called after drop phase');
        // This turn is when the other player has dropped all its pieces
        // First player: 3; second player: 5 => turn 5 ==> drop 3
        // First player: 5; second player: 3 => turn 6 ==> drop 2
        let turnOfLastDrop: number = Math.min(config.defenders, config.invaders) * 2;
        if (config.playersPlaceCastle) {
            turnOfLastDrop += 2;
        }
        let dropBonus: number = 0;
        if (config.defenders < config.invaders) {
            turnOfLastDrop--;
            dropBonus = 1;
        }
        if (state.turn === turnOfLastDrop) {
            return Math.abs(config.defenders - config.invaders) + dropBonus;
        } else {
            return 1;
        }
    }

    private getExpectedDropsThisTurnForBatch(state: QuebecCastlesState, config: QuebecCastlesConfig): number {
        const toDrop: number = this.getNumberOfPieces(state.getCurrentPlayer(), config);
        if (state.turn < 2) {
            if (config.playersPlaceCastle) {
                return 1;
            } else {
                return toDrop;
            }
        } else if (state.turn < 4) {
            if (config.playersPlaceCastle) {
                return toDrop;
            }
        }
        return 0;
    }

    private isLegalDrop(move: QuebecCastlesMove, state: QuebecCastlesState, config: QuebecCastlesConfig)
    : MGPValidation
    {
        if (QuebecCastlesMove.isTranslation(move)) {
            return MGPValidation.failure(QuebecCastlesFailure.CANNOT_MOVE_IN_DROP_PHASE());
        }
        if (this.mustPlaceCastle(state, config)) {
            return this.isLegalCastlePlacement(move, state, config);
        } else {
            return this.isLegalPieceDrop(move, state, config);
        }
    }

    public mustPlaceCastle(state: QuebecCastlesState, config: QuebecCastlesConfig): boolean {
        return state.turn < 2 && config.playersPlaceCastle;
    }

    private isLegalCastlePlacement(move: QuebecCastlesDrop, state: QuebecCastlesState, config: QuebecCastlesConfig)
    : MGPValidation
    {
        if (move.coords.size() === 1) {
            return this.getDropLegality(move.coords.getAnyElement().get(), state, config, false);
        } else {
            return MGPValidation.failure(QuebecCastlesFailure.PLACE_ONLY_ONE_CASTLE());
        }
    }

    private isLegalPieceDrop(move: QuebecCastlesDrop, state: QuebecCastlesState, config: QuebecCastlesConfig)
    : MGPValidation
    {
        if (config.dropMode === 'PIECE_BY_PIECE') {
            if (this.isLastDrop(state, config)) {
                const player: Player = state.getCurrentPlayer();
                const playerCount: number = state.countPieceOnBoard(player);
                const playerTotal: number = this.getNumberOfPieces(player, config);
                const remainToDrop: number = playerTotal - playerCount;
                if (move.coords.size() !== remainToDrop) {
                    return MGPFallible.failure(QuebecCastlesFailure.MUST_DROP_ALL_YOUR_REMAINING_PIECES());
                }
            } else {
                if (move.coords.size() > 1) {
                    return MGPFallible.failure(QuebecCastlesFailure.MUST_DROP_ONE_BY_ONE());
                }
            }
        } else if (config.dropMode === 'BY_BATCH') {
            const numberToDrop: number = this.getNumberOfPieces(state.getCurrentPlayer(), config);
            if (move.coords.size() > numberToDrop) {
                return MGPFallible.failure(QuebecCastlesFailure.CANNOT_DROP_THAT_MANY_PIECES());
            }
            if (move.coords.size() < numberToDrop) {
                return MGPFallible.failure(QuebecCastlesFailure.MUST_DROP_ALL_YOUR_PIECES());
            }
        }
        for (const coord of move.coords) {
            const dropLegality: MGPValidation = this.getDropLegality(coord, state, config, false);
            if (dropLegality.isFailure()) {
                return dropLegality;
            }
        }
        return MGPValidation.SUCCESS;
    }

    private getNumberOfPieces(player: Player, config: QuebecCastlesConfig): number {
        return player === Player.ZERO ? config.defenders : config.invaders;
    }

    private isLastDrop(state: QuebecCastlesState, config: QuebecCastlesConfig): boolean {
        const opponent: Player = state.getCurrentOpponent();
        const opponentCount: number = state.countPieceOnBoard(opponent);
        const opponentTotal: number = this.getNumberOfPieces(opponent, config);
        return opponentCount === opponentTotal; // If opponent dropped all its pieces (one by one)
        // Then you must now drop them all at once
    }

    private getDropLegality(coord: Coord, state: QuebecCastlesState, config: QuebecCastlesConfig, isCastle: boolean)
    : MGPValidation
    {
        if (state.isOnBoard(coord) === false) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(coord));
        }
        const landingSquare: PlayerOrNone = state.getPieceAt(coord);
        if (landingSquare.isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }
        const player: Player = state.getCurrentPlayer();
        if (state.castles.get(player).equalsValue(coord) && isCastle === false) {
            return MGPValidation.failure(QuebecCastlesFailure.CANNOT_LAND_OR_DROP_IN_YOUR_CASTLE());
        }
        if (this.isDropInPlayerTerritory(coord, player, config)) {
            return MGPValidation.SUCCESS;
        } else {
            return MGPValidation.failure(QuebecCastlesFailure.MUST_DROP_IN_YOUR_TERRITORY());
        }
    }

    public getValidDropCoords(player: Player, config: QuebecCastlesConfig): Coord[] {
        const drops: Coord[] = [];
        for (let y: number = 0; y < config.height; y++) {
            for (let x: number = 0; x < config.width; x++) {
                const coord: Coord = new Coord(x, y);
                if (this.isDropInPlayerTerritory(coord, player, config)) {
                    drops.push(coord);
                }
            }
        }
        return drops;
    }

    public isValidDrop(state: QuebecCastlesState, coord: Coord, player: Player, config: QuebecCastlesConfig): boolean {
        if (this.isDropInPlayerTerritory(coord, player, config)) {
            return state.getPieceAt(coord).isNone() && state.isCastleAt(coord) === false;
        } else {
            return false;
        }
    }

    public isDropInPlayerTerritory(coord: Coord, player: Player, config: QuebecCastlesConfig): boolean {
        const y: number = coord.y;
        let metric: number = 0;
        if (config.isRhombic) {
            const x: number = coord.x;
            metric = x + y;
        } else {
            metric = y;
        }
        const minMax: { min: number, max: number } = this.getLegalRangeIndex(player, config);
        return minMax.min <= metric && metric <= minMax.max;
    }

    private getLegalRangeIndex(player: Player, config: QuebecCastlesConfig): { min: number, max: number } {
        const yMax: number = config.height - 1;
        if (config.isRhombic) {
            const xMax: number = config.width - 1;
            const max: number = xMax + yMax;
            return this.getLegalRangeFromMaximum(player, config, max);
        } else {
            return this.getLegalRangeFromMaximum(player, config, yMax);
        }
    }

    private getLegalRangeFromMaximum(player: Player, config: QuebecCastlesConfig, max: number)
    : { min: number, max: number }
    {
        return {
            min: player === Player.ZERO ? (max + 1) - config.linesForTerritory : 0,
            max: player === Player.ZERO ? max : config.linesForTerritory - 1,
        };
    }

    private isLegalTranslation(move: QuebecCastlesMove, state: QuebecCastlesState)
    : MGPValidation
    {
        if (QuebecCastlesMove.isDrop(move)) {
            return MGPValidation.failure(QuebecCastlesFailure.CANNOT_DROP_IN_MOVE_PHASE());
        }
        const startValidity: MGPValidation = this.getStartValidity(state, move.getStart());
        if (startValidity.isFailure()) {
            return startValidity;
        }
        const endValidity: MGPValidation = this.getLandingValidity(state, move.getEnd());
        if (endValidity.isFailure()) {
            return endValidity;
        }
        const middleValidity: MGPValidation = this.getMiddleValidity(state, move);
        if (middleValidity.isFailure()) {
            return middleValidity;
        }
        return MGPValidation.SUCCESS;
    }

    private getStartValidity(state: QuebecCastlesState, start: Coord): MGPValidation {
        if (state.isOnBoard(start) === false) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(start));
        }
        const startPiece: PlayerOrNone = state.getPieceAt(start);
        if (startPiece.isNone()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (startPiece === state.getCurrentOpponent()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        return MGPValidation.SUCCESS;
    }

    private getLandingValidity(state: QuebecCastlesState, landing: Coord): MGPValidation {
        if (state.isOnBoard(landing) === false) {
            return MGPValidation.failure(CoordFailure.OUT_OF_RANGE(landing));
        }
        const landingSquare: PlayerOrNone = state.getPieceAt(landing);
        const currentPlayer: Player = state.getCurrentPlayer();
        if (landingSquare.isPlayer() && landingSquare.equals(currentPlayer)) {
            return MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE());
        }
        const playerCastle: Coord = state.castles.get(currentPlayer).get();
        if (landing.equals(playerCastle)) {
            return MGPValidation.failure(QuebecCastlesFailure.CANNOT_LAND_OR_DROP_IN_YOUR_CASTLE());
        }
        return MGPValidation.SUCCESS;
    }

    private getMiddleValidity(state: QuebecCastlesState, move: MoveCoordToCoord): MGPValidation {
        const direction: MGPFallible<Ordinal> = move.getDirection();
        if (direction.isFailure()) {
            return MGPValidation.failure(DirectionFailure.DIRECTION_MUST_BE_LINEAR());
        }
        const distance: number = move.getDistance();
        if (state.getCurrentPlayer() === Player.ZERO) {
            if (distance !== this.getPlayerStepSize(Player.ZERO)) {
                return MGPValidation.failure(QuebecCastlesFailure.INVALID_DEFENDER_DISTANCE(distance));
            }
        } else {
            if (distance !== this.getPlayerStepSize(Player.ONE)) {
                return MGPValidation.failure(QuebecCastlesFailure.INVALID_INVADER_DISTANCE(distance));
            }
            const middle: Coord[] = move.getJumpedOverCoords();
            const middlePiece: PlayerOrNone = state.getPieceAt(middle[0]);
            if (middlePiece !== PlayerOrNone.NONE) {
                return MGPValidation.failure(RulesFailure.SOMETHING_IN_THE_WAY());
            }
        }
        return MGPValidation.SUCCESS;
    }

    public override applyLegalMove(move: QuebecCastlesMove,
                                   state: QuebecCastlesState,
                                   config: MGPOptional<QuebecCastlesConfig>)
    : QuebecCastlesState
    {
        if (this.isDropPhase(state, config.get())) {
            return this.applyLegalDrop(move as QuebecCastlesDrop, state, config);
        } else {
            return this.applyLegalNormalMove(move as MoveCoordToCoord, state);
        }
    }

    private applyLegalDrop(move: QuebecCastlesDrop,
                           state: QuebecCastlesState,
                           optionalConfig: MGPOptional<QuebecCastlesConfig>)
    : QuebecCastlesState
    {
        const config: QuebecCastlesConfig = optionalConfig.get();
        const currentPlayer: Player = state.getCurrentPlayer();
        if (this.mustPlaceCastle(state, config)) {
            const castles: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
                state.castles.get(Player.ZERO),
                state.castles.get(Player.ONE),
            );
            const castleCoord: Coord = move.coords.getAnyElement().get();
            castles.put(currentPlayer, MGPOptional.of(castleCoord));
            if (config.dropMode === 'AUTO') {
                const adaptedDefaultConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of<QuebecCastlesConfig>({
                    ...this.getDefaultRulesConfig().get(),
                    width: config.width,
                    height: config.height,
                    isRhombic: config.isRhombic,
                });
                const newState: QuebecCastlesState =
                    this.placeCastlesAndMovePiece(state, castles, adaptedDefaultConfig);
                return new QuebecCastlesState(newState.board, state.turn + 1, castles);
            } else {
                return new QuebecCastlesState(state.board, state.turn + 1, castles);
            }
        } else {
            let resultingState: QuebecCastlesState = state;
            for (const drop of move.coords) {
                resultingState = resultingState.setPieceAt(drop, currentPlayer);
            }
            return resultingState.incrementTurn();
        }
    }

    private placeCastlesAndMovePiece(state: QuebecCastlesState,
                                     castles: PlayerMap<MGPOptional<Coord>>,
                                     adaptedDefaultConfig: MGPOptional<QuebecCastlesConfig>)
    : QuebecCastlesState
    {
        const initialState: QuebecCastlesState = this.getInitialState(adaptedDefaultConfig);
        let newState: QuebecCastlesState = this.doCastlePlacement(initialState, castles, Player.ZERO);
        if (state.getCurrentPlayer() === Player.ZERO) {
            initialState.forEachCoord((coord: Coord, content: PlayerOrNone) => {
                if (content === Player.ONE) {
                    newState = newState.setPieceAt(coord, PlayerOrNone.NONE);
                }
            });
        } else {
            newState = this.doCastlePlacement(newState, castles, Player.ONE);
        }
        return newState;
    }

    private doCastlePlacement(initialState: QuebecCastlesState, castles: PlayerMap<MGPOptional<Coord>>, player: Player)
    : QuebecCastlesState
    {
        const actualCastle: Coord = castles.get(player).get();
        const defaultCastle: Coord = initialState.castles.get(player).get();
        if (initialState.getPieceAt(actualCastle).isPlayer()) {
            // The castle has been placed where a piece is on initial state
            // So we remove the "initial piece" where the actual castle is put
            initialState = initialState.setPieceAt(actualCastle, PlayerOrNone.NONE);
            // And move it to the place we know is by defaut empty: the default castle's spalce
            initialState = initialState.setPieceAt(defaultCastle, player);
        }
        return initialState;
    }

    private applyLegalNormalMove(move: MoveCoordToCoord, state: QuebecCastlesState): QuebecCastlesState {
        const currentPlayer: Player = state.getCurrentPlayer();
        return state
            .setPieceAt(move.getStart(), PlayerOrNone.NONE)
            .setPieceAt(move.getEnd(), currentPlayer)
            .incrementTurn();
    }

    public override getGameStatus(node: QuebecCastlesNode, config: MGPOptional<QuebecCastlesConfig>): GameStatus {
        const state: QuebecCastlesState = node.gameState;
        const defenderCastle: MGPOptional<Coord> = state.castles.get(Player.ONE);
        if (defenderCastle.isPresent() && state.getPieceAt(defenderCastle.get()).equals(PlayerOrNone.ZERO)) {
            return GameStatus.ZERO_WON; // Player.ZERO (Invader) stepped on Player.ONE (Defender)'s castle, victory
        }
        const invader: MGPOptional<Coord> = state.castles.get(Player.ZERO);
        if (invader.isPresent() && state.getPieceAt(invader.get()).equals(PlayerOrNone.ONE)) {
            return GameStatus.ONE_WON; // Player.ONE (Defender) stepped on Player.ZERO (Invader)'s castle, victory
        }
        const playerZeroPieces: number = state.countPieceOnBoard(Player.ZERO);
        if (this.isDropPhase(state, config.get()) === false) {
            if (playerZeroPieces === 0) {
                return GameStatus.ONE_WON;
            }
            const playerOne: number = state.countPieceOnBoard(Player.ONE);
            if (playerOne === 0) {
                return GameStatus.ZERO_WON;
            }
        }
        return GameStatus.ONGOING;
    }

    private getPlayerStepSize(player: Player): number {
        if (player === Player.ZERO) {
            return 1;
        } else {
            return 2;
        }
    }

    public getPossibleMovesFor(coord: Coord, state: QuebecCastlesState)
    : QuebecCastlesMove[]
    {
        const owner: Player = state.getPieceAt(coord) as Player;
        const stepSize: number = this.getPlayerStepSize(owner);
        const moves: QuebecCastlesMove[] = [];
        for (const direction of Ordinal.ORDINALS) {
            const step: Coord = coord.getNext(direction);
            if (state.isOnBoard(step)) {
                if (stepSize === 1) {
                    if (this.getLandingValidity(state, step).isSuccess()) {
                        moves.push(QuebecCastlesTranslation.of(coord, step));
                    }
                } else {
                    if (state.getPieceAt(step) === PlayerOrNone.NONE) {
                        const landing: Coord = coord.getNext(direction, 2);
                        if (this.getLandingValidity(state, landing).isSuccess()) {
                            moves.push(QuebecCastlesTranslation.of(coord, landing));
                        }
                    }
                }
            }
        }
        return moves;
    }

}
