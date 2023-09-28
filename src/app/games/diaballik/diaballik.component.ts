import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { DefeatCoords, DiaballikFailure, DiaballikRules, VictoryCoord, VictoryOrDefeatCoords } from './DiaballikRules';
import { DiaballikMove, DiaballikPass, DiaballikSubMove, DiaballikTranslation } from './DiaballikMove';
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

@Component({
    selector: 'app-diaballik',
    templateUrl: './diaballik.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})

export class DiaballikComponent extends GameComponent<DiaballikRules, DiaballikMove, DiaballikState, DiaballikState> {

    public stateInConstruction: DiaballikState;

    public WIDTH: number;
    public HEIGHT: number;
    public INDICATOR_SIZE: number = 20;

    public victoryCoord: MGPOptional<Coord> = MGPOptional.empty();
    public defeatCoords: Coord[] = [];

    public indicators: Coord[] = [];

    private currentSelection: MGPOptional<Coord> = MGPOptional.empty();
    private hasMadePass: boolean = false;
    private subMoves: DiaballikSubMove[] = [];

    private lastMovedBallCoords: Coord[] = [];
    private lastMovedPiecesCoords: Coord[] = [];

    private moveGenerator: DiaballikMoveGenerator = new DiaballikMoveGenerator();

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymmetricBoard = true;
        this.rules = DiaballikRules.get();
        this.node = this.rules.getInitialNode();
        this.WIDTH = this.getState().board.length;
        this.HEIGHT = this.getState().board[0].length;
        this.encoder = DiaballikMove.encoder;
        this.tutorial = new DiaballikTutorial().tutorial;
        this.availableAIs = [
            new DiaballikMinimax(),
            new MCTS($localize`MCTS`, this.moveGenerator, this.rules),
        ];
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: DiaballikState = this.node.gameState;
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
            } else if (subMove instanceof DiaballikPass) {
                this.lastMovedBallCoords.push(subMove.getStart(), subMove.getEnd());
            }
        }
    }

    public override cancelMoveAttempt(): void {
        this.stateInConstruction = this.getState();
        this.currentSelection = MGPOptional.empty();
        this.hasMadePass = false;
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
        if (this.defeatCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('defeat-stroke');
        }
        return classes;
    }

    public getPieceClasses(x: number, y: number, piece: DiaballikPiece): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(piece.owner)];
        if (this.lastMovedPiecesCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('last-move-stroke')
        }
        if (piece.holdsBall === false && this.currentSelection.equalsValue(new Coord(x, y))) {
            classes.push('selected-stroke');
        }
        return classes;
    }

    public getBallClasses(x: number, y: number, piece: DiaballikPiece): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(piece.owner)];
        if (this.lastMovedBallCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('last-move-stroke')
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
                } else {
                    this.currentSelection = MGPOptional.of(clickedCoord);
                    if (clickedPiece.holdsBall) {
                        this.indicators = this.moveGenerator.getPassEnds(this.stateInConstruction, clickedCoord);
                        console.log(this.indicators.length)
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
        const pass: MGPFallible<DiaballikPass> = DiaballikPass.from(start, end);
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
                return this.addSubMove(translation.get(), translationLegality.get());
            } else {
                return this.cancelMove(translationLegality.getReason());
            }
        } else {
            return this.cancelMove(translation.getReason());
        }
    }

    public showDoneButton(): boolean {
        return this.subMoves.length >= 1; // TODO atfer merging design-enhancements: && this.isInteractive
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

}
