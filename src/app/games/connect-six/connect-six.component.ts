import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';

import { Coord } from '@everyboard/games';
import { PlayerOrNone } from '@everyboard/games';
import { RulesFailure } from '@everyboard/games';
import { ConnectSixAlignmentHeuristic } from '@everyboard/games/connect-six';
import { ConnectSixDrops, ConnectSixFirstMove, ConnectSixMove } from '@everyboard/games/connect-six';
import { ConnectSixMoveGenerator } from '@everyboard/games/connect-six';
import { ConnectSixRules } from '@everyboard/games/connect-six';
import { ConnectSixState } from '@everyboard/games/connect-six';
import { MGPOptional, MGPValidation, Set } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { GobanGameComponent } from '../../components/game-components/goban-game-component/GobanGameComponent';
import { BlankGobanComponent } from '../../components/game-components/goban-game-component/blank-goban/blank-goban.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
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

    protected droppedCoord: WritableSignal<MGPOptional<Coord>> = signal(MGPOptional.empty());

    private readonly lastMoved: WritableSignal<Set<Coord>> = signal(new Set());

    private readonly victoryCoords: WritableSignal<Set<Coord>> = signal(new Set());

    public constructor() {
        super('ConnectSix');
        this.aiConfig = {
            minimax: [{
                id: 'Alignment',
                name: $localize`Alignment`,
                heuristic: (): ConnectSixAlignmentHeuristic => new ConnectSixAlignmentHeuristic(),
                moveGenerator: (): ConnectSixMoveGenerator => new ConnectSixMoveGenerator(),
            }],
            mcts: [{
                id: 'default',
                name: $localize`MCTS`,
                moveGenerator: (): ConnectSixMoveGenerator => new ConnectSixMoveGenerator(),
            }],
        };
        this.encoder = ConnectSixMove.encoder;
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
        const state: ConnectSixState = this.state();
        this.board = state.getCopiedBoard();
        this.victoryCoords.set(new Set(ConnectSixRules.getVictoriousCoords(state)));
        this.createHoshis();
    }

    protected override async showLastMove(move: ConnectSixMove): Promise<void> {
        if (move instanceof ConnectSixFirstMove) {
            this.lastMoved.set(new Set([move.coord]));
        } else {
            this.lastMoved.set(new Set([move.getFirst(), move.getSecond()]));
        }
    }

    public override hideLastMove(): void {
        this.lastMoved.set(new Set());
    }

    @ClickHandler((coord: Coord) => '.space-' + coord.x + '-' + coord.y)
    public async onClick(coord: Coord): Promise<MGPValidation> {
        if (this.state().turn === 0) {
            const move: ConnectSixMove = ConnectSixFirstMove.of(coord);
            return this.chooseMove(move);
        } else {
            if (this.state().getPieceAt(coord).isPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
            } else if (this.droppedCoord().isPresent()) {
                const droppedCoord: Coord = this.droppedCoord().get();
                if (droppedCoord.equals(coord)) {
                    return this.cancelMove();
                } else {
                    const move: ConnectSixMove = ConnectSixDrops.of(droppedCoord, coord);
                    return this.chooseMove(move);
                }
            } else {
                this.droppedCoord.set(MGPOptional.of(coord));
                return MGPValidation.SUCCESS;
            }
        }
    }

    protected getSpaceClass(x: number, y: number): string[] {
        const coord: Coord = new Coord(x, y);
        const owner: PlayerOrNone = this.state().getPieceAt(coord);
        const classes: string[] = [];
        if (this.droppedCoord().equalsValue(coord)) {
            classes.push(this.getPlayerClass(this.state().getCurrentPlayer()));
            classes.push('highlighted-stroke');
        } else {
            classes.push(this.getPlayerClass(owner));
            if (this.victoryCoords().contains(coord)) {
                classes.push('victory-stroke');
            }
            if (this.lastMoved().contains(coord)) {
                classes.push('last-move-stroke');
            }
        }
        return classes;
    }

    public override cancelMoveAttempt(): void {
        this.droppedCoord.set(MGPOptional.empty());
    }

}
