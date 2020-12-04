import {Component} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {AwaleRules} from '../../../games/awale/awalerules/AwaleRules';
import {AwaleMove} from 'src/app/games/awale/awalemove/AwaleMove';
import {AwalePartSlice} from '../../../games/awale/AwalePartSlice';
import { AwaleLegalityStatus } from 'src/app/games/awale/AwaleLegalityStatus';
import { Coord } from 'src/app/jscaip/coord/Coord';

@Component({
    selector: 'app-awale-new-component',
    templateUrl: './awale.component.html'
})
export class AwaleComponent extends AbstractGameComponent<AwaleMove, AwalePartSlice, AwaleLegalityStatus> {

    public rules = new AwaleRules(AwalePartSlice);

    public scores: number[] = [0, 0];

    public last: Coord = new Coord(-1, -1);

    constructor() {
        super();
        this.showScore = true;
    }
    public async onClick(x: number, y: number): Promise<boolean> {
        // TODO : option de clonage revision commentage

        this.last  = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove: AwaleMove = new AwaleMove(x, y);
        // let's confirm on java-server-side that the move is legal
        const result: boolean = await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]);
        return result;
    }
    public decodeMove(encodedMove: number): AwaleMove {
        return AwaleMove.decode(encodedMove);
    }
    public encodeMove(move: AwaleMove): number {
        return AwaleMove.encode(move);
    }
    public updateBoard(): void {
        const awalePartSlice: AwalePartSlice = this.rules.node.gamePartSlice;
        this.scores = awalePartSlice.getCapturedCopy();
        const awaleMove: AwaleMove = this.rules.node.move;

        if (this.observerRole === 1) {
            const orientedBoard: number[][] = [];
            awalePartSlice.getCopiedBoard().forEach(
                line => orientedBoard.push(line.reverse()));
            this.board = orientedBoard;
        } else {
            this.board = awalePartSlice.getCopiedBoard().reverse();
        }

        if (awaleMove != null) {
            this.last = awaleMove.coord;
        }
    }
}