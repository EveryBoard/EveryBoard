import { Component, OnInit } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { LodestoneDummyMinimax } from './LodestoneDummyMinimax';
import { LodestoneFailure } from './LodestoneFailure';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneDirection, LodestonePiece, LodestonePieceNone } from './LodestonePiece';
import { LodestoneInfos, LodestoneRules } from './LodestoneRules';
import { LodestoneLodestones, LodestonePressurePlate, LodestonePressurePlatePosition, LodestonePressurePlates, LodestoneState } from './LodestoneState';
import { LodestoneTutorial } from './LodestoneTutorial';

interface LodestoneInfo {
    direction: LodestoneDirection,
    pieceClasses: string[],
    selectedClass: string,
    movingClass: string,
    diagonal: boolean,
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
    public PIECE_RADIUS: number;
    public viewInfo: ViewInfo = {
        availableLodestones: [],
        capturesToPlace: [],
        boardInfo: [],
        currentPlayerClass: '',
        opponentClass: '',
        pressurePlates: [],
        selected: MGPOptional.empty(),
    };

    private displayedState: LodestoneState;
    private stateBeforePlacingCaptures: MGPOptional<LodestoneState> = MGPOptional.empty();
    private lastInfos: MGPOptional<LodestoneInfos> = MGPOptional.empty();
    private capturesToPlace: number = 0;
    private selectedCoord: MGPOptional<Coord> = MGPOptional.empty();
    private selectedLodestone: MGPOptional<[LodestoneDirection, boolean]> = MGPOptional.empty();
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
        this.displayedState = this.rules.node.gameState;
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
        if (this.selectedLodestone.isPresent()) {
            this.selectedCoord = MGPOptional.of(coord);
            return this.putLodestone();
        } else {
            this.selectedCoord = MGPOptional.of(coord);
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        }
    }
    public async selectLodestone(direction: LodestoneDirection, diagonal: boolean): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#lodestone_' + direction + '_' + (diagonal ? 'diagonal' : 'orthogonal'));
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        assert(this.capturesToPlace === 0, 'should not be able to click on a lodestone when captures need to be placed');

        if (this.selectedCoord.isPresent()) {
            this.selectedLodestone = MGPOptional.of([direction, diagonal]);
            return this.putLodestone();
        } else {
            this.selectedLodestone = MGPOptional.of([direction, diagonal]);
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        }
    }
    private async putLodestone(): Promise<MGPValidation> {
        assert(this.selectedCoord.isPresent(), 'coord should have been selected');
        assert(this.selectedLodestone.isPresent(), 'lodestone should have been selected');
        const coord: Coord = this.selectedCoord.get();
        const [direction, diagonal]: [LodestoneDirection, boolean] = this.selectedLodestone.get();
        const state: LodestoneState = this.getState();
        const validity: MGPValidation = LodestoneRules.get().isLegalWithoutCaptures(state, coord, direction);
        assert(validity.isSuccess(), 'Lodestone component should only allow creation of legal moves');
        const infos: LodestoneInfos =
            LodestoneRules.get().applyMoveWithoutPlacingCaptures(state, coord, direction, diagonal);
        this.lastInfos = MGPOptional.of(infos);
        this.capturesToPlace = Math.min(infos.captures.length, state.remainingSpaces());
        if (this.capturesToPlace === 0) {
            return this.applyMove();
        } else {
            this.displayedState = this.displayedState.withBoard(infos.board);
            this.stateBeforePlacingCaptures = MGPOptional.of(this.displayedState);
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        }
    }
    private async applyMove(): Promise<MGPValidation> {
        assert(this.selectedCoord.isPresent(), 'coord should have been selected');
        assert(this.selectedLodestone.isPresent(), 'lodestone should have been selected');
        const coord: Coord = this.selectedCoord.get();
        const [direction, diagonal]: [LodestoneDirection, boolean] = this.selectedLodestone.get();
        const move: LodestoneMove = new LodestoneMove(coord, direction, diagonal, this.captures);
        return this.chooseMove(move, this.getState());
    }
    public async selectPressurePlate(position: LodestonePressurePlatePosition, index: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#plateSquare_' + position + '_' + index);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        if (this.capturesToPlace === 0) {
            return this.cancelMove(LodestoneFailure.NO_CAPTURES_TO_PLACE_YET());
        }

        this.capturesToPlace--;
        this.captures[position]++;
        const state: LodestoneState = this.stateBeforePlacingCaptures.get();
        const opponent: Player = this.getCurrentPlayer().getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const pressurePlates: LodestonePressurePlates = { ...state.pressurePlates };
        const lodestones: LodestoneLodestones = [state.lodestones[0], state.lodestones[1]];
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
        const clickValidity: MGPValidation = this.canUserPlay('#plateSquare_' + position + '_' + index);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        this.capturesToPlace++;
        this.captures[position]--;

        const state: LodestoneState = this.stateBeforePlacingCaptures.get();
        const opponent: Player = this.getCurrentPlayer().getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const pressurePlates: LodestonePressurePlates = { ...state.pressurePlates };
        const lodestones: LodestoneLodestones = [state.lodestones[0], state.lodestones[1]];
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
            this.showLastMove();
        }
        this.scores = MGPOptional.of(this.getState().getScores());
    }
    public cancelMoveAttempt(): void {
        this.displayedState = this.getState();
        this.stateBeforePlacingCaptures = MGPOptional.empty();
        this.lastInfos = MGPOptional.empty();
        const playerLodestone: MGPOptional<Coord> = this.displayedState.lodestones[this.getCurrentPlayer().value];
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
                        diagonal: piece.diagonal,
                    };
                    if (piece.direction === 'push') {
                        squareInfo.lodestone.movingClass = this.getPlayerClass(piece.owner.getOpponent());
                    } else {
                        squareInfo.lodestone.movingClass = this.getPlayerClass(piece.owner);
                    }

                }
                this.viewInfo.boardInfo[y].push(squareInfo);
            }
        }
        if (this.selectedCoord.isPresent() &&
            this.displayedState.getPieceAt(this.selectedCoord.get()).isUnreachable() === false) {
            this.viewInfo.selected = this.selectedCoord;
        } else {
            this.viewInfo.selected = MGPOptional.empty();
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
                this.viewInfo.availableLodestones = [
                    this.nextLodestone(player, nextDirection.get(), true),
                    this.nextLodestone(player, nextDirection.get(), false),
                ];
            } else {
                this.viewInfo.availableLodestones = [
                    this.nextLodestone(player, 'push', false),
                    this.nextLodestone(player, 'push', true),
                    this.nextLodestone(player, 'pull', false),
                    this.nextLodestone(player, 'pull', true),
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
    private nextLodestone(player: Player, direction: LodestoneDirection, diagonal: boolean): LodestoneInfo {
        const info: LodestoneInfo = {
            direction,
            pieceClasses: [this.getPlayerClass(player)],
            movingClass: '',
            selectedClass: '',
            diagonal: false,
        };
        if (direction === 'push') {
            info.movingClass = this.getPlayerClass(player.getOpponent());
        } else {
            info.movingClass = this.getPlayerClass(player);
        }
        if (this.selectedLodestone.isPresent() &&
            this.selectedLodestone.get()[0] === direction &&
            this.selectedLodestone.get()[1] === diagonal) {
            info.selectedClass = 'selected';
        }
        if (diagonal) {
            info.diagonal = true;
        }
        return info;
    }
    private static readonly PRESSURE_PLATES_POSITIONS
    : Record<LodestonePressurePlatePosition, [Coord, Coord, Direction]> = {
        'top': [new Coord(0.5, -1), new Coord(1.5, 0), Direction.RIGHT],
        'bottom': [new Coord(0.5, 8), new Coord(1.5, 7), Direction.RIGHT],
        'left': [new Coord(-1, 0.5), new Coord(0, 1.5), Direction.DOWN],
        'right': [new Coord(8, 0.5), new Coord(7, 1.5), Direction.DOWN],
    };
    private showPressurePlates(): void {
        this.viewInfo.pressurePlates = [];
        for (const pressurePlate of LodestonePressurePlate.POSITIONS) {
            const plateCoordInfos: PressurePlateCoordInfo[] = [];
            const plate: MGPOptional<LodestonePressurePlate> = this.displayedState.pressurePlates[pressurePlate];
            if (plate.isPresent()) {
                const [start5, start3, dir]: [Coord, Coord, Direction] =
                    LodestoneComponent.PRESSURE_PLATES_POSITIONS[pressurePlate];
                const size: 3 | 5 = plate.get().width;
                let coord: Coord = size === 5 ? start5 : start3;
                for (let i: number = 0; i < size; i++) {
                    coord = coord.getNext(dir);
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
    private showLastMove(): void {
        const lastState: LodestoneState = this.rules.node.mother.get().gameState;
        const lastMove: LodestoneMove = this.rules.node.move.get();
        this.lastInfos = MGPOptional.of(
            LodestoneRules.get().applyMoveWithoutPlacingCaptures(lastState,
                                                                 lastMove.coord,
                                                                 lastMove.direction,
                                                                 lastMove.diagonal));
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
                        plateInfo.coords[i].squareClasses.push('moved');
                        plateInfo.coords[i].temporary = temporary;
                        if (temporary) {
                            plateInfo.coords[i].pieceClasses.push('transparent');
                        }
                    }
                }
            } else {
                // Pressure plate has crumbled, show all squares as moved
                for (const info of plateInfo.coords) {
                    info.squareClasses.push('moved');
                }
            }
        }
    }
    private showMovedAndCaptured(infos: LodestoneInfos): void {
        for (const moved of infos.moved) {
            this.viewInfo.boardInfo[moved.y][moved.x].squareClasses.push('moved');
        }
        for (const captured of infos.captures) {
            this.viewInfo.boardInfo[captured.y][captured.x].squareClasses.push('captured');
        }
    }
}
