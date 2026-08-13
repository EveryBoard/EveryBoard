import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { Player, PlayerOrNone } from '@everyboard/games';
import { MGPOptional, MGPValidation } from '@everyboard/lib';

import { ClickHandler } from '../../components/game-components/game-component/ClickHandler';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from '../../jscaip/Coord';

import { P4Heuristic } from './P4Heuristic';
import { P4Move } from './P4Move';
import { P4MoveGenerator } from './P4MoveGenerator';
import { P4OrderedMoveGenerator } from './P4OrderedMoveGenerator';
import { P4Config, P4Rules } from './P4Rules';
import { P4State } from './P4State';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class P4Component extends RectangularGameComponent<P4Rules, P4Move, P4State, PlayerOrNone, P4Config> {

    public EMPTY: PlayerOrNone = PlayerOrNone.NONE;
    public last: MGPOptional<Coord> = MGPOptional.empty();
    public victoryCoords: Coord[] = [];

    public constructor() {
        super();
        this.setRulesAndNode('P4');
        this.aiConfig = {
            minimax: [
                {
                    id: 'alignment',
                    name: $localize`Alignment`,
                    heuristic: (): P4Heuristic => new P4Heuristic(),
                    moveGenerator: (): P4OrderedMoveGenerator => new P4OrderedMoveGenerator(),
                    hash: P4Component.hash,
                },
            ],
            mcts: [
                {
                    id: 'default',
                    name: $localize`Default`,
                    moveGenerator: (): P4MoveGenerator => new P4MoveGenerator(),
                },
                {
                    id: 'alignment',
                    name: $localize`Alignment`,
                    heuristic: (): P4Heuristic => new P4Heuristic(),
                    moveGenerator: (): P4OrderedMoveGenerator => new P4OrderedMoveGenerator(),
                },
            ],
        };
        this.encoder = P4Move.encoder;
    }

    private static hash(state: P4State): string {
        let result: string = '';
        for (const line of state.board) {
            for (const cell of line) {
                switch (cell) {
                    case Player.ZERO:
                        result += '0';
                        break;
                    case Player.ONE:
                        result += '1';
                        break;
                    default:
                        result += '_';
                }
            }
        }
        return result;
    }

    @ClickHandler((x: number, y: number) => `#click-${ x }-${ y }`)
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const chosenMove: P4Move = P4Move.of(x);
        return await this.chooseMove(chosenMove);
    }

    public override async updateBoard(_triggerAnimation: boolean): Promise<void> {
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
