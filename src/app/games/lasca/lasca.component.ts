import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Vector';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { LascaControlAndDominationMinimax } from './LascaControlAndDomination';
import { LascaControlMinimax } from './LascaControlMinimax';
import { LascaFailure } from './LascaFailure';
import { LascaMove } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaPiece, LascaStack, LascaState } from './LascaState';
import { LascaTutorial } from './LascaTutorial';

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
                                                             LascaStack>
{
    public readonly WIDTH_RATIO: number = 1.2;
    public readonly SLOPE_RATIO: number = 0.4;
    public readonly THICKNESS: number = 40;

    public readonly LEFT: number = 0;
    public readonly UP: number = - this.SPACE_SIZE;
    public readonly WIDTH: number = (7 * this.SPACE_SIZE) * (this.WIDTH_RATIO + this.SLOPE_RATIO);
    public readonly HEIGHT: number = (7 * this.SPACE_SIZE) + this.THICKNESS + this.STROKE_WIDTH - this.UP;
    public readonly CX: number = this.WIDTH / 2;
    public readonly CY: number = (this.HEIGHT + this.UP) / 2;

    public adaptedBoard: SpaceInfo[][] = [];

    private lastMove: MGPOptional<LascaMove> = MGPOptional.empty();
    private currentMoveClicks: Coord[] = [];
    private capturedCoords: Coord[] = [];
    private legalMoves: LascaMove[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymetricBoard = true;
        this.rules = LascaRules.get();
        this.availableMinimaxes = [
            new LascaControlMinimax('Lasca Control Minimax'),
            new LascaControlAndDominationMinimax(),
        ];
        this.encoder = LascaMove.encoder;
        this.tutorial = new LascaTutorial().tutorial;
        this.canPass = false;
        this.updateBoard();
    }
    public updateBoard(): void {
        this.lastMove = this.rules.node.move;
        const state: LascaState = this.getState();
        this.board = state.getCopiedBoard();
        this.legalMoves = LascaControlMinimax.getListMoves(this.rules.node);
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
        const square: LascaStack = state.getPieceAtXY(x, y);
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
            this.showPossibleMoves();
        }
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
        const clickedSpace: LascaStack = this.getState().getPieceAt(clickedCoord);
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
        const clickedSpace: LascaStack = this.getState().getPieceAt(clicked);
        const player: Player = this.getState().getCurrentPlayer();
        if (clickedSpace.isCommandedBy(player)) {
            this.cancelMoveAttempt();
            return this.trySelectingPiece(clicked);
        }
        if (this.currentMoveClicks.length === 1) {
            // Doing the second click, either a step or a first capture
            const delta: Vector = this.currentMoveClicks[0].getVectorToward(clicked);
            if (delta.isDiagonalOfLength(1)) {
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
        const delta: Vector = lastCoord.getVectorToward(clicked);
        if (delta.isDiagonalOfLength(2)) {
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
            return this.cancelMove(LascaFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());
        }
    }
    private applyPartialCapture(): MGPValidation {
        let partialState: LascaState = this.getState().remove(this.currentMoveClicks[0]);
        let movingStack: LascaStack = this.getState().getPieceAt(this.currentMoveClicks[0]);
        for (const captured of this.capturedCoords) {
            const previousSpace: LascaStack = this.getState().getPieceAt(captured);
            const capturedCommander: LascaPiece = previousSpace.getCommander();
            const commandedStack: LascaStack = previousSpace.getPiecesUnderCommander();
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
        const clickedSpace: LascaStack = this.getState().getPieceAt(clicked);
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
            return this.cancelMove(LascaFailure.THIS_PIECE_CANNOT_MOVE());
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
            const nextLegalLandings: Coord[] = possibleCaptures
                .map((capture: LascaMove) => capture.coords.get(1));
            for (const nextLegalLanding of nextLegalLandings) {
                this.adaptedBoard[nextLegalLanding.y][nextLegalLanding.x].squareClasses.push('capturable-fill');
            }
        }
    }
    public getCoordTransform(x: number, y: number): string {
        const WIDTH: number = this.SPACE_SIZE;
        const OFFSET: number = this.SLOPE_RATIO * this.SPACE_SIZE;
        const xBase: number = (x * this.WIDTH_RATIO * WIDTH) + ((6 - y) * OFFSET);
        const yBase: number = y * WIDTH;
        const translate: string = 'translate(' + xBase + ' ' + yBase + ')';
        return translate;
    }
    public getParallelogramPoints(): string {
        const parallelogramCoords: Coord[] = this.getParallelogramCoords();
        return parallelogramCoords
            .map((coord: Coord) => coord.x + ', ' + coord.y)
            .join(' ');
    }
    public getParallelogramCoords(): Coord[] {
        const OFFSET: number = this.SLOPE_RATIO * this.SPACE_SIZE;
        const WIDTH: number = this.SPACE_SIZE;
        const PIECE_WIDTH: number = this.WIDTH_RATIO * WIDTH;
        const x0: number = OFFSET;
        const y0: number = 0;
        const x1: number = OFFSET + PIECE_WIDTH;
        const y1: number = 0;
        const x2: number = PIECE_WIDTH;
        const y2: number = WIDTH;
        const x3: number = 0;
        const y3: number = WIDTH;
        return [
            new Coord(x0, y0),
            new Coord(x1, y1),
            new Coord(x2, y2),
            new Coord(x3, y3),
        ];
    }
    public getParallelogramCenter(): Coord {
        const parallelogramCoords: Coord[] = this.getParallelogramCoords();
        return this.getParallelogramCenterOf(
            parallelogramCoords[0],
            parallelogramCoords[1],
            parallelogramCoords[2],
            parallelogramCoords[3],
        );
    }
    /**
     * @param a coord of the parallelogram opposite to c
     * @param b coord of the parallelogram opposite to d
     * @param c coord of the parallelogram opposite to a
     * @param d coord of the parallelogram opposite to b
     * @returns the center of the parallelogram
     */
    public getParallelogramCenterOf(a: Coord, b: Coord, c: Coord, d: Coord): Coord {
        const maxX: number = Math.max(a.x, b.x, c.x, d.x);
        const maxY: number = Math.max(a.y, b.y, c.y, d.y);
        const minX: number = Math.min(a.x, b.x, c.x, d.x);
        const minY: number = Math.min(a.y, b.y, c.y, d.y);
        const x: number = (maxX - minX) / 2;
        const y: number = (maxY - minY) / 2;
        return new Coord(x, y);
    }
    public getRightEdge(): string {
        const WIDTH: number = this.SPACE_SIZE * 7 * this.WIDTH_RATIO;
        const OFFSET: number = this.SPACE_SIZE * 7 * this.SLOPE_RATIO;
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
    public getPieceTranslate(z: number): string {
        // We want the piece to be in the center of the parallelogram, here are its coords
        const parallelogramCenter: Coord = this.getParallelogramCenter();
        const cx: number = parallelogramCenter.x;
        const cy: number = parallelogramCenter.y;
        // We want to center the full piece, which is width=80, height=45, so here are it's center
        // See the define to confirm theses
        const pieceCx: number = 40;
        const pieceCy: number = (50 + 15) / 2;
        // We the need "pieceCx + offsetX" to equal "cx"
        // and "pieceCy + offsetY" to equal "cy", so :
        const offsetX: number = cx - pieceCx;
        const offsetY: number = cy - pieceCy;
        // Each piece on the Z axis will be higher, here is how much (see the define to confirm)
        const pieceHeight: number = this.SPACE_SIZE * 0.15;
        return 'translate(' + offsetX + ' ' + (offsetY - (z * pieceHeight)) + ')';
    }
}
