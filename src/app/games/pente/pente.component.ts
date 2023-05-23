import { PenteRules } from './PenteRules';
import { PenteMove } from './PenteMove';
import { PenteState } from './PenteState';
import { PenteAlignmentMinimax } from './PenteAlignmentMinimax';
import { Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { PenteTutorial } from './PenteTutorial';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { GobanGameComponent } from 'src/app/components/game-components/goban-game-component/GobanGameComponent';

@Component({
    selector: 'app-new-game',
    templateUrl: './pente.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class PenteComponent extends GobanGameComponent<PenteRules, PenteMove, PenteState, PlayerOrNone> {

    public lastMoved: MGPOptional<Coord> = MGPOptional.empty();
    public victoryCoords: Coord[] = [];
    public captured: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.scores = MGPOptional.of([0, 0]);
        this.rules = PenteRules.get();
        this.node = this.rules.getInitialNode();
        this.encoder = PenteMove.encoder;
        this.tutorial = new PenteTutorial().tutorial;
        this.availableMinimaxes = [
            new PenteAlignmentMinimax(this.rules, 'Alignment'),
        ];
    }
    public updateBoard(): void {
        const state: PenteState = this.getState();
        this.board = state.board;
        this.scores = MGPOptional.of(this.getState().captures);
        this.victoryCoords = PenteRules.PENTE_HELPER.getVictoriousCoord(state);
        this.createHoshis();
        this.cancelMoveAttempt();
    }
    public override showLastMove(): void {
        const move: PenteMove = this.node.move.get();
        this.lastMoved = MGPOptional.of(move.coord);
        const opponent: Player = this.getCurrentPlayer().getOpponent();
        this.captured = PenteRules.get().getCaptures(move.coord, this.getPreviousState(), opponent);
    }
    public override cancelMoveAttempt(): void {
        this.lastMoved = MGPOptional.empty();
        this.captured = [];
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        return this.chooseMove(PenteMove.of(clickedCoord), this.getState());
    }
    public getSpaceClass(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const owner: PlayerOrNone = this.getState().getPieceAt(coord);
        const classes: string[] = [];
        classes.push(this.getPlayerClass(owner));
        if (this.victoryCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('victory-stroke');
        }
        if (this.lastMoved.equalsValue(coord)) {
            classes.push('last-move-stroke');
        }
        return classes;
    }
}