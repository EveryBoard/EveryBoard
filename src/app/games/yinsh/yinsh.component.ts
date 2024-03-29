import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { YinshFailure } from './YinshFailure';
import { YinshState } from './YinshState';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { YinshLegalityInformation, YinshRules } from './YinshRules';
import { Utils } from 'src/app/utils/utils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { assert } from 'src/app/utils/assert';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { YinshScoreHeuristic } from './YinshScoreHeuristic';
import { YinshMoveGenerator } from './YinshMoveGenerator';
import { PlayerMap, PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

interface SpaceInfo {
    coord: Coord,
    coordinates: string,
    markerClasses: string[],
    ringClasses: string[],
    isMarker: boolean,
    isRing: boolean,
    center: Coord,
    removedClass: string,
}

interface ViewInfo {
    spaceInfo: SpaceInfo[][],
    selectableCoords: Coord[],
    selectedCoords: Coord[],
    targets: Coord[],
    markerSize: number,
    indicatorSize: number,
    ringOuterSize: number,
    ringMidSize: number,
    ringInnerSize: number,
    sideRings: PlayerNumberMap,
    sideRingClass: PlayerMap<string>,
}

@Component({
    selector: 'app-yinsh',
    templateUrl: './yinsh.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class YinshComponent extends HexagonalGameComponent<YinshRules,
                                                           YinshMove,
                                                           YinshState,
                                                           YinshPiece,
                                                           EmptyRulesConfig,
                                                           YinshLegalityInformation>
{
    private static readonly RING_OUTER_SIZE: number = 40;
    private static readonly RING_MID_SIZE: number = 34;
    private static readonly RING_INNER_SIZE: number = 28;
    private static readonly MARKER_SIZE: number = YinshComponent.RING_INNER_SIZE;
    private static readonly INDICATOR_SIZE: number = 10;

    private constructedState: YinshState;

    private movePhase: 'INITIAL_CAPTURE_SELECT_FIRST' |
                       'INITIAL_CAPTURE_SELECT_LAST' |
                       'INITIAL_CAPTURE_SELECT_RING' |
                       'MOVE_START' |
                       'MOVE_END' |
                       'FINAL_CAPTURE_SELECT_FIRST' |
                       'FINAL_CAPTURE_SELECT_LAST' |
                       'FINAL_CAPTURE_SELECT_RING' =
            'MOVE_START';

    private lastMoved: Coord[] = [];
    private lastCaptured: Coord[] = [];

    private moveStart: MGPOptional<Coord> = MGPOptional.empty();
    private moveEnd: MGPOptional<Coord> = MGPOptional.empty();
    private currentlyMoved: Coord[] = [];
    private currentCapture: MGPOptional<YinshCapture> = MGPOptional.empty();
    private initialCaptures: YinshCapture[] = [];
    private finalCaptures: YinshCapture[] = [];

    private possibleCaptures: YinshCapture[] = [];

    public viewInfo: ViewInfo = {
        spaceInfo: [],
        selectableCoords: [],
        selectedCoords: [],
        targets: [],
        markerSize: YinshComponent.MARKER_SIZE,
        ringOuterSize: YinshComponent.RING_OUTER_SIZE,
        ringMidSize: YinshComponent.RING_MID_SIZE,
        ringInnerSize: YinshComponent.RING_INNER_SIZE,
        indicatorSize: YinshComponent.INDICATOR_SIZE,
        sideRings: PlayerNumberMap.of(5, 5),
        sideRingClass: PlayerMap.ofValues('player0-stroke', 'player1-stroke'),
    };

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('Yinsh');
        this.availableAIs = [
            new Minimax($localize`Score`, this.rules, new YinshScoreHeuristic(), new YinshMoveGenerator()),
            new MCTS($localize`MCTS`, new YinshMoveGenerator(), this.rules),
        ];
        this.encoder = YinshMove.encoder;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));

        this.hexaLayout = new HexaLayout(YinshComponent.RING_OUTER_SIZE * 1.50,
                                         new Coord(YinshComponent.RING_OUTER_SIZE * 2, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.constructedState = this.getState();
        this.constructedState.allCoords().forEach((coord: Coord): void => {
            if (this.viewInfo.spaceInfo[coord.y] == null) {
                this.viewInfo.spaceInfo[coord.y] = [];
            }
            this.viewInfo.spaceInfo[coord.y][coord.x] = {
                coord,
                coordinates: this.getHexaPoints(),
                center: this.getCenterAt(coord),
                markerClasses: [],
                ringClasses: [],
                isMarker: false,
                isRing: false,
                removedClass: '',
            };
        });
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: YinshState = this.getState();
        this.constructedState = state;
        this.scores = MGPOptional.of(state.countScores());
        this.moveToInitialCaptureOrMovePhase();
    }

    public updateViewInfo(): void {
        this.constructedState.allCoords().forEach((coord: Coord): void => {
            const piece: YinshPiece = this.constructedState.getPieceAt(coord);
            this.viewInfo.spaceInfo[coord.y][coord.x].removedClass = '';
            this.setRingInfo(coord, piece);
            this.setMarkerInfo(coord, piece);
        });
        this.viewInfo.sideRings = this.constructedState.sideRings;
        this.showCurrentMoveCaptures();

        this.viewInfo.targets = [];
        this.viewInfo.selectableCoords = [];
        switch (this.movePhase) {
            case 'INITIAL_CAPTURE_SELECT_FIRST':
            case 'INITIAL_CAPTURE_SELECT_LAST':
            case 'FINAL_CAPTURE_SELECT_FIRST':
            case 'FINAL_CAPTURE_SELECT_LAST':
                this.viewInfo.selectableCoords = [];
                for (const capture of this.possibleCaptures) {
                    for (const coord of capture.capturedSpaces) {
                        this.viewInfo.selectableCoords.push(coord);
                    }
                }
                break;
            case 'INITIAL_CAPTURE_SELECT_RING':
            case 'FINAL_CAPTURE_SELECT_RING':
                this.viewInfo.selectableCoords =
                    this.constructedState.getRingCoords(this.constructedState.getCurrentPlayer());
                break;
            case 'MOVE_START':
                if (this.getState().isInitialPlacementPhase() === false) {
                    this.viewInfo.selectableCoords =
                        this.constructedState.getRingCoords(this.constructedState.getCurrentPlayer());
                }
                break;
            case 'MOVE_END':
                this.viewInfo.targets =
                    this.rules.getRingTargets(this.constructedState, this.moveStart.get());
                break;
        }
    }

    private showCurrentMoveCaptures(): void {
        if (this.currentCapture.isPresent()) {
            this.markCurrentCapture(this.currentCapture.get());
        }
        for (const capture of this.initialCaptures) {
            this.markCurrentCapture(capture);
        }
        for (const capture of this.finalCaptures) {
            this.markCurrentCapture(capture);
        }
    }

    protected getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        if (this.currentlyMoved.concat(this.lastMoved).some((c: Coord) => c.equals(coord))) {
            return ['moved-fill'];
        } else if (this.lastCaptured.some((c: Coord) => c.equals(coord))) {
            return ['captured-fill'];
        } else {
            return [];
        }
    }

    private setRingInfo(coord: Coord, piece: YinshPiece): void {
        if (piece.isRing) {
            this.viewInfo.spaceInfo[coord.y][coord.x].isRing = true;
            this.viewInfo.spaceInfo[coord.y][coord.x].ringClasses = ['player' + piece.player.getValue() + '-stroke'];
        } else {
            this.viewInfo.spaceInfo[coord.y][coord.x].isRing = false;
            this.viewInfo.spaceInfo[coord.y][coord.x].ringClasses = [];
        }
    }

    private setMarkerInfo(coord: Coord, piece: YinshPiece): void {
        this.viewInfo.spaceInfo[coord.y][coord.x].isMarker = false;
        this.viewInfo.spaceInfo[coord.y][coord.x].markerClasses = [];
        if (piece !== YinshPiece.EMPTY) {
            const containsMarker: boolean = piece.isRing === false || this.moveStart.equalsValue(coord);
            if (containsMarker) {
                const playerClass: string = this.getPlayerClass(piece.player);
                this.viewInfo.spaceInfo[coord.y][coord.x].isMarker = true;
                this.viewInfo.spaceInfo[coord.y][coord.x].markerClasses = [playerClass];
            }
        }
    }

    public override cancelMoveAttempt(): void {
        this.constructedState = this.getState();
        this.possibleCaptures = [];
        this.initialCaptures = [];
        this.finalCaptures = [];
        this.viewInfo.selectedCoords = [];
        this.currentCapture = MGPOptional.empty();
        this.moveStart = MGPOptional.empty();
        this.moveEnd = MGPOptional.empty();
        this.currentlyMoved = [];
        this.moveToInitialCaptureOrMovePhase();
    }

    public override async showLastMove(move: YinshMove): Promise<void> {
        if (move.isInitialPlacement()) {
            this.lastMoved = [move.start];
        } else {
            this.lastMoved = this.coordsBetween(move.start, move.end.get());
            const nothingSelectedThisTurn: boolean =
                this.currentCapture.isAbsent() &&
                this.initialCaptures.length === 0 &&
                this.moveStart.isAbsent();
            this.lastCaptured = [];
            move.initialCaptures.forEach((c: YinshCapture) => this.showLastMoveCapture(c, nothingSelectedThisTurn));
            move.finalCaptures.forEach((c: YinshCapture) => this.showLastMoveCapture(c, nothingSelectedThisTurn));
        }
    }

    public override hideLastMove(): void {
        this.lastMoved = [];
        this.lastCaptured = [];
    }

    private coordsBetween(start: Coord, end: Coord): Coord[] {
        return start.getAllCoordsToward(end);
    }

    private showLastMoveCapture(capture: YinshCapture, alsoShowPiece: boolean): void {
        for (const coord of capture.capturedSpaces) {
            this.lastCaptured.push(coord);
            if (alsoShowPiece) {
                this.markRemovedMarker(coord, this.getState().getCurrentOpponent());
            }
        }
        this.lastCaptured.push(capture.ringTaken.get());
        if (alsoShowPiece) {
            this.markRemovedRing(capture.ringTaken.get(), this.getState().getCurrentOpponent());
        }
    }

    private moveToInitialCaptureOrMovePhase(): MGPValidation {
        this.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);
        if (this.possibleCaptures.length === 0) {
            this.movePhase = 'MOVE_START';
        } else {
            this.movePhase = 'INITIAL_CAPTURE_SELECT_FIRST';
        }
        this.updateViewInfo();
        return MGPValidation.SUCCESS;
    }

    public async onClick(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + coord.x + '_' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        switch (this.movePhase) {
            case 'INITIAL_CAPTURE_SELECT_FIRST':
            case 'FINAL_CAPTURE_SELECT_FIRST':
                return this.selectCaptureFirstCoord(coord);
            case 'INITIAL_CAPTURE_SELECT_LAST':
            case 'FINAL_CAPTURE_SELECT_LAST':
                return this.selectCaptureLastCoord(coord);
            case 'INITIAL_CAPTURE_SELECT_RING':
            case 'FINAL_CAPTURE_SELECT_RING':
                return this.selectRing(coord);
            case 'MOVE_START':
                return this.selectMoveStart(coord);
            case 'MOVE_END':
                return this.selectMoveEnd(coord);
        }
    }

    private async selectCaptureFirstCoord(coord: Coord): Promise<MGPValidation> {
        const captures: YinshCapture[] = [];
        this.possibleCaptures.forEach((candidate: YinshCapture) => {
            if (candidate.contains(coord)) {
                captures.push(candidate);
            }
        });
        if (captures.length > 1) {
            this.viewInfo.selectedCoords.push(coord);
            this.moveToCaptureSelectLast(captures);
        } else if (captures.length === 0) {
            return this.cancelMove(YinshFailure.MISSING_CAPTURES());
        } else {
            this.selectCapture(captures[0]);
        }
        return MGPValidation.SUCCESS;
    }

    private moveToCaptureSelectLast(possibleCaptures: YinshCapture[]): void {
        this.viewInfo.selectableCoords = [];
        this.possibleCaptures = possibleCaptures;
        for (const capture of possibleCaptures) {
            for (const coord of capture.capturedSpaces) {
                this.viewInfo.selectableCoords.push(coord);
            }
        }
        if (this.movePhase === 'INITIAL_CAPTURE_SELECT_FIRST') {
            this.movePhase = 'INITIAL_CAPTURE_SELECT_LAST';
        } else {
            Utils.expectToBe(this.movePhase, 'FINAL_CAPTURE_SELECT_FIRST', 'moveToCaptureSelectLast did not expect to be called in movePhase' + this.movePhase);
            this.movePhase = 'FINAL_CAPTURE_SELECT_LAST';
        }
    }

    private async selectCaptureLastCoord(coord: Coord): Promise<MGPValidation> {
        const captures: YinshCapture[] = [];
        this.possibleCaptures.forEach((candidate: YinshCapture) => {
            if (candidate.contains(coord)) {
                captures.push(candidate);
            }
        });
        if (captures.length > 1) {
            return this.cancelMove(YinshFailure.AMBIGUOUS_CAPTURE_COORD());
        } else if (captures.length === 0) {
            return this.cancelMove(YinshFailure.MISSING_CAPTURES());
        } else {
            return this.selectCapture(captures[0]);
        }
    }

    private selectCapture(capture: YinshCapture): MGPValidation {
        this.currentCapture = MGPOptional.of(capture);
        this.constructedState = new YinshState(
            this.rules.applyCaptureWithoutTakingRing(this.constructedState, capture),
            this.constructedState.sideRings,
            this.constructedState.turn);

        if (this.movePhase === 'INITIAL_CAPTURE_SELECT_FIRST' ||
            this.movePhase === 'INITIAL_CAPTURE_SELECT_LAST')
        {
            this.movePhase = 'INITIAL_CAPTURE_SELECT_RING';
        } else {
            const message: string = 'selectCapture did not expect to be called in movePhase ' + this.movePhase;
            assert(this.movePhase === 'FINAL_CAPTURE_SELECT_FIRST' || this.movePhase === 'FINAL_CAPTURE_SELECT_LAST', message);
            this.movePhase = 'FINAL_CAPTURE_SELECT_RING';
        }
        this.updateViewInfo();
        return MGPValidation.SUCCESS;
    }

    private markCurrentCapture(capture: YinshCapture): void {
        for (const coord of capture.capturedSpaces) {
            this.viewInfo.selectedCoords.push(coord);
            this.markRemovedMarker(coord, this.getState().getCurrentPlayer());
        }
        if (capture.ringTaken.isPresent()) {
            this.viewInfo.selectedCoords.push(capture.ringTaken.get());
            this.markRemovedRing(capture.ringTaken.get(), this.getState().getCurrentPlayer());
        }
    }

    private markRemovedMarker(coord: Coord, player: Player): void {
        this.viewInfo.spaceInfo[coord.y][coord.x].removedClass = 'semi-transparent';
        this.setMarkerInfo(coord, YinshPiece.MARKERS.get(player));
    }

    private markRemovedRing(coord: Coord, player: Player): void {
        this.viewInfo.spaceInfo[coord.y][coord.x].removedClass = 'semi-transparent';
        this.setRingInfo(coord, YinshPiece.RINGS.get(player));
    }

    private async selectRing(coord: Coord): Promise<MGPValidation> {
        const validity: MGPValidation = this.rules.ringSelectionValidity(this.constructedState, coord);
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.constructedState = this.rules.takeRing(this.constructedState, coord);
        const capture: YinshCapture = this.currentCapture.get().setRingTaken(coord);
        this.currentCapture = MGPOptional.empty();

        this.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);

        switch (this.movePhase) {
            case 'INITIAL_CAPTURE_SELECT_RING':
                this.initialCaptures.push(capture);
                if (this.possibleCaptures.length === 0) {
                    return this.moveToMovePhase();
                } else {
                    this.movePhase = 'INITIAL_CAPTURE_SELECT_FIRST';
                    this.updateViewInfo();
                    return MGPValidation.SUCCESS;
                }
            default:
                Utils.expectToBe(this.movePhase, 'FINAL_CAPTURE_SELECT_RING');
                this.finalCaptures.push(capture);
                if (this.possibleCaptures.length === 0) {
                    return this.tryMove();
                } else {
                    this.movePhase = 'FINAL_CAPTURE_SELECT_FIRST';
                    this.updateViewInfo();
                    return MGPValidation.SUCCESS;
                }
        }
    }

    private moveToMovePhase(): MGPValidation {
        this.movePhase = 'MOVE_START';
        this.updateViewInfo();
        return MGPValidation.SUCCESS;
    }

    private async tryMove(): Promise<MGPValidation> {
        const move: YinshMove = new YinshMove(this.initialCaptures,
                                              this.moveStart.get(),
                                              this.moveEnd,
                                              this.finalCaptures);
        const validity: MGPValidation = await this.chooseMove(move);
        return validity;
    }

    private async selectMoveStart(coord: Coord): Promise<MGPValidation> {
        if (this.constructedState.isInitialPlacementPhase()) {
            const validity: MGPFallible<YinshLegalityInformation> =
                this.rules.initialPlacementValidity(this.constructedState, coord);
            if (validity.isFailure()) {
                return this.cancelMove(validity.getReason());
            }
            this.moveStart = MGPOptional.of(coord);
            return this.tryMove();
        } else {
            const validity: MGPValidation = this.rules.moveStartValidity(this.constructedState, coord);
            if (validity.isFailure()) {
                return this.cancelMove(validity.getReason());
            }
            this.moveStart = MGPOptional.of(coord);
            this.movePhase = 'MOVE_END';
            this.updateViewInfo();
        }
        return MGPValidation.SUCCESS;
    }

    private async selectMoveEnd(coord: Coord): Promise<MGPValidation> {
        if (this.moveStart.equalsValue(coord)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        const currentPlayerRing: YinshPiece = YinshPiece.RINGS.get(this.getState().getCurrentPlayer());
        if (this.constructedState.getPieceAt(coord) === currentPlayerRing) {
            this.cancelMoveAttempt();
            return this.selectMoveStart(coord);
        }
        const validity: MGPValidation = this.rules.moveValidity(this.constructedState, this.moveStart.get(), coord);
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.moveEnd = MGPOptional.of(coord);
        this.currentlyMoved = this.coordsBetween(this.moveStart.get(), coord);
        this.constructedState = this.rules.applyRingMoveAndFlip(this.moveStart.get(), coord, this.constructedState);
        this.updateViewInfo();
        return this.moveToFinalCapturePhaseOrTryMove();
    }

    private async moveToFinalCapturePhaseOrTryMove(): Promise<MGPValidation> {
        this.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);
        if (this.possibleCaptures.length === 0) {
            return this.tryMove();
        } else {
            this.movePhase = 'FINAL_CAPTURE_SELECT_FIRST';
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        }
    }

}
