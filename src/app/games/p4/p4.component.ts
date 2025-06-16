import { ChangeDetectorRef, Component } from '@angular/core';
import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { P4State } from './P4State';
import { P4Config, P4Rules } from './P4Rules';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { P4Move } from '../../../app/games/p4/P4Move';
import { PlayerOrNone } from '../../../app/jscaip/Player';
import { Coord } from '../../../app/jscaip/Coord';
import { MessageDisplayer } from '../../../app/services/MessageDisplayer';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class P4Component extends RectangularGameComponent<P4Rules, P4Move, P4State, PlayerOrNone, P4Config> {

    public EMPTY: PlayerOrNone = PlayerOrNone.NONE;
    public last: MGPOptional<Coord> = MGPOptional.empty();
    public victoryCoords: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('P4');
        // this.availableAIs = [ TODO: make this code sequence only present in setRulesAndNodes
        this.encoder = P4Move.encoder;
    }

    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay(`#click-${ x }-${ y }`);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: P4Move = P4Move.of(x);
        return await this.chooseMove(chosenMove);
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: P4State = this.getState();

        this.victoryCoords = P4Rules.get().getVictoriousCoords(state);
        this.board = state.board;
    }

    public override async showLastMove(move: P4Move): Promise<void> {
        const state: P4State = this.getState();
        const y: number = P4Rules.get().getLowestUnoccupiedSpace(state.board, move.x) + 1;
        this.last = MGPOptional.of(new Coord(move.x, y));
    }

    public override hideLastMove(): void {
        this.last = MGPOptional.empty();
    }

    public getSquareFillClass(x: number, y: number): string[] {
        const content: PlayerOrNone = this.board[y][x];
        return [this.getPlayerClass(content)];
    }

}
