import { Component } from '@angular/core';
import { P4PartSlice } from './P4PartSlice';
import { P4Rules } from './P4Rules';
import { Move } from '../../jscaip/Move';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { P4Move } from 'src/app/games/p4/P4Move';
import { Player } from 'src/app/jscaip/player/Player';
import { Coord } from 'src/app/jscaip/coord/Coord';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class P4Component extends AbstractGameComponent<P4Move, P4PartSlice> {
    public static VERBOSE: boolean = false;

    public EMPTY_CASE: number = Player.NONE.value;
    public CASE_SIZE: number = 100;
    public STROKE_WIDTH: number = 8;
    public rules: P4Rules = new P4Rules(P4PartSlice);
    private last: Coord;

    public async onClick(x: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: P4Move = P4Move.of(x);
        return await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard(): void {
        const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
        const lastMove: P4Move = this.rules.node.move;

        this.board = p4PartSlice.board;
        if (lastMove !== null) {
            const y: number = P4Rules.getLowestUnoccupiedCase(p4PartSlice.board, lastMove.x) + 1;
            this.last = new Coord(lastMove.x, y);
        } else {
            this.last = null;
        }
    }
    public getCaseClasses(x: number, y: number): string[] {
        const classes: string[] = [];
        classes.push(this.getCaseFillClass(this.board[y][x]));
        if (this.last && this.last.equals(new Coord(x, y))) {
            classes.push('highlighted');
        }
        return classes;
    }
    private getCaseFillClass(content: number): string {
        return this.getPlayerClass(Player.of(content));
    }
    public decodeMove(encodedMove: number): Move {
        return P4Move.decode(encodedMove);
    }
    public encodeMove(move: P4Move): number {
        return P4Move.encode(move);
    }
}
