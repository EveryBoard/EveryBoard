import {Component} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {AwaleRules} from '../../../games/awale/AwaleRules';
import {AwaleMove} from 'src/app/games/awale/AwaleMove';
import {AwalePartSlice} from '../../../games/awale/AwalePartSlice';
import { AwaleLegalityStatus } from 'src/app/games/awale/AwaleLegalityStatus';

@Component({
    selector: 'app-awale-new-component',
    templateUrl: './awale.component.html'
})
export class AwaleComponent extends AbstractGameComponent<AwaleMove, AwalePartSlice, AwaleLegalityStatus> {

    rules = new AwaleRules();

    scores: number[] = [0, 0];

    imagesLocation = 'assets/images/'; // en prod
    // imagesLocation = 'src/assets/images/'; // en dev

    lastX = -1;
    lastY = -1;

    constructor() {
        super();
        this.showScore = true;
    }

    public onClick(x: number, y: number) {
        // todo : option de clonage revision commentage
        console.log('vous tentez un mouvement en (' + x + ', ' + y + ')');

        this.lastX = -1;
        this.lastY = -1; // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove: AwaleMove = new AwaleMove(x, y);
        // let's confirm on java-server-side that the move is legal
        console.log("awale component about to call chooseMove");
        const result: boolean = this.chooseMove(chosenMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]);
        console.log("and chooseMove says : " + result);
    }

    decodeMove(encodedMove: number): AwaleMove {
        return AwaleMove.decode(encodedMove);
    }

    encodeMove(move: AwaleMove): number {
        return move.encode();
    }

    updateBoard(): void {
        const awalePartSlice: AwalePartSlice = this.rules.node.gamePartSlice;
        this.scores = awalePartSlice.captured;
        const awaleMove: AwaleMove = this.rules.node.move;

        if (this.observerRole === 1) {
            const orientedBoard: number[][] = [];
            awalePartSlice.getCopiedBoard().forEach(
                line => orientedBoard.push(line.reverse()));
            this.board = orientedBoard;
        } else {
            this.board = awalePartSlice.getCopiedBoard().reverse();
        }

        // this.scores = awalePartSlice.getCapturedCopy(); // TODO: vérifier que le score s'affiche bien
        if (awaleMove != null) {
            this.lastX = awaleMove.coord.x;
            this.lastY = awaleMove.coord.y;
        }
    }
}