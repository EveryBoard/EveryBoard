import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ConfigDescriptionType, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Utils } from 'src/app/utils/utils';
import { BaseGameComponent } from '../../game-components/game-component/GameComponent';
import { ActivatedRoute } from '@angular/router';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidator, RulesConfigDescription } from '../../normal-component/pick-game/pick-game.component';
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
        this.assertParamsAreCoherent();
        this.gameName = this.getGameName();
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        if (Object.keys(config).length === 0) {
            return this.updateCallback.emit(MGPOptional.of({}));
        }
        const group: ConfigFormJson = {};

        console.log('ngOnInit got', config)
        Object.keys(config).forEach((parameterName: string) => {
            const value: ConfigDescriptionType =
                this.getRulesConfigDescriptionValue(parameterName, config[parameterName]);

            group[parameterName] = this.getFormControl(parameterName, value);
        });
        this.rulesConfigForm = new FormGroup(group);
    }
    private assertParamsAreCoherent(): void {
        if (this.userIsCreator === false) {
            Utils.assert(this.rulesConfigToDisplay != null,
                         'Config should be provided to non-creator in RulesConfigurationComponent TODO TESTEZ ME LA CHAAAATTE');
            const rulesConfigToDisplay: RulesConfig = Utils.getNonNullable(this.rulesConfigToDisplay);
            Utils.assert(Object.keys(rulesConfigToDisplay).length > 0,
                         'Config should be provided to non-creator in RulesConfigurationComponent TODO TESTEZ MEL Q');
            console.log('so our non null rulesCOnfigToDisplay is ', this.rulesConfigToDisplay);
        }
    }

    private getRulesConfigDescriptionValue(name: string, defaultValue: ConfigDescriptionType): ConfigDescriptionType {
        console.log('getRulesConfigDescriptionValue', name, defaultValue, this.userIsCreator)
        if (this.userIsCreator === false) {
            const configuration: RulesConfig = Utils.getNonNullable(this.rulesConfigToDisplay);
            defaultValue = configuration[name];
        }
        return defaultValue;
    }

    private getFormControl(parameterName: string, value: ConfigDescriptionType): FormControl {
        console.log('getFormControl', parameterName, value)
        let formControl: FormControl;
        if (typeof value === 'number') {
            const mgpValidators: MGPValidator = this.rulesConfigDescription.validator[parameterName];
            const validator: CustomValidator = this.getNumberValidator(mgpValidators);
            formControl = new FormControl(value, validator) as FormControl<number>;
            formControl = new FormControl(value) as FormControl<number>;
        } else {
            Utils.expectToBe(typeof value, 'boolean');
            formControl = new FormControl(value) as FormControl<boolean>;
        }
        if (this.userIsCreator === false) {
            formControl.disable();
        }
        formControl.valueChanges.subscribe(() => {
            this.onUpdate();
        });
        return formControl;
    }

    private getNumberValidator(mgpValidator: MGPValidator): CustomValidator {
        return (control: AbstractControl) => {
            return { invalidTruc: mgpValidator(control.value).isFailure() };
        };
    }

    public onUpdate(): void {
        if (this.userIsCreator) {
            const rulesConfig: RulesConfig = {};
            const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
            const parameterNames: string[] = Object.keys(config);
            for (const parameterName of parameterNames) {
                if (this.isInvalid(parameterName)) {
                    // This inform the parent component that an invalid update has been done
                    this.updateCallback.emit(MGPOptional.empty());
                    return; // In order not to send update when form is invalid
                }
                rulesConfig[parameterName] = this.rulesConfigForm.controls[parameterName].value;
            }
            this.updateCallback.emit(MGPOptional.of(rulesConfig));
        } else {
            ErrorLoggerService.logError('RulesConfiguration', 'Only creator should be able to modify rules config');
        }
    }

    public isNumber(field: string): boolean {
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        const value: ConfigDescriptionType = config[field];
        return typeof value === 'number';
    }

    public isBoolean(field: string): boolean {
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        const value: ConfigDescriptionType = config[field];
        return typeof value === 'boolean';
    }

    public isInvalid(field: string): boolean {
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        const value: ConfigDescriptionType = config[field];
        if (typeof value === 'number') {
            const fieldValue: number = this.rulesConfigForm.controls[field].value;
            const validity: MGPValidation = this.rulesConfigDescription.validator[field](fieldValue);
            return validity.isFailure();
        } else {
            Utils.expectToBe(typeof value, 'boolean');
            // Angular make thoses controls invalid when they are boolean, not sure why
            return false; // So we return false cause they cannot be invalid, checked or not, its always valid
        }
    }

    public getErrorMessage(field: string): string {
        const fieldValue: number | null = this.rulesConfigForm.controls[field].value;
        const validity: MGPValidation = this.rulesConfigDescription.validator[field](fieldValue);
        return validity.getReason();
    }

    public getFields(): string[] {
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        return Object.keys(config);
    }
}
