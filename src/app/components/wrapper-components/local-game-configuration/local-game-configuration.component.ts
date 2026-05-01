import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { comparableEquals, MGPOptional, Utils } from '@everyboard/lib';

import { AbstractNode, GameNode } from '../../../jscaip/AI/GameNode';
import { ConfigDescriptionType, RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { GameState } from '../../../jscaip/state/GameState';
import { BaseWrapperComponent } from '../BaseWrapperComponent';
import { DemoNodeInfo, DemoCardWrapperComponent } from '../demo-card-wrapper/demo-card-wrapper.component';
import { RulesConfigurationComponent } from '../rules-configuration/rules-configuration.component';

/**
 * This component appears when we start a local game.
 * Its role is to setup the configuration, possibly letting the user choose the config if the game allows it.
 * When the config is selected, we switch to LocalGameWrapper.
 * If the game is not configurable, we directly switch to LocalGameWrapper.
 */
@Component({
    selector: 'app-local-game-configuration',
    templateUrl: './local-game-configuration.component.html',
    imports: [RulesConfigurationComponent, DemoCardWrapperComponent],
})
export class LocalGameConfigurationComponent extends BaseWrapperComponent {

    private readonly router: Router = inject(Router);
    private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    public configDemo: DemoNodeInfo;

    // The configuration to display. Empty if there is no configuration (yet or because it's invalid)
    private rulesConfig: MGPOptional<RulesConfig> = MGPOptional.empty();

    private setConfigDemo(config: RulesConfig): void {
        const stateProvider: MGPOptional<(config: RulesConfig) => GameState> = this.getStateProvider();
        if (stateProvider.isPresent()) {
            const node: AbstractNode = new GameNode(stateProvider.get()(config));
            this.configDemo = {
                title: this.getGameName().get(),
                click: MGPOptional.empty(),
                name: this.getGameUrlName(),
                node,
            };
            this.cdr.detectChanges();
        }
    }

    public getConfigDemo(): DemoNodeInfo {
        return this.configDemo;
    }

    public async updateConfig(rulesConfig: MGPOptional<RulesConfig>): Promise<void> {
        this.rulesConfig = rulesConfig;
        // rulesConfig config is absent if the config update was incorrect
        if (rulesConfig.isPresent()) {
            // If there is no config for this game, then rulesConfig value will be {}
            this.setConfigDemo(this.rulesConfig.get());
            if (Object.keys(this.rulesConfig.get()).length === 0) {
                // There is nothing to configure for this game, start it!
                await this.startGame();
            }
        }
    }

    public async startGame(): Promise<boolean> {
        Utils.assert(this.rulesConfig.isPresent(), 'Cannot start the game without having chosen a config');
        const rulesConfig: RulesConfig = this.rulesConfig.get();
        if (Object.keys(rulesConfig).length === 0) {
            // game without config, start it
            return this.router.navigate(['/local', this.getGameUrlName()]);
        }
        const defaultConfig: RulesConfig = this.getRulesConfigDescription().getDefaultConfig().config;
        if (comparableEquals(rulesConfig, defaultConfig)) {
            // This is the default config, no need to specify it in the parameters
            return this.router.navigate(['/local', this.getGameUrlName()]);
        } else {
            const queryParams: { [key: string]: string } =
                Object.fromEntries(Object.entries(rulesConfig)
                    .map((configElement: [string, ConfigDescriptionType]) => {
                        return [configElement[0], JSON.stringify(configElement[1])];
                    }));
            return this.router.navigate(['/local', this.getGameUrlName()], { queryParams });
        }
    }

}
