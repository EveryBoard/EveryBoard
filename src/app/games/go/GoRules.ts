import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { GoState, Phase, GoPiece } from './GoState';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { GoMove } from './GoMove';
import { Player } from 'src/app/jscaip/Player';
import { GoGroupDatas } from './GoGroupsDatas';
import { MGPFallible, MGPOptional, Utils } from '@everyboard/lib';
import { Table } from 'src/app/jscaip/TableUtils';
import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { Coord } from 'src/app/jscaip/Coord';
import { GoGroupDatasFactory } from './GoGroupDatasFactory';
import { GoFailure } from './GoFailure';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Debug } from 'src/app/utils/Debug';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { GobanUtils } from 'src/app/jscaip/GobanUtils';

export type GoLegalityInformation = Coord[];

export type GoConfig = GobanConfig & {

    handicap: number;
};

export class GoNode extends GameNode<GoMove, GoState> {}

@Debug.log
export class GoRules extends ConfigurableRules<GoMove, GoState, GoConfig, GoLegalityInformation> {

    private static singleton: MGPOptional<GoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<GoConfig> =
        new RulesConfigDescription<GoConfig>({
            name: (): string => $localize`19 x 19`,
            config: {
                width: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
                height: new NumberConfig(19, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(1, 99)),
                handicap: new NumberConfig(0, () => $localize`Handicap`, MGPValidators.range(0, 9)),
            },
        }, [{
            name: (): string => $localize`13 x 13`,
            config: {
                width: 13,
                height: 13,
                handicap: 0,
            },
        }, {
            name: (): string => $localize`9 x 9`,
            config: {
                width: 9,
                height: 9,
                handicap: 0,
            },
        }]);

    public static get(): GoRules {
        if (GoRules.singleton.isAbsent()) {
            GoRules.singleton = MGPOptional.of(new GoRules());
        }
        return GoRules.singleton.get();
    }

    public override getInitialState(optionalConfig: MGPOptional<GoConfig>): GoState {
        const config: GoConfig = optionalConfig.get();
        const board: GoPiece[][] = GoState.getStartingBoard(config);
        let turn: number = 0;
        const left: number = GobanUtils.getHorizontalLeft(config.width);
        const right: number = GobanUtils.getHorizontalRight(config.width);
        const up: number = GobanUtils.getVerticalUp(config.height);
        const down: number = GobanUtils.getVerticalDown(config.height);
        const horizontalCenter: number = GobanUtils.getHorizontalCenter(config.width);
        const verticalCenter: number = GobanUtils.getVerticalCenter(config.height);
        const orderedHandicaps: Coord[] = [
            new Coord(left, up),
            new Coord(right, down),
            new Coord(right, up),
            new Coord(left, down),
            new Coord(horizontalCenter, verticalCenter),
            new Coord(horizontalCenter, up),
            new Coord(horizontalCenter, down),
            new Coord(left, verticalCenter),
            new Coord(right, verticalCenter),
        ];
        if (1 <= config.handicap) {
            turn = 1;
        }
        for (let i: number = 0; i < config.handicap; i++) {
            const handicapToPut: Coord = orderedHandicaps[i];
            board[handicapToPut.y][handicapToPut.x] = GoPiece.DARK;
        }
        return new GoState(board, PlayerNumberMap.of(0, 0), turn, MGPOptional.empty(), Phase.PLAYING);
    }

