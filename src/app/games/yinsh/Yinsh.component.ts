import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/abstract-game-component/HexagonalGameComponent';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { YinshFailure } from './YinshFailure';
import { YinshGameState } from './YinshGameState';
import { YinshLegalityStatus } from './YinshLegalityStatus';
import { YinshMinimax } from './YinshMinimax';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { YinshRules } from './YinshRules';
import { yinshTutorial } from './YinshTutorial';

interface CaseInfo {
    coord: Coord,
    coordinates: string,
    caseClasses: string[],
    pieceClasses: string[],
    isPiece: boolean,
    center: Coord,
}

interface ViewInfo {
    caseInfo: CaseInfo[][],
    possibleCaptures: YinshCapture[],
    selectableRings: Coord[],
    pieceSize: number,
    sideRings: [number, number],
    sideRingClass: [string, string],
}

@Component({
    selector: 'app-yinsh',
    templateUrl: './yinsh.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class YinshComponent extends HexagonalGameComponent<YinshMove, YinshGameState, YinshLegalityStatus> {

    private static PIECE_SIZE: number = 40;

    public rules: YinshRules = new YinshRules(YinshGameState);

    public hexaLayout: HexaLayout = new HexaLayout(YinshComponent.PIECE_SIZE * 1.50,
                                                   new Coord(YinshComponent.PIECE_SIZE * 2, 0),
                                                   FlatHexaOrientation.INSTANCE);

    public encoder: MoveEncoder<YinshMove> = YinshMove.encoder;

    public tutorial: TutorialStep[] = yinshTutorial;

    public scores: number[] = [0, 0];

    private constructedState: YinshGameState;

    private movePhase: 'INITIAL_CAPTURE' |
                       'INITIAL_CAPTURE_SELECT_RING' |
                       'MOVE_START' |
                       'MOVE_END' |
                       'FINAL_CAPTURE' |
                       'FINAL_CAPTURE_SELECT_RING'
        = 'MOVE_START';

    private moveStart: MGPOptional<Coord> = MGPOptional.empty();
    private moveEnd: MGPOptional<Coord> = MGPOptional.empty();
    private currentCapture: MGPOptional<YinshCapture> = MGPOptional.empty();
    private initialCaptures: YinshCapture[] = [];
    private finalCaptures: YinshCapture[] = [];

    private captured: Coord[] = [];

    private moved: Coord[] = [];

    public viewInfo: ViewInfo = {
        caseInfo: [],
        possibleCaptures: [],
        selectableRings: [],
        pieceSize: YinshComponent.PIECE_SIZE,
        sideRings: [5, 5],
        sideRingClass: ['player0-stroke', 'player1-stroke'],
    };

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.availableMinimaxes = [
            new YinshMinimax(this.rules, 'YinshMinimax'),
        ];
        this.showScore = true;
        this.constructedState = this.rules.node.gamePartSlice;
        this.constructedState.hexaBoard.allCoords().forEach((coord: Coord): void => {
            if (this.viewInfo.caseInfo[coord.y] == null) {
                this.viewInfo.caseInfo[coord.y] = [];
            }
            this.viewInfo.caseInfo[coord.y][coord.x] = {
                coord,
                coordinates: this.getHexaCoordsAt(coord),
                center: this.getCenterAt(coord),
                caseClasses: [],
                pieceClasses: [],
                isPiece: false,
            };
        });
    }
    public updateBoard(): void {
        const state: YinshGameState = this.rules.node.gamePartSlice;
        this.board = state.board;

        this.cancelMoveAttempt();
        this.updateViewInfo();
    }
    public updateViewInfo(): void {
        this.constructedState.hexaBoard.allCoords().forEach((coord: Coord): void => {
            this.viewInfo.caseInfo[coord.y][coord.x].caseClasses = this.getCaseClasses(coord);
            this.viewInfo.caseInfo[coord.y][coord.x].pieceClasses = this.getPieceClasses(coord);
            this.viewInfo.caseInfo[coord.y][coord.x].isPiece =
                this.constructedState.hexaBoard.getAt(coord) !== YinshPiece.EMPTY;
        });
        for (const player of [Player.ZERO, Player.ONE]) {
            this.viewInfo.sideRings[player.value] = this.constructedState.sideRings[player.value];
        }
        if (this.movePhase === 'INITIAL_CAPTURE' || this.movePhase === 'FINAL_CAPTURE') {
            this.viewInfo.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);
            this.viewInfo.selectableRings = [];
        } else if (this.movePhase === 'INITIAL_CAPTURE_SELECT_RING' || this.movePhase === 'FINAL_CAPTURE_SELECT_RING') {
            this.viewInfo.possibleCaptures = [];
            this.viewInfo.selectableRings =
                this.constructedState.hexaBoard.getRingCoords(this.constructedState.getCurrentPlayer());
        } else {
            this.viewInfo.possibleCaptures = [];
            this.viewInfo.selectableRings = [];
        }
    }
    public getCaseClasses(coord: Coord): string[] {
        if (this.captured.some((c: Coord) => c.equals(coord))) {
            return ['captured'];
        } else if (this.moved.some((c: Coord) => c.equals(coord))) {
            return ['moved'];
        } else {
            return [];
        }
    }
    public getPieceClasses(coord: Coord): string[] {
        const piece: YinshPiece = this.constructedState.hexaBoard.getAt(coord);
        const playerClass: string = this.getPlayerClass(piece.player);
        if (piece.isRing) {
            const classes: string[] = [playerClass + '-stroke'];
            if (coord.equals(this.moveStart.getOrNull())) {
                classes.push(playerClass);
            } else {
                classes.push('no-fill');
            }
            return classes;
        } else {
            return [playerClass];
        }
    }
    public cancelMoveAttempt(): void {
        this.constructedState = this.rules.node.gamePartSlice;
        this.captured = [];
        this.moved = [];

        this.showLastMove();

        this.initialCaptures = [];
        this.finalCaptures = [];
        this.currentCapture = MGPOptional.empty();
        this.moveStart = MGPOptional.empty();
        this.moveEnd = MGPOptional.empty();
        this.updateViewInfo();
        this.moveToInitialCaptureOrMovePhase();
    }
    private showLastMove(): void {
        const move: YinshMove = this.rules.node.move;
        if (move !== null) {
            if (move.isInitialPlacement()) {
                this.moved = [move.start];
            } else {
                this.moved = [move.start, move.end.get()];
                move.initialCaptures.forEach((c: YinshCapture) => this.markCapture(c));
                move.finalCaptures.forEach((c: YinshCapture) => this.markCapture(c));
            }
        }
    }
    private markCapture(capture: YinshCapture): void {
        capture.forEach((c: Coord) => {
            this.captured.push(c);
        });
    }
    private moveToInitialCaptureOrMovePhase(): MGPValidation {
        this.viewInfo.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);
        if (this.viewInfo.possibleCaptures.length === 0) {
            this.movePhase = 'MOVE_START';
        } else {
            this.movePhase = 'INITIAL_CAPTURE';
        }
        return MGPValidation.SUCCESS;
    }
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + coord.x + '_' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        switch (this.movePhase) {
            case 'INITIAL_CAPTURE':
            case 'FINAL_CAPTURE':
                return this.selectCapture(coord);
            case 'INITIAL_CAPTURE_SELECT_RING':
            case 'FINAL_CAPTURE_SELECT_RING':
                return this.selectRing(coord);
            case 'MOVE_START':
                return this.selectMoveStart(coord);
            case 'MOVE_END':
                return this.selectMoveEnd(coord);
        }
    }
    private async selectCapture(coord: Coord): Promise<MGPValidation> {
        const captures: YinshCapture[] = [];
        this.viewInfo.possibleCaptures.forEach((candidate: YinshCapture) => {
            if (candidate.contains(coord)) {
                captures.push(candidate);
            }
        });
        if (captures.length > 1) {
            return this.cancelMove(YinshFailure.AMBIGUOUS_CAPTURE_COORD);
        } else if (captures.length === 0) {
            return this.cancelMove(YinshFailure.MISSING_CAPTURES);
        }
        const capture: YinshCapture = captures[0];
        this.currentCapture = MGPOptional.of(capture);
        this.constructedState = new YinshGameState(
            this.rules.applyCaptureWithoutTakingRing(this.constructedState, capture),
            this.constructedState.sideRings,
            this.constructedState.turn);
        this.markCapture(capture);

        switch (this.movePhase) {
            case 'INITIAL_CAPTURE':
                this.movePhase = 'INITIAL_CAPTURE_SELECT_RING';
                break;
            case 'FINAL_CAPTURE':
                this.movePhase = 'FINAL_CAPTURE_SELECT_RING';
                break;
        }
        this.updateViewInfo();
        return MGPValidation.SUCCESS;
    }
    private async selectRing(coord: Coord): Promise<MGPValidation> {
        const validity: MGPValidation = this.rules.ringSelectionValidity(this.constructedState, coord);
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.constructedState = this.rules.takeRing(this.constructedState, coord);
        const capture: YinshCapture = this.currentCapture.get().setRingTaken(coord);
        this.currentCapture = MGPOptional.empty();

        this.viewInfo.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);

        switch (this.movePhase) {
            case 'INITIAL_CAPTURE_SELECT_RING':
                this.initialCaptures.push(capture);
                if (this.viewInfo.possibleCaptures.length === 0) {
                    return this.moveToMovePhase();
                } else {
                    this.movePhase = 'INITIAL_CAPTURE';
                    this.updateViewInfo();
                    return MGPValidation.SUCCESS;
                }
            case 'FINAL_CAPTURE_SELECT_RING':
                this.finalCaptures.push(capture);
                if (this.viewInfo.possibleCaptures.length === 0) {
                    return this.tryMove();
                } else {
                    this.movePhase = 'FINAL_CAPTURE';
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
        const validity: MGPValidation = await this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        return validity;
    }
    private async selectMoveStart(coord: Coord): Promise<MGPValidation> {
        if (this.constructedState.isInitialPlacementPhase()) {
            const validity: MGPValidation = this.rules.initialPlacementValidity(this.constructedState, coord);
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
            this.updateViewInfo();
            this.movePhase = 'MOVE_END';
        }
        return MGPValidation.SUCCESS;
    }
    private async selectMoveEnd(coord: Coord): Promise<MGPValidation> {
        const validity: MGPValidation = this.rules.moveValidity(this.constructedState, this.moveStart.get(), coord);
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.moveEnd = MGPOptional.of(coord);
        this.constructedState = this.rules.applyRingMoveAndFlip(this.constructedState, this.moveStart.get(), coord);
        this.updateViewInfo();
        return this.moveToFinalCapturePhaseOrTryMove();
    }
    private async moveToFinalCapturePhaseOrTryMove(): Promise<MGPValidation> {
        this.viewInfo.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);
        if (this.viewInfo.possibleCaptures.length === 0) {
            return this.tryMove();
        } else {
            this.movePhase = 'FINAL_CAPTURE';
        }
    }
}
