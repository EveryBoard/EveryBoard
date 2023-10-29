import { Component } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { LodestoneFailure } from './LodestoneFailure';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneOrientation, LodestoneDirection, LodestonePiece, LodestonePieceNone, LodestonePieceLodestone, LodestoneDescription } from './LodestonePiece';
import { LodestoneInfos, PressurePlatePositionInformation, LodestoneRules, PressurePlateViewPosition } from './LodestoneRules';
import { LodestonePositions, LodestonePressurePlate, LodestonePressurePlateGroup, LodestonePressurePlatePosition, LodestonePressurePlates, LodestoneState } from './LodestoneState';
import { LodestoneTutorial } from './LodestoneTutorial';
import { MCTS } from 'src/app/jscaip/MCTS';
import { LodestoneMoveGenerator } from './LodestoneMoveGenerator';
import { LodestoneScoreHeuristic } from './LodestoneScoreHeuristic';
import { Minimax } from 'src/app/jscaip/Minimax';

export type LodestoneInfo = {
    direction: LodestoneDirection,
    pieceClasses: string[],
    selectedClass: string,
    movingClass: string,
    orientation: LodestoneOrientation,
};

type PressurePlateInfo = {
    position: LodestonePressurePlatePosition,
    index: number,
    coords: PressurePlateCoordInfo[],
};

type PressurePlateCoordInfo = {
    coord: Coord,
    hasPiece: boolean,
    pieceClasses: string[],
    squareClasses: string[],
    temporary: boolean,
};

type CaptureInfo = {
    pieceClasses: string[],
};

type ViewInfo = {
    boardInfo: SquareInfo[][],
    availableLodestones: LodestoneInfo[],
    capturesToPlace: CaptureInfo[],
    pressurePlatesInfo: PressurePlateInfo[],
    currentPlayerClass: string,
    opponentClass: string,
    selected: MGPOptional<Coord>,
};

type SquareStatus = 'not crumbled' | 'crumbled last turn' | 'crumbled';

type SquareInfo = {
    coord: Coord,
    squareClasses: string[],
    status: SquareStatus,
    isTherePieceToDraw: boolean,
    pieceClasses: string[],
    lodestone?: LodestoneInfo,
};

