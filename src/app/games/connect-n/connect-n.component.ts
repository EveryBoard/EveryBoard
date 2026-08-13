import { NgClass } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';

import { MGPValidation } from '@everyboard/lib';

import { TopologicGameComponent } from '../../components/game-components/topologic-game-component/TopologicGameComponent';
import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { MCTS } from '../../jscaip/AI/MCTS';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { PlayerOrNone } from '../../jscaip/Player';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TopologicGameState } from '../../jscaip/state/TopologicGameState';

import { ConnectNAlignmentMinimax } from './ConnectNAlignmentMinimax';
import { ConnectNMove } from './ConnectNMove';
import { ConnectNMoveGenerator } from './ConnectNMoveGenerator';
import { ConnectNConfig, ConnectNRules } from './ConnectNRules';
import { ConnectNAlignmentHeuristic } from './ConnectNAlignmentHeuristic';

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
    protected coordsAndContents: WritableSignal<{ coord: Coord, content: FourStatePiece }[]> = signal([]);

    public droppedCoords: WritableSignal<Coord[]> = signal([]);

    public lastMoveds: WritableSignal<Coord[]> = signal([]);

    public victoryCoords: WritableSignal<Coord[]> = signal([]);

    private readonly NUMBER_OF_AWAITED_DROPS: number = 2;

    public constructor() {
        super();
        this.setRulesAndNode('ConnectN');
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
        const state: TopologicGameState<FourStatePiece> = this.getState();
        this.coordsAndContents.set(state.getCoordsAndContents());
        this.victoryCoords.set(ConnectNRules.getVictoriousCoords(state, this.getConfig()));
    }

    public override async showLastMove(move: ConnectNMove): Promise<void> {
        this.lastMoveds.set(move.coords.toList());
    }

    public override hideLastMove(): void {
        this.lastMoveds.set([]);
    }

    @ClickHandler((coord: Coord) => '#click-' + coord.x + '-' + coord.y)
    public async onClick(coord: Coord): Promise<MGPValidation> {
        const x: number = coord.x;
        const y: number = coord.y;
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + x + '-' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const clickedCoord: Coord = new Coord(x, y);
        if (this.getState().turn === 0) {
            const move: ConnectNMove = ConnectNMove.of([clickedCoord]);
            return this.chooseMove(move);
        } else {
            if (this.getState().getPieceAt(clickedCoord).isPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            } else if (this.droppedCoords().length === 0) {
                this.droppedCoords.set([clickedCoord]);
                return MGPValidation.SUCCESS;
            } else {
                if (this.droppedCoords().some((c: Coord) => c.equals(clickedCoord))) {
                    return this.cancelMove();
                } else {
                    const droppedCoords: Coord[] = this.droppedCoords();
                    droppedCoords.push(clickedCoord);
                    this.droppedCoords.set(droppedCoords);
                    if (this.droppedCoords().length === this.NUMBER_OF_AWAITED_DROPS) {
                        const move: ConnectNMove = ConnectNMove.of(this.droppedCoords());
                        return this.chooseMove(move);
                    } else {
                        return MGPValidation.SUCCESS;
                    }
                }
            }
        }
    }

    public getSpaceClass(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const owner: PlayerOrNone = this.getState().getPieceAt(coord).getPlayer();
        const classes: string[] = [];
        if (this.droppedCoords().some((c: Coord) => c.equals(coord))) {
            classes.push(this.getPlayerClass(this.getState().getCurrentPlayer()));
            classes.push('highlighted-stroke');
        } else {
            classes.push(this.getPlayerClass(owner));
            if (this.victoryCoords().some((c: Coord) => c.equals(coord))) {
                classes.push('victory-stroke');
            }
            if (this.lastMoveds().some((c: Coord) => c.equals(coord))) {
                classes.push('last-move-stroke');
            }
        }
        return classes;
    }

    public override cancelMoveAttempt(): void {
        this.droppedCoords.set([]);
    }

}
