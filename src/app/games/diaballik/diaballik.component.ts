import { DefeatCoords, DiaballikRules, VictoryCoord, VictoryOrDefeatCoords } from './DiaballikRules';
import { DiaballikMove, DiaballikBallPass, DiaballikSubMove, DiaballikTranslation } from './DiaballikMove';
import { DiaballikPiece, DiaballikState } from './DiaballikState';
import { Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { DiaballikTutorial } from './DiaballikTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { DiaballikMinimax } from './DiaballikMinimax';
import { DiaballikMoveGenerator } from './DiaballikMoveGenerator';
import { MCTS } from 'src/app/jscaip/MCTS';
import { Utils } from 'src/app/utils/utils';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { DiaballikFailure } from './DiaballikFailure';

@Component({
    selector: 'app-diaballik',
    templateUrl: './diaballik.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})

export class DiaballikComponent
    extends RectangularGameComponent<DiaballikRules, DiaballikMove, DiaballikState, DiaballikPiece, DiaballikState>
{

    public stateInConstruction: DiaballikState;

    public WIDTH: number;
    public HEIGHT: number;
    public INDICATOR_SIZE: number = 20;

    public victoryCoord: MGPOptional<Coord> = MGPOptional.empty();
    public defeatCoords: Coord[] = [];

    public indicators: Coord[] = [];

    private currentSelection: MGPOptional<Coord> = MGPOptional.empty();
    private hasMadePass: boolean = false;
    private translationsMade: number = 0;
    private subMoves: DiaballikSubMove[] = [];

    private lastMovedBallCoords: Coord[] = [];
    private lastMovedPiecesCoords: Coord[] = [];

    private moveGenerator: DiaballikMoveGenerator = new DiaballikMoveGenerator();

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.rules = DiaballikRules.get();
        this.node = this.rules.getInitialNode();
        this.WIDTH = this.getState().getWidth();
        this.HEIGHT = this.getState().getHeight();
        this.encoder = DiaballikMove.encoder;
        this.tutorial = new DiaballikTutorial().tutorial;
        this.availableAIs = [
            new DiaballikMinimax(),
            new MCTS($localize`MCTS`, this.moveGenerator, this.rules),
        ];
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: DiaballikState = this.node.gameState;
        this.board = state.board; // Needed by RectangularGameComponent
        this.stateInConstruction = state;
        const possibleVictory: MGPOptional<VictoryOrDefeatCoords> = this.rules.getVictoryOrDefeatCoords(state);
        if (possibleVictory.isPresent()) {
            const victory: VictoryOrDefeatCoords = possibleVictory.get();
            if (victory instanceof VictoryCoord) {
                this.victoryCoord = MGPOptional.of(victory.coord);
            } else if (victory instanceof DefeatCoords) {
                this.defeatCoords = victory.coords;
            }
        }
    }

    public override async showLastMove(move: DiaballikMove): Promise<void> {
        this.lastMovedPiecesCoords = [];
        this.lastMovedBallCoords = [];
        for (const subMove of move.getSubMoves()) {
            if (subMove instanceof DiaballikTranslation) {
                this.lastMovedPiecesCoords.push(subMove.getStart(), subMove.getEnd());
            } else {
                Utils.assert(subMove instanceof DiaballikBallPass, 'DiaballikMove can only be a translation or a pass');
                this.lastMovedBallCoords.push(subMove.getStart(), subMove.getEnd());
            }
        }
    }

    public override cancelMoveAttempt(): void {
        this.stateInConstruction = this.getState();
        this.currentSelection = MGPOptional.empty();
        this.hasMadePass = false;
        this.translationsMade = 0;
        this.subMoves = [];
        this.indicators = [];
    }

    public getSpaceClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [];
        if (this.lastMovedPiecesCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('moved-fill');
        }
        if (this.lastMovedBallCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('moved-fill');
        }
        if (this.victoryCoord.equalsValue(coord)) {
            classes.push('victory-stroke');
        }
        return classes;
    }

    public getPieceClasses(x: number, y: number, piece: DiaballikPiece): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(piece.owner)];
        if (this.lastMovedPiecesCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('last-move-stroke');
        }
        if (piece.holdsBall === false && this.currentSelection.equalsValue(new Coord(x, y))) {
            classes.push('selected-stroke');
        }
        if (this.defeatCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('defeat-stroke');
        }
        return classes;
    }

    public getBallClasses(x: number, y: number, piece: DiaballikPiece): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(piece.owner)];
        if (this.lastMovedBallCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('last-move-stroke');
        }
        if (this.currentSelection.equalsValue(new Coord(x, y))) {
            classes.push('selected-stroke');
        }
        return classes;
    }

    private async addSubMove(subMove: DiaballikSubMove, stateAfterSubMove: DiaballikState): Promise<MGPValidation> {
        this.currentSelection = MGPOptional.empty();
        this.indicators = [];
        this.subMoves.push(subMove);
        this.stateInConstruction = stateAfterSubMove;
        if (this.subMoves.length === 3) {
            const move: DiaballikMove =
                new DiaballikMove(this.subMoves[0], MGPOptional.of(this.subMoves[1]), MGPOptional.of(this.subMoves[2]));
            return this.chooseMove(move);
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const clickedCoord: Coord = new Coord(x, y);
        const clickedPiece: DiaballikPiece = this.stateInConstruction.getPieceAt(clickedCoord);
        if (this.currentSelection.isPresent()) {
            const selection: Coord = this.currentSelection.get();
            if (selection.equals(clickedCoord)) {
                // Just deselects
                this.currentSelection = MGPOptional.empty();
                this.indicators = [];
                return MGPValidation.SUCCESS;
            }
            if (this.stateInConstruction.getPieceAt(selection).holdsBall) {
                return this.performPass(selection, clickedCoord);
            } else {
                return this.performTranslation(selection, clickedCoord);
            }
        } else {
            // No piece selected, select this one if it is a player piece
            if (clickedPiece.owner === this.getCurrentPlayer()) {
                if (this.hasMadePass && clickedPiece.holdsBall) {
                    // Only one pass is allowed, so we don't allow to select the piece holding the ball anymore
                    return this.cancelMove(DiaballikFailure.CAN_ONLY_DO_ONE_PASS());
                } else if (this.translationsMade === 2 && clickedPiece.holdsBall === false) {
                    // At most two translations are allowed
                    return this.cancelMove(DiaballikFailure.CAN_ONLY_TRANSLATE_TWICE());
                } else {
                    this.currentSelection = MGPOptional.of(clickedCoord);
                    if (clickedPiece.holdsBall) {
                        this.indicators = this.moveGenerator.getPassEnds(this.stateInConstruction, clickedCoord);
                    } else {
                        this.indicators = this.moveGenerator.getTranslationEnds(this.stateInConstruction, clickedCoord);
                    }
                    return MGPValidation.SUCCESS;
                }
            } else {
                return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            }
        }
    }

    private performPass(start: Coord, end: Coord): Promise<MGPValidation> {
        const pass: MGPFallible<DiaballikBallPass> = DiaballikBallPass.from(start, end);
        if (pass.isSuccess()) {
            const passLegality: MGPFallible<DiaballikState> =
                this.rules.isLegalPass(this.stateInConstruction, pass.get());
            if (passLegality.isSuccess()) {
                this.hasMadePass = true;
                return this.addSubMove(pass.get(), passLegality.get());
            } else {
                return this.cancelMove(passLegality.getReason());
            }
        } else {
            return this.cancelMove(pass.getReason());
        }
    }

    private performTranslation(start: Coord, end: Coord): Promise<MGPValidation> {
        const translation: MGPFallible<DiaballikTranslation> = DiaballikTranslation.from(start, end);
        if (translation.isSuccess()) {
            const translationLegality: MGPFallible<DiaballikState> =
                this.rules.isLegalTranslation(this.stateInConstruction, translation.get());
            if (translationLegality.isSuccess()) {
                this.translationsMade++;
                return this.addSubMove(translation.get(), translationLegality.get());
            } else {
                return this.cancelMove(translationLegality.getReason());
            }
        } else {
            return this.cancelMove(translation.getReason());
        }
    }

    public showDoneButton(): boolean {
        return this.isInteractive && this.subMoves.length >= 1;
    }

    public async done(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#done');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        let second: MGPOptional<DiaballikSubMove> = MGPOptional.empty();
        if (this.subMoves.length >= 2) {
            second = MGPOptional.of(this.subMoves[1]);
        }
        // Note: user can't click on done if there are either no sub move (button doesn't appear)
        // or if there are three submoves (as the move would have been performed directly)

        const move: DiaballikMove = new DiaballikMove(this.subMoves[0], second, MGPOptional.empty());
        return this.chooseMove(move);
    }

    public getBoardRotation(): string {
        const rotation: number = this.getPointOfView().value * 180;
        const boardWidth: number = this.getState().getWidth() * this.SPACE_SIZE + this.STROKE_WIDTH;
        const boardHeight: number = this.getState().getHeight() * this.SPACE_SIZE + this.STROKE_WIDTH;
        const centerX: number = boardWidth / 2;
        const centerY: number = boardHeight / 2;
        console.log({centerX, centerY, rotation})
        return `rotate(${rotation} ${centerX} ${centerY})`;
    }
}
