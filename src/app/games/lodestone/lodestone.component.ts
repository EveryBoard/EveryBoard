import { Component, OnInit } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Vector } from 'src/app/jscaip/Vector';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { LodestoneDummyMinimax } from './LodestoneDummyMinimax';
import { LodestoneFailure } from './LodestoneFailure';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneOrientation, LodestoneDirection, LodestonePiece, LodestonePieceNone, LodestonePieceLodestone, LodestoneDescription } from './LodestonePiece';
import { LodestoneInfos, PressurePlatePositionInformation, LodestoneRules, PressurePlateViewPosition } from './LodestoneRules';
import { LodestonePositions, LodestonePressurePlate, LodestonePressurePlatePosition, LodestonePressurePlates, LodestoneState } from './LodestoneState';
import { LodestoneTutorial } from './LodestoneTutorial';

interface LodestoneInfo {
    direction: LodestoneDirection,
    pieceClasses: string[],
    selectedClass: string,
    movingClass: string,
    orientation: LodestoneOrientation,
}

interface PressurePlateInfo {
    position: LodestonePressurePlatePosition,
    coords: PressurePlateCoordInfo[],
}

interface PressurePlateCoordInfo {
    coord: Coord,
    hasPiece: boolean,
    pieceClasses: string[],
    squareClasses: string[],
    temporary: boolean,
}

interface CaptureInfo {
    pieceClasses: string[],
}

interface ViewInfo {
    boardInfo: SquareInfo[][],
    availableLodestones: LodestoneInfo[],
    capturesToPlace: CaptureInfo[],
    pressurePlates: PressurePlateInfo[],
    currentPlayerClass: string,
    opponentClass: string,
    selected: MGPOptional<Coord>,
    pressurePlateShift: Record<LodestonePressurePlatePosition, Vector>;
}

interface SquareInfo {
    coord: Coord,
    squareClasses: string[],
    crumbled: boolean,
    hasPiece: boolean,
    pieceClasses: string[],
    lodestone?: LodestoneInfo,
}