@Component({
    selector: 'app-lodestone',
    templateUrl: './lodestone.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LodestoneComponent
    extends GameComponent<LodestoneRules, LodestoneMove, LodestoneState, LodestoneInfos>
{
    private static readonly PRESSURE_PLATE_EXTRA_SHIFT: number = 0.2;

    private static readonly PRESSURE_PLATES_POSITIONS: PressurePlatePositionInformation = MGPMap.from({
        top: {
            start: (plateIndex: number, plateWidth: number) => new Coord(
                (8 - plateWidth) / 2,
                - (plateIndex + 1) * (1 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT),
            ),
            direction: Direction.RIGHT,
        },
        bottom: {
            start: (plateIndex: number, plateWidth: number) => new Coord(
                (8 - plateWidth) / 2,
                8 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT +
                plateIndex * (1 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT),
            ),
            direction: Direction.RIGHT,
        },
        left: {
            start: (plateIndex: number, plateWidth: number) => new Coord(
                - (1 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT) * (1 + plateIndex),
                (8 - plateWidth) / 2,
            ),
            direction: Direction.DOWN,
        },
        right: {
            start: (plateIndex: number, plateWidth: number) => new Coord(
                8 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT +
                plateIndex * (1 + LodestoneComponent.PRESSURE_PLATE_EXTRA_SHIFT),
                (8 - plateWidth) / 2,
            ),
            direction: Direction.DOWN,
        },
    });

    public PIECE_RADIUS: number;

    public viewInfo: ViewInfo = {
        availableLodestones: [],
        capturesToPlace: [],
        boardInfo: [],
        currentPlayerClass: '',
        opponentClass: '',
        pressurePlatesInfo: [],
        selected: MGPOptional.empty(),
    };

    public LEFT: number;
    public UP: number;
    public WIDTH: number;
    public HEIGHT: number;
    public platesGroupSize: number;
    public boardSize: number;

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
        this.node = this.rules.getInitialNode();
        this.tutorial = new LodestoneTutorial().tutorial;
        this.availableAIs = [
            new Minimax($localize`Score`, this.rules, new LodestoneScoreHeuristic(), new LodestoneMoveGenerator()),
            new MCTS($localize`MCTS`, new LodestoneMoveGenerator(), this.rules),
        ];
        this.encoder = LodestoneMove.encoder;
        this.PIECE_RADIUS = (this.SPACE_SIZE - (2 * this.STROKE_WIDTH)) * 0.5;
        this.displayedState = this.getState();
        this.scores = MGPOptional.of([0, 0]);
    }

    public getViewBox(): string {
        const abstractPlateWidth: number = this.getState().pressurePlates.top.plates.length;
        this.platesGroupSize = abstractPlateWidth * (this.SPACE_SIZE * 1.2);
        this.LEFT = - this.platesGroupSize;
        this.UP = - (this.platesGroupSize + this.SPACE_SIZE);
        this.boardSize = this.getState().board.length * this.SPACE_SIZE;
        this.WIDTH = this.boardSize + (2 * this.platesGroupSize);
        this.HEIGHT = this.boardSize + (2 * this.platesGroupSize) + (2 * this.SPACE_SIZE) + this.STROKE_WIDTH;
        return this.LEFT + ' ' + this.UP + ' ' + this.WIDTH + ' ' + this.HEIGHT;
    }

    public async selectCoord(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#square_' + coord.x + '_' + coord.y);
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
        const clickValidity: MGPValidation = await this.canUserPlay('#lodestone_' + lodestone.direction + '_' + lodestone.orientation);
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
        return this.chooseMove(move);
    }

    public async onPressurePlateClick(temporary: boolean,
                                      position: LodestonePressurePlatePosition,
                                      plateIndex: number,
                                      pieceIndex: number)
    : Promise<MGPValidation>
    {
        const squareName: string = '#plate_' + position + '_' + plateIndex + '_' + pieceIndex;
        const clickValidity: MGPValidation = await this.canUserPlay(squareName);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (temporary) {
            return this.deselectPressurePlate(position);
        } else {
            return this.selectPressurePlate(position);
        }
    }

    private async selectPressurePlate(position: LodestonePressurePlatePosition): Promise<MGPValidation> {
        if (this.capturesToPlace === 0) {
            return this.cancelMove(LodestoneFailure.NO_CAPTURES_TO_PLACE_YET());
        }
        this.capturesToPlace--;
        this.captures[position]++;
        const state: LodestoneState = this.stateAfterPlacingLodestone.get();
        const opponent: Player = this.getCurrentOpponent();
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

    public async deselectPressurePlate(position: LodestonePressurePlatePosition): Promise<MGPValidation> {
        this.capturesToPlace++;
        this.captures[position]--;
        const state: LodestoneState = this.stateAfterPlacingLodestone.get();
        const opponent: Player = this.getCurrentOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const pressurePlates: LodestonePressurePlates = { ...state.pressurePlates };
        const lodestones: LodestonePositions = state.lodestones.getCopy();
        LodestoneRules.get().updatePressurePlates(board, pressurePlates, lodestones, opponent, this.captures);
        this.displayedState = new LodestoneState(board, state.turn, lodestones, pressurePlates);
        this.updateViewInfo();
        this.showPressurePlateDifferences(this.getState(), this.displayedState, true);
        return MGPValidation.SUCCESS;
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.cancelMoveAttempt();
        this.scores = MGPOptional.of(this.getState().getScores());
    }

    public override cancelMoveAttempt(): void {
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
        const lodestoneInfo: LodestoneInfo | undefined = this.getLodestoneInfo(coord);
        const squareInfo: SquareInfo = {
            coord,
            squareClasses: [],
            status: this.getStatus(coord),
            isTherePieceToDraw: false,
            pieceClasses: [],
            lodestone: lodestoneInfo,
        };
        if (piece.isPlayerPiece()) {
            squareInfo.isTherePieceToDraw = true;
            squareInfo.pieceClasses = [this.getPlayerClass(piece.owner)];
        } else if (this.coordHasJustBeenCrumbled(coord)) {
            const crumbledOwner: PlayerOrNone = this.getCrumbledOwner(coord);
            squareInfo.pieceClasses = [this.getPlayerClass(crumbledOwner)]; // TODO CHECK IF THIS IS OK
        }
        return squareInfo;
    }

    private getLodestoneInfo(coord: Coord): LodestoneInfo | undefined {
        const piece: LodestonePiece = this.displayedState.getPieceAt(coord);
        if (piece.isLodestone()) {
            return this.getLodestoneInfoAt(this.displayedState, coord);
        } else if (this.hadLodestone(coord)) {
            return this.getLodestoneInfoAt(this.getPreviousState(), coord);
        } else if (this.lodestoneHasBeenCrumbled(coord)) {
            return this.getCrumbledLodestone();
        } else {
            return undefined;
        }
    }

    private getCrumbledLodestone(): LodestoneInfo | undefined {
        const previousMove: LodestoneMove = this.node.previousMove.get();
        const owner: Player = this.getCurrentOpponent();
        const lodestoneInfo: LodestoneInfo = {
            direction: previousMove.direction,
            pieceClasses: [this.getPlayerClass(owner)],
            selectedClass: '',
            movingClass: '',
            orientation: previousMove.orientation,
        };
        if (previousMove.direction === 'push') {
            lodestoneInfo.movingClass = this.getPlayerClass(owner.getOpponent());
        } else {
            lodestoneInfo.movingClass = this.getPlayerClass(owner);
        }
        return lodestoneInfo;
    }

    private lodestoneHasBeenCrumbled(coord: Coord): boolean {
        if (this.node.previousMove.isPresent()) {
            const previousMove: LodestoneMove = this.node.previousMove.get();
            return previousMove.coord.equals(coord);
        } else {
            return false;
        }
    }

    private hadLodestone(coord: Coord): boolean {
        if (this.node.parent.isPresent()) {
            const previousState: LodestoneState = this.node.parent.get().gameState;
            const piece: LodestonePiece = previousState.getPieceAt(coord);
            return piece.isLodestone();
        } else {
            return false;
        }
    }

    private getLodestoneInfoAt(state: LodestoneState, coord: Coord): LodestoneInfo {
        const piece: LodestonePieceLodestone = state.getPieceAt(coord) as LodestonePieceLodestone;
        if (piece.owner.isPlayer() === false) console.log('LE CUL DLA CHATTE')
        const lodestone: LodestoneInfo = {
            direction: piece.direction,
            pieceClasses: [this.getPlayerClass(piece.owner)],
            selectedClass: '',
            movingClass: '',
            orientation: piece.orientation,
        };
        if (piece.direction === 'push') {
            lodestone.movingClass = this.getPlayerClass(piece.owner.getOpponent());
        } else {
            lodestone.movingClass = this.getPlayerClass(piece.owner);
        }
        return lodestone;
    }

    private coordHasJustBeenCrumbled(coord: Coord): boolean {
        if (this.node.parent.isPresent()) {
            const piece: LodestonePiece = this.displayedState.getPieceAt(coord);
            const pieceIsUnreachable: boolean = piece.isUnreachable();
            const previousPiece: LodestonePiece = this.getPreviousState().getPieceAt(coord);
            const pieceWasReachable: boolean = previousPiece.isUnreachable() === false;
            return pieceIsUnreachable && pieceWasReachable;
        } else {
            return false;
        }
    }

    private getCrumbledOwner(coord: Coord): PlayerOrNone {
        const previousState: LodestoneState = this.getPreviousState();
        return previousState.getPieceAt(coord).owner;
    }

    private hadPiece(coord: Coord): boolean {
        if (this.node.parent.isPresent()) {
            return this.getPreviousState().getPieceAt(coord).isEmpty() === false;
        } else {
            return false;
        }
    }

    private getStatus(coord: Coord): SquareStatus {
        const piece: LodestonePiece = this.displayedState.getPieceAt(coord);
        if (piece.isUnreachable()) {
            if (this.node.parent.isPresent()) {
                if (this.getPreviousState().getPieceAt(coord).isUnreachable() === false) {
                    return 'crumbled last turn';
                }
            }
            return 'crumbled';
        } else {
            return 'not crumbled';
        }
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
        const opponent: Player = this.getCurrentOpponent();
        this.viewInfo.capturesToPlace = [];
        for (let i: number = 0; i < this.capturesToPlace; i++) {
            this.viewInfo.capturesToPlace.push({
                pieceClasses: [this.getPlayerClass(opponent)],
            });
        }
    }

    private nextLodestone(player: Player, description: LodestoneDescription): LodestoneInfo {
        const lodestone: LodestonePieceLodestone = LodestonePieceLodestone.of(player, description);
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
        this.viewInfo.pressurePlatesInfo = [];
        for (const pressurePlatePosition of LodestonePressurePlate.POSITIONS) {
            const plateCoordInfos: PressurePlateCoordInfo[] = [];
            const plates: LodestonePressurePlateGroup = this.getPlatesToDisplay(pressurePlatePosition);
            let plateIndex: number = 0;
            for (const plate of plates.plates) {
                const plateViewPosition: PressurePlateViewPosition =
                    LodestoneComponent.PRESSURE_PLATES_POSITIONS.get(pressurePlatePosition).get();
                const size: number = plate.width;
                let coord: Coord = plateViewPosition.start(plateIndex, size);
                for (let i: number = 0; i < size; i++) {
                    const content: LodestonePiece = plate.getPieceAt(i);
                    let pieceClass: string = '';
                    if (content.isPlayerPiece()) {
                        pieceClass = this.getPlayerClass(content.owner);
                    }
                    const hadPiece: boolean = this.plateHadPiece(pressurePlatePosition, plateIndex, i);
                    plateCoordInfos.push({
                        coord,
                        hasPiece: content.isPlayerPiece() || hadPiece,
                        pieceClasses: [pieceClass],
                        squareClasses: [],
                        temporary: false,
                    });
                    coord = coord.getNext(plateViewPosition.direction);
                }
                this.viewInfo.pressurePlatesInfo.push({
                    position: pressurePlatePosition,
                    index: plateIndex,
                    coords: plateCoordInfos,
                });
                plateIndex++;
            }
        }
    }

    private getPlatesToDisplay(platePosition: LodestonePressurePlatePosition): LodestonePressurePlateGroup {
        const previousState: LodestoneState = this.getPreviousStateOr(this.getState());
        const previousPlate: LodestonePressurePlateGroup = previousState.pressurePlates[platePosition];
        const currentPlate: LodestonePressurePlateGroup = this.displayedState.pressurePlates[platePosition];
        const previousWidth: number = previousPlate.getCurrentPlateWidth();
        const currentWidth: number = currentPlate.getCurrentPlateWidth();
        const plateJustCrumbled: boolean = previousWidth > currentWidth;
        if (plateJustCrumbled) {
            return this.getPreviousStateOr(this.displayedState).pressurePlates[platePosition];
        } else {
            return this.displayedState.pressurePlates[platePosition];
        }
    }

    private plateHadPiece(platePosition: LodestonePressurePlatePosition,
                          plateIndex: number,
                          pieceIndex: number)
    : boolean
    {
        if (this.node.parent.isPresent()) {
            const previousState: LodestoneState = this.getPreviousState();
            const plate: LodestonePressurePlate =
                previousState.pressurePlates[platePosition].plates[plateIndex];
            const piece: LodestonePiece = plate.getPieceAt(pieceIndex);
            return piece.isEmpty() === false;
        } else {
            return false;
        }
    }

    public override async showLastMove(move: LodestoneMove): Promise<void> {
        const lastState: LodestoneState = this.getPreviousState();
        this.lastInfos = MGPOptional.of(
            LodestoneRules.get().applyMoveWithoutPlacingCaptures(lastState, move.coord, move));
        this.updateViewInfo();
        const currentState: LodestoneState = this.getState();
        this.showPressurePlateDifferences(lastState, currentState, false);
    }

    private showPressurePlateDifferences(oldState: LodestoneState, newState: LodestoneState, temporary: boolean): void {
        for (const position of LodestonePressurePlate.POSITIONS) {
            const lastPressurePlate: LodestonePressurePlateGroup = oldState.pressurePlates[position];
            const currentPressurePlate: LodestonePressurePlateGroup = newState.pressurePlates[position];
            this.showPressurePlateDifference(lastPressurePlate, currentPressurePlate, position, temporary);
        }
    }

    private showPressurePlateDifference(oldPlateGroup: LodestonePressurePlateGroup,
                                        newPlateGroup: LodestonePressurePlateGroup,
                                        position: LodestonePressurePlatePosition,
                                        temporary: boolean)
    : void
    {
        let indexPlate: number = 0;
        for (const oldPlate of oldPlateGroup.plates) {
            const actualNewPlate: LodestonePressurePlate = newPlateGroup.plates[indexPlate];
            const plateInfo: PressurePlateInfo =
                Utils.getNonNullable(this.viewInfo.pressurePlatesInfo.find((infos: PressurePlateInfo) =>
                    infos.position === position));
            if (oldPlate.width === actualNewPlate.width) {
                // Only show the different squares
                for (let i: number = 0; i < actualNewPlate.width; i++) {
                    const oldPiece: LodestonePiece = oldPlate.getPieceAt(i);
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
            indexPlate++;
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

    public getSquareTransform(x: number, y: number): string {
        const dx: number = x * this.SPACE_SIZE + this.STROKE_WIDTH + this.SPACE_SIZE / 2;
        const dy: number = y * this.SPACE_SIZE + this.STROKE_WIDTH + this.SPACE_SIZE / 2;
        return `translate(${dx}, ${dy})`;
    }

    public getCaptureTransform(x: number): string {
        const halfSize: number = LodestoneState.SIZE / 2;
        const dx: number = (x + (halfSize - this.viewInfo.capturesToPlace.length / 2)) * this.SPACE_SIZE +
            this.SPACE_SIZE / 2;
        const dy: number = - (this.platesGroupSize + 0.5 * this.SPACE_SIZE + this.STROKE_WIDTH);
        return `translate(${ dx }, ${ dy })`;
    }

    public getAvailableLodestoneTransform(x: number): string {
        const halfSize: number = LodestoneState.SIZE / 2;
        const dx: number = (x + (halfSize - this.viewInfo.availableLodestones.length / 2)) * this.SPACE_SIZE;
        const dy: number = this.boardSize + this.platesGroupSize + this.STROKE_WIDTH;
        return `translate(${dx}, ${dy})`;
    }

}
