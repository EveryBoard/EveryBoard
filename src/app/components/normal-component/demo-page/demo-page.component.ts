import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from 'src/app/jscaip/Move';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TutorialStep } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { GameInfo } from '../pick-game/pick-game.component';
import { DemoNodeInfo } from './demo-card.component';
import { AbstractNode } from 'src/app/jscaip/MGPNode';
import { AbstractRules } from 'src/app/jscaip/Rules';

@Component({
    selector: 'app-demo-page',
    templateUrl: './demo-page.component.html',
})
export class DemoPageComponent {
    public numberOfColumns: FormControl = new FormControl(5);
    public squared: FormControl = new FormControl(true);

    public columns: DemoNodeInfo[][] = [];

    public constructor() {
        this.fillColumns(5);
        this.numberOfColumns.valueChanges.subscribe((columns: number) => {
            this.fillColumns(columns);
        });
    }
    public fillColumns(numberOfColumns: number) {
        const allGames: GameInfo[] = GameInfo.ALL_GAMES();
        let column: number = 0;
        let i: number = 0;
        this.columns = [];
        // Create a game card for each demo node of each game
        for (const game of allGames) {
            let demoNodes: AbstractNode[] = [];
            const rules: AbstractRules = game.rules;
            const steps: TutorialStep[] = game.tutorial.tutorial;
            for (const step of steps) {
                if (step.isMove()) {
                    const move: Move = step.acceptedMoves[0];
                    demoNodes.push(new MGPNode(rules.applyLegalMove(move, step.state,
                                                                    rules.isLegal(move, step.state).get()),
                                               MGPOptional.of(new MGPNode(step.state)),
                                               MGPOptional.of(move)));
                }
            }
            for (const node of demoNodes) {
                // We fill from right to left, one node per column at a time
                if (i < numberOfColumns) {
                    // We need to create the columns the first time we access them
                    this.columns.push([]);
                }
                this.columns[column].push({ name: game.name, component: game.component, node });
                i++;
                column = (column+1) % numberOfColumns;
            }
        }
    }
}
