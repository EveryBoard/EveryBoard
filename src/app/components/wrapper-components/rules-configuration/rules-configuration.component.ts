import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigDescriptionType, ConfigParameter, GameConfig, GameConfigDescription } from 'src/app/jscaip/ConfigUtil';
import { Utils } from 'src/app/utils/utils';
import { BaseGameComponent } from '../../game-components/game-component/GameComponent';
import { ActivatedRoute } from '@angular/router';

type ConfigFormJson = {
    [member: string]: FormControl<ConfigDescriptionType>;
}

@Component({
    selector: 'app-rules-configuration',
    templateUrl: './rules-configuration.component.html',
})
export class RulesConfigurationComponent extends BaseGameComponent implements OnInit {

    @Input() configDescription: GameConfigDescription;

    @Input() config?: GameConfig;

    @Input() userIsCreator: boolean;

    // notify that the config has been update
    @Output() updateCallback: EventEmitter<GameConfig> = new EventEmitter<GameConfig>();

    public gameConfigForm: FormGroup = new FormGroup({});

    public gameName: string; // Instanciated onInit

    public constructor(actRoute: ActivatedRoute) {
        super(actRoute);
    }

    public ngOnInit(): void {
        this.gameName = this.getGameName();
        if (this.configDescription == null || this.configDescription.fields.length === 0) {
            return this.updateCallback.emit({});
        }
        const group: ConfigFormJson = {};

        this.configDescription.fields.forEach((configDescription: ConfigParameter) => {
            let value: ConfigDescriptionType;
            if (this.userIsCreator) {
                value = configDescription.defaultValue;
            } else {
                Utils.assert(this.config != null, 'Config should be provided to non-creator in RulesConfigurationComponent');
                const configuration: GameConfig = Utils.getNonNullable(this.config);
                value = configuration[configDescription.name];
            }
            switch (configDescription.type) {
                case 'string':
                    group[configDescription.name] = new FormControl(value) as FormControl<string>;
                    break;
                case 'boolean':
                    group[configDescription.name] = new FormControl(value) as FormControl<boolean>;
                    break;
                default:
                    Utils.expectToBe(configDescription.type, 'number');
                    group[configDescription.name] = new FormControl(value) as FormControl<number>;
            }
            group[configDescription.name].valueChanges.subscribe(() => {
                this.onUpdate();
            });
        });
        this.gameConfigForm = new FormGroup(group);
    }

    public onUpdate(): void {
        // TODO: unit test game without config should start immediately
        // TODO: unit test that when I remove some default value, I cannot click
        // TODO: min value
        // TODO: max value
        const gameConfig: GameConfig = {};
        for (const configDescription of this.configDescription.fields) {
            gameConfig[configDescription.name] = this.gameConfigForm.controls[configDescription.name].value;
        }
        this.updateCallback.emit(gameConfig);
    }

    public formContentIsValid(): boolean {
        return 'TODO' === 'TODO';
    }

}
