import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { ConnectSixRules } from './ConnectSixRules';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove, ConnectSixMoveEncoder } from './ConnectSixMove';
import { ConnectSixState } from './ConnectSixState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ConnectSixTutorial } from './ConnectSixTutorial.spec';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

@Component({
    selector: 'app-connect-six',
    templateUrl: './connect-six.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class ConnectSixComponent extends RectangularGameComponent<ConnectSixRules,
                                                                  ConnectSixMove,
                                                                  ConnectSixState,
                                                                  PlayerOrNone>
{
    public droppedCoord: MGPOptional<Coord> = MGPOptional.empty();

    public victoryCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = ConnectSixRules.get();
        this.availableMinimaxes = [
        ];
        this.encoder = ConnectSixMoveEncoder;
        this.tutorial = new ConnectSixTutorial().tutorial;
    }
    public updateBoard(): void {
        const state: ConnectSixState = this.getState();
        this.board = state.getCopiedBoard();
        this.victoryCoords = ConnectSixRules.getVictoriousCoords(state);
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.getState().turn === 0) {
            return this.chooseMove(new ConnectSixFirstMove(x, y), this.getState());
        } else {
            const clickedCoord: Coord = new Coord(x, y);
            if (this.getState().getPieceAt(clickedCoord).isPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            } else if (this.droppedCoord.isPresent()) {
                if (this.droppedCoord.equalsValue(clickedCoord)) {
                    return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
                } else {
                    const move: ConnectSixMove = ConnectSixDrops.from(this.droppedCoord.get(), clickedCoord).get();
                    return this.chooseMove(move, this.getState());
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
        const classes: string[] = [this.getPlayerClass(owner)];
        if (this.victoryCoords.some((c: Coord) => c.equals(coord))) {
            classes.push('victory-stroke');
        }
        return classes;
    }
    public cancelMoveAttempt(): void {
        this.droppedCoord = MGPOptional.empty();
    }
    public async removeDroppedCoord(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#dropped');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.droppedCoord = MGPOptional.empty();
        return MGPValidation.SUCCESS;
    }
}
