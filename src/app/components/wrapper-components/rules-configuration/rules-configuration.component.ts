import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigDescriptionType, ConfigParameter, RulesConfig, RulesConfigDescription } from 'src/app/jscaip/ConfigUtil';
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

    @Input() rulesConfigDescription: RulesConfigDescription;

    @Input() rulesConfigToDisplay?: RulesConfig;

    @Input() userIsCreator: boolean;

    // notify that the config has been update
    @Output() updateCallback: EventEmitter<RulesConfig> = new EventEmitter<RulesConfig>();

    public rulesConfigForm: FormGroup = new FormGroup({});

    public gameName: string; // Instanciated onInit

    public constructor(actRoute: ActivatedRoute) {
        super(actRoute);
    }

    public ngOnInit(): void {
        this.gameName = this.getGameName();
        if (this.rulesConfigDescription == null || this.rulesConfigDescription.fields.length === 0) {
            return this.updateCallback.emit({});
        }
        const group: ConfigFormJson = {};

        this.rulesConfigDescription.fields.forEach((rulesConfigDescription: ConfigParameter) => {
            let value: ConfigDescriptionType;
            if (this.userIsCreator) {
                value = rulesConfigDescription.defaultValue;
            } else {
                Utils.assert(this.rulesConfigToDisplay != null, 'Config should be provided to non-creator in RulesConfigurationComponent');
                const configuration: RulesConfig = Utils.getNonNullable(this.rulesConfigToDisplay);
                value = configuration[rulesConfigDescription.name];
            }
            if (typeof value === 'boolean') {
                group[rulesConfigDescription.name] = new FormControl(value) as FormControl<boolean>;
            } else {
                Utils.expectToBe(typeof value, 'number');
                group[rulesConfigDescription.name] = new FormControl(value, Validators.min(1)) as FormControl<number>;
            }
            group[rulesConfigDescription.name].valueChanges.subscribe(() => {
                this.onUpdate();
            });
        });
        this.rulesConfigForm = new FormGroup(group);
    }

    public onUpdate(): void {
        // TODO: unit test game without config should start immediately
        // TODO: unit test that when I remove some default value, I cannot click
        // TODO: min value
        // TODO: max value
        const rulesConfig: RulesConfig = {};
        for (const rulesConfigDescription of this.rulesConfigDescription.fields) {
            rulesConfig[rulesConfigDescription.name] = this.rulesConfigForm.controls[rulesConfigDescription.name].value;
        }
        this.updateCallback.emit(rulesConfig);
    }

    public formContentIsValid(): boolean {
        return this.rulesConfigForm.valid;
        // return 'TODO' === 'TODO';
    }

    public isNumber(value: ConfigDescriptionType): boolean {
        return typeof value === 'number';
    }

    public isBoolean(value: ConfigDescriptionType): boolean {
        return typeof value === 'boolean';
    }

    public isInvalid(name: string): boolean {
        return this.rulesConfigForm.controls[name].invalid;
    }
}
