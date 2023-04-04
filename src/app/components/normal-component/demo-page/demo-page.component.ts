import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Move } from 'src/app/jscaip/Move';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TutorialStep } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { GameInfo } from '../pick-game/pick-game.component';
import { AbstractNode } from 'src/app/jscaip/MGPNode';
import { AbstractRules } from 'src/app/jscaip/Rules';
import { DemoNodeInfo } from '../../wrapper-components/demo-card-wrapper/demo-card-wrapper.component';

@Component({
    selector: 'app-demo-page',
    templateUrl: './demo-page.component.html',
})
export class DemoPageComponent {

    public numberOfColumns: FormControl = new FormControl(5);
    public squared: FormControl = new FormControl(true);

    public columns: DemoNodeInfo[][] = [];

    public constructor() {
        this.fillColumns(this.numberOfColumns.value);
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
            const demoNodes: { node: AbstractNode, click: MGPOptional<string> }[] = [];
            const rules: AbstractRules = game.rules;
            const steps: TutorialStep[] = game.tutorial.tutorial;
            for (const step of steps) {
                if (step.hasSolution()) {
                    const solution: Move | string = step.getSolution();
                    if (typeof solution === 'string') {
                        demoNodes.push({
                            node: new MGPNode(step.state),
                            click: MGPOptional.of(solution as string),
                        });
                    } else {
                        const move: Move = solution as Move;
                        const node: AbstractNode =
                            new MGPNode(rules.applyLegalMove(move,
                                                             step.state,
                                                             rules.isLegal(move, step.state).get()),
                                        MGPOptional.of(new MGPNode(step.state)),
                                        MGPOptional.of(move));
                        demoNodes.push({ node, click: MGPOptional.empty() });
                    }
                }
            }
            for (const node of demoNodes) {
                // We fill from right to left, one node per column at a time
                if (i < numberOfColumns) {
                    // We need to create the columns the first time we access them
                    this.columns.push([]);
                }
                this.columns[column].push({
                    name: game.urlName,
                    node: node.node,
                    click: node.click,
                });
                i++;
                column = (column + 1) % numberOfColumns;
            }
        }
    }
}
