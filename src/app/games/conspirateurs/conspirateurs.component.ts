import { Component, OnInit } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { assert } from 'src/app/utils/utils';
import { ConspirateursMinimax } from './ConspirateursMinimax';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveEncoder, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursRules } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';
import { ConspirateursTutorial } from './ConspirateursTutorial';

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
export class ConspirateursComponent
    extends GameComponent<ConspirateursRules, ConspirateursMove, ConspirateursState>
    implements OnInit
{
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
        this.PIECE_RADIUS = (this.SPACE_SIZE - (2 * this.STROKE_WIDTH)) * 0.5;
        this.rules = ConspirateursRules.get();
        this.availableMinimaxes = [
            new ConspirateursMinimax(this.rules, 'ConspirateursMinimax'),
        ];
        this.encoder = ConspirateursMoveEncoder;
        this.tutorial = new ConspirateursTutorial().tutorial;
    }
    public ngOnInit(): void {
        this.updateBoard();
    }
    public updateBoard(): void {
        this.updateViewInfo();
        const lastMove: MGPOptional<ConspirateursMove> = this.rules.node.move;
        if (lastMove.isPresent()) {
            this.showLastMove();
        }
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
                const piece: Player = state.getPieceAt(coord);
                const squareInfo: SquareInfo = {
                    coord,
                    squareClasses: [],
                    shelterClasses: [],
                    pieceClasses: [this.getPlayerClass(piece)],
                    hasPiece: piece !== Player.NONE,
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
                squareInfo.shelterClasses.push('highlighted');
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
                    [this.getPlayerClass(this.getCurrentPlayer()), 'selected'];
                this.viewInfo.boardInfo[jumpCurrent.y][jumpCurrent.x].hasPiece = true;
                for (const coord of jump.coords) {
                    this.viewInfo.boardInfo[coord.y][coord.x].squareClasses.push('moved');
                }
            } else {
                const selected: Coord = this.selected.get();
                this.viewInfo.boardInfo[selected.y][selected.x].pieceClasses.push('selected');
            }
        }
    }
    private updateVictory(): void {
        const state: ConspirateursState = this.getState();
        const gameStatus: GameStatus = ConspirateursRules.get().getGameStatus(this.rules.node);
        if (gameStatus.isEndGame === true) {
            for (const shelter of ConspirateursState.ALL_SHELTERS) {
                if (state.getPieceAt(shelter) === gameStatus.winner) {
                    this.viewInfo.boardInfo[shelter.y][shelter.x].squareClasses.push('victory');
                }
            }
        }
    }
    private showLastMove(): void {
        const lastMove: ConspirateursMove = this.rules.node.move.get();
        if (lastMove.isDrop()) {
            this.viewInfo.boardInfo[lastMove.coord.y][lastMove.coord.x].squareClasses.push('moved');
        } else if (lastMove.isSimple()) {
            this.viewInfo.boardInfo[lastMove.coord.y][lastMove.coord.x].squareClasses.push('moved');
            this.viewInfo.boardInfo[lastMove.end.y][lastMove.end.x].squareClasses.push('moved');
        } else {
            this.viewInfo.lastMoveArrow = '';
            for (const coord of lastMove.coords) {
                this.viewInfo.boardInfo[coord.y][coord.x].squareClasses.push('moved');
                this.viewInfo.lastMoveArrow += (coord.x * this.SPACE_SIZE) + this.SPACE_SIZE/2 + this.STROKE_WIDTH;
                this.viewInfo.lastMoveArrow += ' ';
                this.viewInfo.lastMoveArrow += (coord.y * this.SPACE_SIZE) + this.SPACE_SIZE/2 + this.STROKE_WIDTH;
                this.viewInfo.lastMoveArrow += ' ';
            }
        }
    }
    public cancelMoveAttempt(): void {
        this.jumpInConstruction = MGPOptional.empty();
        this.selected = MGPOptional.empty();
        this.updateBoard();
    }
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + coord.x + '_' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const state: ConspirateursState = this.getState();
        if (state.getPieceAt(coord) === this.getCurrentPlayer()) {
            this.selected = MGPOptional.of(coord);
            this.jumpInConstruction = MGPOptional.empty();
            this.updateViewInfo();
            return MGPValidation.SUCCESS;
        } else if (this.jumpInConstruction.isPresent()) {
            return this.constructJump(coord);
        } else if (this.selected.isPresent()) {
            return this.selectNextCoord(coord);
        } else if (state.isDropPhase()) {
            const move: MGPFallible<ConspirateursMove> = ConspirateursMoveDrop.of(coord);
            assert(move.isSuccess(), 'ConspirateursMove should be valid by construction');
            return this.chooseMove(move.get(), state);
        } else {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
    }
    private async constructJump(nextTarget: Coord): Promise<MGPValidation> {
        const jump: ConspirateursMoveJump = this.jumpInConstruction.get();
        const state: ConspirateursState = this.getState();
        if (nextTarget.equals(jump.getEndingCoord())) {
            // double clicking on an early destination performs the jump
            return this.chooseMove(jump, state);
        } else {
            const newJump: MGPFallible<ConspirateursMoveJump> = jump.addJump(nextTarget);
            if (newJump.isFailure()) {
                return this.cancelMove(newJump.getReason());
            }
            const jumpLegality: MGPFallible<void> = this.rules.jumpLegality(newJump.get(), state);
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
            return this.chooseMove(jump, state);
        }
    }
    private async selectNextCoord(coord: Coord): Promise<MGPValidation> {
        const selected: Coord = this.selected.get();
        const move: MGPFallible<ConspirateursMove> = ConspirateursMoveSimple.of(selected, coord);
        if (move.isSuccess()) {
            return this.chooseMove(move.get(), this.getState());
        } else {
            const jump: MGPFallible<ConspirateursMoveJump> = ConspirateursMoveJump.of([selected, coord]);
            if (jump.isFailure()) {
                return this.cancelMove(jump.getReason());
            }
            return this.updateJump(jump.get());
        }
    }
}
