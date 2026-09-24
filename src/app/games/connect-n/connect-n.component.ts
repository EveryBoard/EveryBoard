import { NgClass } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';

import { MGPValidation, Set } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { TopologicGameComponent } from '../../components/game-components/topologic-game-component/TopologicGameComponent';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { PlayerOrNone } from '../../jscaip/Player';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';

import { ConnectNAlignmentHeuristic } from './ConnectNAlignmentHeuristic';
import { ConnectNMove } from './ConnectNMove';
import { ConnectNMoveGenerator } from './ConnectNMoveGenerator';
import { ConnectNConfig, ConnectNRules } from './ConnectNRules';

@Component({
    selector: 'app-connect-n',
    templateUrl: './connect-n.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class ConnectNComponent extends TopologicGameComponent<ConnectNRules,
                                                              ConnectNMove,
                                                              TopologicGameState<FourStatePiece>,
                                                              FourStatePiece,
                                                              ConnectNConfig>
{
    protected coordsAndContents: WritableSignal<{ coord: Coord; content: FourStatePiece }[]> = signal([]);

    protected readonly droppedCoords: WritableSignal<Set<Coord>> = signal(new Set());

    protected readonly lastMoveds: WritableSignal<Set<Coord>> = signal(new Set());

    protected readonly victoryCoords: WritableSignal<Set<Coord>> = signal(new Set());

    public constructor() {
        super('ConnectN');
        this.aiConfig = {
            minimax: [{
                id: 'Alignment',
                name: $localize`Alignment`,
                heuristic: (): ConnectNAlignmentHeuristic => new ConnectNAlignmentHeuristic(),
                moveGenerator: (): ConnectNMoveGenerator => new ConnectNMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): ConnectNMoveGenerator => new ConnectNMoveGenerator(),
            }],
        };
        this.encoder = ConnectNMove.encoder;
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: TopologicGameState<FourStatePiece> = this.state();
        this.coordsAndContents.set(state.getCoordsAndContents());
        this.victoryCoords.set(
            new Set(
                ConnectNRules.getVictoriousCoords(state, this.config()),
            ),
        );
    }

    public override async showLastMove(move: ConnectNMove): Promise<void> {
        this.lastMoveds.set(move.coords);
    }

    public override hideLastMove(): void {
        this.lastMoveds.set(new Set());
    }

    @ClickHandler((coord: Coord) => '#click-' + coord.x + '-' + coord.y)
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const config: ConnectNConfig = this.config();
        const awaitedClicks: number = this.state().turn === 0 ? 1 : config.dropAfterFirstTurn;
        if (this.state().getPieceAt(coord).isPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }
        if (this.droppedCoords().contains(coord)) {
            return this.cancelMove();
        }
        this.droppedCoords.set(this.droppedCoords().addElement(coord));
        if (this.droppedCoords().size() === awaitedClicks) {
            const move: ConnectNMove = new ConnectNMove(this.droppedCoords());
            return this.chooseMove(move);
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public getSpaceClass(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const owner: PlayerOrNone = this.state().getPieceAt(coord).getPlayer();
        const classes: string[] = [];
        if (this.droppedCoords().contains(coord)) {
            classes.push(this.getPlayerClass(this.state().getCurrentPlayer()));
            classes.push('highlighted-stroke');
        } else {
            classes.push(this.getPlayerClass(owner));
            if (this.victoryCoords().contains(coord)) {
                classes.push('victory-stroke');
            }
            if (this.lastMoveds().contains(coord)) {
                classes.push('last-move-stroke');
            }
        }
        return classes;
    }

    public override cancelMoveAttempt(): void {
        this.droppedCoords.set(new Set());
    }

}
