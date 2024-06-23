import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { GoState } from './GoState';
import { GoPhase } from './go/GoPhase';
import { GoPiece } from './GoPiece';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { GoMove } from './GoMove';
import { Player } from 'src/app/jscaip/Player';
import { GoGroupDatas } from './GoGroupsDatas';
import { MGPFallible, MGPOptional, Utils } from '@everyboard/lib';
import { Table } from 'src/app/jscaip/TableUtils';
import { ConfigurableRules } from 'src/app/jscaip/Rules';
import { Coord } from 'src/app/jscaip/Coord';
import { OrthogonalGoGroupDatasFactory } from './GoGroupDatasFactory';
import { GoFailure } from './GoFailure';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Debug } from 'src/app/utils/Debug';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

export type GoLegalityInformation = Coord[];

export class GoNode extends GameNode<GoMove, GoState> {}

@Debug.log
export abstract class AbstractGoRules<C extends RulesConfig>
    extends ConfigurableRules<GoMove, GoState, C, GoLegalityInformation>
{
    public static isLegal(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {
        if (AbstractGoRules.isPass(move)) {
            const playing: boolean = state.phase === GoPhase.PLAYING;
            const passed: boolean = state.phase === GoPhase.PASSED;
            Debug.display('GoRules', 'isLegal',
                          'at ' + state.phase + ((playing || passed) ? ' forbid' : ' allowed') +
                          ' passing on ' + state.getCopiedBoard());
            if (playing || passed) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE());
            }
        } else if (AbstractGoRules.isAccept(move)) {
            const counting: boolean = state.phase === GoPhase.COUNTING;
            const accept: boolean = state.phase === GoPhase.ACCEPT;
            if (counting || accept) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE());
            }
        }
        if (AbstractGoRules.isOccupied(move.coord, state.getCopiedBoard())) {
            Debug.display('GoRules', 'isLegal', 'move is marking');
            const legal: boolean = AbstractGoRules.isLegalDeadMarking(move, state);
            if (legal) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.OCCUPIED_INTERSECTION());
            }
        } else {
            Debug.display('GoRules', 'isLegal', 'move is normal stuff: ' + move.toString());
            return AbstractGoRules.isLegalNormalMove(move, state);
        }
    }

    public static getNewKo(move: GoMove, newBoard: GoPiece[][], captures: Coord[]): MGPOptional<Coord> {
        if (captures.length === 1) {
            const captured: Coord = captures[0];
            const capturerCoord: Coord = move.coord;
            const capturer: GoPiece = newBoard[capturerCoord.y][capturerCoord.x];
            const goGroupDatasFactory: OrthogonalGoGroupDatasFactory = new OrthogonalGoGroupDatasFactory();
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
        const emptyZones: GoGroupDatas[] = AbstractGoRules.getTerritoryLikeGroup(state);
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
        return AbstractGoRules.getGroupsDatasWhere(deadlessState.getCopiedBoard(), (pawn: GoPiece) => pawn.isEmpty());
    }

    public static getGroupsDatasWhere(board: GoPiece[][], condition: (pawn: GoPiece) => boolean): GoGroupDatas[] {
        const groups: GoGroupDatas[] = [];
        let coord: Coord;
        let group: GoGroupDatas;
        let currentSpace: GoPiece;
        const goGroupDatasFactory: OrthogonalGoGroupDatasFactory = new OrthogonalGoGroupDatasFactory();
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

        const goGroupDatasFactory: OrthogonalGoGroupDatasFactory = new OrthogonalGoGroupDatasFactory();
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
        if (state.phase === GoPhase.FINISHED) {
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
        return AbstractGoRules.isOccupied(move.coord, state.getCopiedBoard()) &&
               (state.phase === GoPhase.COUNTING || state.phase === GoPhase.ACCEPT);
    }

    private static isLegalNormalMove(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {

        const boardCopy: GoPiece[][] = state.getCopiedBoard();
        if (AbstractGoRules.isKo(move, state)) {
            return MGPFallible.failure(GoFailure.ILLEGAL_KO());
        }
        if ([GoPhase.COUNTING, GoPhase.ACCEPT].includes(state.phase)) {
            state = AbstractGoRules.resurrectStones(state);
        }
        const captureState: CaptureState = AbstractGoRules.getCaptureState(move, state);
        if (CaptureState.isCapturing(captureState)) {
            return MGPFallible.success(captureState.capturedCoords);
        } else {
            boardCopy[move.coord.y][move.coord.x] = state.turn%2 === 0 ? GoPiece.DARK : GoPiece.LIGHT;
            const goGroupDatasFactory: OrthogonalGoGroupDatasFactory = new OrthogonalGoGroupDatasFactory();
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
            capturedInDirection = AbstractGoRules.getCapturedInDirection(move.coord, direction, state);
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
                const goGroupDatasFactory: OrthogonalGoGroupDatasFactory = new OrthogonalGoGroupDatasFactory();
                const neightbooringGroup: GoGroupDatas =
                    goGroupDatasFactory.getGroupDatas(neightbooringCoord, copiedBoard) as GoGroupDatas;
                const koCoord: MGPOptional<Coord> = state.koCoord;
                if (AbstractGoRules.isCapturableGroup(neightbooringGroup, koCoord)) {
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
        const emptyGroups: GoGroupDatas[] = AbstractGoRules.getEmptyZones(state);
        return emptyGroups.filter((currentGroup: GoGroupDatas) => currentGroup.isMonoWrapped());
    }

    private static applyPass(state: GoState): GoState {
        const oldBoard: GoPiece[][] = state.getCopiedBoard();
        const oldCaptured: PlayerNumberMap = state.getCapturedCopy();
        const oldTurn: number = state.turn;
        let newPhase: GoPhase;
        let resultingState: GoState;
        if (state.phase === GoPhase.PASSED) {
            newPhase = GoPhase.COUNTING;
            resultingState = new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
            resultingState = AbstractGoRules.markTerritoryAndCount(resultingState);
        } else {
            Utils.assert(state.phase === GoPhase.PLAYING, 'Cannot pass in counting phase!');
            newPhase = GoPhase.PASSED;
            resultingState = new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
        }
        return resultingState;
    }

    private static applyLegalAccept(state: GoState): GoState {
        const countingBoard: GoPiece[][] = state.getCopiedBoard();
        let phase: GoPhase;
        if (state.phase === GoPhase.COUNTING) {
            phase = GoPhase.ACCEPT;
        } else {
            phase = GoPhase.FINISHED;
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
        if ([GoPhase.COUNTING, GoPhase.ACCEPT].includes(currentState.phase)) {
            state = AbstractGoRules.resurrectStones(currentState);
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
        const newKoCoord: MGPOptional<Coord> = AbstractGoRules.getNewKo(legalMove, newBoard, capturedCoords);
        const newCaptured: PlayerNumberMap = state.getCapturedCopy();
        newCaptured.add(currentPlayer, capturedCoords.length);
        return new GoState(newBoard, newCaptured, newTurn, newKoCoord, GoPhase.PLAYING);
    }

    public static resurrectStones(state: GoState): GoState {
        for (let y: number = 0; y < state.getHeight(); y++) {
            for (let x: number = 0; x < state.getWidth(); x++) {
                if (state.getPieceAtXY(x, y).isDead()) {
                    state = AbstractGoRules.switchAliveness(new Coord(x, y), state);
                }
            }
        }
        return AbstractGoRules.removeAndSubstractTerritory(state);
    }

    private static applyDeadMarkingMove(legalMove: GoMove,
                                        state: GoState)
    : GoState
    {
        const territorylessState: GoState = AbstractGoRules.removeAndSubstractTerritory(state);
        const switchedState: GoState = AbstractGoRules.switchAliveness(legalMove.coord, territorylessState);
        const resultingState: GoState =
            new GoState(switchedState.getCopiedBoard(),
                        switchedState.getCapturedCopy(),
                        switchedState.turn + 1,
                        MGPOptional.empty(),
                        GoPhase.COUNTING);
        return AbstractGoRules.markTerritoryAndCount(resultingState);
    }

    public override isLegal(move: GoMove, state: GoState): MGPFallible<GoLegalityInformation> {
        return AbstractGoRules.isLegal(move, state);
    }

    public override applyLegalMove(legalMove: GoMove,
                                   state: GoState,
                                   _config: MGPOptional<C>,
                                   infos: GoLegalityInformation)
    : GoState
    {
        if (AbstractGoRules.isPass(legalMove)) {
            Debug.display('GoRules', 'applyLegalMove', 'isPass');
            return AbstractGoRules.applyPass(state);
        } else if (AbstractGoRules.isAccept(legalMove)) {
            Debug.display('GoRules', 'applyLegalMove', 'isAccept');
            return AbstractGoRules.applyLegalAccept(state);
        } else if (AbstractGoRules.isLegalDeadMarking(legalMove, state)) {
            Debug.display('GoRules', 'applyLegalMove', 'isDeadMarking');
            return AbstractGoRules.applyDeadMarkingMove(legalMove, state);
        } else {
            Debug.display('GoRules', 'applyLegalMove', 'else it is normal move');
            return AbstractGoRules.applyNormalLegalMove(legalMove, state, infos);
        }
    }

    public getGameStatus(node: GoNode): GameStatus {
        return AbstractGoRules.getGameStatus(node);
    }

}

class CaptureState {

    public capturedCoords: Coord[] = [];

    public static isCapturing(captureState: CaptureState): boolean {
        return captureState.capturedCoords.length > 0;
    }

}