@Component({
    selector: 'app-lodestone',
    templateUrl: './lodestone.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LodestoneComponent
    extends GameComponent<LodestoneRules, LodestoneMove, LodestoneState, LodestoneInfos>
    implements OnInit
{
    private static readonly PRESSURE_PLATE_EXTRA_SHIFT: number = 0.2;

    private static readonly PRESSURE_PLATES_POSITIONS: PressurePlatePositionInformation = MGPMap.from({
        top: {
            startForBigPlate: new Coord(0.5, -1 - LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT),
            startForSmallPlate: new Coord(1.5, 0 - LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT),
            direction: Direction.RIGHT,
        },
        bottom: {
            startForBigPlate: new Coord(0.5, 8 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT),
            startForSmallPlate: new Coord(1.5, 7 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT),
            direction: Direction.RIGHT,
        },
        left: {
            startForBigPlate: new Coord(-1 - LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT, 0.5),
            startForSmallPlate: new Coord(0 - LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT, 1.5),
            direction: Direction.DOWN,
        },
        right: {
            startForBigPlate: new Coord(8 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT, 0.5),
            startForSmallPlate: new Coord(7 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT, 1.5),
            direction: Direction.DOWN,
        },
    });

    public PIECE_RADIUS: number;
    public TRIANGLE_OUT: string;
    public TRIANGLE_IN: string;
    public viewInfo: ViewInfo = {
        availableLodestones: [],
        capturesToPlace: [],
        boardInfo: [],
        currentPlayerClass: '',
        opponentClass: '',
        pressurePlates: [],
        selected: MGPOptional.empty(),
        pressurePlateShift: {
            top: new Vector(0, 0),
            left: new Vector(0, 0),
            right: new Vector(0, 0),
            bottom: new Vector(0, 0),
        },
    };

    private displayedState: LodestoneState;
    private stateAfterPlacingLodestone: MGPOptional<LodestoneState> = MGPOptional.empty();
    private lastInfos: MGPOptional<LodestoneInfos> = MGPOptional.empty();
    private capturesToPlace: number = 0;
    private selectedCoord: MGPOptional<Coord> = MGPOptional.empty();
    private selectedLodestone: MGPOptional<LodestonePieceLodestone> = MGPOptional.empty();
    private captures: LodestoneCaptures = { top: 0, bottom: 0, left: 0, right: 0 };

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = LodestoneRules.get();
        this.tutorial = new LodestoneTutorial().tutorial;
        this.availableMinimaxes = [
            new LodestoneDummyMinimax(this.rules, 'LodestoneDummyMinimax'),
        ];
        this.encoder = LodestoneMove.encoder;
        this.PIECE_RADIUS = (this.SPACE_SIZE - (2 * this.STROKE_WIDTH)) * 0.5;
        const radius80: number = this.PIECE_RADIUS * 0.8;
        const radius30: number = this.PIECE_RADIUS * 0.3;
        const radius20: number = this.PIECE_RADIUS * 0.2;
        this.TRIANGLE_OUT = `${radius80},0 ${radius30},${radius20} ${radius30},-${radius20}`;
        this.TRIANGLE_IN = `${radius30},0 ${radius80},${radius30} ${radius80},-${radius30}`;
        this.displayedState = this.getState();
        this.scores = MGPOptional.of([0, 0]);
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
    public async selectCoord(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#square_' + coord.x + '_' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        if (this.capturesToPlace > 0) {
            return this.cancelMove(LodestoneFailure.MUST_PLACE_CAPTURES());
        }

        const targetValidity: MGPValidation = LodestoneRules.get().isTargetLegal(this.getState(), coord);
        if (targetValidity.isFailure()) {
            return this.cancelMove(targetValidity.getReason());
        }
        if (this.selectedCoord.equalsValue(coord)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        this.selectedCoord = MGPOptional.of(coord);
        if (this.selectedLodestone.isPresent()) {
            return this.putLodestone();
        } else {
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        }
    }
    public async selectLodestone(lodestone: LodestoneDescription): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#lodestone_' + lodestone.direction + '_' + lodestone.orientation);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        assert(this.capturesToPlace === 0, 'should not be able to click on a lodestone when captures need to be placed');

        const player: Player = this.getCurrentPlayer();
        const playerLodestone: LodestonePieceLodestone = LodestonePieceLodestone.of(player, lodestone);
        if (this.selectedLodestone.equalsValue(playerLodestone)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        this.selectedLodestone = MGPOptional.of(playerLodestone);
        if (this.selectedCoord.isPresent()) {
            return this.putLodestone();
        } else {
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        }
    }
    private async putLodestone(): Promise<MGPValidation> {
        assert(this.selectedCoord.isPresent(), 'coord should have been selected');
        assert(this.selectedLodestone.isPresent(), 'lodestone should have been selected');
        const coord: Coord = this.selectedCoord.get();
        const lodestone: LodestoneDescription = this.selectedLodestone.get();
        const state: LodestoneState = this.getState();
        const validity: MGPValidation = LodestoneRules.get().isLegalWithoutCaptures(state, coord, lodestone.direction);
        assert(validity.isSuccess(), 'Lodestone component should only allow creation of legal moves');
        const infos: LodestoneInfos = LodestoneRules.get().applyMoveWithoutPlacingCaptures(state, coord, lodestone);
        this.lastInfos = MGPOptional.of(infos);
        this.capturesToPlace = Math.min(infos.captures.length, state.remainingSpaces());
        if (this.capturesToPlace === 0) {
            return this.applyMove();
        } else {
            this.displayedState = this.displayedState.withBoard(infos.board);
            this.stateAfterPlacingLodestone = MGPOptional.of(this.displayedState);
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        }
    }
    private async applyMove(): Promise<MGPValidation> {
        assert(this.selectedCoord.isPresent(), 'coord should have been selected');
        assert(this.selectedLodestone.isPresent(), 'lodestone should have been selected');
        const coord: Coord = this.selectedCoord.get();
        const lodestone: LodestoneDescription = this.selectedLodestone.get();
        const move: LodestoneMove = new LodestoneMove(coord, lodestone.direction, lodestone.orientation, this.captures);
        return this.chooseMove(move, this.getState());
    }
    public onPressurePlateClick(temporary: boolean, position: LodestonePressurePlatePosition, index: number)
    : Promise<MGPValidation> {
        if (temporary) {
            return this.deselectPressurePlate(position, index);
        } else {
            return this.selectPressurePlate(position, index);
        }
    }
    private async selectPressurePlate(position: LodestonePressurePlatePosition, index: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#plate_' + position + '_' + index);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        if (this.capturesToPlace === 0) {
            return this.cancelMove(LodestoneFailure.NO_CAPTURES_TO_PLACE_YET());
        }

        this.capturesToPlace--;
        this.captures[position]++;
        const state: LodestoneState = this.stateAfterPlacingLodestone.get();
        const opponent: Player = this.getCurrentPlayer().getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const pressurePlates: LodestonePressurePlates = { ...state.pressurePlates };
        const lodestones: LodestonePositions = state.lodestones.getCopy();
        LodestoneRules.get().updatePressurePlates(board, pressurePlates, lodestones, opponent, this.captures);
        this.displayedState = new LodestoneState(board, state.turn, lodestones, pressurePlates);

        if (this.capturesToPlace === 0) {
            return this.applyMove();
        } else {
            this.updateViewInfo();
            this.showPressurePlateDifferences(this.getState(), this.displayedState, true);
        }
        return MGPValidation.SUCCESS;
    }
    public async deselectPressurePlate(position: LodestonePressurePlatePosition, index: number)
    : Promise<MGPValidation>
    {
        const clickValidity: MGPValidation = this.canUserPlay('#plate_' + position + '_' + index);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        this.capturesToPlace++;
        this.captures[position]--;

        const state: LodestoneState = this.stateAfterPlacingLodestone.get();
        const opponent: Player = this.getCurrentPlayer().getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const pressurePlates: LodestonePressurePlates = { ...state.pressurePlates };
        const lodestones: LodestonePositions = state.lodestones.getCopy();
        LodestoneRules.get().updatePressurePlates(board, pressurePlates, lodestones, opponent, this.captures);
        this.displayedState = new LodestoneState(board, state.turn, lodestones, pressurePlates);

        this.updateViewInfo();
        this.showPressurePlateDifferences(this.getState(), this.displayedState, true);
        return MGPValidation.SUCCESS;
    }
    public updateBoard(): void {
        this.cancelMoveAttempt();
        const lastMove: MGPOptional<LodestoneMove> = this.rules.node.move;
        if (lastMove.isPresent()) {
            this.showLastMove(this.rules.node.move.get());
        }
        this.scores = MGPOptional.of(this.getState().getScores());
    }
    public cancelMoveAttempt(): void {
        this.displayedState = this.getState();
        this.stateAfterPlacingLodestone = MGPOptional.empty();
        this.lastInfos = MGPOptional.empty();
        const playerLodestone: MGPOptional<Coord> = this.displayedState.lodestones.get(this.getCurrentPlayer());
        if (playerLodestone.isPresent()) {
            // Hide the lodestone so that it is clearer that the player can make its next move here
            const board: LodestonePiece[][] = ArrayUtils.copyBiArray(this.displayedState.board);
            board[playerLodestone.get().y][playerLodestone.get().x] = LodestonePieceNone.EMPTY;
            this.displayedState = this.displayedState.withBoard(board);
        }
        this.selectedCoord = MGPOptional.empty();
        this.selectedLodestone = MGPOptional.empty();
        this.capturesToPlace = 0;
        this.captures = { top: 0, bottom: 0, left: 0, right: 0 };
        this.updateViewInfo();
    }
    private updateViewInfo(): void {
        const state: LodestoneState = this.getState();
        const currentPlayer: Player = state.getCurrentPlayer();
        this.viewInfo.currentPlayerClass = this.getPlayerClass(currentPlayer);
        this.viewInfo.opponentClass = this.getPlayerClass(currentPlayer.getOpponent());
        this.showBoard();
        this.showAvailableLodestones();
        this.showCapturesToPlace();
        this.showPressurePlates();
        this.computePressurePlateShift();
        if (this.lastInfos.isPresent()) {
            this.showMovedAndCaptured(this.lastInfos.get());
        }
    }
    private showBoard(): void {
        this.viewInfo.boardInfo = [];
        for (let y: number = 0; y < LodestoneState.SIZE; y++) {
            this.viewInfo.boardInfo.push([]);
            for (let x: number = 0; x < LodestoneState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                this.viewInfo.boardInfo[y].push(this.getSquareInfo(coord));
            }
        }
        if (this.selectedCoord.isPresent() &&
            this.displayedState.getPieceAt(this.selectedCoord.get()).isUnreachable() === false) {
            this.viewInfo.selected = this.selectedCoord;
        } else {
            this.viewInfo.selected = MGPOptional.empty();
        }
    }
    private getSquareInfo(coord: Coord): SquareInfo {
        const piece: LodestonePiece = this.displayedState.getPieceAt(coord);
        const squareInfo: SquareInfo = {
            coord,
            squareClasses: [],
            crumbled: piece.isUnreachable(),
            hasPiece: piece.isPlayerPiece(),
            pieceClasses: [],
        };
        if (piece.isPlayerPiece()) {
            squareInfo.pieceClasses = [this.getPlayerClass(piece.owner)];
        }
        if (piece.isLodestone()) {
            squareInfo.lodestone = {
                direction: piece.direction,
                pieceClasses: [this.getPlayerClass(piece.owner)],
                selectedClass: '',
                movingClass: '',
                orientation: piece.orientation,
            };
            if (piece.direction === 'push') {
                squareInfo.lodestone.movingClass = this.getPlayerClass(piece.owner.getOpponent());
            } else {
                squareInfo.lodestone.movingClass = this.getPlayerClass(piece.owner);
            }
        }
        return squareInfo;
    }
    private showAvailableLodestones(): void {
        if (this.capturesToPlace > 0) {
            // While placing captures, we don't want to display the lodestones (as the player already selected it)
            this.viewInfo.availableLodestones = [];
        } else {
            // Here, we rely on the state after the move, as the lodestones don't change during a move
            // Moreover, since we remove the lodestone from the board (for displaying purposes),
            // we break an assumption of nextLodestoneDirection
            const player: Player = this.getState().getCurrentPlayer();
            const nextDirection: MGPOptional<LodestoneDirection> = this.getState().nextLodestoneDirection();
            if (nextDirection.isPresent()) {
                const direction: LodestoneDirection = nextDirection.get();
                this.viewInfo.availableLodestones = [
                    this.nextLodestone(player, { direction, orientation: 'orthogonal' }),
                    this.nextLodestone(player, { direction, orientation: 'diagonal' }),
                ];
            } else {
                this.viewInfo.availableLodestones = [
                    this.nextLodestone(player, { direction: 'push', orientation: 'orthogonal' }),
                    this.nextLodestone(player, { direction: 'push', orientation: 'diagonal' }),
                    this.nextLodestone(player, { direction: 'pull', orientation: 'orthogonal' }),
                    this.nextLodestone(player, { direction: 'pull', orientation: 'diagonal' }),
                ];
            }
        }
    }
    private showCapturesToPlace(): void {
        const opponent: Player = this.getCurrentPlayer().getOpponent();
        this.viewInfo.capturesToPlace = [];
        for (let i: number = 0; i < this.capturesToPlace; i++) {
            this.viewInfo.capturesToPlace.push({
                pieceClasses: [this.getPlayerClass(opponent)],
            });
        }
    }
    private nextLodestone(player: Player, description: LodestoneDescription): LodestoneInfo {
        const lodestone: LodestonePieceLodestone =
            LodestonePieceLodestone.of(player, description);
        const info: LodestoneInfo = {
            direction: lodestone.direction,
            orientation: lodestone.orientation,
            pieceClasses: [this.getPlayerClass(lodestone.owner)],
            movingClass: '',
            selectedClass: '',
        };
        if (lodestone.direction === 'push') {
            info.movingClass = this.getPlayerClass(lodestone.owner.getOpponent());
        } else {
            info.movingClass = this.getPlayerClass(lodestone.owner);
        }
        if (this.selectedLodestone.equalsValue(lodestone)) {
            info.selectedClass = 'selected-stroke';
        }
        return info;
    }
    private showPressurePlates(): void {
        this.viewInfo.pressurePlates = [];
        for (const pressurePlate of LodestonePressurePlate.POSITIONS) {
            const plateCoordInfos: PressurePlateCoordInfo[] = [];
            const plate: MGPOptional<LodestonePressurePlate> = this.displayedState.pressurePlates[pressurePlate];
            if (plate.isPresent()) {
                const plateViewPosition: PressurePlateViewPosition =
                    LodestoneComponent.PRESSURE_PLATES_POSITIONS.get(pressurePlate).get();
                const size: 3 | 5 = plate.get().width;
                let coord: Coord = size === 5 ?
                    plateViewPosition.startForBigPlate :
                    plateViewPosition.startForSmallPlate;
                for (let i: number = 0; i < size; i++) {
                    coord = coord.getNext(plateViewPosition.direction);
                    const content: LodestonePiece = plate.get().getPieceAt(i);
                    let pieceClass: string = '';
                    if (content.isPlayerPiece()) {
                        pieceClass = this.getPlayerClass(content.owner);
                    }
                    plateCoordInfos.push({
                        coord,
                        hasPiece: content.isPlayerPiece(),
                        pieceClasses: [pieceClass],
                        squareClasses: [],
                        temporary: false,
                    });
                }
            }
            this.viewInfo.pressurePlates.push({ position: pressurePlate, coords: plateCoordInfos });
        }
    }
    public showLastMove(move: LodestoneMove): void {
        const lastState: LodestoneState = this.rules.node.mother.get().gameState;
        this.lastInfos = MGPOptional.of(
            LodestoneRules.get().applyMoveWithoutPlacingCaptures(lastState, move.coord, move));
        this.updateViewInfo();
        const currentState: LodestoneState = this.getState();
        this.showPressurePlateDifferences(lastState, currentState, false);
    }
    private showPressurePlateDifferences(oldState: LodestoneState, newState: LodestoneState, temporary: boolean): void {
        for (const position of LodestonePressurePlate.POSITIONS) {
            const lastPressurePlate: MGPOptional<LodestonePressurePlate> = oldState.pressurePlates[position];
            const currentPressurePlate: MGPOptional<LodestonePressurePlate> = newState.pressurePlates[position];
            this.showPressurePlateDifference(lastPressurePlate, currentPressurePlate, position, temporary);
        }
    }
    private showPressurePlateDifference(oldPlate: MGPOptional<LodestonePressurePlate>,
                                        newPlate: MGPOptional<LodestonePressurePlate>,
                                        position: LodestonePressurePlatePosition,
                                        temporary: boolean)
    : void
    {
        if (oldPlate.isPresent() && newPlate.isPresent()) {
            const actualOldPlate: LodestonePressurePlate = oldPlate.get();
            const actualNewPlate: LodestonePressurePlate = newPlate.get();
            const plateInfo: PressurePlateInfo =
                Utils.getNonNullable(this.viewInfo.pressurePlates.find((infos: PressurePlateInfo) =>
                    infos.position === position));
            if (actualOldPlate.width === actualNewPlate.width) {
                // Only show the different squares
                for (let i: number = 0; i < actualNewPlate.width; i++) {
                    const oldPiece: LodestonePiece = actualOldPlate.getPieceAt(i);
                    const newPiece: LodestonePiece = actualNewPlate.getPieceAt(i);
                    if (oldPiece.equals(newPiece) === false) {
                        plateInfo.coords[i].squareClasses.push('moved-fill');
                        plateInfo.coords[i].temporary = temporary;
                        if (temporary) {
                            plateInfo.coords[i].pieceClasses.push('semi-transparent');
                        }
                    }
                }
            } else {
                // Pressure plate has crumbled, show all squares as moved
                for (const info of plateInfo.coords) {
                    info.squareClasses.push('moved-fill');
                }
            }
        }
    }
    private showMovedAndCaptured(infos: LodestoneInfos): void {
        for (const moved of infos.moved) {
            this.viewInfo.boardInfo[moved.y][moved.x].squareClasses.push('moved-fill');
        }
        for (const captured of infos.captures) {
            this.viewInfo.boardInfo[captured.y][captured.x].squareClasses.push('captured-fill');
        }
    }
    private computePressurePlateShift(): void {
        const state: LodestoneState = this.displayedState;
        const left: number = this.getPressurePlateShift(state.pressurePlates.left);
        const right: number = this.getPressurePlateShift(state.pressurePlates.right);
        const top: number = this.getPressurePlateShift(state.pressurePlates.top);
        const bottom: number = this.getPressurePlateShift(state.pressurePlates.bottom);
        this.viewInfo.pressurePlateShift.top = new Vector(0.5 * (left - right), 0);
        this.viewInfo.pressurePlateShift.bottom = new Vector(0.5 * (left - right), 0);
        this.viewInfo.pressurePlateShift.left = new Vector(0, 0.5 * (top - bottom));
        this.viewInfo.pressurePlateShift.right = new Vector(0, 0.5 * (top - bottom));
    }
    private getPressurePlateShift(plate: MGPOptional<LodestonePressurePlate>): number {
        if (plate.isAbsent()) {
            return 2;
        } else if (plate.get().width === 3) {
            return 1;
        } else {
            return 0;
        }
    }
    public getSquareTransform(x: number, y: number): string {
        const dx: number = x * this.SPACE_SIZE + this.STROKE_WIDTH + this.SPACE_SIZE / 2;
        const dy: number = y * this.SPACE_SIZE + this.STROKE_WIDTH + this.SPACE_SIZE / 2;
        return `translate(${dx}, ${dy})`;
    }
    public getCaptureTransform(x: number): string {
        const halfSize: number = LodestoneState.SIZE / 2;
        const dx: number = (x + (halfSize - this.viewInfo.capturesToPlace.length / 2)) * this.SPACE_SIZE +
            this.STROKE_WIDTH + this.SPACE_SIZE / 2 +
            this.viewInfo.pressurePlateShift.top.x * this.SPACE_SIZE;
        const dy: number = -30 + -2 * this.SPACE_SIZE + this.STROKE_WIDTH + this.SPACE_SIZE / 2;
        return `translate(${dx}, ${dy})`;
    }
    public getAvailableLodestoneTransform(x: number): string {
        const halfSize: number = LodestoneState.SIZE / 2;
        const dx: number = (x + (halfSize - this.viewInfo.availableLodestones.length / 2)) * this.SPACE_SIZE +
            this.STROKE_WIDTH + this.SPACE_SIZE / 2 +
            this.viewInfo.pressurePlateShift.top.x * this.SPACE_SIZE;
        const dy: number = 30 + 9 * this.SPACE_SIZE + this.STROKE_WIDTH + this.SPACE_SIZE / 2;
        return `translate(${dx}, ${dy})`;
    }
    public getPressurePlateTransform(position: LodestonePressurePlatePosition): string {
        const dx: number = this.viewInfo.pressurePlateShift[position].x * this.SPACE_SIZE;
        const dy: number = this.viewInfo.pressurePlateShift[position].y * this.SPACE_SIZE;
        return `translate(${dx}, ${dy})`;
    }
}
