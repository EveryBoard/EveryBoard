import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, OnDestroy, OnInit, effect, input, output, OutputEmitterRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { comparableEquals, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { ConfigDescriptionType, DefaultConfigDescription, NamedRulesConfig, RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { Localized } from '../../../utils/LocaleUtils';
import { BaseWrapperComponent } from '../BaseWrapperComponent';

import { EnumConfig, RulesConfigDescription } from './RulesConfigDescription';

const CUSTOM_CONFIG_NAME: string = '__custom__';

type EnumOption = {
    enumValue: string;
    localized: Localized;
}

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

    // Required whenever the component is not editable, including creator review mode.
    public readonly rulesConfigToDisplay: InputSignal<RulesConfig | undefined> = input<RulesConfig>();

    // Whether this config can be edited or not
    public readonly editable: InputSignal<boolean> = input<boolean>(false);

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

    public defaultConfigName: string; // set in onInit

    public nonDefaultStandardConfigs: NamedRulesConfig<RulesConfig>[] = [];

    public configFields: string[] = [];

    public enumOptionsByField: { [field: string]: EnumOption[] } = {};

    private defaultConfig: RulesConfig = {};

    private formSubscription: Subscription = new Subscription();

    private selectedConfigSubscription: Subscription = new Subscription();

    private initialized: boolean = false;

    public errorMessages: string[] = [];

    public constructor() {
        super();
        effect(() => {
            this.syncEditableState();
        });
        effect(() => {
            this.syncDisplayedConfig();
        });
    }

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
        this.initializeConfigDescriptionViewState();
        if (this.isCustomizable()) {
            this.subscribeToSelectedConfigControl();
            if (this.creatorMode() && this.editable()) {
                const defaultConfig: NamedRulesConfig<RulesConfig> = this.rulesConfigDescription().getDefaultConfig();
                this.setChosenConfig(defaultConfig.name());
            } else {
                this.initializeReadOnlyConfig();
            }
        } else {
            return this.updateCallback.emit(MGPOptional.of({}));
        }
        this.initialized = true;
    }

    private initializeConfigDescriptionViewState(): void {
        const defaultConfig: NamedRulesConfig<RulesConfig> = this.rulesConfigDescription().getDefaultConfig();
        this.defaultConfig = defaultConfig.config;
        this.defaultConfigName = defaultConfig.name();
        this.nonDefaultStandardConfigs = this.rulesConfigDescription().getNonDefaultStandardConfigs();
        this.configFields = this.rulesConfigDescription().getFields();
        this.enumOptionsByField = this.getEnumOptionsByField();
    }

    private getEnumOptionsByField(): { [field: string]: EnumOption[] } {
        const enumOptionsByField: { [field: string]: EnumOption[] } = {};
        for (const field of this.configFields) {
            if (this.typeOfConfig(field) === 'string') {
                enumOptionsByField[field] = this.getEnumValues(field);
            }
        }
        return enumOptionsByField;
    }

    public ngOnDestroy(): void {
        this.formSubscription.unsubscribe();
        this.selectedConfigSubscription.unsubscribe();
    }

    private subscribeToSelectedConfigControl(): void {
        this.selectedConfigSubscription.unsubscribe();
        this.selectedConfigSubscription = this.selectedConfigControl.valueChanges.subscribe((configName: string) => {
            this.setChosenConfig(configName);
        });
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

    private syncEditableState(): void {
        this.updateSelectedConfigControlAvailability();
        if (this.editable() && this.getChosenConfigName() === CUSTOM_CONFIG_NAME) {
            this.rulesConfigForm.enable({ emitEvent: false });
        } else {
            this.rulesConfigForm.disable({ emitEvent: false });
        }
    }

    private syncDisplayedConfig(): void {
        const editable: boolean = this.editable();
        const rulesConfigToDisplay: RulesConfig | undefined = this.rulesConfigToDisplay();
        if (this.initialized === false || editable) {
            return;
        }
        Utils.assert(rulesConfigToDisplay !== undefined, 'Config should be provided if RulesConfigurationComponent is not editable');
        if (this.isCustomizable()) {
            this.initializeReadOnlyConfig();
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
        const rulesConfig: RulesConfig = {};
        for (const field of this.configFields) {
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
        const value: ConfigDescriptionType = this.defaultConfig[field];
        return typeof value;
    }

    public isValid(field: string): boolean {
        return this.rulesConfigDescription().isValid(field, this.rulesConfigForm.controls[field].value);
    }

    public getErrorMessage(field: string): string {
        const fieldValue: number | null = this.rulesConfigForm.controls[field].value;
        return this.rulesConfigDescription().getValidityError(field, fieldValue);
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

    private setChosenConfig(configName: string): void {
        Utils.assert(this.creatorMode(), 'RulesConfigurationComponent should only allow creator to choose config');
        Utils.assert(this.editable(), 'RulesConfigurationComponent should only allow choosing config while editable');
        this.setSelectedConfigName(configName);
        if (configName === CUSTOM_CONFIG_NAME) {
            this.generateForm(this.defaultConfig, this.editable());
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
