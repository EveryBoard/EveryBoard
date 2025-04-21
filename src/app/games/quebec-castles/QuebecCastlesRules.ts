import { MGPFallible, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { QuebecCastlesDrop, QuebecCastlesMove, QuebecCastlesTranslation } from './QuebecCastlesMove';
import { QuebecCastlesState } from './QuebecCastlesState';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { BooleanConfig, EnumConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { DirectionFailure } from 'src/app/jscaip/Direction';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { Localized } from 'src/app/utils/LocaleUtils';

export class QuebecCastlesFailure {

    // TODO: tu veux qu'içi le "2" et "1" soient injectés ?
    public static readonly INVALID_INVADER_DISTANCE: (distance: number) => string = (distance: number) => $localize`Move distance must be 2 for invader, not ${ distance }`;

    public static readonly INVALID_DEFENDER_DISTANCE: (distance: number) => string = (distance: number) => $localize`Move distance must be 1 for defender, not ${ distance }`;

    public static readonly MUST_DROP_IN_YOUR_TERRITORY: Localized = () => $localize`Must drop in your own territory`;

    public static readonly CANNOT_DROP_IN_MOVE_PHASE: Localized = () => $localize`Cannot drop in move phase`;

    public static readonly CANNOT_MOVE_IN_DROP_PHASE: Localized = () => $localize`Cannot move in drop phase`;

    public static readonly MUST_DROP_ALL_YOUR_PIECES: Localized = () => $localize`Must drop all your pieces`;

    public static readonly MUST_DROP_ALL_YOUR_REMAINING_PIECES: Localized = () => $localize`Must drop all your remaining pieces, not more not less`;

    public static readonly CANNOT_DROP_THAT_MUCH: Localized = () => $localize`Cannot drop that many pieces`;

    public static readonly MUST_DROP_ONE_BY_ONE: Localized = () => $localize`Must drop pieces one by one`;

    public static readonly CANNOT_LAND_IN_YOUR_THRONE: Localized = () => $localize`You cannot land on your throne`;

    public static readonly PLACE_ONLY_ONE_THRONE: Localized = () => $localize`You must only place your throne`;

    public static readonly CANNOT_PUT_THAT_MANY_PIECE_IN_THERE: (max: number, line: number) => string = (max: number, line: number) => $localize`If you have ${ line } line(s), you can only have ${ max } pieces`;

    public static readonly TOO_MANY_LINES_FOR_TERRITORY: Localized = () => $localize`Too many lines for territory, your opponent lines would merge with yours!`;
}

export enum DropModeEnum {
    AUTO = 'AUTO',
    PIECE_BY_PIECE = 'PIECE_BY_PIECE',
    BY_BATCH = 'BY_BATCH',
}
export class DropMode {
    public static readonly AUTO: Localized = () => $localize`Automatic`;
    public static readonly PIECE_BY_PIECE: Localized = () => $localize`Piece by piece`;
    public static readonly BY_BATCH: Localized = () => $localize`By batch`;
}
export const DropModes: { [key: string]: Localized } = {
    'AUTO': DropMode.AUTO,
    'PIECE_BY_PIECE': DropMode.PIECE_BY_PIECE,
    'BY_BATCH': DropMode.BY_BATCH,
};

// TODO show score
export type QuebecCastlesConfig = {

    width: number;

    height: number;

    linesForTerritory: number;

    invaders: number;

    defenders: number;

    isRhombic: boolean;

    placeThroneYourself: boolean;

    dropMode: DropModeEnum;

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
                    linesForTerritory: new NumberConfig(4, () => $localize`Lines for territory`, (value: number, config: QuebecCastlesConfig) => {
                        let height: number;
                        if (config.isRhombic) {
                            height = config.width + config.height - 2;
                        } else {
                            height = config.height;
                        }
                        if (value < (height / 2)) {
                            return MGPValidation.SUCCESS;
                        } else {
                            return MGPValidation.failure(QuebecCastlesFailure.TOO_MANY_LINES_FOR_TERRITORY());
                        }
                    }),
                    invaders: new NumberConfig<QuebecCastlesConfig>(14, () => $localize`Number of invader`, (value: number, config: QuebecCastlesConfig) => {
                        return QuebecCastlesRules.isThereEnoughPlaceForPiece(Player.ZERO, config, value);
                    }),
                    defenders: new NumberConfig(9, () => $localize`Number of defender`, (value: number, config: QuebecCastlesConfig) => {
                        return QuebecCastlesRules.isThereEnoughPlaceForPiece(Player.ONE, config, value);
                    }),
                    isRhombic: new BooleanConfig(true, () => $localize`Is Rhombic`),
                    placeThroneYourself: new BooleanConfig(false, () => $localize`Place throne yourself`),
                    dropMode: new EnumConfig(DropModeEnum.AUTO.valueOf(), () => $localize`Drop mode`, DropModes),
                },
            },
        );

    public static get(): QuebecCastlesRules {
        if (QuebecCastlesRules.singleton.isAbsent()) {
            QuebecCastlesRules.singleton = MGPOptional.of(new QuebecCastlesRules());
        }
        return QuebecCastlesRules.singleton.get();
    }

    public static isThereEnoughPlaceForPiece(player: Player, config: QuebecCastlesConfig, numberOfPiece: number)
    : MGPValidation
    {
        // Got to substract 1 as the throne is not included
        const spaceForPiece: number = QuebecCastlesRules.get().getValidDropCoords(player, config).length - 1;
        if (spaceForPiece < numberOfPiece) {
            const line: number = config.linesForTerritory;
            return MGPValidation.failure(QuebecCastlesFailure.CANNOT_PUT_THAT_MANY_PIECE_IN_THERE(spaceForPiece, line));
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<QuebecCastlesConfig>> {
        return MGPOptional.of(QuebecCastlesRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getInitialState(optionalConfig: MGPOptional<QuebecCastlesConfig>): QuebecCastlesState {
        const config: QuebecCastlesConfig = optionalConfig.get();
        const thrones: PlayerMap<MGPOptional<Coord>> = this.getThrones(config);
        const board: Table<PlayerOrNone> = TableUtils.create(config.width, config.height, PlayerOrNone.NONE);
        let state: QuebecCastlesState = new QuebecCastlesState(board, 0, thrones);
        if (config.dropMode === DropModeEnum.AUTO && config.placeThroneYourself === false) {
            state = this.fillBoard(state, config);
        }
        return state;
    }

    private getThrones(config: QuebecCastlesConfig): PlayerMap<MGPOptional<Coord>> {
        if (config.placeThroneYourself) {
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
        let lineDirection: number;
        let lineToFillIndex: number;
        if (player === Player.ZERO) {
            lineDirection = -1;
            lineToFillIndex = lineToFillRange.max;
        } else {
            lineDirection = 1;
            lineToFillIndex = lineToFillRange.min;
        }
        return { lineDirection, lineToFillIndex };
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
        let pieceToDrop: number = player === Player.ZERO ? config.defenders : config.invaders;
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
            if (state.isThroneAt(coord) === false) {
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
            return this.isLegalNormalMove(move, state);
        }
    }

    public getExpectedDropsThisTurn(state: QuebecCastlesState, config: QuebecCastlesConfig): number {
        switch (config.dropMode) {
            case DropModeEnum.PIECE_BY_PIECE:
                return this.getExpectedDropsThisTurnForPieceByPiece(state, config);
            case DropModeEnum.BY_BATCH:
                return this.getExpectedDropsThisTurnForBatch(state, config);
            default:
                if (this.mustPlaceThrone(state, config)) {
                    return 1;
                } else {
                    return 0;
                }
        }
    }

    private getExpectedDropsThisTurnForPieceByPiece(state: QuebecCastlesState, config: QuebecCastlesConfig): number {
        if (this.mustPlaceThrone(state, config)) {
            return 1;
        }
        const totalPieceToDrop: number = config.defenders + config.invaders;
        const totalPieceDropped: number = state.countPieceOnBoard(Player.ZERO) + state.countPieceOnBoard(Player.ONE);
        if (totalPieceDropped === totalPieceToDrop) {
            return 0;
        }
        Utils.assert(state.turn < totalPieceToDrop, 'getExpectedDropThisTurnForPieceByPiece should not be called after drop phase');
        // This turn is when the other player has dropped all its pieces
        // First player: 3; second player: 5 => turn 5 ==> drop 3
        // First player: 5; second player: 3 => turn 6 ==> drop 2
        let turnOfLastDrop: number = Math.min(config.defenders, config.invaders) * 2;
        if (config.placeThroneYourself) {
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
        const toDrop: number = state.getCurrentPlayer() === Player.ZERO ? config.defenders : config.invaders;
        if (state.turn < 2) {
            if (config.placeThroneYourself) {
                return 1;
            } else {
                return toDrop;
            }
        } else if (state.turn < 4) {
            if (config.placeThroneYourself) {
                return toDrop;
            }
        }
        return 0;
    }

    public isLegalDrop(move: QuebecCastlesMove, state: QuebecCastlesState, config: QuebecCastlesConfig)
    : MGPValidation
    {
        if (QuebecCastlesMove.isTranslation(move)) {
            return MGPValidation.failure(QuebecCastlesFailure.CANNOT_MOVE_IN_DROP_PHASE());
        }
        if (this.mustPlaceThrone(state, config)) {
            return this.isLegalThronePlacement(move, state, config);
        } else {
            return this.isLegalPieceDrop(move, state, config);
        }
    }

    public mustPlaceThrone(state: QuebecCastlesState, config: QuebecCastlesConfig): boolean {
        return state.turn < 2 && config.placeThroneYourself;
    }

    private isLegalThronePlacement(move: QuebecCastlesDrop, state: QuebecCastlesState, config: QuebecCastlesConfig)
    : MGPValidation
    {
        if (move.coords.size() === 1) {
            return this.getDropLegality(move.coords.getAnyElement().get(), state, config, false);
        } else {
            return MGPValidation.failure(QuebecCastlesFailure.PLACE_ONLY_ONE_THRONE());
        }
    }

    private isLegalPieceDrop(move: QuebecCastlesDrop, state: QuebecCastlesState, config: QuebecCastlesConfig)
    : MGPValidation
    {
        if (config.dropMode === DropModeEnum.PIECE_BY_PIECE) {
            if (this.isLastDrop(state, config)) {
                const player: Player = state.getCurrentPlayer();
                const playerCount: number = state.countPieceOnBoard(player);
                const playerTotal: number = player === Player.ZERO ? config.defenders : config.invaders;
                const remainToDrop: number = playerTotal - playerCount;
                if (move.coords.size() !== remainToDrop) {
                    return MGPFallible.failure(QuebecCastlesFailure.MUST_DROP_ALL_YOUR_REMAINING_PIECES());
                }
            } else {
                if (move.coords.size() > 1) {
                    return MGPFallible.failure(QuebecCastlesFailure.MUST_DROP_ONE_BY_ONE());
                }
            }
        } else if (config.dropMode === DropModeEnum.BY_BATCH) {
            const numberToDrop: number =
                state.getCurrentPlayer() === Player.ZERO ? config.defenders : config.invaders;
            if (move.coords.size() > numberToDrop) {
                return MGPFallible.failure(QuebecCastlesFailure.CANNOT_DROP_THAT_MUCH());
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

    private isLastDrop(state: QuebecCastlesState, config: QuebecCastlesConfig): boolean {
        const opponent: Player = state.getCurrentOpponent();
        const opponentCount: number = state.countPieceOnBoard(opponent);
        const opponentTotal: number = opponent === Player.ZERO ? config.defenders : config.invaders;
        return opponentCount === opponentTotal; // If opponent dropped all its pieces (one by one)
        // Then you must now dropped them all at once
    }

    private getDropLegality(coord: Coord, state: QuebecCastlesState, config: QuebecCastlesConfig, isThrone: boolean)
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
        if (state.thrones.get(player).equalsValue(coord) && isThrone === false) {
            return MGPValidation.failure(QuebecCastlesFailure.CANNOT_LAND_IN_YOUR_THRONE());
        }
        if (this.isValidDropCoord(coord, player, config)) {
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
                if (this.isValidDropCoord(coord, player, config)) {
                    drops.push(coord);
                }
            }
        }
        return drops;
    }

    public isValidDrop(state: QuebecCastlesState, coord: Coord, player: Player, config: QuebecCastlesConfig): boolean {
        if (this.isValidDropCoord(coord, player, config) === false) {
            return false;
        }
        return state.getPieceAt(coord).isNone();
    }

    public isValidDropCoord(coord: Coord, player: Player, config: QuebecCastlesConfig): boolean {
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

    public getLegalRangeIndex(player: Player, config: QuebecCastlesConfig): { min: number, max: number } {
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
            min: player === Player.ZERO ? max - config.linesForTerritory : 0,
            max: player === Player.ZERO ? max : config.linesForTerritory,
        };
    }

    public isLegalNormalMove(move: QuebecCastlesMove, state: QuebecCastlesState)
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
        const playerThrone: Coord = state.thrones.get(currentPlayer).get();
        if (landing.equals(playerThrone)) {
            return MGPValidation.failure(QuebecCastlesFailure.CANNOT_LAND_IN_YOUR_THRONE());
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
        if (this.mustPlaceThrone(state, config)) {
            const thrones: PlayerMap<MGPOptional<Coord>> = PlayerMap.ofValues(
                state.thrones.get(Player.ZERO),
                state.thrones.get(Player.ONE),
            );
            const throneCoord: Coord = move.coords.getAnyElement().get();
            thrones.put(currentPlayer, MGPOptional.of(throneCoord));
            if (config.dropMode === DropModeEnum.AUTO) {
                const adaptedDefaultConfig: MGPOptional<QuebecCastlesConfig> = MGPOptional.of({
                    ...this.getDefaultRulesConfig().get(),
                    width: config.width,
                    height: config.height,
                    isRhombic: config.isRhombic,
                    // TODO: defender and invader are affected TOOOOO
                });
                let newState: QuebecCastlesState = this.getInitialState(adaptedDefaultConfig);
                newState = this.placeThronesAndMovePiece(state, thrones, adaptedDefaultConfig);
                return new QuebecCastlesState(newState.board, state.turn + 1, thrones);
            } else {
                return new QuebecCastlesState(state.board, state.turn + 1, thrones);
            }
        } else {
            let resultingState: QuebecCastlesState = state;
            for (const drop of move.coords) {
                resultingState = resultingState.setPieceAt(drop, currentPlayer);
            }
            return resultingState.incrementTurn();
        }
    }

    private placeThronesAndMovePiece(state: QuebecCastlesState,
                                     thrones: PlayerMap<MGPOptional<Coord>>,
                                     adaptedDefaultConfig: MGPOptional<QuebecCastlesConfig>)
    : QuebecCastlesState
    {
        const initialState: QuebecCastlesState = this.getInitialState(adaptedDefaultConfig);
        let newState: QuebecCastlesState = this.doThronePlacement(initialState, thrones, Player.ZERO);
        if (state.getCurrentPlayer() === Player.ZERO) {
            initialState.forEachCoord((coord: Coord, content: PlayerOrNone) => {
                if (content === Player.ONE) {
                    newState = newState.setPieceAt(coord, PlayerOrNone.NONE);
                }
            });
        } else {
            newState = this.doThronePlacement(newState, thrones, Player.ONE);
        }
        return newState;
    }

    private doThronePlacement(initialState: QuebecCastlesState, thrones: PlayerMap<MGPOptional<Coord>>, player: Player)
    : QuebecCastlesState
    {
        const actualThrone: Coord = thrones.get(player).get();
        const defaultThrone: Coord = initialState.thrones.get(player).get();
        if (initialState.getPieceAt(actualThrone).isPlayer()) {
            // The throne has been placed where a piece is on initial state
            // So we remove the "initial piece" where the actual throne is put
            initialState = initialState.setPieceAt(actualThrone, PlayerOrNone.NONE);
            // And move it to the place we know is by defaut empty: the default throne's spalce
            initialState = initialState.setPieceAt(defaultThrone, player);
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
        const defenderThrone: MGPOptional<Coord> = state.thrones.get(Player.ONE);
        if (defenderThrone.isPresent() && state.getPieceAt(defenderThrone.get()).equals(PlayerOrNone.ZERO)) {
            return GameStatus.ZERO_WON; // Player.ZERO (Invader) stepped on Player.ONE (Defender)'s throne, victory
        }
        const invader: MGPOptional<Coord> = state.thrones.get(Player.ZERO);
        if (invader.isPresent() && state.getPieceAt(invader.get()).equals(PlayerOrNone.ONE)) {
            return GameStatus.ONE_WON; // Player.ONE (Defender) stepped on Player.ZERO (Invader)'s throne, victory
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

    public getPlayerStepSize(player: Player): number {
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
                        const landing: Coord = coord.getNext(direction, 2); // TODO not "2"
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
