import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, InputSignal, OnDestroy, OnInit, effect, input, output, OutputEmitterRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ConfigDescriptionType, DefaultConfigDescription, NamedRulesConfig, RulesConfig } from '@everyboard/games';
import { EnumConfig } from '@everyboard/games';
import { RulesConfigDescription } from '@everyboard/games';
import { Localized } from '@everyboard/games';
import { comparableEquals, MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { BaseWrapperComponent } from '../BaseWrapperComponent';


const CUSTOM_CONFIG_NAME: string = '__custom__';

type RulesConfigFormControls = {
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

    private defaultConfig: RulesConfig = {};

    private formSubscription: Subscription = new Subscription();

    private selectedConfigSubscription: Subscription = new Subscription();

    private initialized: boolean = false;

    public errorMessages: string[] = [];

    public constructor() {
        super();
        this.watchEditableState();
        this.watchReadOnlyConfigToDisplay();
    }

    private watchEditableState(): void {
        effect(() => {
            this.applyEditableState();
        });
    }

    private watchReadOnlyConfigToDisplay(): void {
        effect(() => {
            this.refreshReadOnlyConfigToDisplay();
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
        this.cacheConfigDescriptionValues();
        if (this.isCustomizable() === false) {
            this.updateCallback.emit(MGPOptional.of({}));
            return;
        }
        this.subscribeToSelectedConfigControl();
        if (this.creatorMode() && this.editable()) {
            this.chooseConfig(this.defaultConfigName);
        } else {
            this.displayReadOnlyConfig();
        }
        this.initialized = true;
    }

    private cacheConfigDescriptionValues(): void {
        const defaultConfig: NamedRulesConfig<RulesConfig> = this.rulesConfigDescription().getDefaultConfig();
        this.defaultConfig = defaultConfig.config;
        this.defaultConfigName = defaultConfig.name();
        this.nonDefaultStandardConfigs = this.rulesConfigDescription().getNonDefaultStandardConfigs();
        this.configFields = this.rulesConfigDescription().getFields();
    }

    public ngOnDestroy(): void {
        this.formSubscription.unsubscribe();
        this.selectedConfigSubscription.unsubscribe();
    }

    private subscribeToSelectedConfigControl(): void {
        this.selectedConfigSubscription.unsubscribe();
        this.selectedConfigSubscription = this.selectedConfigControl.valueChanges.subscribe((configName: string) => {
            this.chooseConfig(configName);
        });
    }

    private displayReadOnlyConfig(): void {
        const configToDisplay: RulesConfig = Utils.getNonNullable(this.rulesConfigToDisplay());
        this.setSelectedConfigName(this.getDisplayedConfigName());
        this.buildRulesConfigForm(configToDisplay, false);
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

    private applyEditableState(): void {
        this.updateSelectedConfigControlAvailability();
        if (this.editable() && this.getChosenConfigName() === CUSTOM_CONFIG_NAME) {
            this.rulesConfigForm.enable({ emitEvent: false });
        } else {
            this.rulesConfigForm.disable({ emitEvent: false });
        }
    }

    private refreshReadOnlyConfigToDisplay(): void {
        const editable: boolean = this.editable();
        const rulesConfigToDisplay: RulesConfig | undefined = this.rulesConfigToDisplay();
        if (this.initialized === false || editable) {
            return;
        }
        Utils.assert(rulesConfigToDisplay !== undefined, 'Config should be provided if RulesConfigurationComponent is not editable');
        if (this.isCustomizable()) {
            this.displayReadOnlyConfig();
        }
    }

    private buildRulesConfigForm(config: RulesConfig, fieldsEditable: boolean): void {
        const group: RulesConfigFormControls = {};

        Object.keys(config).forEach((parameterName: string) => {
            group[parameterName] = this.createFormControl(config[parameterName], fieldsEditable);
        });
        this.formSubscription.unsubscribe();
        this.rulesConfigForm = new FormGroup(group);
        this.formSubscription = this.rulesConfigForm.valueChanges.subscribe(() => {
            this.emitFormUpdate();
        });
    }

    private createFormControl(value: ConfigDescriptionType, enabled: boolean): FormControl {
        const formControl: FormControl = new FormControl(value);
        if (enabled === false) {
            formControl.disable();
        }
        return formControl;
    }

    private emitFormUpdate(): void {
        const rulesConfig: RulesConfig = {};
        for (const field of this.configFields) {
            if (this.isFieldValid(field)) {
                rulesConfig[field] = this.rulesConfigForm.controls[field].value;
            } else {
                // This informs the parent component that an invalid update has been done
                this.updateCallback.emit(MGPOptional.empty());
                return; // In order not to send update when form is invalid
            }
        }
        return this.emitValidatedConfig(rulesConfig);
    }

    private emitValidatedConfig(rulesConfig: RulesConfig): void {
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

    public getFieldType(field: string): string {
        const value: ConfigDescriptionType = this.defaultConfig[field];
        return typeof value;
    }

    public isFieldValid(field: string): boolean {
        return this.rulesConfigDescription().isValid(field, this.rulesConfigForm.controls[field].value);
    }

    public getFieldErrorMessage(field: string): string {
        const fieldValue: number | null = this.rulesConfigForm.controls[field].value;
        return this.rulesConfigDescription().getValidityError(field, fieldValue);
    }

    public getEnumOptions(field: string): { enumValue: string; localized: Localized }[] {
        const defaultConfig: DefaultConfigDescription = this.rulesConfigDescription().defaultConfigDescription;
        const config: EnumConfig = defaultConfig.config[field] as EnumConfig;
        return Object.keys(config.possibleValues).map((key: string) => {
            return {
                enumValue: key,
                localized: config.possibleValues[key],
            };
        });
    }

    private chooseConfig(configName: string): void {
        Utils.assert(this.creatorMode(), 'RulesConfigurationComponent should only allow creator to choose config');
        Utils.assert(this.editable(), 'RulesConfigurationComponent should only allow choosing config while editable');
        this.setSelectedConfigName(configName);
        if (configName === CUSTOM_CONFIG_NAME) {
            this.buildRulesConfigForm(this.defaultConfig, this.editable());
        } else {
            const chosenConfig: RulesConfig = this.rulesConfigDescription().getConfig(configName);
            this.buildRulesConfigForm(chosenConfig, false);
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
