import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionMinimax } from './LinesOfActionMinimax';
import { LinesOfActionFailure } from './LinesOfActionFailure';
import { LinesOfActionState } from './LinesOfActionState';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { LinesOfActionTutorial } from './LinesOfActionTutorial';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-linesofaction',
    templateUrl: './lines-of-action.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LinesOfActionComponent extends RectangularGameComponent<LinesOfActionRules,
                                                                     LinesOfActionMove,
                                                                     LinesOfActionState,
                                                                     PlayerOrNone>
{
    public INDICATOR_SIZE: number = 20;
    public EMPTY: PlayerOrNone = PlayerOrNone.NONE;
    public targets: Coord[] = [];
    public state: LinesOfActionState;
    private selected: MGPOptional<Coord> = MGPOptional.empty();
    private lastMove: MGPOptional<LinesOfActionMove> = MGPOptional.empty();
    private captured: MGPOptional<Coord> = MGPOptional.empty();

    public constructor(messageDisplayer: MessageDisplayer, actRoute: ActivatedRoute) {
        super(messageDisplayer, actRoute);
        this.rules = LinesOfActionRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new LinesOfActionMinimax(this.rules, 'LinesOfActionMinimax'),
        ];
        this.encoder = LinesOfActionMove.encoder;
        this.tutorial = new LinesOfActionTutorial().tutorial;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const coord: Coord = new Coord(x, y);
        if (this.selected.equalsValue(coord)) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        }
        const currentPlayer: PlayerOrNone = this.getState().getCurrentPlayer();
        if (this.selected.isAbsent() ||
            this.getState().getPieceAt(coord) === currentPlayer)
        {
            return this.select(coord);
        } else {
            return this.concludeMove(coord);
        }
    }
    private async concludeMove(coord: Coord): Promise<MGPValidation> {
        const move: MGPFallible<LinesOfActionMove> =
            LinesOfActionMove.from(this.selected.get(), coord);
        if (move.isSuccess()) {
            return this.chooseMove(move.get());
        } else {
            return this.cancelMove(move.getReason());
        }
    }
    private async select(coord: Coord): Promise<MGPValidation> {
        if (this.getState().getPieceAt(coord) !== this.getState().getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        this.selected = MGPOptional.of(coord);
        this.targets = LinesOfActionRules.possibleTargets(this.getState(), this.selected.get());
        if (this.targets.length === 0) {
            return this.cancelMove(LinesOfActionFailure.PIECE_CANNOT_MOVE());
        }
        return MGPValidation.SUCCESS;
    }
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.cancelMoveAttempt();
        this.board = this.getState().board;
        this.lastMove = this.node.move;
    }
    public override async showLastMove(move: LinesOfActionMove): Promise<void> {
        if (this.getPreviousState().getPieceAt(move.getEnd()).isPlayer()) {
            this.captured = MGPOptional.of(move.getEnd());
        } else {
            this.captured = MGPOptional.empty();
        }
    }
    public override cancelMoveAttempt(): void {
        this.selected = MGPOptional.empty();
        this.targets = [];
    }
    public getSquareClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);

        if (this.lastMove.isPresent()) {
            const lastMoveStart: Coord = this.lastMove.get().getStart();
            const lastMoveEnd: Coord = this.lastMove.get().getEnd();
            if (this.captured.isPresent() && coord.equals(this.captured.get())) {
                return ['captured-fill'];
            }
            if (coord.equals(lastMoveStart) || coord.equals(lastMoveEnd)) {
                return ['moved-fill'];
            }
        }
        return [];
    }
    public getPieceClasses(x: number, y: number): string[] {
        const content: PlayerOrNone = this.board[y][x];
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(content)];
        if (this.selected.isPresent() && this.selected.get().equals(coord)) {
            classes.push('selected-stroke');
        }
        return classes;
    }
}
