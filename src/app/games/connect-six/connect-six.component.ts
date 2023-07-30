import { Component } from '@angular/core';
import { ConnectSixRules } from './ConnectSixRules';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove, ConnectSixMoveEncoder } from './ConnectSixMove';
import { ConnectSixState } from './ConnectSixState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ConnectSixTutorial } from './ConnectSixTutorial';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { GobanGameComponent } from 'src/app/components/game-components/goban-game-component/GobanGameComponent';
import { ConnectSixMinimax } from './ConnectSixMinimax';

@Component({
    selector: 'app-connect-six',
    templateUrl: './connect-six.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ConnectSixComponent extends GobanGameComponent<ConnectSixRules,
                                                            ConnectSixMove,
                                                            ConnectSixState,
                                                            PlayerOrNone>
{
    public droppedCoord: MGPOptional<Coord> = MGPOptional.empty();

    public lastMoved: Coord[] = [];

    public victoryCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = ConnectSixRules.get();
        this.node = this.rules.getInitialNode();
        this.availableMinimaxes = [
            new ConnectSixMinimax(),
        ];
        this.encoder = ConnectSixMoveEncoder;
        this.tutorial = new ConnectSixTutorial().tutorial;
    }
    public updateBoard(): void {
        const state: ConnectSixState = this.getState();
        this.board = state.getCopiedBoard();
        this.victoryCoords = ConnectSixRules.getVictoriousCoords(state);
        this.createHoshis();
    }
    public override showLastMove(move: ConnectSixMove): void {
        if (move instanceof ConnectSixFirstMove) {
            this.lastMoved = [move.coord];
        } else {
            this.lastMoved = [move.getFirst(), move.getSecond()];
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        if (this.getState().turn === 0) {
            return this.chooseMove(ConnectSixFirstMove.from(clickedCoord));
        } else {
            if (this.getState().getPieceAt(clickedCoord).isPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            } else if (this.droppedCoord.isPresent()) {
                if (this.droppedCoord.equalsValue(clickedCoord)) {
                    this.droppedCoord = MGPOptional.empty();
                    return MGPValidation.SUCCESS;
                } else {
                    const move: ConnectSixMove = ConnectSixDrops.from(this.droppedCoord.get(), clickedCoord).get();
                    return this.chooseMove(move);
                }
            } else {
                this.droppedCoord = MGPOptional.of(clickedCoord);
                return MGPValidation.SUCCESS;
            }
        }
    }
    public getSpaceClass(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const owner: PlayerOrNone = this.getState().getPieceAt(coord);
        const classes: string[] = [];
        if (this.droppedCoord.equalsValue(coord)) {
            classes.push(this.getPlayerClass(this.getState().getCurrentPlayer()));
            classes.push('highlighted-stroke');
        } else {
            classes.push(this.getPlayerClass(owner));
            if (this.victoryCoords.some((c: Coord) => c.equals(coord))) {
                classes.push('victory-stroke');
            }
            if (this.lastMoved.some((c: Coord) => c.equals(coord))) {
                classes.push('last-move-stroke');
            }
        }
        return classes;
    }
    public override cancelMoveAttempt(): void {
        this.droppedCoord = MGPOptional.empty();
    }
}
