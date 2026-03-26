import { ChangeDetectorRef, Component } from '@angular/core';

import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { ScoreName } from '../../components/game-components/game-component/GameComponent';
import { GobanGameComponent } from '../../components/game-components/goban-game-component/GobanGameComponent';
import { MCTS } from '../../jscaip/AI/MCTS';
import { Coord } from '../../jscaip/Coord';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { MessageDisplayer } from '../../services/MessageDisplayer';

import { PenteAlignmentMinimax } from './PenteAlignmentMinimax';
import { PenteConfig } from './PenteConfig';
import { PenteMove } from './PenteMove';
import { PenteMoveGenerator } from './PenteMoveGenerator';
import { PenteRules } from './PenteRules';
import { PenteState } from './PenteState';
import { BlankGobanComponent } from '../../components/game-components/goban-game-component/blank-goban/blank-goban.component';
import { NgFor, NgClass } from '@angular/common';

@Component({
    selector: 'app-new-game',
    templateUrl: './pente.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [BlankGobanComponent, NgFor, NgClass]
})
export class PenteComponent extends GobanGameComponent<PenteRules,
                                                       PenteMove,
                                                       PenteState,
                                                       PlayerOrNone,
                                                       PenteConfig>
{

    public lastMoved: MGPOptional<Coord> = MGPOptional.empty();
    public victoryCoords: Coord[] = [];
    public captured: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer, cdr: ChangeDetectorRef) {
        super(messageDisplayer, cdr);
        this.setRulesAndNode('Pente');
        this.availableAIs = [
            new PenteAlignmentMinimax(),
            new MCTS($localize`MCTS`, new PenteMoveGenerator(), this.rules),
        ];
        this.encoder = PenteMove.encoder;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    protected override getScoreName(): ScoreName {
        return ScoreName.CAPTURES;
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: PenteState = this.getState();
        this.board = state.board;
        this.scores = MGPOptional.of(this.getState().captures);
        const config: MGPOptional<PenteConfig> = this.getConfig();
        this.victoryCoords = this.rules.getHelper(config.get()).getVictoriousCoord(state);
        this.createHoshis();
    }

    public override async showLastMove(move: PenteMove): Promise<void> {
        this.lastMoved = MGPOptional.of(move.coord);
        const opponent: Player = this.getCurrentOpponent();
        this.captured = PenteRules.get().getCaptures(
            move.coord,
            this.getPreviousState(),
            this.getConfig().get(),
            opponent,
        );
    }

    public override hideLastMove(): void {
        this.captured = [];
        this.lastMoved = MGPOptional.empty();
    }

    public async onClick(coord: Coord): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + coord.x + '-' + coord.y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        return this.chooseMove(PenteMove.of(coord));
    }

    public getSpaceClass(coord: Coord): string[] {
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
