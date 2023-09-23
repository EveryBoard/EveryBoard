import { Component } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Vector';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursRules } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';
import { ConspirateursTutorial } from './ConspirateursTutorial';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MCTS } from 'src/app/jscaip/MCTS';
import { ConspirateursMoveGenerator } from './ConspirateursMoveGenerator';
import { ConspirateursMinimax } from './ConspirateursMinimax';

interface ViewInfo {
    boardInfo: SquareInfo[][],
    dropPhase: boolean,
    victory: Coord[],
    lastMoveArrow: string,
    sidePieces: [number, number],
}

interface SquareInfo {
    coord: Coord,
    squareClasses: string[],
    shelterClasses: string[],
    pieceClasses: string[],
    hasPiece: boolean,
    isShelter: boolean,
    isOccupiedShelter: boolean,
}

@Component({
    selector: 'app-conspirateurs',
    templateUrl: './conspirateurs.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ConspirateursComponent extends GameComponent<ConspirateursRules, ConspirateursMove, ConspirateursState> {

    public PIECE_RADIUS: number;
    public ALL_SHELTERS: Coord[] = ConspirateursState.ALL_SHELTERS;
    public CENTRAL_ZONE_START: Coord = ConspirateursState.CENTRAL_ZONE_TOP_LEFT;
    public CENTRAL_ZONE_SIZE: Vector = new Vector(
        ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.x - ConspirateursState.CENTRAL_ZONE_TOP_LEFT.x + 1,
        ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.y - ConspirateursState.CENTRAL_ZONE_TOP_LEFT.y + 1,
    );
    public viewInfo: ViewInfo = {
        dropPhase: true,
        boardInfo: [],
        victory: [],
        lastMoveArrow: '',
        sidePieces: [20, 20],
    };
    private selected: MGPOptional<Coord> = MGPOptional.empty();

    private jumpInConstruction: MGPOptional<ConspirateursMoveJump> = MGPOptional.empty();

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.PIECE_RADIUS = (this.SPACE_SIZE / 2) - this.STROKE_WIDTH;
        this.rules = ConspirateursRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new ConspirateursMinimax(),
            new MCTS('MCTS', new ConspirateursMoveGenerator(), this.rules),
        ];
        this.encoder = ConspirateursMove.encoder;
        this.tutorial = new ConspirateursTutorial().tutorial;
    }
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.updateViewInfo();
    }
    private updateViewInfo(): void {
        const state: ConspirateursState = this.getState();
        this.viewInfo.dropPhase = state.isDropPhase();
        this.viewInfo.boardInfo = [];
        this.viewInfo.lastMoveArrow = '';
        for (let y: number = 0; y < ConspirateursState.HEIGHT; y++) {
            this.viewInfo.boardInfo.push([]);
            for (let x: number = 0; x < ConspirateursState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: PlayerOrNone = state.getPieceAt(coord);
                const squareInfo: SquareInfo = {
                    coord,
                    squareClasses: [],
                    shelterClasses: [],
                    pieceClasses: [this.getPlayerClass(piece)],
                    hasPiece: piece.isPlayer(),
                    isShelter: false,
                    isOccupiedShelter: false,
                };
                this.viewInfo.boardInfo[y].push(squareInfo);
            }
        }
        this.viewInfo.sidePieces = state.getSidePieces();
        this.updateOccupiedShelters();
        this.updateSelected();
        this.updateVictory();
    }
    private updateOccupiedShelters(): void {
        for (const shelter of ConspirateursState.ALL_SHELTERS) {
            const squareInfo: SquareInfo = this.viewInfo.boardInfo[shelter.y][shelter.x];
            squareInfo.isShelter = true;
            if (squareInfo.hasPiece) {
                squareInfo.shelterClasses.push('selectable-stroke');
            }
        }
    }
    private updateSelected(): void {
        if (this.selected.isPresent()) {
            if (this.jumpInConstruction.isPresent()) {
                const jump: ConspirateursMoveJump = this.jumpInConstruction.get();
                const jumpStart: Coord = jump.getStartingCoord();
                const jumpCurrent: Coord = jump.getEndingCoord();
                this.viewInfo.boardInfo[jumpStart.y][jumpStart.x].hasPiece = false;
                this.viewInfo.boardInfo[jumpCurrent.y][jumpCurrent.x].pieceClasses =
                    [this.getPlayerClass(this.getCurrentPlayer()), 'selected-stroke'];
                this.viewInfo.boardInfo[jumpCurrent.y][jumpCurrent.x].hasPiece = true;
                for (const coord of jump.coords) {
                    this.viewInfo.boardInfo[coord.y][coord.x].squareClasses.push('moved-fill');
                }
            } else {
                const selected: Coord = this.selected.get();
                this.viewInfo.boardInfo[selected.y][selected.x].pieceClasses.push('selected-stroke');
            }
        }
    }
    private updateVictory(): void {
        const state: ConspirateursState = this.getState();
        const gameStatus: GameStatus = ConspirateursRules.get().getGameStatus(this.node);
        if (gameStatus.isEndGame === true) {
            for (const shelter of ConspirateursState.ALL_SHELTERS) {
                if (state.getPieceAt(shelter) === gameStatus.winner) {
                    this.viewInfo.boardInfo[shelter.y][shelter.x].squareClasses.push('victory-fill');
                }
            }
        }
    }
    public override async showLastMove(move: ConspirateursMove): Promise<void> {
        if (ConspirateursMove.isDrop(move)) {
            this.viewInfo.boardInfo[move.coord.y][move.coord.x].squareClasses.push('moved-fill');
        } else if (ConspirateursMove.isSimple(move)) {
            this.viewInfo.boardInfo[move.getStart().y][move.getStart().x].squareClasses.push('moved-fill');
            this.viewInfo.boardInfo[move.getEnd().y][move.getEnd().x].squareClasses.push('moved-fill');
        } else {
            this.viewInfo.lastMoveArrow = '';
            for (const coord of move.coords) {
                this.viewInfo.boardInfo[coord.y][coord.x].squareClasses.push('moved-fill');
                this.viewInfo.lastMoveArrow += (coord.x * this.SPACE_SIZE) + this.SPACE_SIZE/2 + this.STROKE_WIDTH;
                this.viewInfo.lastMoveArrow += ' ';
                this.viewInfo.lastMoveArrow += (coord.y * this.SPACE_SIZE) + this.SPACE_SIZE/2 + this.STROKE_WIDTH;
                this.viewInfo.lastMoveArrow += ' ';
            }
        }
    }
    public override async cancelMoveAttempt(): Promise<void> {
        this.jumpInConstruction = MGPOptional.empty();
        this.selected = MGPOptional.empty();
        await this.updateBoard(false);
    }
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + coord.x + '_' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const state: ConspirateursState = this.getState();
        if (state.getPieceAt(coord) === this.getCurrentPlayer()) {
            if (this.selected.equalsValue(coord)) {
                await this.cancelMoveAttempt();
            } else {
                this.selected = MGPOptional.of(coord);
                this.jumpInConstruction = MGPOptional.empty();
            }
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        } else if (this.jumpInConstruction.isPresent()) {
            return this.constructJump(coord);
        } else if (this.selected.isPresent()) {
            return this.selectNextCoord(coord);
        } else if (state.isDropPhase()) {
            const move: ConspirateursMove = ConspirateursMoveDrop.of(coord);
            return this.chooseMove(move);
        } else {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
    }
    private async constructJump(nextTarget: Coord): Promise<MGPValidation> {
        const jump: ConspirateursMoveJump = this.jumpInConstruction.get();
        const state: ConspirateursState = this.getState();
        if (nextTarget.equals(jump.getEndingCoord())) {
            // double clicking on an early destination performs the jump
            return this.chooseMove(jump);
        } else {
            const newJump: MGPFallible<ConspirateursMoveJump> = jump.addJump(nextTarget);
            if (newJump.isFailure()) {
                return this.cancelMove(newJump.getReason());
            }
            const jumpLegality: MGPValidation = this.rules.jumpLegality(newJump.get(), state);
            if (jumpLegality.isFailure()) {
                return this.cancelMove(jumpLegality.getReason());
            }
            return this.updateJump(newJump.get());
        }
    }
    private async updateJump(jump: ConspirateursMoveJump): Promise<MGPValidation> {
        const state: ConspirateursState = this.getState();
        if (this.rules.jumpHasPossibleNextTargets(jump, state)) {
            this.jumpInConstruction = MGPOptional.of(jump);
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        } else {
            return this.chooseMove(jump);
        }
    }
    private async selectNextCoord(coord: Coord): Promise<MGPValidation> {
        const selected: Coord = this.selected.get();
        const move: MGPFallible<ConspirateursMove> = ConspirateursMoveSimple.from(selected, coord);
        if (move.isSuccess()) {
            return this.chooseMove(move.get());
        } else {
            const jump: MGPFallible<ConspirateursMoveJump> = ConspirateursMoveJump.from([selected, coord]);
            if (jump.isFailure()) {
                return this.cancelMove(jump.getReason());
            }
            return this.updateJump(jump.get());
        }
    }
}
