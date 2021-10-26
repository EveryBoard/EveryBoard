import { Component } from '@angular/core';
import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { ApagosMove } from './ApagosMove';
import { ApagosRules } from './ApagosRules';
import { ApagosSquare } from './ApagosSquare';
import { ApagosState } from './ApagosState';

@Component({
    selector: 'app-apagos',
    templateUrl: './apagos.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.css'],
})
export class ApagosComponent extends GameComponent<ApagosRules,
                                                   ApagosMove,
                                                   ApagosState>
{

    public Player: typeof Player = Player;

    public board: readonly ApagosSquare[];

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new ApagosRules(ApagosState);
        this.availableMinimaxes = [
        ];
        this.encoder = ApagosMove.encoder;
        // this.tutorial = new ApagosTutorial().tutorial;
    }
    public updateBoard(): void {
        this.board = this.rules.node.gameState.board;
    }
    public getCircleCenter(x: number, i: number, square: ApagosSquare): Coord {
        const bx: number = (x * this.CASE_SIZE) + (0.5 * this.CASE_SIZE);
        const by: number = ((3 - x) * this.CASE_SIZE * 0.25) + (0.5 * this.CASE_SIZE);
        if (square.containing.get(Player.NONE).get() === 1) {
            return new Coord(bx, by);
        }
        const nbCircle: number = square.containing.get(Player.NONE).get();
        const angle: number = i * 2 * Math.PI / nbCircle;
        const radius: number = this.CASE_SIZE * 0.5;
        const deltaX: number = radius * Math.cos(angle);
        const deltaY: number = radius * Math.sin(angle);
        return new Coord(bx + deltaX, by + deltaY);
    }
}
