import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Coord } from '@everyboard/games';
import { Player, PlayerOrNone } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { PenteAlignmentHeuristic } from '@everyboard/games';
import { PenteConfig } from '@everyboard/games';
import { PenteMove } from '@everyboard/games';
import { PenteMoveGenerator } from '@everyboard/games';
import { PenteRules } from '@everyboard/games';
import { PenteState } from '@everyboard/games';
import { ScoreName } from '@everyboard/games';
import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { GobanGameComponent } from '../../components/game-components/goban-game-component/GobanGameComponent';
import { BlankGobanComponent } from '../../components/game-components/goban-game-component/blank-goban/blank-goban.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-new-game',
    templateUrl: './pente.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [BlankGobanComponent, NgClass],
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

    public constructor() {
        super('Pente');
        this.aiConfig = {
            minimax: [{
                id: 'Alignment',
                name: $localize`Alignment`,
                heuristic: (): PenteAlignmentHeuristic => new PenteAlignmentHeuristic(),
                moveGenerator: (): PenteMoveGenerator => new PenteMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): PenteMoveGenerator => new PenteMoveGenerator(),
            }],
        };
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
        const config: PenteConfig = this.config();
        this.victoryCoords = this.rules.getHelper(config).getVictoriousCoord(state);
        this.createHoshis();
    }

    protected override async showLastMove(move: PenteMove): Promise<void> {
        this.lastMoved = MGPOptional.of(move.coord);
        const opponent: Player = this.getCurrentOpponent();
        this.captured = PenteRules.get().getCaptures(
            move.coord,
            this.getPreviousState(),
            this.config(),
            opponent,
        );
    }

    public override hideLastMove(): void {
        this.captured = [];
        this.lastMoved = MGPOptional.empty();
    }

    @ClickHandler((coord: Coord) => '.space-' + coord.x + '-' + coord.y)
    public async onClick(coord: Coord): Promise<MGPValidation> {
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
