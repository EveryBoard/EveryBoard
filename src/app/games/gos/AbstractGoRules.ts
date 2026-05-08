import { MGPFallible, MGPOptional, Set, Utils } from '@everyboard/lib';

import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord } from '../../jscaip/Coord';
import { GameStatus } from '../../jscaip/GameStatus';
import { Player } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { ConfigurableRules } from '../../jscaip/Rules';
import { RulesConfig } from '../../jscaip/RulesConfigUtil';
import { Vector } from '../../jscaip/Vector';
import { Debug } from '../../utils/Debug';

import { GoFailure } from './GoFailure';
import { GoGroupDataFactory } from './GoGroupDataFactory';
import { GoGroupData } from './GoGroupsData';
import { GoMove } from './GoMove';
import { GoPhase } from './GoPhase';
import { GoPiece } from './GoPiece';
import { GoState } from './GoState';

export type GoLegalityInformation = {

    readonly postCaptureState: GoState,

    readonly uniqueCapture: MGPOptional<Coord>;

};

export class GoNode extends GameNode<GoMove, GoState> {}

export type AbstractGoConfig = RulesConfig;

@Debug.log
export abstract class AbstractGoRules<C extends AbstractGoConfig>
    extends ConfigurableRules<GoMove, GoState, C, GoLegalityInformation>
{

    protected constructor(public readonly playOnIntersection: boolean) {
        super();
    }

    public abstract getGoGroupDataFactory(zoom: number): GoGroupDataFactory;

    public getZoom(_: MGPOptional<C>): number {
        return 1;
    }

    private getNewKo(
        move: GoMove,
        newBoard: GoPiece[][],
        goLegalityInformation: GoLegalityInformation,
        config: MGPOptional<C>,
    ): MGPOptional<Coord> {
        if (goLegalityInformation.uniqueCapture.isPresent()) {
            const captured: Coord = goLegalityInformation.uniqueCapture.get();
            const capturerCoord: Coord = move.coord;
            const capturer: GoPiece = newBoard[capturerCoord.y][capturerCoord.x];
            const maxStepSize: number = this.getZoom(config);
            for (let zoom: number = 1; zoom <= maxStepSize; zoom++) {
                const goGroupDataFactory: GoGroupDataFactory = this.getGoGroupDataFactory(zoom);
                const capturersInfo: GoGroupData = goGroupDataFactory.getGroupData(capturerCoord, newBoard);
                const capturersFreedoms: Coord[] = capturersInfo.emptyCoords;
                const capturersGroup: Coord[] =
                    GoPiece.pieceBelongTo(capturer, Player.ZERO) ? capturersInfo.darkCoords : capturersInfo.lightCoords;
                if (capturersFreedoms.length === 1 &&
                    capturersFreedoms[0].equals(captured) &&
                    capturersGroup.length === 1
                ) {
                    return MGPOptional.of(captured);
                }
            }
        }
        return MGPOptional.empty();
    }

    public markTerritoryAndCount(state: GoState): GoState {
        const resultingBoard: GoPiece[][] = state.getCopiedBoard();
        const emptyZones: GoGroupData[] = this.getTerritoryLikeGroup(state);
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

    private getEmptyZones(deadlessState: GoState): GoGroupData[] {
        const zoom: number = 1;
        return this.getGoGroupDataFactory(zoom)
            .getGroupsDataWhere(
                deadlessState.getCopiedBoard(),
                (piece: GoPiece) => piece.isEmpty(),
            );
    }

    public switchAliveness(groupCoord: Coord, switchedState: GoState, zoom: number): GoState {
        const switchedBoard: GoPiece[][] = switchedState.getCopiedBoard();
        const switchedPiece: GoPiece = switchedBoard[groupCoord.y][groupCoord.x];
        Utils.assert(switchedPiece.isOccupied(), `Can't switch emptyness aliveness`);

        const goGroupDataFactory: GoGroupDataFactory = this.getGoGroupDataFactory(zoom);
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
        return state.getPieceAt(move.coord).isOccupied() &&
               (state.phase.isCounting() || state.phase.isAccept());
    }

    private isLegalDrop(move: GoMove, state: GoState, config: MGPOptional<C>)
    : MGPFallible<GoLegalityInformation>
    {
        if (this.isKo(move, state)) {
            return MGPFallible.failure(GoFailure.ILLEGAL_KO());
        }
        if (state.phase.isCounting() || state.phase.isAccept()) {
            state = this.resurrectStones(state);
        }
        const goLegalityInformation: GoLegalityInformation = this.applyCaptures(move, state, config);
        const postCaptureState: GoState = goLegalityInformation.postCaptureState;
        const droppedPieceHasFreedom: boolean = this.doesPieceHaveFreedoms(
            move.coord,
            postCaptureState.setPieceAt(move.coord, GoPiece.ofPlayer(postCaptureState.getCurrentPlayer())),
            config,
        );
        if (droppedPieceHasFreedom) {
            return MGPFallible.success(goLegalityInformation);
        } else {
            return MGPFallible.failure(GoFailure.CANNOT_COMMIT_SUICIDE());
        }
    }

    private doesPieceHaveFreedoms(coord: Coord, state: GoState, config: MGPOptional<C>): boolean {
        const boardCopy: GoPiece[][] = state.getCopiedBoard();
        boardCopy[coord.y][coord.x] = GoPiece.ofPlayer(state.getCurrentPlayer());
        const maxStepSize: number = this.getZoom(config);
        for (let zoom: number = 1; zoom <= maxStepSize; zoom++) {
            const goGroupDataFactory: GoGroupDataFactory = this.getGoGroupDataFactory(zoom);
            const goGroupsData: GoGroupData = goGroupDataFactory.getGroupData(coord, boardCopy);
            const isSuicide: boolean = goGroupsData.emptyCoords.length === 0;
            if (isSuicide) {
                return false;
            }
        }
        return true;
    }

    private isKo(move: GoMove, state: GoState): boolean {
        if (state.koCoord.isPresent()) {
            return move.coord.equals(state.koCoord.get());
        } else {
            return false;
        }
    }

    /**
     * will remove captured pieces
     * will add captured pieces count to captures
     * will return an optional coord if there is a coord that is the only capture
     * (if zero capture, optional will be absent, if two or more it will be absent too)
     */
    private applyCaptures(move: GoMove, state: GoState, config: MGPOptional<C>): GoLegalityInformation {
        const captureds: Coord[] = [];
        const maxStepSize: number = this.getZoom(config);
        for (let zoom: number = 1; zoom <= maxStepSize; zoom++) {
            const goGroupDataFactory: GoGroupDataFactory = this.getGoGroupDataFactory(zoom);
            for (const direction of goGroupDataFactory.getDirections(move.coord)) {
                const captures: Coord[] = this.getCapturedInDirection(move.coord, direction, state, goGroupDataFactory);
                captureds.push(
                    ...captures,
                );
            }
        }
        const capturedSet: Set<Coord> = new Set(captureds);
        for (const captured of capturedSet) {
            state = state.setPieceAt(captured, GoPiece.EMPTY);
        }
        state = state.addCaptures(state.getCurrentPlayer(), capturedSet.size());
        return {
            postCaptureState: state,
            uniqueCapture: capturedSet.size() === 1 ?
                MGPOptional.of(capturedSet.getAnyElement().get()) :
                MGPOptional.empty(),
        };
    }

    private getCapturedInDirection(
        coord: Coord,
        vector: Vector,
        state: GoState,
        goGroupDataFactory: GoGroupDataFactory,
    ): Coord[] {
        const neightbooringCoord: Coord = coord.getNext(vector);
        const copiedBoard: GoPiece[][] = state.getCopiedBoard();
        if (this.isReachable(neightbooringCoord, state)) {
            const opponent: GoPiece = GoPiece.ofPlayer(state.getCurrentOpponent());
            if (state.getPieceAt(neightbooringCoord) === opponent) {
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

    public getTerritoryLikeGroup(state: GoState): GoGroupData[] {
        const emptyGroups: GoGroupData[] = this.getEmptyZones(state);
        return emptyGroups.filter((currentGroup: GoGroupData) => currentGroup.isMonoWrapped());
    }

    private applyPass(state: GoState): GoState {
        const oldBoard: GoPiece[][] = state.getCopiedBoard();
        const oldCaptured: PlayerNumberMap = state.getCapturedCopy();
        const oldTurn: number = state.turn;
        if (state.phase.isPassed()) {
            const newPhase: GoPhase = GoPhase.COUNTING;
            const resultingState: GoState =
                new GoState(oldBoard, oldCaptured, oldTurn + 1, MGPOptional.empty(), newPhase);
            return this.markTerritoryAndCount(resultingState);
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
        goLegalityInformation: GoLegalityInformation,
        config: MGPOptional<C>,
    ): GoState
    {
        let state: GoState = goLegalityInformation.postCaptureState;
        if (state.phase.isCounting() || state.phase.isAccept()) {
            state = this.resurrectStones(state);
        }
        const x: number = legalMove.coord.x;
        const y: number = legalMove.coord.y;

        const newBoard: GoPiece[][] = state.getCopiedBoard();
        const currentTurn: number = state.turn;
        const currentPlayer: Player = state.getCurrentPlayer();
        const currentPlayerPiece: GoPiece = GoPiece.ofPlayer(currentPlayer);
        const newTurn: number = currentTurn + 1;
        newBoard[y][x] = currentPlayerPiece;
        const newKoCoord: MGPOptional<Coord> = this.getNewKo(legalMove, newBoard, goLegalityInformation, config);
        const newCaptured: PlayerNumberMap = goLegalityInformation.postCaptureState.getCapturedCopy();
        return new GoState(newBoard, newCaptured, newTurn, newKoCoord, GoPhase.PLAYING);
    }

    private resurrectStones(state: GoState): GoState {
        for (let y: number = 0; y < state.getHeight(); y++) {
            for (let x: number = 0; x < state.getWidth(); x++) {
                if (state.getPieceAtXY(x, y).isDead()) {
                    state = this.switchAliveness(new Coord(x, y), state, 1);
                }
            }
        }
        return this.removeAndSubtractTerritory(state);
    }

    private applyDeadMarkingMove(legalMove: GoMove, state: GoState): GoState {
        const territorylessState: GoState = this.removeAndSubtractTerritory(state);
        const switchedState: GoState = this.switchAliveness(legalMove.coord, territorylessState, 1);
        const resultingState: GoState =
            new GoState(switchedState.getCopiedBoard(),
                        switchedState.getCapturedCopy(),
                        switchedState.turn + 1,
                        MGPOptional.empty(),
                        GoPhase.COUNTING,
            );
        return this.markTerritoryAndCount(resultingState);
    }

    public override isLegal(move: GoMove, state: GoState, config: MGPOptional<C>): MGPFallible<GoLegalityInformation> {
        const defaultSuccess: MGPFallible<GoLegalityInformation> = MGPFallible.success({
            postCaptureState: state,
            uniqueCapture: MGPOptional.empty(),
        });
        if (this.isPass(move)) {
            const playing: boolean = state.phase.isPlaying();
            const passed: boolean = state.phase.isPassed();
            Debug.display('GoRules', 'isLegal',
                          'at ' + state.phase + ((playing || passed) ? ' forbid' : ' allowed') +
                          ' passing on ' + state.getCopiedBoard());
            if (playing || passed) {
                return defaultSuccess;
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE());
            }
        } else if (this.isAccept(move)) {
            const counting: boolean = state.phase.isCounting();
            const accept: boolean = state.phase.isAccept();
            if (counting || accept) {
                return defaultSuccess;
            } else {
                return MGPFallible.failure(GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE());
            }
        } else if (state.getPieceAt(move.coord).isOccupied()) {
            Debug.display('GoRules', 'isLegal', 'move is marking');
            const legal: boolean = this.isLegalDeadMarking(move, state);
            if (legal) {
                return defaultSuccess;
            } else {
                if (this.playOnIntersection) {
                    return MGPFallible.failure(GoFailure.OCCUPIED_INTERSECTION());
                } else {
                    return MGPFallible.failure(GoFailure.OCCUPIED_SPACE());
                }
            }
        } else {
            Debug.display('GoRules', 'isLegal', 'move is normal stuff: ' + move.toString());
            return this.isLegalDrop(move, state, config);
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
            return this.applyPass(state);
        } else if (this.isAccept(legalMove)) {
            Debug.display('GoRules', 'applyLegalMove', 'isAccept');
            return this.applyLegalAccept(state);
        } else if (this.isLegalDeadMarking(legalMove, state)) {
            Debug.display('GoRules', 'applyLegalMove', 'isDeadMarking');
            return this.applyDeadMarkingMove(legalMove, state);
        } else {
            Debug.display('GoRules', 'applyLegalMove', 'else it is normal move');
            return this.applyNormalLegalMove(legalMove, infos, config);
        }
    }

    public override getGameStatus(node: GoNode): GameStatus {
        const state: GoState = node.gameState;
        if (state.phase.isFinished()) {
            const captured: PlayerNumberMap = state.getCapturedCopy();
            const capturedZero: number = captured.get(Player.ZERO);
            const capturedOne: number = captured.get(Player.ONE);
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

