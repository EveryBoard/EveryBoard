import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/abstract-game-component/HexagonalGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { YinshFailure } from './YinshFailure';
import { YinshGameState } from './YinshGameState';
import { YinshLegalityStatus } from './YinshLegalityStatus';
import { YinshCapture, YinshMove } from './YinshMove';
import { YinshPiece } from './YinshPiece';
import { YinshRules } from './YinshRules';

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
    pieceSize: number,
}

@Component({
    selector: 'app-yinsh',
    templateUrl: './yinsh.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class YinshComponent extends HexagonalGameComponent<YinshMove, YinshGameState, YinshLegalityStatus> {
    private static PIECE_SIZE: number = 40;
    public readonly PIECE_SIZE: number = YinshComponent.PIECE_SIZE;

    public rules: YinshRules = new YinshRules(YinshGameState);

    public hexaLayout: HexaLayout = new HexaLayout(YinshComponent.PIECE_SIZE * 1.50,
                                                   new Coord(YinshComponent.PIECE_SIZE * 2, 0),
                                                   FlatHexaOrientation.INSTANCE);

    public encoder: MoveEncoder<YinshMove> = YinshMove.encoder;

    public scores: number[] = [0, 0];

    private constructedState: YinshGameState = null;

    private movePhase: 'INITIAL_CAPTURE' | 'FINAL_CAPTURE' | 'RING_SELECTION' | 'MOVE_START' | 'MOVE_END' = 'MOVE_START';

    private moveStart: MGPOptional<Coord> = MGPOptional.empty();
    private moveEnd: MGPOptional<Coord> = MGPOptional.empty();
    private ringTaken: MGPOptional<Coord> = MGPOptional.empty();
    private initialCaptures: YinshCapture[] = [];
    private finalCaptures: YinshCapture[] = [];

    private captured: Coord[] = [];

    private moved: Coord[] = [];

    public viewInfo: ViewInfo = { caseInfo: [], possibleCaptures: [], pieceSize: YinshComponent.PIECE_SIZE };

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.availableMinimaxes = [
            // TODO
        ];
        this.showScore = true;
        this.constructedState = this.rules.node.gamePartSlice;
        this.constructedState.hexaBoard.allCoords().forEach((coord: Coord): void => {
            if (this.viewInfo.caseInfo[coord.y] == null) {
                this.viewInfo.caseInfo[coord.y] = [];
            }
            this.viewInfo.caseInfo[coord.y][coord.x] = {
                coord,
                coordinates: this.getHexaCoordinates(coord),
                center: this.getCenter(coord),
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
        if (piece.isRing) {
            return [this.getPlayerClass(piece.player) + '-stroke', 'no-fill'];
        } else {
            return [this.getPlayerClass(piece.player)];
        }
    }
    public cancelMoveAttempt(): void {
        this.constructedState = this.rules.node.gamePartSlice;
        this.captured = [];
        this.moved = [];

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

        this.initialCaptures = [];
        this.finalCaptures = [];
        this.moveStart = MGPOptional.empty();
        this.moveEnd = MGPOptional.empty();
        this.moveToInitialCaptureOrMovePhase();
    }
    private markCapture(capture: YinshCapture): void {
        capture.forEach((c: Coord) => {
            this.captured.push(c);
        });
    }
    private moveToInitialCaptureOrMovePhase(): MGPValidation {
        console.log('moving to initial phase')
        this.viewInfo.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);
        console.log({captures: this.viewInfo.possibleCaptures.length})
        if (this.viewInfo.possibleCaptures.length === 0) {
            this.movePhase = 'MOVE_START';
        } else {
            this.movePhase = 'INITIAL_CAPTURE';
        }
        console.log({newPhase: this.movePhase})
        return MGPValidation.SUCCESS;
    }
    public async onClick(coord: Coord): Promise<MGPValidation> {
        console.log({click: coord, phase: this.movePhase});
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + coord.x + '_' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        switch (this.movePhase) {
            case 'INITIAL_CAPTURE':
            case 'FINAL_CAPTURE':
                return this.selectCapture(coord);
            case 'RING_SELECTION':
                return this.selectRing(coord);
            case 'MOVE_START':
                return this.selectMoveStart(coord);
            case 'MOVE_END':
                return this.selectMoveEnd(coord);
        }
    }
    private async selectCapture(coord: Coord): Promise<MGPValidation> {
        console.log({selectCapture: coord})
        const captures: YinshCapture[] = [];
        this.viewInfo.possibleCaptures.forEach((candidate: YinshCapture) => {
            if (candidate.contains(coord)) {
                captures.push(candidate);
            }
        });
        if (captures.length > 1) {
            return this.cancelMove(YinshFailure.AMBIGUOUS_CAPTURE_COORD);
        } else if (captures.length === 0) {
            return this.cancelMove(YinshFailure.NOT_PART_OF_CAPTURE);
        }
        const capture: YinshCapture = captures[0];

        this.constructedState = this.rules.applyCapture(this.constructedState, capture);
        this.markCapture(capture);
        this.viewInfo.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);
        this.updateViewInfo();
        switch (this.movePhase) {
            case 'INITIAL_CAPTURE':
                this.initialCaptures.push(capture);
                if (this.viewInfo.possibleCaptures.length === 0) {
                    return this.moveToRingSelectionPhase();
                } else {
                    return MGPValidation.SUCCESS;
                }
            case 'FINAL_CAPTURE':
                this.finalCaptures.push(capture);
                if (this.viewInfo.possibleCaptures.length === 0) {
                    return this.moveToRingSelectionPhase();
                } else {
                    return MGPValidation.SUCCESS;
                }
        }
    }
    private moveToRingSelectionPhase(coord): MGPValidation {
        this.movePhase = 'RING_SELECTION';
        return MGPValidation.SUCCESS;
    }
    private async selectRing(coord: Coord): Promise<MGPValidation> {
        // TODO
    }
    private moveToMovePhase(): MGPValidation {
        console.log('moveToMove');
        this.movePhase = 'MOVE_START';
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
        if (this.constructedState.turn < 10) {
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
            this.movePhase = 'MOVE_END';
        }
        return MGPValidation.SUCCESS;
    }
    private async selectMoveEnd(coord: Coord): Promise<MGPValidation> {
        console.log({moveEnd: coord})
        const validity: MGPValidation = this.rules.moveValidity(this.constructedState, this.moveStart.get(), coord);
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.moveEnd = MGPOptional.of(coord);
        this.constructedState = this.rules.applyMoveAndFlip(this.constructedState, this.moveStart.get(), coord);
        this.updateViewInfo();
        return this.moveToFinalCapturePhaseOrTryMove();
    }
    private async moveToFinalCapturePhaseOrTryMove(): Promise<MGPValidation> {
        console.log('moveToFinal');
        this.viewInfo.possibleCaptures = this.rules.getPossibleCaptures(this.constructedState);
        if (this.viewInfo.possibleCaptures.length === 0) {
            return this.tryMove();
        } else {
            this.movePhase = 'FINAL_CAPTURE';
        }
        return MGPValidation.SUCCESS;
    }
}
