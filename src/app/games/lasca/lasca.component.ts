import { Component } from '@angular/core';
import { ModeConfig, ParallelogramGameComponent } from 'src/app/components/game-components/parallelogram-game-component/ParallelogramGameComponent';
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
import { LascaFailure } from './LascaFailure';
import { LascaMove } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaPiece, LascaStack, LascaState } from './LascaState';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { LascaControlHeuristic } from './LascaControlHeuristic';
import { LascaMoveGenerator } from './LascaMoveGenerator';
import { LascaControlPlusDominationHeuristic } from './LascaControlAndDominationHeuristic';

interface SpaceInfo {
    x: number;
    y: number;
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
export class LascaComponent extends ParallelogramGameComponent<LascaRules,
                                                               LascaMove,
                                                               LascaState,
                                                               LascaStack>
{
    public readonly THICKNESS: number = 40;
    public readonly mode: ModeConfig = {
        horizontalWidthRatio: 1.2,
        offsetRatio: 0.4,
        pieceHeightRatio: 1,
        parallelogramHeight: 100,
        abstractBoardSize: LascaState.SIZE,
    };

    public readonly LEFT: number = 0;
    public readonly UP: number = - this.SPACE_SIZE;
    public readonly basicWidth: number = this.mode.abstractBoardSize * this.mode.parallelogramHeight;
    public readonly WIDTH: number = this.basicWidth * (this.mode.horizontalWidthRatio + this.mode.offsetRatio);
    public readonly HEIGHT: number = this.basicWidth + this.THICKNESS + this.STROKE_WIDTH - this.UP;
    public readonly CX: number = this.WIDTH / 2;
    public readonly CY: number = (this.HEIGHT + this.UP) / 2;

    public adaptedBoard: { isAlreadySwitched: boolean, spaceInfo: SpaceInfo[][] } = {
        isAlreadySwitched: false,
        spaceInfo: [],
    };
    private currentMoveClicks: Coord[] = [];
    private capturedCoords: Coord[] = []; // Only the coords capture by active player during this turn
    private legalMoves: LascaMove[] = [];
    private readonly moveGenerator: LascaMoveGenerator = new LascaMoveGenerator();

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('Lasca');
        this.availableAIs = [
            new Minimax($localize`Control`, this.rules, new LascaControlHeuristic(), this.moveGenerator),
            new Minimax($localize`Control and Domination`,
                        this.rules,
                        new LascaControlPlusDominationHeuristic(),
                        this.moveGenerator),
            new MCTS($localize`MCTS`, this.moveGenerator, this.rules),
        ];
        this.encoder = LascaMove.encoder;
        this.hasAsymmetricBoard = true;
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: LascaState = this.getState();
        this.board = state.getCopiedBoard();
        this.legalMoves = this.moveGenerator.getListMoves(this.node, this.config);
        this.createAdaptedBoardFrom(state);
        this.showPossibleMoves();
        this.rotateAdaptedBoardIfNeeded();
    }

    private createAdaptedBoardFrom(state: LascaState): void {
        this.adaptedBoard = {
            isAlreadySwitched: false,
            spaceInfo: [],
        };
        for (let y: number = 0; y < LascaState.SIZE; y++) {
            const newRow: SpaceInfo[] = [];
            for (let x: number = 0; x < LascaState.SIZE; x++) {
                const newSpace: SpaceInfo = this.getSpaceInfo(state, x, y);
                newRow.push(newSpace);
            }
            this.adaptedBoard.spaceInfo.push(newRow);
        }
        const lastClick: Coord = this.currentMoveClicks[this.currentMoveClicks.length - 1];
        const selectedPiece: MGPOptional<Coord> = MGPOptional.ofNullable(lastClick);
        if (selectedPiece.isPresent()) {
            const coord: Coord = selectedPiece.get();
            for (const pieceInfo of this.getSpaceInfoAt(coord).pieceInfos) {
                pieceInfo.classes.push('selected-stroke');
            }
            this.showPossibleLandings(coord, state);
        }
        for (const captured of this.capturedCoords) {
            this.getSpaceInfoAt(captured).squareClasses.push('captured-fill');
        }
        for (const moved of this.currentMoveClicks) {
            this.getSpaceInfoAt(moved).squareClasses.push('moved-fill');
        }
    }

    private getSpaceInfo(state: LascaState, x: number, y: number): SpaceInfo {
        const square: LascaStack = state.getPieceAtXY(x, y);
        const pieceInfos: LascaPieceInfo[] = [];
        // Start by the lower piece
        for (let pieceIndex: number = square.getStackSize() - 1; 0 <= pieceIndex; pieceIndex--) {
            const piece: LascaPiece = square.get(pieceIndex);
            pieceInfos.push({
                classes: [this.getPlayerClass(piece.player)],
                isOfficer: piece.isOfficer,
            });
        }
        return {
            pieceInfos,
            x,
            y,
            squareClasses: [],
        };
    }

    public override async showLastMove(move: LascaMove): Promise<void> {
        this.showLastCapture(move);
        this.showSteppedOnCoord(move);
    }

    private showLastCapture(move: LascaMove): void {
        if (move.isStep === false) {
            const jumpedOverCoord: MGPFallible<MGPSet<Coord>> = move.getCapturedCoords();
            Utils.assert(jumpedOverCoord.isSuccess(), 'Last move is a capture yet has illegal jumps !?');
            for (const coord of jumpedOverCoord.get()) {
                this.getSpaceInfoAt(coord).squareClasses.push('captured-fill');
            }
        }
    }

