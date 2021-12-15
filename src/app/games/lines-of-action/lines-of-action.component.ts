import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionRules } from './LinesOfActionRules';
import { LinesOfActionMinimax } from './LinesOfActionMinimax';
import { LinesOfActionFailure } from './LinesOfActionFailure';
import { LinesOfActionState } from './LinesOfActionState';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { LinesOfActionTutorial } from './LinesOfActionTutorial';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

@Component({
    selector: 'app-linesofaction',
    templateUrl: './lines-of-action.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LinesOfActionComponent extends RectangularGameComponent<LinesOfActionRules,
                                                                     LinesOfActionMove,
                                                                     LinesOfActionState,
                                                                     Player>
{
    public INDICATOR_SIZE: number = 20;
    public EMPTY: Player = Player.NONE;
    public targets: Coord[] = [];
    public state: LinesOfActionState;
    private selected: MGPOptional<Coord> = MGPOptional.empty();
    private lastMove: MGPOptional<LinesOfActionMove> = MGPOptional.empty();
    private captured: MGPOptional<Coord> = MGPOptional.empty();

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new LinesOfActionRules(LinesOfActionState);
        this.availableMinimaxes = [
            new LinesOfActionMinimax(this.rules, 'LinesOfActionMinimax'),
        ];
        this.encoder = LinesOfActionMove.encoder;
        this.tutorial = new LinesOfActionTutorial().tutorial;
        this.updateBoard();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const coord: Coord = new Coord(x, y);
        if (this.selected.isPresent()) {
            if (this.getState().getPieceAt(coord) === this.getState().getCurrentPlayer()) {
                return this.select(coord);
            } else {
                const move: MGPFallible<LinesOfActionMove> =
                    LinesOfActionMove.of(this.selected.get(), new Coord(x, y));
                if (move.isSuccess()) {
                    return this.chooseMove(move.get(), this.rules.node.gameState);
                } else {
                    return this.cancelMove(LinesOfActionFailure.INVALID_DIRECTION());
                }
            }
        } else {
            return this.select(coord);
        }
    }
    private async select(coord: Coord): Promise<MGPValidation> {
        if (this.getState().getPieceAt(coord) !== this.getState().getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        this.selected = MGPOptional.of(coord);
        this.targets = LinesOfActionRules.possibleTargets(this.rules.node.gameState, this.selected.get());
        if (this.targets.length === 0) {
            return this.cancelMove(LinesOfActionFailure.PIECE_CANNOT_MOVE());
        }
        return MGPValidation.SUCCESS;
    }
    public getState(): LinesOfActionState {
        return this.rules.node.gameState;
    }
    public getPreviousState(): LinesOfActionState {
        return this.rules.node.mother.get().gameState;
    }
    public updateBoard(): void {
        this.cancelMoveAttempt();
        this.board = this.getState().board;
        this.lastMove = this.rules.node.move;
        if (this.lastMove.isPresent()) {
            const lastMove: LinesOfActionMove = this.lastMove.get();
            if (this.getPreviousState().getPieceAt(lastMove.end) !== Player.NONE) {
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
    public getPieceClasses(x: number, y: number): string[] {
        const content: Player = this.board[y][x];
        const coord: Coord = new Coord(x, y);
        const classes: string[] = [this.getPlayerClass(content)];
        if (this.selected.isPresent() && this.selected.get().equals(coord)) {
            classes.push('selected');
        }
        return classes;
    }
}
