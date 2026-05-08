import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { GobanGameComponent } from '../../components/game-components/goban-game-component/GobanGameComponent';
import { BlankGobanComponent } from '../../components/game-components/goban-game-component/blank-goban/blank-goban.component';
import { MCTS } from '../../jscaip/AI/MCTS';
import { Coord } from '../../jscaip/Coord';
import { PlayerOrNone } from '../../jscaip/Player';
import { RulesFailure } from '../../jscaip/RulesFailure';

import { ConnectSixAlignmentMinimax } from './ConnectSixAlignmentMinimax';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from './ConnectSixMove';
import { ConnectSixMoveGenerator } from './ConnectSixMoveGenerator';
import { ConnectSixRules } from './ConnectSixRules';
import { ConnectSixState } from './ConnectSixState';

@Component({
    selector: 'app-connect-six',
    templateUrl: './connect-six.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [BlankGobanComponent, NgClass],
})
export class ConnectSixComponent extends GobanGameComponent<ConnectSixRules,
                                                            ConnectSixMove,
                                                            ConnectSixState,
                                                            PlayerOrNone>
{

    public droppedCoord: MGPOptional<Coord> = MGPOptional.empty();

    public lastMoved: Coord[] = [];

    public victoryCoords: Coord[] = [];

    public constructor() {
        super();
        this.setRulesAndNode('ConnectSix');
        this.availableAIs = [
            new ConnectSixAlignmentMinimax(),
            new MCTS($localize`MCTS`, new ConnectSixMoveGenerator(), this.rules),
        ];
        this.encoder = ConnectSixMove.encoder;
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: ConnectSixState = this.getState();
        this.board = state.getCopiedBoard();
        this.victoryCoords = ConnectSixRules.getVictoriousCoords(state);
        this.createHoshis();
    }

    public override async showLastMove(move: ConnectSixMove): Promise<void> {
        if (move instanceof ConnectSixFirstMove) {
            this.lastMoved = [move.coord];
        } else {
            this.lastMoved = [move.getFirst(), move.getSecond()];
        }
    }

    public override hideLastMove(): void {
        this.lastMoved = [];
    }

    public async onClick(coord: Coord): Promise<MGPValidation> {
        const x: number = coord.x;
        const y: number = coord.y;
        const clickValidity: MGPValidation = await this.canUserPlay('.data-click-' + x + '-' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        if (this.getState().turn === 0) {
            const move: ConnectSixMove = ConnectSixFirstMove.of(clickedCoord);
            return this.chooseMove(move);
        } else {
            if (this.getState().getPieceAt(clickedCoord).isPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            } else if (this.droppedCoord.isPresent()) {
                if (this.droppedCoord.equalsValue(clickedCoord)) {
                    return this.cancelMove();
                } else {
                    const move: ConnectSixMove = ConnectSixDrops.of(this.droppedCoord.get(), clickedCoord);
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