    private showSteppedOnCoord(move: LascaMove): void {
        for (const steppedCoord of move.coords) {
            this.getSpaceInfoAt(steppedCoord).squareClasses.push('moved-fill');
        }
    }

    private showPossibleMoves(): void {
        if (this.interactive) {
            for (const validMove of this.legalMoves) {
                const startingCoord: Coord = validMove.getStartingCoord();
                this.getSpaceInfoAt(startingCoord).squareClasses.push('selectable-fill');
            }
        }
    }

    private getSpaceInfoAt(unadapedCoord: Coord): SpaceInfo {
        // Adapt the coord if needed so we don't affect the "centrally symmetrical" coord to this one
        if (this.getPointOfView() === Player.ONE && this.adaptedBoard.isAlreadySwitched) {
            const max: number = LascaState.SIZE - 1;
            const adaptedCoord: Coord = new Coord(max - unadapedCoord.x, max - unadapedCoord.y);
            return this.adaptedBoard.spaceInfo[adaptedCoord.y][adaptedCoord.x];
        } else {
            return this.adaptedBoard.spaceInfo[unadapedCoord.y][unadapedCoord.x];
        }
    }

    private rotateAdaptedBoardIfNeeded(): void {
        if (this.getPointOfView() === Player.ONE) {
            const rotatedAdaptedBoard: SpaceInfo[][] = [];
            for (let y: number = 0; y < LascaState.SIZE; y++) {
                rotatedAdaptedBoard[(LascaState.SIZE - 1) - y] = [];
                for (let x: number = 0; x < LascaState.SIZE; x++) {
                    const rx: number = (LascaState.SIZE - 1) - x;
                    const ry: number = (LascaState.SIZE - 1) - y;
                    rotatedAdaptedBoard[ry][rx] = this.getSpaceInfoAt(new Coord(x, y));
                }
            }
            this.adaptedBoard = {
                isAlreadySwitched: true,
                spaceInfo: rotatedAdaptedBoard,
            };
        }
    }

    public override hideLastMove(): void {
        this.createAdaptedBoardFrom(this.getState());
        this.rotateAdaptedBoardIfNeeded();
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#coord_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        const clickedSpace: LascaStack = this.getState().getPieceAt(clickedCoord);
        const opponent: Player = this.getState().getCurrentOpponent();
        if (clickedSpace.isCommandedBy(opponent)) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        if (this.currentMoveClicks.length === 0) {
            return this.trySelectingPiece(clickedCoord);
        } else {
            return this.moveClick(clickedCoord);
        }
    }

    public override cancelMoveAttempt(): void {
        this.currentMoveClicks = [];
        this.capturedCoords = [];
        this.createAdaptedBoardFrom(this.getState());
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
                return this.chooseMove(step);
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
                return this.chooseMove(currentMove);
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
        this.createAdaptedBoardFrom(partialState);
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

    private async selectPiece(coord: Coord): Promise<MGPValidation> {
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
                this.getSpaceInfoAt(possibleStep.getEndingCoord()).squareClasses.push('selectable-fill');
            }
        } else {
            const nextLegalLandings: Coord[] = possibleCaptures
                .map((capture: LascaMove) => capture.coords.get(1));
            for (const nextLegalLanding of nextLegalLandings) {
                this.getSpaceInfoAt(nextLegalLanding).squareClasses.push('capturable-fill');
            }
        }
    }

    public getTranslationAtXYZ(x: number, y: number, z: number): string {
        const coordTransform: Coord = this.getCoordTranslation(x, y, z, this.mode);
        const translation: string = 'translate(' + coordTransform.x + ' ' + coordTransform.y + ')';
        return translation;
    }

    public getParallelogramPoints(): string {
        const parallelogramCoords: Coord[] = this.getParallelogramCoordsForLasca();
        return parallelogramCoords
            .map((coord: Coord) => coord.x + ', ' + coord.y)
            .join(' ');
    }

    public getParallelogramCoordsForLasca(): Coord[] {
        return this.getParallelogramCoords(this.mode);
    }

    public getParallelogramCenter(): Coord {
        const parallelogramCoords: Coord[] = this.getParallelogramCoordsForLasca();
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
        const WIDTH: number = this.basicWidth * this.mode.horizontalWidthRatio;
        const OFFSET: number = this.basicWidth * this.mode.offsetRatio;
        const x0: number = OFFSET + WIDTH;
        const y0: number = 0;
        const x1: number = OFFSET + WIDTH;
        const y1: number = this.THICKNESS;
        const x2: number = WIDTH;
        const y2: number = this.basicWidth + this.THICKNESS;
        const x3: number = WIDTH;
        const y3: number = this.basicWidth;
        return [x0, y0, x1, y1, x2, y2, x3, y3].join(' ');
    }

    public getPieceTranslation(z: number): string {
        // We want the piece to be in the center of the parallelogram, here are its coords
        const parallelogramCenter: Coord = this.getParallelogramCenter();
        const cy: number = parallelogramCenter.y;
        // We want to center the full piece, which is width=80, height=45, so here are it's center
        // See the define to confirm these
        const pieceCy: number = (50 + 15) / 2;
        // We the need "pieceCx + offsetX" to equal "cx"
        // and "pieceCy + offsetY" to equal "cy", so :
        const offsetY: number = cy - pieceCy;
        // Each piece on the Z axis will be higher, here is how much (see the define to confirm)
        const pieceHeight: number = this.SPACE_SIZE * 0.15;
        return 'translate(' + 0 + ' ' + (offsetY - (z * pieceHeight)) + ')';
    }

}
