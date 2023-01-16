import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { LascaControlAndDominationMinimax } from './LascaControlAndDomination';
import { LascaControlMinimax } from './LascaControlMinimax';
import { LascaMove, LascaMoveFailure } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaPiece, LascaSpace, LascaState } from './LascaState';
import { LascaTutorial } from './LascaTutorial';

export class LascaComponentFailure {

    public static readonly THIS_PIECE_CANNOT_MOVE: Localized = () => $localize`This piece cannot move!`;
}

interface SpaceInfo {
    squareClasses: string[];
    pieceInfos: LascaPieceInfo[];
}
interface LascaPieceInfo {
    classes: string[];
    isOfficer: boolean;
}
@Component({
    selector: 'app-lasca',
    templateUrl: './lasca.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LascaComponent extends RectangularGameComponent<LascaRules,
                                                             LascaMove,
                                                             LascaState,
                                                             LascaSpace>
{
    public readonly WIDTH_RATIO: number = 1.2;
    public readonly DIAGONALISATION: number = 0.4;
    public readonly THICKNESS: number = 40;

    public readonly LEFT: number = 0;
    public readonly UP: number = -100;
    public readonly WIDTH: number = (7 * this.SPACE_SIZE) * (this.WIDTH_RATIO + this.DIAGONALISATION);
    public readonly HEIGHT: number = (7 * this.SPACE_SIZE) + this.THICKNESS - this.UP;
    public readonly CX: number = this.WIDTH / 2;
    public readonly CY: number = (this.HEIGHT + this.UP) / 2;

    public adaptedBoard: SpaceInfo[][] = [];
    private lastMove: MGPOptional<LascaMove> = MGPOptional.empty();
    private currentMoveClicks: Coord[] = [];
    private capturedCoords: Coord[] = [];
    private legalMoves: LascaMove[] = [];
    public LascaSpace: typeof LascaSpace = LascaSpace;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymetricBoard = true;
        this.rules = LascaRules.get();
        this.availableMinimaxes = [
            new LascaControlMinimax(this.rules, 'Control Minimax'),
            new LascaControlAndDominationMinimax(this.rules, 'Control and Domination'),
        ];
        this.encoder = LascaMove.encoder;
        this.tutorial = new LascaTutorial().tutorial;
        this.canPass = false;
        this.updateBoard();
    }
    public backgroundColor(x: number, y: number): string {
        if ((x + y) % 2 === 0) {
            return 'lightgrey';
        } else {
            return 'black';
        }
    }
    public updateBoard(): void {
        this.lastMove = this.rules.node.move;
        const state: LascaState = this.getState();
        this.board = state.getCopiedBoard();
        this.legalMoves = LascaControlMinimax.get().getListMoves(this.rules.node);
        this.updateAdaptedBoardFrom(state);
        this.showLastMove();
        this.showPossibleMoves();
        this.rotateAdaptedBoardIfNeeded();
    }
    private updateAdaptedBoardFrom(state: LascaState): void {
        this.adaptedBoard = [];
        for (let y: number = 0; y < LascaState.SIZE; y++) {
            const newRow: SpaceInfo[] = [];
            for (let x: number = 0; x < LascaState.SIZE; x++) {
                const newSpace: SpaceInfo = this.getSpaceInfo(state, x, y);
                newRow.push(newSpace);
            }
            this.adaptedBoard.push(newRow);
        }
        const lastClick: Coord = this.currentMoveClicks[this.currentMoveClicks.length - 1];
        const selectedPiece: MGPOptional<Coord> = MGPOptional.ofNullable(lastClick);
        if (selectedPiece.isPresent()) {
            const coord: Coord = selectedPiece.get();
            for (const pieceInfo of this.adaptedBoard[coord.y][coord.x].pieceInfos) {
                pieceInfo.classes.push('selected-stroke');
            }
            this.showPossibleLandings(coord, state);
        }
        for (const captured of this.capturedCoords) {
            this.adaptedBoard[captured.y][captured.x].squareClasses.push('captured-fill');
        }
        for (const moved of this.currentMoveClicks) {
            this.adaptedBoard[moved.y][moved.x].squareClasses.push('moved-fill');
        }
    }
    private getSpaceInfo(state: LascaState, x: number, y: number): SpaceInfo {
        const square: LascaSpace = state.getPieceAtXY(x, y);
        const pieceInfos: LascaPieceInfo[] = [];
        // Start by the lower piece
        for (let pieceIndex: number = square.getStackSize() - 1; pieceIndex >= 0; pieceIndex--) {
            const piece: LascaPiece = square.get(pieceIndex);
            pieceInfos.push({
                classes: [this.getPlayerClass(piece.player)],
                isOfficer: piece.isOfficer,
            });
        }
        return {
            pieceInfos,
            squareClasses: [],
        };
    }
    public showLastMove(): void {
        if (this.lastMove.isPresent()) {
            this.showLastCapture();
            this.showSteppedOnCoord();
        }
        this.showPossibleMoves();
    }
    private showLastCapture(): void {
        if (this.lastMove.get().isStep === false) {
            const jumpedOverCoord: MGPFallible<MGPSet<Coord>> = this.lastMove.get().getCapturedCoords();
            Utils.assert(jumpedOverCoord.isSuccess(), 'Last move is a capture yet has illegal jumps !?');
            for (const coord of jumpedOverCoord.get()) {
                this.adaptedBoard[coord.y][coord.x].squareClasses.push('captured-fill');
            }
        }
    }
    private showSteppedOnCoord(): void {
        const lastMove: LascaMove = this.lastMove.get();
        for (const steppedCoord of lastMove.coords) {
            this.adaptedBoard[steppedCoord.y][steppedCoord.x].squareClasses.push('moved-fill');
        }
    }
    private showPossibleMoves(): void {
        for (const validMove of this.legalMoves) {
            const startingCoord: Coord = validMove.getStartingCoord();
            this.adaptedBoard[startingCoord.y][startingCoord.x].squareClasses.push('selectable-fill');
        }
    }
    private rotateAdaptedBoardIfNeeded(): void {
        if (this.role === Player.ONE) {
            const rotatedAdaptedBoard: SpaceInfo[][] = [];
            for (let y: number = 0; y < LascaState.SIZE; y++) {
                rotatedAdaptedBoard[(LascaState.SIZE - 1) - y] = [];
                for (let x: number = 0; x < LascaState.SIZE; x++) {
                    rotatedAdaptedBoard[(LascaState.SIZE - 1) - y][(LascaState.SIZE - 1) - x] = this.adaptedBoard[y][x];
                }
            }
            this.adaptedBoard = rotatedAdaptedBoard;
        }
    }
    private hideLastMove(): void {
        this.updateAdaptedBoardFrom(this.getState());
        this.rotateAdaptedBoardIfNeeded();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        if (this.role === Player.ONE) {
            x = (LascaState.SIZE - 1) - x;
            y = (LascaState.SIZE - 1) - y;
        }
        const clickValidity: MGPValidation = this.canUserPlay('#coord_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clickedCoord);
        const opponent: Player = this.getState().getCurrentOpponent();
        if (clickedSpace.isCommandedBy(opponent)) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        if (this.currentMoveClicks.length === 0) {
            return this.trySelectingPiece(clickedCoord);
        } else {
            return this.moveClick(clickedCoord);
        }
    }
    public cancelMoveAttempt(): void {
        this.currentMoveClicks = [];
        this.capturedCoords = [];
        this.updateAdaptedBoardFrom(this.getState());
        this.showLastMove();
        this.showPossibleMoves();
        this.rotateAdaptedBoardIfNeeded();
    }
    public async moveClick(clicked: Coord): Promise<MGPValidation> {
        if (clicked.equals(this.currentMoveClicks[0])) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clicked);
        const player: Player = this.getState().getCurrentPlayer();
        if (clickedSpace.isCommandedBy(player)) {
            this.cancelMoveAttempt();
            return this.trySelectingPiece(clicked);
        }
        if (this.currentMoveClicks.length === 1) {
            // Doing the second click, either a step or a first capture
            const delta: Coord = this.currentMoveClicks[0].getVectorToward(clicked);
            if (Math.abs(delta.x) === 1 && Math.abs(delta.y) === 1) {
                // It is indeed a step
                const step: LascaMove = LascaMove.fromStep(this.currentMoveClicks[0], clicked).get();
                return this.chooseMove(step, this.getState());
            }
        }
        // Continuing to capture
        return this.capture(clicked);
    }
    private async capture(clicked: Coord): Promise<MGPValidation> {
        const numberOfClicks: number = this.currentMoveClicks.length;
        const lastCoord: Coord = this.currentMoveClicks[numberOfClicks - 1];
        const delta: Coord = lastCoord.getVectorToward(clicked);
        if (Math.abs(delta.x) === 2 && Math.abs(delta.y) === 2) {
            const captured: Coord = new Coord(lastCoord.x + (delta.x / 2), lastCoord.y + (delta.y / 2));
            this.capturedCoords.push(captured);
            this.currentMoveClicks.push(clicked);
            const currentMove: LascaMove = LascaMove.fromCapture(this.currentMoveClicks).get();
            if (this.legalMoves.some((capture: LascaMove) => capture.isPrefix(currentMove))) {
                return this.applyPartialCapture();
            } else {
                return this.chooseMove(currentMove, this.getState());
            }
        } else {
            return this.cancelMove(LascaMoveFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());
        }
    }
    private applyPartialCapture(): MGPValidation {
        let partialState: LascaState = this.getState().remove(this.currentMoveClicks[0]);
        let movingStack: LascaSpace = this.getState().getPieceAt(this.currentMoveClicks[0]);
        for (const captured of this.capturedCoords) {
            const previousSpace: LascaSpace = this.getState().getPieceAt(captured);
            const capturedCommander: LascaPiece = previousSpace.getCommander();
            const commandedStack: LascaSpace = previousSpace.getPiecesUnderCommander();
            partialState = partialState.set(captured, commandedStack);
            movingStack = movingStack.capturePiece(capturedCommander);
        }
        const landing: Coord = this.currentMoveClicks[this.currentMoveClicks.length - 1];
        partialState = partialState.set(landing, movingStack);
        this.updateAdaptedBoardFrom(partialState);
        this.rotateAdaptedBoardIfNeeded();
        return MGPValidation.SUCCESS;
    }
    private async trySelectingPiece(clicked: Coord): Promise<MGPValidation> {
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clicked);
        if (clickedSpace.isEmpty()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else {
            return this.selectPiece(clicked);
        }
    }
    private selectPiece(coord: Coord): MGPValidation {
        this.capturedCoords = [];
        if (this.legalMoves.some((move: LascaMove) => move.getStartingCoord().equals(coord))) {
            this.currentMoveClicks = [coord];
            this.hideLastMove();
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(LascaComponentFailure.THIS_PIECE_CANNOT_MOVE());
        }
    }
    private showPossibleLandings(coord: Coord, state: LascaState): void {
        const possibleCaptures: LascaMove[] = this.rules.getPieceCaptures(state, coord);
        if (possibleCaptures.length === 0) {
            const possibleSteps: LascaMove[] = this.rules.getPieceSteps(state, coord);
            for (const possibleStep of possibleSteps) {
                const landingY: number = possibleStep.getEndingCoord().y;
                const landingX: number = possibleStep.getEndingCoord().x;
                this.adaptedBoard[landingY][landingX].squareClasses.push('selectable-fill');
            }
        } else {
            const currentLocation: number = 1;
            const nextLegalLandings: Coord[] = possibleCaptures
                .map((capture: LascaMove) => capture.getCoord(currentLocation))
                .filter((capture: MGPFallible<Coord>) => capture.isSuccess())
                .map((capture: MGPFallible<Coord>) => capture.get());
            for (const nextLegalLanding of nextLegalLandings) {
                this.adaptedBoard[nextLegalLanding.y][nextLegalLanding.x].squareClasses.push('capturable-fill');
            }
        }
    }
    public getCoordTransform(x: number, y: number): string {
        const WIDTH: number = this.SPACE_SIZE;
        const OFFSET: number = this.DIAGONALISATION * this.SPACE_SIZE;
        const xBase: number = (x * this.WIDTH_RATIO * WIDTH) + ((6 - y) * OFFSET);
        const yBase: number = y * WIDTH;
        const translate: string = 'translate(' + xBase + ' ' + yBase + ')';
        return translate;
    }
    public getRhombusPoints(): string {
        const OFFSET: number = this.DIAGONALISATION * this.SPACE_SIZE;
        const WIDTH: number = this.SPACE_SIZE;
        const x0: number = OFFSET;
        const y0: number = 0;
        const x1: number = OFFSET + (this.WIDTH_RATIO * WIDTH);
        const y1: number = 0;
        const x2: number = (this.WIDTH_RATIO * WIDTH);
        const y2: number = WIDTH;
        const x3: number = 0;
        const y3: number = WIDTH;
        return [x0, y0, x1, y1, x2, y2, x3, y3].join(' ');
    }
    public getBoardThicknessDecorationDiagonalPoints(): string {
        const WIDTH: number = this.SPACE_SIZE * 7 * this.WIDTH_RATIO;
        const OFFSET: number = this.SPACE_SIZE * 7 * this.DIAGONALISATION;
        const x0: number = OFFSET + WIDTH;
        const y0: number = 0;
        const x1: number = OFFSET + WIDTH;
        const y1: number = this.THICKNESS;
        const x2: number = WIDTH;
        const y2: number = 700 + this.THICKNESS;
        const x3: number = WIDTH;
        const y3: number = 700;
        return [x0, y0, x1, y1, x2, y2, x3, y3].join(' ');
    }
    public getTransform(z: number): string {
        return 'translate(0 ' + (0 - (z * 15)) + ')';
    }
}
