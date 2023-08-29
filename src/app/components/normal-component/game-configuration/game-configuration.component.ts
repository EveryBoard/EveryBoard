import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigDescriptionType, ConfigParameter, GameConfig, GameConfigDescription } from 'src/app/jscaip/ConfigUtil';
import { Utils } from 'src/app/utils/utils';

type ConfigFormJson = {
    [member: string]: FormControl<ConfigDescriptionType>;
}

@Component({
    selector: 'app-game-configuration',
    templateUrl: './game-configuration.component.html',
})
export class GameConfigurationComponent implements OnInit {

    @Input() config: GameConfigDescription;

    // notify that the config has been filled
    @Output() configFullfilledNotification: EventEmitter<GameConfig> = new EventEmitter<GameConfig>();

    public gameConfigForm: FormGroup = new FormGroup({});

    public ngOnInit(): void {
        if (this.config == null || this.config.fields.length === 0) {
            return this.configFullfilledNotification.emit({});
        }
        const group: ConfigFormJson = {};

        this.config.fields.forEach((configDescription: ConfigParameter) => {
            switch (configDescription.type) {
                case 'string':
                    group[configDescription.name] = new FormControl('') as FormControl<string>;
                    break;
                case 'boolean':
                    group[configDescription.name] = new FormControl(true) as FormControl<boolean>;
                    break;
                default:
                    Utils.expectToBe(configDescription.type, 'number');
                    group[configDescription.name] = new FormControl(0) as FormControl<number>;
            }
        });
        this.gameConfigForm = new FormGroup(group);
    }
    public onSubmit(): void {
        // TODO: game without config should start immediately
        // TODO: check validity
        //     TODO: min value
        //     TODO: max value
        // TODO: default value
        const gameConfig: GameConfig = {};
        for (const configDescription of this.config.fields) {
            gameConfig[configDescription.name] = this.gameConfigForm.controls[configDescription.name].value;
        }
        this.configFullfilledNotification.emit(gameConfig);
    }
}
