import { PenteRules } from './PenteRules';
import { PenteMove } from './PenteMove';
import { PenteState } from './PenteState';
import { Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { GobanGameComponent } from 'src/app/components/game-components/goban-game-component/GobanGameComponent';
import { MCTS } from 'src/app/jscaip/AI/MCTS';
import { PenteMoveGenerator } from './PenteMoveGenerator';
import { PenteAlignmentHeuristic } from './PenteAlignmentHeuristic';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { PenteConfig } from './PenteConfig';

@Component({
    selector: 'app-new-game',
    templateUrl: './pente.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
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

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('Pente');
        this.availableAIs = [
            new Minimax($localize`Alignment`, this.rules, new PenteAlignmentHeuristic(), new PenteMoveGenerator()),
            new MCTS($localize`MCTS`, new PenteMoveGenerator(), this.rules),
        ];
        this.encoder = PenteMove.encoder;
        this.scores = MGPOptional.of(PlayerNumberMap.of(0, 0));
    }

    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: PenteState = this.getState();
        this.board = state.board;
        this.scores = MGPOptional.of(this.getState().captures);
        const config: MGPOptional<PenteConfig> = this.getConfig();
        this.victoryCoords = this.rules.getHelper(config).getVictoriousCoord(state);
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
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + coord.x + '_' + coord.y);
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
