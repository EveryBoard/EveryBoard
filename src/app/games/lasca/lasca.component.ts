import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
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
import { LascaMove, LascaMoveFailure } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaPiece, LascaSpace, LascaState } from './LascaState';
import { LascaTutorial } from './LascaTutorial';

class SpaceInfo {
    spaceClasses: string[];
    pieceInfos: LascaPieceInfo[];
}
class LascaPieceInfo {
    classes: string[];
    isOfficer: boolean;
}
@Component({
    selector: 'app-lasca', // Juneau why !
    templateUrl: './lasca.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LascaComponent extends RectangularGameComponent<LascaRules,
                                                             LascaMove,
                                                             LascaState,
                                                             LascaSpace>
{
    public readonly HORIZONTAL_WIDTH_RATIO: number = 1.2;
    public readonly DIAGONALISATION: number = 0.4;
    public readonly EPAISSEUR: number = 40;

    public readonly LEFT: number = 0;
    public readonly UP: number = -100;
    public readonly WIDTH: number = (7 * this.SPACE_SIZE) * (this.HORIZONTAL_WIDTH_RATIO + this.DIAGONALISATION);
    public readonly HEIGHT: number = (7 * this.SPACE_SIZE) + this.EPAISSEUR - this.UP;
    public readonly CX: number = this.WIDTH / 2;
    public readonly CY: number = (this.HEIGHT + this.UP) / 2;

    public adaptedBoard: SpaceInfo[][] = [];
    private lastMove: MGPOptional<LascaMove> = MGPOptional.empty();
    private validClicks: Coord[] = [];
    private captureds: Coord[] = [];
    private validCaptures: LascaMove[] = [];
    private validSteps: LascaMove[] = [];
    public LascaSpace: typeof LascaSpace = LascaSpace;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymetricBoard = true;
        this.rules = new LascaRules(LascaState);
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
        this.validCaptures = LascaRules.getCaptures(state);
        this.validSteps = LascaRules.getSteps(state);
        this.updateAdaptedBoardFrom(state);
        this.showLastMove();
        this.showPossiblesMoves();
        this.rotateAdaptedBoard();
    }
    private updateAdaptedBoardFrom(state: LascaState): void {
        this.adaptedBoard = [];
        for (let y: number = 0; y < 7; y++) {
            const newRow: SpaceInfo[] = [];
            for (let x: number = 0; x < 7; x++) {
                const newSpace: SpaceInfo = this.getSpaceInfo(state, x, y);
                newRow.push(newSpace);
            }
            this.adaptedBoard.push(newRow);
        }
        const selectedPiece: MGPOptional<Coord> = MGPOptional.ofNullable(this.validClicks[this.validClicks.length - 1]);
        if (selectedPiece.isPresent()) {
            const coord: Coord = selectedPiece.get();
            for (const pieceInfo of this.adaptedBoard[coord.y][coord.x].pieceInfos) {
                pieceInfo.classes.push('selected-stroke');
            }
            this.showPossibleLandings(coord, state);
        }
        for (const captured of this.captureds) {
            this.adaptedBoard[captured.y][captured.x].spaceClasses.push('captured-fill');
        }
        for (const moved of this.validClicks) {
            this.adaptedBoard[moved.y][moved.x].spaceClasses.push('moved-fill');
        }
    }
    private getSpaceInfo(state: LascaState, x: number, y: number): SpaceInfo {
        const space: LascaSpace = state.getPieceAtXY(x, y);
        const pieceInfos: LascaPieceInfo[] = [];
        let pieceIndex: number = space.getPileSize() - 1; // Start by the lower piece
        while (pieceIndex >= 0) {
            const piece: LascaPiece = space.get(pieceIndex);
            pieceInfos.push({
                classes: [this.getPlayerClass(piece.player)],
                isOfficer: piece.isOfficer,
            });
            pieceIndex--;
        }
        return {
            pieceInfos,
            spaceClasses: [],
        };
    }
    public showLastMove(): void {
        this.showLastCapture();
        this.showSteppedOnCoord();
        this.showPossiblesMoves();
    }
    private showLastCapture(): void {
        if (this.lastMove.isAbsent()) {
            return;
        }
        if (this.lastMove.get().isStep === false) {
            const jumpedOverCoord: MGPFallible<MGPSet<Coord>> = this.lastMove.get().getCapturedCoords();
            Utils.assert(jumpedOverCoord.isSuccess(), 'Last move is a capture yet has illegal jumps !?');
            const coords: Coord[] = jumpedOverCoord.get().toList();
            for (const coord of coords) {
                this.adaptedBoard[coord.y][coord.x].spaceClasses.push('captured-fill');
            }
        }
    }
    private showSteppedOnCoord(): void {
        if (this.lastMove.isPresent()) {
            const lastMove: LascaMove = this.lastMove.get();
            const steppedCoords: Coord[] = lastMove.getCoordsCopy();
            for (const steppedCoord of steppedCoords) {
                this.adaptedBoard[steppedCoord.y][steppedCoord.x].spaceClasses.push('moved-fill');
            }
        } else {
            return;
        }
    }
    private showPossiblesMoves(): void {
        let possiblesMoves: LascaMove[] = [];
        if (this.validCaptures.length > 0) {
            possiblesMoves = this.validCaptures;
        } else {
            possiblesMoves = this.validSteps;
        }
        for (const validMove of possiblesMoves) {
            const startingCoord: Coord = validMove.getStartingCoord();
            this.adaptedBoard[startingCoord.y][startingCoord.x].spaceClasses.push('selectable-fill');
        }
    }
    private rotateAdaptedBoard(): void {
        if (this.role === Player.ONE) {
            const rotatedAdaptedBoard: SpaceInfo[][] = [];
            for (let y: number = 0; y < 7; y++) {
                rotatedAdaptedBoard[6 - y] = [];
                for (let x: number = 0; x < 7; x++) {
                    rotatedAdaptedBoard[6 - y][6 - x] = this.adaptedBoard[y][x];
                }
            }
            this.adaptedBoard = rotatedAdaptedBoard;
        }
    }
    private hideLastMove(): void {
        this.updateAdaptedBoardFrom(this.getState());
        this.rotateAdaptedBoard();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        if (this.role === Player.ONE) {
            x = 6 - x;
            y = 6 - y;
        }
        const clickValidity: MGPValidation = this.canUserPlay('#space_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clickedCoord);
        const opponent: Player = this.getState().getCurrentOpponent();
        if (clickedSpace.isCommandedBy(opponent)) {
            return this.cancelMove(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        if (this.validClicks.length === 0) {
            return this.trySelectingPiece(clickedCoord);
        } else {
            return this.moveClick(clickedCoord);
        }
    }
    public cancelMoveAttempt(): void {
        this.validClicks = [];
        this.captureds = [];
        this.updateAdaptedBoardFrom(this.getState());
        this.rotateAdaptedBoard();
    }
    public async moveClick(clicked: Coord): Promise<MGPValidation> {
        if (clicked.equals(this.validClicks[0])) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clicked);
        const player: Player = this.getState().getCurrentPlayer();
        if (clickedSpace.isCommandedBy(player)) {
            this.cancelMoveAttempt();
            return this.trySelectingPiece(clicked);
        }
        if (this.validClicks.length === 1) {
            // Doing the second click, either a step or a first capture
            const delta: Coord = this.validClicks[0].getVectorToward(clicked);
            if (Math.abs(delta.x) === 1 && Math.abs(delta.y) === 1) {
                // It is indeed a step
                const step: LascaMove = LascaMove.fromStep(this.validClicks[0], clicked).get();
                return this.chooseMove(step, this.getState());
            }
        }
        // Continuing to capture
        return this.capture(clicked);
    }
    private async capture(clicked: Coord): Promise<MGPValidation> {
        const numberOfClicks: number = this.validClicks.length;
        const lastCoord: Coord = this.validClicks[numberOfClicks - 1];
        const delta: Coord = lastCoord.getVectorToward(clicked);
        if (Math.abs(delta.x) === 2 && Math.abs(delta.y) === 2) {
            const captured: Coord = new Coord(lastCoord.x + (delta.x / 2), lastCoord.y + (delta.y / 2));
            this.captureds.push(captured);
            this.validClicks.push(clicked);
            const currentMove: LascaMove = LascaMove.fromCapture(this.validClicks).get();
            if (this.validCaptures.some((capture: LascaMove) => capture.getRelation(currentMove) === 'PREFIX')) {
                return this.applyPartialCapture();
            } else {
                return this.chooseMove(currentMove, this.getState());
            }
        } else {
            return this.cancelMove(LascaMoveFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());
        }
    }
    private applyPartialCapture(): MGPValidation {
        let partialState: LascaState = this.getState().remove(this.validClicks[0]);
        let movingPile: LascaSpace = this.getState().getPieceAt(this.validClicks[0]);
        for (const captured of this.captureds) {
            const previousSpace: LascaSpace = this.getState().getPieceAt(captured);
            const capturedCommander: LascaPiece = previousSpace.getCommander();
            const commandedPile: LascaSpace = previousSpace.getCommandedPile();
            partialState = partialState.set(captured, commandedPile);
            movingPile = movingPile.capturePiece(capturedCommander);
        }
        const landing: Coord = this.validClicks[this.validClicks.length - 1];
        partialState = partialState.set(landing, movingPile);
        this.updateAdaptedBoardFrom(partialState);
        this.rotateAdaptedBoard();
        return MGPValidation.SUCCESS;
    }
    private async trySelectingPiece(clicked: Coord): Promise<MGPValidation> {
        const clickedSpace: LascaSpace = this.getState().getPieceAt(clicked);
        if (clickedSpace.isEmpty()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        } else {
            this.selectPiece(clicked);
            return MGPValidation.SUCCESS;
        }
    }
    private selectPiece(coord: Coord): void {
        this.captureds = [];
        this.validClicks = [coord];
        this.hideLastMove();
    }
    private showPossibleLandings(coord: Coord, state: LascaState): void {
        const possibleCaptures: LascaMove[] = LascaRules.getPieceCaptures(state, coord);
        const currentLocation: number = 1;
        const nextLegalLandings: Coord[] = possibleCaptures
            .map((capture: LascaMove) => capture.getCoord(currentLocation))
            .filter((capture: MGPFallible<Coord>) => capture.isSuccess())
            .map((capture: MGPFallible<Coord>) => capture.get());
        for (const nextLegalLanding of nextLegalLandings) {
            this.adaptedBoard[nextLegalLanding.y][nextLegalLanding.x].spaceClasses.push('capturable-fill');
        }
    }
    public getCoordTransform(x: number, y: number): string {
        const WIDTH: number = this.SPACE_SIZE;
        const OFFSET: number = this.DIAGONALISATION * this.SPACE_SIZE;
        const xBase: number = (x * this.HORIZONTAL_WIDTH_RATIO * WIDTH) + ((6 - y) * OFFSET);
        const yBase: number = y * WIDTH;
        const translate: string = 'translate(' + xBase + ' ' + yBase + ')';
        return translate;
    }
    public getRhombusPoints(): string {
        // Rhombos coord ?
        const OFFSET: number = this.DIAGONALISATION * this.SPACE_SIZE;
        const WIDTH: number = this.SPACE_SIZE;
        const x0: number = OFFSET;
        const y0: number = 0;
        const x1: number = OFFSET + (this.HORIZONTAL_WIDTH_RATIO * WIDTH);
        const y1: number = 0;
        const x2: number = (this.HORIZONTAL_WIDTH_RATIO * WIDTH);
        const y2: number = WIDTH;
        const x3: number = 0;
        const y3: number = WIDTH;
        return [x0, y0, x1, y1, x2, y2, x3, y3].join(' ');
    }
    public getDiagonalVolumeLanPoints(): string {
        const WIDTH: number = this.SPACE_SIZE * 7 * this.HORIZONTAL_WIDTH_RATIO;
        const OFFSET: number = this.SPACE_SIZE * 7 * this.DIAGONALISATION;
        const x0: number = OFFSET + WIDTH;
        const y0: number = 0;
        const x1: number = OFFSET + WIDTH;
        const y1: number = this.EPAISSEUR;
        const x2: number = WIDTH;
        const y2: number = 700 + this.EPAISSEUR;
        const x3: number = WIDTH;
        const y3: number = 700;
        return [x0, y0, x1, y1, x2, y2, x3, y3].join(' ');
    }
}
