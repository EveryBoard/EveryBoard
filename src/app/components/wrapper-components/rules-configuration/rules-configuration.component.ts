import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ConfigDescriptionType, ConfigParameter, RulesConfig, RulesConfigDescription } from 'src/app/jscaip/RulesConfigUtil';
import { Utils } from 'src/app/utils/utils';
import { BaseGameComponent } from '../../game-components/game-component/GameComponent';
import { ActivatedRoute } from '@angular/router';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';

type ConfigFormJson = {
    [member: string]: FormControl<ConfigDescriptionType>;
}

type CustomValidator = (c: AbstractControl) => { invalidTruc: boolean } | null;

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
        if (this.rulesConfigDescription.fields.length === 0) {
            return this.updateCallback.emit(MGPOptional.of({}));
        }
        const group: ConfigFormJson = {};

        this.rulesConfigDescription.fields.forEach((configParameter: ConfigParameter) => {
            const value: ConfigDescriptionType = this.getRulesConfigDescriptionValue(configParameter);

            group[configParameter.name] = this.getFormControl(configParameter, value);
        });
        this.rulesConfigForm = new FormGroup(group);
    }

    private getRulesConfigDescriptionValue(configParameter: ConfigParameter): ConfigDescriptionType {
        let value: ConfigDescriptionType;
        if (this.userIsCreator) {
            value = configParameter.defaultValue;
        } else {
            Utils.assert(this.rulesConfigToDisplay != null,
                         'Config should be provided to non-creator in RulesConfigurationComponent');
            const configuration: RulesConfig = Utils.getNonNullable(this.rulesConfigToDisplay);
            value = configuration[configParameter.name];
        }
        return value;
    }

    private getFormControl(configParameter: ConfigParameter, value: ConfigDescriptionType): FormControl {
        let formControl: FormControl;
        const validator: CustomValidator = this.getValidator(configParameter.isValid);
        if (typeof configParameter.defaultValue === 'boolean') {
            formControl = new FormControl(value, validator) as FormControl<boolean>;
        } else {
            Utils.expectToBe(typeof configParameter.defaultValue, 'number');
            formControl = new FormControl(value, validator) as FormControl<number>;
        }
        if (this.userIsCreator === false) {
            formControl.disable();
        }
        formControl.valueChanges.subscribe(() => {
            this.onUpdate();
        });
        return formControl;
    }

    private getValidator(isValid?: ((value: ConfigDescriptionType) => MGPValidation)): CustomValidator {
        if (isValid === undefined) {
            return (c: AbstractControl) => {
                return null;
            };
        } else {
            return (control: AbstractControl) => {
                return { invalidTruc: isValid(control.value).isFailure() };
            };
        }
    }

    public onUpdate(): void {
        // TODO: unit test that when I remove some default value, I cannot click
        if (this.userIsCreator) {
            const rulesConfig: RulesConfig = {};
            for (const rulesConfigDescription of this.rulesConfigDescription.fields) {
                const name: string = rulesConfigDescription.name;
                if (this.isInvalid(name, rulesConfigDescription.isValid)) {
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

    public isInvalid(name: string, isValid?: (v: ConfigDescriptionType) => MGPValidation): boolean {
        const fieldValue: ConfigDescriptionType = this.rulesConfigForm.controls[name].value;
        if (typeof fieldValue === 'boolean') {
            // Angular make thoses controls invalid when they are boolean, not sure why
            return false; // So we return false cause they cannot be invalid, checked or not, its always valid
        } else {
            if (isValid === undefined) {
                return false;
            } else {
                const validity: MGPValidation = isValid(fieldValue);
                return validity.isFailure();
            }
        }
    }

    public getErrorMessage(configParameter: ConfigParameter): string {
        if (configParameter.isValid === undefined) {
            return 'des chaussettes mon peyo';
        } else {
            const fieldValue: ConfigDescriptionType =
                this.rulesConfigForm.controls[configParameter.name].value;
            const validity: MGPValidation = configParameter.isValid(fieldValue);
            return validity.getReason();
        }
    }
}