    public static isLegal(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {
        if (GoRules.isPass(move)) {
            const playing: boolean = state.phase === Phase.PLAYING;
            const passed: boolean = state.phase === Phase.PASSED;
            Debug.display('GoRules', 'isLegal',
                          'at ' + state.phase + ((playing || passed) ? ' forbid' : ' allowed') +
                          ' passing on ' + state.getCopiedBoard());
            if (playing || passed) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE());
            }
        } else if (GoRules.isAccept(move)) {
            const counting: boolean = state.phase === Phase.COUNTING;
            const accept: boolean = state.phase === Phase.ACCEPT;
            if (counting || accept) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE());
            }
        }
        if (GoRules.isOccupied(move.coord, state.getCopiedBoard())) {
            Debug.display('GoRules', 'isLegal', 'move is marking');
            const legal: boolean = GoRules.isLegalDeadMarking(move, state);
            if (legal) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.OCCUPIED_INTERSECTION());
            }
        } else {
            Debug.display('GoRules', 'isLegal', 'move is normal stuff: ' + move.toString());
            return GoRules.isLegalNormalMove(move, state);
        }
    }

    public static getNewKo(move: GoMove, newBoard: GoPiece[][], captures: Coord[]): MGPOptional<Coord> {
        if (captures.length === 1) {
            const captured: Coord = captures[0];
            const capturerCoord: Coord = move.coord;
            const capturer: GoPiece = newBoard[capturerCoord.y][capturerCoord.x];
            const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
            const capturersInfo: GoGroupDatas =
                goGroupDatasFactory.getGroupDatas(capturerCoord, newBoard) as GoGroupDatas;
            const capturersFreedoms: Coord[] = capturersInfo.emptyCoords;
            const capturersGroup: Coord[] =
                GoPiece.pieceBelongTo(capturer, Player.ZERO) ? capturersInfo.darkCoords : capturersInfo.lightCoords;
            if (capturersFreedoms.length === 1 &&
                capturersFreedoms[0].equals(captured) &&
                capturersGroup.length === 1)
            {
                return MGPOptional.of(captured);
            }
        }
        return MGPOptional.empty();
    }

    public static markTerritoryAndCount(state: GoState): GoState {
        const resultingBoard: GoPiece[][] = state.getCopiedBoard();
        const emptyZones: GoGroupDatas[] = GoRules.getTerritoryLikeGroup(state);
        const captured: PlayerNumberMap = state.getCapturedCopy();

        for (const emptyZone of emptyZones) {
            const pointMaker: GoPiece = emptyZone.getWrapper();
            if (pointMaker === GoPiece.LIGHT) {
                // light territory
                captured.add(Player.ONE, emptyZone.emptyCoords.length);
                for (const territory of emptyZone.getCoords()) {
                    resultingBoard[territory.y][territory.x] = GoPiece.LIGHT_TERRITORY;
                }
            } else {
                Utils.assert(pointMaker === GoPiece.DARK, 'territory should be wrapped by dark or light, not by ' + pointMaker.toString());
                // dark territory
                captured.add(Player.ZERO, emptyZone.emptyCoords.length);
                for (const territory of emptyZone.getCoords()) {
                    resultingBoard[territory.y][territory.x] = GoPiece.DARK_TERRITORY;
                }
            }
        }
        return new GoState(resultingBoard, captured, state.turn, state.koCoord, state.phase);
    }

    public static removeAndSubstractTerritory(state: GoState): GoState {
        const resultingBoard: GoPiece[][] = state.getCopiedBoard();
        const captured: PlayerNumberMap = state.getCapturedCopy();
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            if (coordAndContent.content.isTerritory()) {
                resultingBoard[coord.y][coord.x] = GoPiece.EMPTY;
                const owner: Player = coordAndContent.content.getOwner() as Player;
                captured.add(owner, - 1);
            }
        }
        return new GoState(resultingBoard, captured, state.turn, state.koCoord, state.phase);
    }

    public static getEmptyZones(deadlessState: GoState): GoGroupDatas[] {
        return GoRules.getGroupsDatasWhere(deadlessState.getCopiedBoard(), (pawn: GoPiece) => pawn.isEmpty());
    }

    public static getGroupsDatasWhere(board: GoPiece[][], condition: (pawn: GoPiece) => boolean): GoGroupDatas[] {
        const groups: GoGroupDatas[] = [];
        let coord: Coord;
        let group: GoGroupDatas;
        let currentSpace: GoPiece;
        const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                coord = new Coord(x, y);
                currentSpace = board[y][x];
                if (condition(currentSpace)) {
                    if (groups.some((currentGroup: GoGroupDatas) => currentGroup.selfContains(coord)) === false) {
                        group = goGroupDatasFactory.getGroupDatas(coord, board) as GoGroupDatas;
                        groups.push(group);
                    }
                }
            }
        }
        return groups;
    }

    public static addDeadToScore(state: GoState): number[] {
        const captured: PlayerNumberMap = state.getCapturedCopy();
        let playerOneScore: number = captured.get(Player.ONE);
        let playerZeroScore: number = captured.get(Player.ZERO);
        let currentSpace: GoPiece;
        for (let y: number = 0; y < state.getHeight(); y++) {
            for (let x: number = 0; x < state.getWidth(); x++) {
                currentSpace = state.getPieceAtXY(x, y);
                if (currentSpace === GoPiece.DEAD_DARK) {
                    playerOneScore++;
                } else if (currentSpace === GoPiece.DEAD_LIGHT) {
                    playerZeroScore++;
                }
            }
        }
        return [playerZeroScore, playerOneScore];
    }

    public static switchAliveness(groupCoord: Coord, switchedState: GoState): GoState {
        const switchedBoard: GoPiece[][] = switchedState.getCopiedBoard();
        const switchedPiece: GoPiece = switchedBoard[groupCoord.y][groupCoord.x];
        Utils.assert(switchedPiece.isOccupied(), `Can't switch emptyness aliveness`);

        const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
        const group: GoGroupDatas = goGroupDatasFactory.getGroupDatas(groupCoord, switchedBoard) as GoGroupDatas;
        const captured: PlayerNumberMap = switchedState.getCapturedCopy();
        switch (group.color) {
            case GoPiece.DEAD_DARK:
                captured.add(Player.ONE, - 2 * group.deadDarkCoords.length);
                for (const deadDarkCoord of group.deadDarkCoords) {
                    switchedBoard[deadDarkCoord.y][deadDarkCoord.x] = GoPiece.DARK;
                }
                break;
            case GoPiece.DEAD_LIGHT:
                captured.add(Player.ZERO, - 2 * group.deadLightCoords.length);
                for (const deadLightCoord of group.deadLightCoords) {
                    switchedBoard[deadLightCoord.y][deadLightCoord.x] = GoPiece.LIGHT;
                }
                break;
            case GoPiece.LIGHT:
                captured.add(Player.ZERO, 2 * group.lightCoords.length);
                for (const lightCoord of group.lightCoords) {
                    switchedBoard[lightCoord.y][lightCoord.x] = GoPiece.DEAD_LIGHT;
                }
                break;
            default:
                Utils.expectToBe(group.color, GoPiece.DARK);
                captured.add(Player.ONE, 2 * group.darkCoords.length);
                for (const darkCoord of group.darkCoords) {
                    switchedBoard[darkCoord.y][darkCoord.x] = GoPiece.DEAD_DARK;
                }
                break;
        }
        return new GoState(switchedBoard,
                           captured,
                           switchedState.turn,
                           switchedState.koCoord,
                           switchedState.phase);
    }

    public static getGameStatus(node: GoNode): GameStatus {
        const state: GoState = node.gameState;
        if (state.phase === Phase.FINISHED) {
            const capturedZero: number = state.captured.get(Player.ZERO);
            const capturedOne: number = state.captured.get(Player.ONE);
            if (capturedOne < capturedZero) {
                return GameStatus.ZERO_WON;
            } else if (capturedZero < capturedOne) {
                return GameStatus.ONE_WON;
            } else {
                return GameStatus.DRAW;
            }
        } else {
            return GameStatus.ONGOING;
        }
    }

    private static isPass(move: GoMove): boolean {
        return move.equals(GoMove.PASS);
    }

    private static isAccept(move: GoMove): boolean {
        return move.equals(GoMove.ACCEPT);
    }

    private static isLegalDeadMarking(move: GoMove, state: GoState): boolean {
        return GoRules.isOccupied(move.coord, state.getCopiedBoard()) &&
               (state.phase === Phase.COUNTING || state.phase === Phase.ACCEPT);
    }

    private static isLegalNormalMove(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {

        const boardCopy: GoPiece[][] = state.getCopiedBoard();
        if (GoRules.isKo(move, state)) {
            return MGPFallible.failure(GoFailure.ILLEGAL_KO());
        }
        if ([Phase.COUNTING, Phase.ACCEPT].includes(state.phase)) {
            state = GoRules.resurrectStones(state);
        }
        const captureState: CaptureState = GoRules.getCaptureState(move, state);
        if (CaptureState.isCapturing(captureState)) {
            return MGPFallible.success(captureState.capturedCoords);
        } else {
            boardCopy[move.coord.y][move.coord.x] = state.turn%2 === 0 ? GoPiece.DARK : GoPiece.LIGHT;
            const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
            const goGroupsDatas: GoGroupDatas =
                goGroupDatasFactory.getGroupDatas(move.coord, boardCopy) as GoGroupDatas;
            const isSuicide: boolean = goGroupsDatas.emptyCoords.length === 0;
            boardCopy[move.coord.y][move.coord.x] = GoPiece.EMPTY;

            if (isSuicide) {
                return MGPFallible.failure(GoFailure.CANNOT_COMMIT_SUICIDE());
            } else {
                return MGPFallible.success([]);
            }
        }
    }

    private static isOccupied(coord: Coord, board: Table<GoPiece>): boolean {
        return board[coord.y][coord.x].isOccupied();
    }

    public static isKo(move: GoMove, state: GoState): boolean {
        if (state.koCoord.isPresent()) {
            return move.coord.equals(state.koCoord.get());
        } else {
            return false;
        }
    }

    public static getCaptureState(move: GoMove, state: GoState): CaptureState {
        const captureState: CaptureState = new CaptureState();
        let capturedInDirection: Coord[];
        for (const direction of Orthogonal.ORTHOGONALS) {
            capturedInDirection = GoRules.getCapturedInDirection(move.coord, direction, state);
            if (capturedInDirection.length > 0 &&
                captureState.capturedCoords.every((coord: Coord) => capturedInDirection[0].equals(coord) === false))
            {
                captureState.capturedCoords = captureState.capturedCoords.concat(capturedInDirection);
            }
        }
        return captureState;
    }

    public static getCapturedInDirection(coord: Coord, direction: Orthogonal, state: GoState): Coord[] {
        const copiedBoard: GoPiece[][] = state.getCopiedBoard();
        const neightbooringCoord: Coord = coord.getNext(direction);
        if (neightbooringCoord.isInRange(state.getWidth(), state.getHeight())) {
            const opponent: GoPiece = state.turn%2 === 0 ? GoPiece.LIGHT : GoPiece.DARK;
            if (copiedBoard[neightbooringCoord.y][neightbooringCoord.x] === opponent) {
                Debug.display('GoRules', 'getCapturedInDirection', 'a group could be captured');
                const goGroupDatasFactory: GoGroupDatasFactory = new GoGroupDatasFactory();
                const neightbooringGroup: GoGroupDatas =
                    goGroupDatasFactory.getGroupDatas(neightbooringCoord, copiedBoard) as GoGroupDatas;
                const koCoord: MGPOptional<Coord> = state.koCoord;
                if (GoRules.isCapturableGroup(neightbooringGroup, koCoord)) {
                    Debug.display('GoRules', 'getCapturedInDirection', {
                        neightbooringGroupCoord: neightbooringGroup.getCoords(),
                        message: 'is capturable',
                    });
                    return neightbooringGroup.getCoords();
                }
            }
        }
        return [];
    }

    public static isCapturableGroup(groupDatas: GoGroupDatas, koCoord: MGPOptional<Coord>): boolean {
        if (groupDatas.color.isOccupied() && groupDatas.emptyCoords.length === 1) {
            return koCoord.equalsValue(groupDatas.emptyCoords[0]) === false; // Ko Rules Block Capture
        } else {
            return false;
        }
    }

    public static getTerritoryLikeGroup(state: GoState): GoGroupDatas[] {
        const emptyGroups: GoGroupDatas[] = GoRules.getEmptyZones(state);
        return emptyGroups.filter((currentGroup: GoGroupDatas) => currentGroup.isMonoWrapped());
    }

    private static applyPass(state: GoState): GoState {
        const oldBoard: GoPiece[][] = state.getCopiedBoard();
        const oldCaptured: PlayerNumberMap = state.getCapturedCopy();
        const oldTurn: number = state.turn;
        let newPhase: Phase;
        let resultingState: GoState;
        if (state.phase === Phase.PASSED) {
            newPhase = Phase.COUNTING;
            resultingState = new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
            resultingState = GoRules.markTerritoryAndCount(resultingState);
        } else {
            Utils.assert(state.phase === Phase.PLAYING, 'Cannot pass in counting phase!');
            newPhase = Phase.PASSED;
            resultingState = new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
        }
        return resultingState;
    }

    private static applyLegalAccept(state: GoState): GoState {
        const countingBoard: GoPiece[][] = state.getCopiedBoard();
        let phase: Phase;
        if (state.phase === Phase.COUNTING) {
            phase = Phase.ACCEPT;
        } else {
            phase = Phase.FINISHED;
        }
        return new GoState(countingBoard,
                           state.getCapturedCopy(),
                           state.turn + 1,
                           MGPOptional.empty(),
                           phase);
    }

    private static applyNormalLegalMove(legalMove: GoMove,
                                        currentState: GoState,
                                        capturedCoords: GoLegalityInformation)
    : GoState
    {
        let state: GoState;
        if ([Phase.COUNTING, Phase.ACCEPT].includes(currentState.phase)) {
            state = GoRules.resurrectStones(currentState);
        } else {
            state = currentState.copy();
        }
        const x: number = legalMove.coord.x;
        const y: number = legalMove.coord.y;

        const newBoard: GoPiece[][] = state.getCopiedBoard();
        const currentTurn: number = state.turn;
        const currentPlayer: Player = state.getCurrentPlayer();
        const currentPlayerPiece: GoPiece = GoPiece.ofPlayer(currentPlayer);
        const newTurn: number = currentTurn + 1;
        newBoard[y][x] = currentPlayerPiece;
        for (const capturedCoord of capturedCoords) {
            newBoard[capturedCoord.y][capturedCoord.x] = GoPiece.EMPTY;
        }
        const newKoCoord: MGPOptional<Coord> = GoRules.getNewKo(legalMove, newBoard, capturedCoords);
        const newCaptured: PlayerNumberMap = state.getCapturedCopy();
        newCaptured.add(currentPlayer, capturedCoords.length);
        return new GoState(newBoard, newCaptured, newTurn, newKoCoord, Phase.PLAYING);
    }

    public static resurrectStones(state: GoState): GoState {
        for (let y: number = 0; y < state.getHeight(); y++) {
            for (let x: number = 0; x < state.getWidth(); x++) {
                if (state.getPieceAtXY(x, y).isDead()) {
                    state = GoRules.switchAliveness(new Coord(x, y), state);
                }
            }
        }
        return GoRules.removeAndSubstractTerritory(state);
    }

    private static applyDeadMarkingMove(legalMove: GoMove,
                                        state: GoState)
    : GoState
    {
        const territorylessState: GoState = GoRules.removeAndSubstractTerritory(state);
        const switchedState: GoState = GoRules.switchAliveness(legalMove.coord, territorylessState);
        const resultingState: GoState =
            new GoState(switchedState.getCopiedBoard(),
                        switchedState.getCapturedCopy(),
                        switchedState.turn + 1,
                        MGPOptional.empty(),
                        Phase.COUNTING);
        return GoRules.markTerritoryAndCount(resultingState);
    }

    public override isLegal(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {
        return GoRules.isLegal(move, state);
    }

    public override applyLegalMove(legalMove: GoMove,
                                   state: GoState,
                                   _config: MGPOptional<GoConfig>,
                                   infos: GoLegalityInformation)
    : GoState
    {
        if (GoRules.isPass(legalMove)) {
            Debug.display('GoRules', 'applyLegalMove', 'isPass');
            return GoRules.applyPass(state);
        } else if (GoRules.isAccept(legalMove)) {
            Debug.display('GoRules', 'applyLegalMove', 'isAccept');
            return GoRules.applyLegalAccept(state);
        } else if (GoRules.isLegalDeadMarking(legalMove, state)) {
            Debug.display('GoRules', 'applyLegalMove', 'isDeadMarking');
            return GoRules.applyDeadMarkingMove(legalMove, state);
        } else {
            Debug.display('GoRules', 'applyLegalMove', 'else it is normal move');
            return GoRules.applyNormalLegalMove(legalMove, state, infos);
        }
    }

    public override getGameStatus(node: GoNode): GameStatus {
        return GoRules.getGameStatus(node);
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<GoConfig>> {
        return MGPOptional.of(GoRules.RULES_CONFIG_DESCRIPTION);
    }

}
class CaptureState {

    public capturedCoords: Coord[] = [];

    public static isCapturing(captureState: CaptureState): boolean {
        return captureState.capturedCoords.length > 0;
    }

}
