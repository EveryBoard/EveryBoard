import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfigDescriptionType, ConfigParameter, RulesConfig, RulesConfigDescription } from 'src/app/jscaip/ConfigUtil';
import { Utils } from 'src/app/utils/utils';
import { BaseGameComponent } from '../../game-components/game-component/GameComponent';
import { ActivatedRoute } from '@angular/router';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPOptional } from 'src/app/utils/MGPOptional';

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

    /**
     * notify that the config has been update
     * if the optional is empty, the last update was invalid
     */
    @Output() updateCallback: EventEmitter<MGPOptional<RulesConfig>> = new EventEmitter<MGPOptional<RulesConfig>>();

    public rulesConfigForm: FormGroup = new FormGroup({});

    public gameName: string; // Instanciated onInit

    public constructor(actRoute: ActivatedRoute) {
        super(actRoute);
    }

    public ngOnInit(): void {
        this.gameName = this.getGameName();
        if (this.rulesConfigDescription == null || this.rulesConfigDescription.fields.length === 0) {
            return this.updateCallback.emit(MGPOptional.of({}));
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
            if (typeof rulesConfigDescription.defaultValue === 'boolean') {
                group[rulesConfigDescription.name] = new FormControl(value) as FormControl<boolean>;
            } else {
                Utils.expectToBe(typeof rulesConfigDescription.defaultValue, 'number');
                group[rulesConfigDescription.name] = new FormControl(value, Validators.min(1)) as FormControl<number>;
            }
            if (this.userIsCreator === false) {
                group[rulesConfigDescription.name].disable();
            }
            group[rulesConfigDescription.name].valueChanges.subscribe(() => {
                this.onUpdate();
            });
        });
        this.rulesConfigForm = new FormGroup(group);
    }

    public onUpdate(): void {
        // TODO: unit test that when I remove some default value, I cannot click
        if (this.userIsCreator) {
            const rulesConfig: RulesConfig = {};
            for (const rulesConfigDescription of this.rulesConfigDescription.fields) {
                const name: string = rulesConfigDescription.name;
                if (this.isInvalid(name)) {
                    // This inform the parent component that an invalid update has been done
                    this.updateCallback.emit(MGPOptional.empty());
                    return; // In order not to send update when form is invalid
                }
                rulesConfig[name] = this.rulesConfigForm.controls[name].value;
            }
            this.updateCallback.emit(MGPOptional.of(rulesConfig));
        } else {
            ErrorLoggerService.logError('RulesConfiguration', 'Only creator should be able to modify rules config');
        }
    }

    public isNumber(value: ConfigDescriptionType): boolean {
        return typeof value === 'number';
    }

    public isBoolean(value: ConfigDescriptionType): boolean {
        return typeof value === 'boolean';
    }

    public isInvalid(name: string): boolean {
        if (typeof this.rulesConfigForm.controls[name].value === 'boolean') {
            // Angular make thoses controls invalid when they are boolean, not sure why
            return false; // So we return false cause they cannot be invalid, checked or not, its always valid
        } else {
            return this.rulesConfigForm.controls[name].invalid;
        }
    }
}
