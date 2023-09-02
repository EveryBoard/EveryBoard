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
    selector: 'app-game-configuration',
    templateUrl: './game-configuration.component.html',
})
export class GameConfigurationComponent extends BaseGameComponent implements OnInit {

    @Input() config: GameConfigDescription;

    @Input() configurationButtonMessage: string = 'Start with this config';

    // notify that the config has been filled
    @Output() configFullfilledNotification: EventEmitter<GameConfig> = new EventEmitter<GameConfig>();

    public gameConfigForm: FormGroup = new FormGroup({});

    public gameName: string; // Instanciated onInit

    public constructor(actRoute: ActivatedRoute) {
        super(actRoute);
    }

    public ngOnInit(): void {
        this.gameName = this.getGameName();
        if (this.config == null || this.config.fields.length === 0) {
            return this.configFullfilledNotification.emit({});
        }
        const group: ConfigFormJson = {};

        this.config.fields.forEach((configDescription: ConfigParameter) => {
            switch (configDescription.type) {
                case 'string':
                    group[configDescription.name] =
                        new FormControl(configDescription.defaultValue) as FormControl<string>;
                    break;
                case 'boolean':
                    group[configDescription.name] =
                        new FormControl(configDescription.defaultValue) as FormControl<boolean>;
                    break;
                default:
                    Utils.expectToBe(configDescription.type, 'number');
                    group[configDescription.name] =
                        new FormControl(configDescription.defaultValue) as FormControl<number>;
            }
        });
        this.gameConfigForm = new FormGroup(group);
    }

    public onSubmit(): void {
        // TODO: unit test game without config should start immediately
        // TODO: unit test that when I remove some default value, I cannot click
        // TODO: min value
        // TODO: max value
        const gameConfig: GameConfig = {};
        for (const configDescription of this.config.fields) {
            gameConfig[configDescription.name] = this.gameConfigForm.controls[configDescription.name].value;
        }
        this.configFullfilledNotification.emit(gameConfig);
    }

}
