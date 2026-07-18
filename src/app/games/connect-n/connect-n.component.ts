import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { ViewBox } from '../../components/game-components/GameComponentUtils';
import { GameComponent } from '../../components/game-components/game-component/GameComponent';
import { BlankGobanComponent } from '../../components/game-components/goban-game-component/blank-goban/blank-goban.component';
import { MCTS } from '../../jscaip/AI/MCTS';
import { Coord } from '../../jscaip/Coord';
import { FourStatePiece } from '../../jscaip/FourStatePiece';
import { PlayerOrNone } from '../../jscaip/Player';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TopologicGameState } from '../../jscaip/TopologicGameState';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from '../connect-six/ConnectSixMove';

import { ConnectNAlignmentMinimax } from './ConnectNAlignmentMinimax';
import { ConnectNMoveGenerator } from './ConnectNMoveGenerator';
import { ConnectNConfig, ConnectNRules } from './ConnectNRules';

@Component({
    selector: 'app-connect-n',
    templateUrl: './connect-n.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [BlankGobanComponent, NgClass],
})
export class ConnectNComponent extends GameComponent<ConnectNRules,
                                                     ConnectSixMove,
                                                     TopologicGameState<FourStatePiece>,
                                                     ConnectNConfig>
{
    protected coordsAndContents: { coord: Coord, content: FourStatePiece }[] = [];

    public droppedCoord: MGPOptional<Coord> = MGPOptional.empty();

    public lastMoved: Coord[] = [];

    public victoryCoords: Coord[] = [];

    public constructor() {
        super();
        this.setRulesAndNode('ConnectN');
        this.availableAIs = [
            new ConnectNAlignmentMinimax(),
            new MCTS($localize`MCTS`, new ConnectNMoveGenerator(), this.rules),
        ];
        this.encoder = ConnectSixMove.encoder;
    }

    public getViewBox(): ViewBox {
        let minX: number = Number.MAX_VALUE;
        let minY: number = Number.MAX_VALUE;
        let maxX: number = Number.MIN_VALUE;
        let maxY: number = Number.MIN_VALUE;
        for (const coord of this.getState().getAllCoords()) {
            minX = Math.min(minX, coord.x);
            minY = Math.min(minY, coord.y);
            maxX = Math.max(maxX, coord.x);
            maxY = Math.max(maxY, coord.y);
        }
        return ViewBox.fromLimits(
            minX * this.SPACE_SIZE,
            maxX * this.SPACE_SIZE,
            minY * this.SPACE_SIZE,
            maxY * this.SPACE_SIZE,
        );
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: TopologicGameState<FourStatePiece> = this.getState();
        // this.board = state.getCopiedBoard();
        this.coordsAndContents = state.getCoordsAndContents();
        this.victoryCoords = ConnectNRules.getVictoriousCoords(state, this.getConfig());
        // this.createHoshis();
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
        const clickValidity: MGPValidation = await this.canUserPlay('#click-' + x + '-' + y);
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
        const owner: PlayerOrNone = this.getState().getPieceAt(coord).getPlayer();
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
