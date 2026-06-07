import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, ModelSignal, OnDestroy, OnInit, input, model, output, OutputEmitterRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { comparableEquals, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ConfigDescriptionType, DefaultConfigDescription, NamedRulesConfig, RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { Localized } from '../../../utils/LocaleUtils';
import { BaseWrapperComponent } from '../BaseWrapperComponent';

import { EnumConfig, RulesConfigDescription } from './RulesConfigDescription';

const CUSTOM_CONFIG_NAME: string = '__custom__';

type ConfigFormJSON = {
    [member: string]: FormControl<ConfigDescriptionType>;
}

@Component({
    selector: 'app-rules-configuration',
    templateUrl: './rules-configuration.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, NgClass],
})
export class RulesConfigurationComponent extends BaseWrapperComponent implements OnInit, OnDestroy {

    public readonly CUSTOM_CONFIG_NAME: string = CUSTOM_CONFIG_NAME;

    public readonly rulesConfigDescription: InputSignal<RulesConfigDescription<RulesConfig>> =
        input.required<RulesConfigDescription<RulesConfig>>();

    public readonly creatorMode: InputSignal<boolean> = input.required<boolean>();

    // Only needed for the non-creator/read-only mode
    public readonly rulesConfigToDisplay: InputSignal<RulesConfig | undefined> = input<RulesConfig>();

    // Whether this config can be edited or not
    public readonly editable: ModelSignal<boolean> = model<boolean>(false);

    /**
     * notify that the config has been updated
     * if the optional is empty, the last update was invalid
     * we do want to emit something when the current config is invalid,
     * so that the parent component knows that the situation is not ok
     */
    public readonly updateCallback: OutputEmitterRef<MGPOptional<RulesConfig>> = output<MGPOptional<RulesConfig>>();

    public readonly selectedConfigControl: FormControl<string> = new FormControl('', { nonNullable: true });

    public rulesConfigForm: FormGroup = new FormGroup({});

    public urlName: string; // set in onInit

    private formSubscription: Subscription = new Subscription();

    public errorMessages: string[] = [];

    private checkInputs(): void {
        if (this.creatorMode() === false && this.editable()) {
            Utils.assert(false, 'RulesConfigurationComponent should not be editable when not in creator mode');
        }
        if (this.editable() === false) {
            Utils.assert(this.rulesConfigToDisplay() !== undefined, 'Config should be provided if RulesConfigurationComponent is not editable');
        }
    }

    public getChosenConfigName(): string {
        return this.selectedConfigControl.getRawValue();
    }

    public ngOnInit(): void {
        this.checkInputs();
        this.urlName = this.getGameUrlName();
        if (this.isCustomizable()) {
            if (this.creatorMode() && this.editable()) {
                const defaultConfig: NamedRulesConfig<RulesConfig> = this.rulesConfigDescription().getDefaultConfig();
                this.setChosenConfig(defaultConfig.name());
            } else {
                this.initializeReadOnlyConfig();
            }
        } else {
            return this.updateCallback.emit(MGPOptional.of({}));
        }
    }

    public ngOnDestroy(): void {
        this.formSubscription.unsubscribe();
    }

    private initializeReadOnlyConfig(): void {
        const configToDisplay: RulesConfig = Utils.getNonNullable(this.rulesConfigToDisplay());
        this.setSelectedConfigName(this.getDisplayedConfigName());
        this.generateForm(configToDisplay, false);
    }

    private setSelectedConfigName(configName: string): void {
        this.selectedConfigControl.setValue(configName, { emitEvent: false });
        this.updateSelectedConfigControlAvailability();
    }

    private updateSelectedConfigControlAvailability(): void {
        if (this.editable()) {
            this.selectedConfigControl.enable({ emitEvent: false });
        } else {
            this.selectedConfigControl.disable({ emitEvent: false });
        }
    }

    private generateForm(config: RulesConfig, configurable: boolean): void {
        const group: ConfigFormJSON = {};

        Object.keys(config).forEach((parameterName: string) => {
            group[parameterName] = this.getFormControl(config[parameterName], configurable);
        });
        this.formSubscription.unsubscribe();
        this.rulesConfigForm = new FormGroup(group);
        this.formSubscription = this.rulesConfigForm.valueChanges.subscribe(() => {
            this.onUpdate();
        });
    }

    private getFormControl(value: ConfigDescriptionType, configurable: boolean): FormControl {
        const formControl: FormControl = new FormControl(value);
        if (configurable === false) {
            formControl.disable();
        }
        return formControl;
    }

    public isEditableAndCustom(): boolean {
        return this.editable() && this.getChosenConfigName() === CUSTOM_CONFIG_NAME;
    }

    private onUpdate(): void {
        // Note: we may receive updates just because the form has changed from "editable" to "non editable"
        // (e.g., due to proposing to the opponent or clicking on "changing configuration").
        const rulesConfig: RulesConfig = {};
        const fieldNames: string[] = this.rulesConfigDescription().getFields();
        for (const field of fieldNames) {
            if (this.isValid(field)) {
                rulesConfig[field] = this.rulesConfigForm.controls[field].value;
            } else {
                // This informs the parent component that an invalid update has been done
                this.updateCallback.emit(MGPOptional.empty());
                return; // In order not to send update when form is invalid
            }
        }
        return this.checkForValidators(rulesConfig);
    }

    private checkForValidators(rulesConfig: RulesConfig): void {
        const validators: ((config: RulesConfig) => MGPValidation)[] =
            this.rulesConfigDescription().defaultConfigDescription.validators ?? [];
        this.errorMessages = [];
        for (const validator of validators) {
            const validation: MGPValidation = validator(rulesConfig);
            if (validation.isFailure()) {
                this.errorMessages.push(validation.getReason());
            }
        }
        if (this.errorMessages.length > 0) {
            this.updateCallback.emit(MGPOptional.empty());
        } else {
            this.updateCallback.emit(MGPOptional.of(rulesConfig));
        }
    }

    public typeOfConfig(field: string): string {
        const config: RulesConfig = this.rulesConfigDescription().getDefaultConfig().config;
        const value: ConfigDescriptionType = config[field];
        return typeof value;
    }

    public isValid(field: string): boolean {
        return this.rulesConfigDescription().isValid(field, this.rulesConfigForm.controls[field].value);
    }

    public getErrorMessage(field: string): string {
        const fieldValue: number | null = this.rulesConfigForm.controls[field].value;
        return this.rulesConfigDescription().getValidityError(field, fieldValue);
    }

    public getFields(): string[] {
        return this.rulesConfigDescription().getFields();
    }

    public onChange(event: Event): void {
        const select: HTMLSelectElement = event.target as HTMLSelectElement;
        this.setChosenConfig(select.value);
    }

    public getEnumValues(field: string): { enumValue: string, localized: Localized }[] {
        const defaultConfig: DefaultConfigDescription = this.rulesConfigDescription().defaultConfigDescription;
        const config: EnumConfig = defaultConfig.config[field] as EnumConfig;
        return Object.keys(config.possibleValues).map((key: string) => {
            return {
                enumValue: key,
                localized: config.possibleValues[key],
            };
        });
    }

    public isSelectedEnum(configParameter: string, enumValue: string): boolean {
        return enumValue === this.rulesConfigForm.controls[configParameter].getRawValue();
    }

    public onEnumChange(field: string, event: Event): void {
        const select: HTMLSelectElement = event.target as HTMLSelectElement;
        this.rulesConfigForm.controls[field].setValue(select.value);
    }

    private setChosenConfig(configName: string): void {
        Utils.assert(this.creatorMode(), 'RulesConfigurationComponent should only allow creator to choose config');
        Utils.assert(this.editable(), 'RulesConfigurationComponent should only allow choosing config while editable');
        this.setSelectedConfigName(configName);
        if (configName === CUSTOM_CONFIG_NAME) {
            const defaultConfig: RulesConfig = this.rulesConfigDescription().getDefaultConfig().config;
            this.generateForm(defaultConfig, this.editable());
        } else {
            const chosenConfig: RulesConfig = this.rulesConfigDescription().getConfig(configName);
            this.generateForm(chosenConfig, false);
            // Emit the config directly because standard config are always legal
            this.updateCallback.emit(MGPOptional.of(chosenConfig));
        }
    }

    public isCustomizable(): boolean {
        return this.rulesConfigDescription().isCustomizable();
    }

    public setEditable(editable: boolean): void {
        Utils.assert(this.creatorMode() || editable === false,
                     'RulesConfigurationComponent should not be editable when not in creator mode');
        this.editable.set(editable);
        this.updateSelectedConfigControlAvailability();
        if (this.editable() && this.getChosenConfigName() === CUSTOM_CONFIG_NAME) {
            this.rulesConfigForm.enable();
        } else {
            this.rulesConfigForm.disable();
        }
    }

    /*
     * Checks the config parameter values.
     * If it matches an existing configuration, returns its name.
     * Otherwise, returns the internal custom config name
     */
    private getDisplayedConfigName(): string {
        const currentConfig: RulesConfig = this.rulesConfigToDisplay() as RulesConfig;
        const defaultConfigs: NamedRulesConfig<RulesConfig>[] = this.rulesConfigDescription().getStandardConfigs();
        const matchingConfigs: NamedRulesConfig<RulesConfig>[] = defaultConfigs.filter(
            (nameConfig: NamedRulesConfig<RulesConfig>) => {
                return comparableEquals(nameConfig.config, currentConfig);
            });
        if (matchingConfigs.length === 1) {
            return matchingConfigs[0].name();
        } else {
            return CUSTOM_CONFIG_NAME;
        }
    }

}
