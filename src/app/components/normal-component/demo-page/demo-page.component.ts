import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MGPFallible, MGPOptional } from '@everyboard/lib';

import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { Move } from 'src/app/jscaip/Move';
import { TutorialStep } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { GameInfo } from '../pick-game/pick-game.component';
import { AbstractNode } from 'src/app/jscaip/AI/GameNode';
import { AbstractRules } from 'src/app/jscaip/Rules';
import { DemoNodeInfo } from '../../wrapper-components/demo-card-wrapper/demo-card-wrapper.component';
import { GameState } from 'src/app/jscaip/state/GameState';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

@Component({
    selector: 'app-demo-page',
    templateUrl: './demo-page.component.html',
})
export class DemoPageComponent {

    public numberOfColumns: FormControl = new FormControl(5);

    public columns: DemoNodeInfo[][] = [];

    public constructor() {
        this.fillColumns(this.numberOfColumns.value);
        this.numberOfColumns.valueChanges.subscribe((columns: number) => {
            this.fillColumns(columns);
        });
    }

    public fillColumns(numberOfColumns: number): void {
        const allGames: GameInfo[] = GameInfo.getAllGames();
        let column: number = 0;
        let i: number = 0;
        this.columns = [];
        // Create a game card for each demo node of each game
        for (const gameInfo of allGames) {
            const demoNodes: { node: AbstractNode, click: MGPOptional<string> }[] = [];
            const rules: AbstractRules = gameInfo.rules;
            const steps: TutorialStep[] = gameInfo.tutorial.tutorial;
            const config: MGPOptional<RulesConfig> = gameInfo.getRulesConfig();
            for (const step of steps) {
                const nodeFromStep: { node: AbstractNode, click: MGPOptional<string>} =
                    this.getNodeFromStep(step, rules, config);
                demoNodes.push(nodeFromStep);
            }
            for (const node of demoNodes) {
                // We fill from right to left, one node per column at a time
                if (i < numberOfColumns) {
                    // We need to create the columns the first time we access them
                    this.columns.push([]);
                }
                this.columns[column].push({
                    name: gameInfo.urlName,
                    node: node.node,
                    click: node.click,
                });
                i++;
                column = (column + 1) % numberOfColumns;
            }
        }
    }

    private getNodeFromStep(step: TutorialStep, rules: AbstractRules, config: MGPOptional<RulesConfig>)
    : { node: AbstractNode, config: MGPOptional<RulesConfig>, click: MGPOptional<string> }
    {
        const state: GameState = GameState.getStateAndNotConfig(step.state);
        const stepConfig: MGPOptional<RulesConfig> = GameState.getRulesConfigNotState(step.state, config);
        if (step.hasSolution()) {
            const solution: Move | string = step.getSolution();
            if (typeof solution === 'string') {
                return {
                    node: new GameNode(state),
                    config: stepConfig,
                    click: MGPOptional.of(solution),
                };
            } else {
                const move: Move = solution;
                const legalityStatus: MGPFallible<unknown> = rules.isLegal(move, state, stepConfig);
                const resultingState: GameState = rules.applyLegalMove(move, state, stepConfig, legalityStatus.get());
                const parent: AbstractNode = new GameNode(resultingState);
                const node: AbstractNode = new GameNode(resultingState,
                                                        MGPOptional.of(parent),
                                                        MGPOptional.of(move),
                );
                return {
                    node,
                    config: stepConfig,
                    click: MGPOptional.empty(),
                };
            }
        } else {
            return {
                node: new GameNode(state),
                config: stepConfig,
                click: MGPOptional.empty(),
            };
        }
    }

}
