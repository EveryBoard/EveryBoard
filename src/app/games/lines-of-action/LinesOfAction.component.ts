import { Component } from '@angular/core';
import { AbstractGameComponent }
    from 'src/app/components/game-components/abstract-game-component/AbstractGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionMinimax } from './LinesOfActionMinimax';
import { LinesOfActionFailure } from './LinesOfActionFailure';
import { LinesOfActionState } from './LinesOfActionState';
import { MoveEncoder } from 'src/app/jscaip/Encoder';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TutorialStep } from 'src/app/components/wrapper-components/tutorial-game-wrapper/TutorialStep';
import { linesOfActionTutorial } from './LinesOfActionTutorial';

@Component({
    selector: 'app-linesofaction',
    templateUrl: './LinesOfAction.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class LinesOfActionComponent extends AbstractGameComponent<LinesOfActionMove, LinesOfActionState> {

    public CASE_SIZE: number = 100;
    public STROKE_WIDTH: number = 8;
    public INDICATOR_SIZE: number = 20;
    public EMPTY: number = Player.NONE.value;
    public targets: Coord[] = [];
    public state: LinesOfActionState;
    private selected: MGPOptional<Coord> = MGPOptional.empty();
    private lastMove: MGPOptional<LinesOfActionMove> = MGPOptional.empty();
    private captured: MGPOptional<Coord> = MGPOptional.empty();

    public encoder: MoveEncoder<LinesOfActionMove> = LinesOfActionMove.encoder;

    public tutorial: TutorialStep[] = linesOfActionTutorial;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new LinesOfActionRules(LinesOfActionState);
        this.availableMinimaxes = [
            new LinesOfActionMinimax(this.rules, 'LinesOfActionMinimax'),
        ];
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const coord: Coord = new Coord(x, y);
        if (this.selected.isPresent()) {
            if (this.getState().getAt(coord) === this.getState().getCurrentPlayer().value) {
                return this.select(coord);
            } else {
                const move: MGPFallible<LinesOfActionMove> =
                    LinesOfActionMove.of(this.selected.get(), new Coord(x, y));
                if (move.isSuccess()) {
                    return this.chooseMove(move.get(), this.rules.node.gamePartSlice, null, null);
                } else {
                    return this.cancelMove(LinesOfActionFailure.INVALID_DIRECTION);
                }
            }
        } else {
            return this.select(coord);
        }
    }
    private async select(coord: Coord): Promise<MGPValidation> {
        if (this.getState().getAt(coord) !== this.getState().getCurrentPlayer().value) {
            return this.cancelMove(LinesOfActionFailure.NOT_YOUR_PIECE);
        }
        this.selected = MGPOptional.of(coord);
        this.targets = LinesOfActionRules.possibleTargets(this.rules.node.gamePartSlice, this.selected.get());
        if (this.targets.length === 0) {
            return this.cancelMove(LinesOfActionFailure.PIECE_CANNOT_MOVE);
        }
        return MGPValidation.SUCCESS;
    }
    public getState(): LinesOfActionState {
        return this.rules.node.gamePartSlice;
    }
    public getPreviousState(): LinesOfActionState {
        return this.rules.node.mother.gamePartSlice;
    }
    public updateBoard(): void {
        this.cancelMoveAttempt();
        this.board = this.getState().board;
        this.lastMove = MGPOptional.ofNullable(this.rules.node.move);
        if (this.lastMove.isPresent()) {
            const lastMove: LinesOfActionMove = this.lastMove.get();
            if (this.getPreviousState().getAt(lastMove.end) !== Player.NONE.value) {
                this.captured = MGPOptional.of(lastMove.end);
            } else {
                this.captured = MGPOptional.empty();
            }
        }
    }
    public cancelMoveAttempt(): void {
        this.selected = MGPOptional.empty();
        this.targets = [];
    }
    public getCaseClasses(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);

        if (this.lastMove.isPresent()) {
            const lastMoveStart: Coord = this.lastMove.get().coord;
            const lastMoveEnd: Coord = this.lastMove.get().end;
            if (this.captured.isPresent() && coord.equals(this.captured.get())) {
                return ['captured'];
            }
            if (coord.equals(lastMoveStart) || coord.equals(lastMoveEnd)) {
                return ['moved'];
            }
        }
        return [];
    }
    public getPieceClasses(x: number, y: number, content: number): string[] {
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(Player.of(content))];
        if (this.selected.isPresent() && this.selected.get().equals(coord)) {
            classes.push('selected');
        }
        return classes;
    }
}
