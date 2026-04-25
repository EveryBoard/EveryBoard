import { MGPFallible, MGPOptional, Utils } from '@everyboard/lib';

import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord } from '../../jscaip/Coord';
import { GameStatus } from '../../jscaip/GameStatus';
import { Player } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesConfig } from '../../jscaip/RulesConfigUtil';
import { Table } from '../../jscaip/TableUtils';
import { Vector } from '../../jscaip/Vector';
import { Debug } from '../../utils/Debug';

import { GoFailure } from './GoFailure';
import { GoGroupDataFactory } from './GoGroupDataFactory';
import { GoGroupData } from './GoGroupsData';
import { GoMove } from './GoMove';
import { GoPhase } from './GoPhase';
import { GoPiece } from './GoPiece';
import { GoState } from './GoState';

export type GoLegalityInformation = Coord[];

export class GoNode extends GameNode<GoMove, GoState> {}

export type AbstractGoConfig = RulesConfig & {

    readonly stepSize: number;

};

@Debug.log
export abstract class AbstractGoRules<C extends AbstractGoConfig>
    extends ConfigurableRules<GoMove, GoState, C, GoLegalityInformation>
{

    protected constructor(public readonly playOnIntersection: boolean) {
        super();
    }

    public abstract getGoGroupDataFactory(stepSize: number): GoGroupDataFactory;

    private getNewKo(
        move: GoMove,
        newBoard: GoPiece[][],
        captures: Coord[],
        config: MGPOptional<C>,
    ): MGPOptional<Coord> {
        if (captures.length === 1) {
            const captured: Coord = captures[0];
            const capturerCoord: Coord = move.coord;
            const capturer: GoPiece = newBoard[capturerCoord.y][capturerCoord.x];
            const stepSize: number = config.get().stepSize; // TODO: test and think ko cases
            const goGroupDataFactory: GoGroupDataFactory = this.getGoGroupDataFactory(stepSize);
            const capturersInfo: GoGroupData = goGroupDataFactory.getGroupData(capturerCoord, newBoard);
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

    public markTerritoryAndCount(state: GoState, config: MGPOptional<C>): GoState {
        const resultingBoard: GoPiece[][] = state.getCopiedBoard();
        const emptyZones: GoGroupData[] = this.getTerritoryLikeGroup(state, config);
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

    private removeAndSubtractTerritory(state: GoState): GoState {
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

    private getEmptyZones(deadlessState: GoState, config: MGPOptional<C>): GoGroupData[] {
        // TODO: check que ce n'est bien utilisé que dans le zoom = 1 pour évaluer le score
        const stepSize: number = 1;
        return this.getGoGroupDataFactory(stepSize)
            .getGroupsDataWhere(
                deadlessState.getCopiedBoard(),
                (piece: GoPiece) => piece.isEmpty(),
            );
    }

    public switchAliveness(groupCoord: Coord, switchedState: GoState, stepSize: number): GoState {
        const switchedBoard: GoPiece[][] = switchedState.getCopiedBoard();
        const switchedPiece: GoPiece = switchedBoard[groupCoord.y][groupCoord.x];
        Utils.assert(switchedPiece.isOccupied(), `Can't switch emptyness aliveness`);

        const goGroupDataFactory: GoGroupDataFactory = this.getGoGroupDataFactory(stepSize);
        const group: GoGroupData = goGroupDataFactory.getGroupData(groupCoord, switchedBoard);
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

    private isPass(move: GoMove): boolean {
        return move.equals(GoMove.PASS);
    }

    private isAccept(move: GoMove): boolean {
        return move.equals(GoMove.ACCEPT);
    }

    private isLegalDeadMarking(move: GoMove, state: GoState): boolean {
        return this.isOccupied(move.coord, state.getCopiedBoard()) &&
               (state.phase.isCounting() || state.phase.isAccept());
    }

    private isLegalTranslation(move: GoMove, state: GoState, config: MGPOptional<C>)
    : MGPFallible<GoLegalityInformation>
    {
        // TODO: what the fuck do you call a translation ??
        const boardCopy: GoPiece[][] = state.getCopiedBoard();
        if (this.isKo(move, state)) {
            return MGPFallible.failure(GoFailure.ILLEGAL_KO());
        }
        if (state.phase.isCounting() || state.phase.isAccept()) {
            state = this.resurrectStones(state, config);
        }
        const captureState: CaptureState = this.getCaptureState(move, state, config);
        if (captureState.isCapturing()) {
            return MGPFallible.success(captureState.capturedCoords);
        } else {
            const maxStepSize: number = config.get().stepSize; // TODO test if it was 1
            const originalSquare: GoPiece = boardCopy[move.coord.y][move.coord.x];
            for (let stepSize: number = 1; stepSize <= maxStepSize; stepSize++) {
                boardCopy[move.coord.y][move.coord.x] = state.turn % 2 === 0 ? GoPiece.DARK : GoPiece.LIGHT;
                const goGroupDataFactory: GoGroupDataFactory = this.getGoGroupDataFactory(stepSize);
                const goGroupsData: GoGroupData = goGroupDataFactory.getGroupData(move.coord, boardCopy);
                const isSuicide: boolean = goGroupsData.emptyCoords.length === 0;
                boardCopy[move.coord.y][move.coord.x] = originalSquare;

                if (isSuicide) { // TODO explain that if it's suicide in one zoom, it count as suicide
                    return MGPFallible.failure(GoFailure.CANNOT_COMMIT_SUICIDE());
                }
            }
            return MGPFallible.success([]);
        }
    }

    private isOccupied(coord: Coord, board: Table<GoPiece>): boolean {
        return board[coord.y][coord.x].isOccupied();
    }

    private isKo(move: GoMove, state: GoState): boolean {
        // TODO: adapter la logique du Ko au fait que dans un multi-zoom, jouer sur le ko du zoom = 1 pourrait changer le plateau via les autres zooms
        if (state.koCoord.isPresent()) {
            return move.coord.equals(state.koCoord.get());
        } else {
            return false;
        }
    }

    private getCaptureState(move: GoMove, state: GoState, config: MGPOptional<C>): CaptureState {
        const captureState: CaptureState = new CaptureState();
        let capturedInDirection: Coord[];
        const maxStepSize: number = config.get().stepSize; // TODO: test if it was 1
        for (let stepSize: number = 1; stepSize <= maxStepSize; stepSize++) {
            const goGroupDataFactory: GoGroupDataFactory = this.getGoGroupDataFactory(stepSize);
            for (const direction of this.getGoGroupDataFactory(stepSize).getDirections(move.coord)) {
                capturedInDirection = this.getCapturedInDirection(move.coord, direction, state, goGroupDataFactory);
                console.log('at stepSize', stepSize, 'direction', direction.toString(), 'we got', capturedInDirection)
                if (capturedInDirection.length > 0 &&
                    captureState.capturedCoords.every((coord: Coord) => capturedInDirection[0].equals(coord) === false))
                {
                    captureState.capturedCoords = captureState.capturedCoords.concat(capturedInDirection);
                }
            }
        }
        return captureState;
    }

    private getCapturedInDirection(
        coord: Coord,
        vector: Vector,
        state: GoState,
        goGroupDataFactory: GoGroupDataFactory,
    ): Coord[] {
        const copiedBoard: GoPiece[][] = state.getCopiedBoard();
        const neightbooringCoord: Coord = coord.getNext(vector);
        // const stepSize: number = config.get().stepSize; // TODO: test if it was 1
        if (this.isReachable(neightbooringCoord, state)) {
            const opponent: GoPiece = state.turn%2 === 0 ? GoPiece.LIGHT : GoPiece.DARK;
            if (copiedBoard[neightbooringCoord.y][neightbooringCoord.x] === opponent) {
                Debug.display('GoRules', 'getCapturedInDirection', 'a group could be captured');
                const neightbooringGroup: GoGroupData =
                    goGroupDataFactory.getGroupData(neightbooringCoord, copiedBoard);
                const koCoord: MGPOptional<Coord> = state.koCoord;
                if (this.isCapturableGroup(neightbooringGroup, koCoord)) {
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

    private isReachable(coord: Coord, state: GoState): boolean {
        return state.hasInequalPieceAt(coord, GoPiece.UNREACHABLE);
    }

    private isCapturableGroup(groupData: GoGroupData, koCoord: MGPOptional<Coord>): boolean {
        if (groupData.color.isOccupied() && groupData.emptyCoords.length === 1) {
            return koCoord.equalsValue(groupData.emptyCoords[0]) === false; // Ko Rules Block Capture
        } else {
            return false;
        }
    }

    public getTerritoryLikeGroup(state: GoState, config: MGPOptional<C>): GoGroupData[] {
        const emptyGroups: GoGroupData[] = this.getEmptyZones(state, config);
        return emptyGroups.filter((currentGroup: GoGroupData) => currentGroup.isMonoWrapped());
    }

    private applyPass(state: GoState, config: MGPOptional<C>): GoState {
        const oldBoard: GoPiece[][] = state.getCopiedBoard();
        const oldCaptured: PlayerNumberMap = state.getCapturedCopy();
        const oldTurn: number = state.turn;
        if (state.phase.isPassed()) {
            const newPhase: GoPhase = GoPhase.COUNTING;
            const resultingState: GoState =
                new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
            return this.markTerritoryAndCount(resultingState, config);
        } else {
            Utils.assert(state.phase.isPlaying(), 'Cannot pass in counting phase!');
            const newPhase: GoPhase = GoPhase.PASSED;
            return new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
        }
    }

    private applyLegalAccept(state: GoState): GoState {
        const countingBoard: GoPiece[][] = state.getCopiedBoard();
        let phase: GoPhase;
        if (state.phase.isCounting()) {
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

    private applyNormalLegalMove(
        legalMove: GoMove,
        currentState: GoState,
        capturedCoords: GoLegalityInformation,
        config: MGPOptional<C>,
    ): GoState
    {
        let state: GoState;
        if (currentState.phase.isCounting() || currentState.phase.isAccept()) {
            state = this.resurrectStones(currentState, config);
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
        const newKoCoord: MGPOptional<Coord> = this.getNewKo(legalMove, newBoard, capturedCoords, config);
        const newCaptured: PlayerNumberMap = state.getCapturedCopy();
        newCaptured.add(currentPlayer, capturedCoords.length);
        return new GoState(newBoard, newCaptured, newTurn, newKoCoord, GoPhase.PLAYING);
    }

    private resurrectStones(state: GoState, config: MGPOptional<C>): GoState {
        for (let y: number = 0; y < state.getHeight(); y++) {
            for (let x: number = 0; x < state.getWidth(); x++) {
                if (state.getPieceAtXY(x, y).isDead()) {
                    state = this.switchAliveness(new Coord(x, y), state, 1);
                }
            }
        }
        return this.removeAndSubtractTerritory(state);
    }

    private applyDeadMarkingMove(legalMove: GoMove, state: GoState, config: MGPOptional<C>): GoState {
        const territorylessState: GoState = this.removeAndSubtractTerritory(state);
        const switchedState: GoState = this.switchAliveness(legalMove.coord, territorylessState, 1);
        const resultingState: GoState =
            new GoState(switchedState.getCopiedBoard(),
                        switchedState.getCapturedCopy(),
                        switchedState.turn + 1,
                        MGPOptional.empty(),
                        GoPhase.COUNTING,
            );
        return this.markTerritoryAndCount(resultingState, config);
    }

    public override isLegal(move: GoMove, state: GoState, config: MGPOptional<C>): MGPFallible<GoLegalityInformation> {
        if (this.isPass(move)) {
            const playing: boolean = state.phase.isPlaying();
            const passed: boolean = state.phase.isPassed();
            Debug.display('GoRules', 'isLegal',
                          'at ' + state.phase + ((playing || passed) ? ' forbid' : ' allowed') +
                          ' passing on ' + state.getCopiedBoard());
            if (playing || passed) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE());
            }
        } else if (this.isAccept(move)) {
            const counting: boolean = state.phase.isCounting();
            const accept: boolean = state.phase.isAccept();
            if (counting || accept) {
                return MGPFallible.success([]);
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE());
            }
        } else if (this.isOccupied(move.coord, state.getCopiedBoard())) { // TODO: state.isOccupied(move.coord)
            Debug.display('GoRules', 'isLegal', 'move is marking');
            const legal: boolean = this.isLegalDeadMarking(move, state);
            if (legal) {
                return MGPFallible.success([]);
            } else {
                if (this.playOnIntersection) {
                    return MGPFallible.failure(GoFailure.OCCUPIED_INTERSECTION());
                } else {
                    return MGPFallible.failure(GoFailure.OCCUPIED_SPACE());
                }
            }
        } else {
            Debug.display('GoRules', 'isLegal', 'move is normal stuff: ' + move.toString());
            return this.isLegalTranslation(move, state, config);
        }
    }

    public override applyLegalMove(legalMove: GoMove,
                                   state: GoState,
                                   config: MGPOptional<C>,
                                   infos: GoLegalityInformation)
    : GoState
    {
        if (this.isPass(legalMove)) {
            Debug.display('GoRules', 'applyLegalMove', 'isPass');
            return this.applyPass(state, config);
        } else if (this.isAccept(legalMove)) {
            Debug.display('GoRules', 'applyLegalMove', 'isAccept');
            return this.applyLegalAccept(state);
        } else if (this.isLegalDeadMarking(legalMove, state)) {
            Debug.display('GoRules', 'applyLegalMove', 'isDeadMarking');
            return this.applyDeadMarkingMove(legalMove, state, config);
        } else {
            Debug.display('GoRules', 'applyLegalMove', 'else it is normal move');
            return this.applyNormalLegalMove(legalMove, state, infos, config);
        }
    }

    public override getGameStatus(node: GoNode): GameStatus {
        const state: GoState = node.gameState;
        if (state.phase.isFinished()) {
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

}

class CaptureState {

    public capturedCoords: Coord[] = [];

    public isCapturing(): boolean {
        return this.capturedCoords.length > 0;
    }

}
