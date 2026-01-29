import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { MGPFallible, MGPOptional } from '@everyboard/lib';

import { GameNode } from '../../../jscaip/AI/GameNode';
import { Move } from '../../../jscaip/Move';
import { TutorialStep } from '../../wrapper-components/tutorial-game-wrapper/TutorialStep';
import { GameInfo } from '../pick-game/game-info';
import { AbstractNode } from '../../../jscaip/AI/GameNode';
import { AbstractRules } from '../../../jscaip/Rules';
import { DemoNodeInfo, DemoNodeWithConfig } from '../../wrapper-components/demo-card-wrapper/demo-card-wrapper.component';
import { GameState } from '../../../jscaip/state/GameState';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';

@Component({
    selector: 'app-demo-page',
    templateUrl: './demo-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoPageComponent {

    public numberOfColumns: FormControl = new FormControl(5);

    public columns: DemoNodeInfo[][] = [];

    public constructor(private readonly cdr: ChangeDetectorRef) {
        this.fillColumns(this.numberOfColumns.value);
        this.numberOfColumns.valueChanges.subscribe((columns: number) => {
            this.fillColumns(columns);
            this.cdr.detectChanges();
        });
    }

    public fillColumns(numberOfColumns: number): void {
        const demoNodes: DemoNodeInfo[] = this.getDemoNodes();
        let column: number = 0;
        let i: number = 0;
        this.columns = [];
        for (const node of demoNodes) {
            // We fill from right to left, one node per column at a time
            if (i < numberOfColumns) {
                // We need to create the columns the first time we access them
                this.columns.push([]);
            }
            this.columns[column].push(node);
            i++;
            column = (column + 1) % numberOfColumns;
        }
    }

    public getDemoNodes(): DemoNodeInfo[] {
        const allGames: GameInfo[] = GameInfo.getAllGames();
        // Create a game card for each demo node of each game
        const demoNodes: DemoNodeInfo[] = [];
        for (const gameInfo of allGames) {
            const steps: TutorialStep[] = gameInfo.tutorial.tutorial;
            const rules: AbstractRules = gameInfo.rules;
            const defaultConfig: MGPOptional<RulesConfig> = gameInfo.getRulesConfig();
            for (const step of steps) {
                const nodeFromStep: DemoNodeWithConfig =
                    this.getNodeFromStep(step, rules, defaultConfig, gameInfo.urlName);
                demoNodes.push(nodeFromStep);
            }
        }
        return demoNodes;
    }

    private getNodeFromStep(step: TutorialStep,
                            rules: AbstractRules,
                            defaultConfig: MGPOptional<RulesConfig>,
                            name: string)
    : DemoNodeWithConfig
    {
        const state: GameState = step.state;
        const stepConfig: MGPOptional<RulesConfig> = step.config.orElse(defaultConfig);
        if (step.hasSolution()) {
            const solution: Move | string = step.getSolution();
            if (typeof solution === 'string') {
                return {
                    node: new GameNode(state),
                    config: stepConfig,
                    click: MGPOptional.of(solution),
                    title: step.title,
                    name,
                };
            } else {
                const move: Move = solution;
                const legalityStatus: MGPFallible<unknown> = rules.isLegal(move, state, stepConfig);
                const resultingState: GameState = rules.applyLegalMove(move, state, stepConfig, legalityStatus.get());
                const parent: AbstractNode = new GameNode(state);
                const node: AbstractNode = new GameNode(resultingState,
                                                        MGPOptional.of(parent),
                                                        MGPOptional.of(move),
                );
                return {
                    node,
                    config: stepConfig,
                    click: MGPOptional.empty(),
                    title: step.title,
                    name,
                };
            }
        } else {
            return {
                node: new GameNode(state),
                config: stepConfig,
                click: MGPOptional.empty(),
                title: step.title,
                name,
            };
        }
    }

}
