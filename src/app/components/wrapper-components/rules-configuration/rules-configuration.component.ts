import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, Type } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ConfigDescriptionType, RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Utils } from 'src/app/utils/utils';
import { BaseGameComponent } from '../../game-components/game-component/GameComponent';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { DemoNodeInfo } from '../demo-card-wrapper/demo-card-wrapper.component';
import { GameState } from 'src/app/jscaip/GameState';
import { AbstractNode, GameNode } from 'src/app/jscaip/GameNode';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { RulesConfigDescription } from './RulesConfigDescription';

type ConfigFormJSON = {
    [member: string]: FormControl<ConfigDescriptionType>;
}

@Component({
    selector: 'app-rules-configuration',
    templateUrl: './rules-configuration.component.html',
})
export class RulesConfigurationComponent extends BaseGameComponent implements OnInit {

    @Input() stateType: MGPOptional<Type<GameState>>;

    @Input() rulesConfigDescription: RulesConfigDescription;

    @Input() rulesConfigToDisplay?: RulesConfig;

    @Input() userIsCreator: boolean;

    /**
     * notify that the config has been update
     * if the optional is empty, the last update was invalid
     */
    @Output() updateCallback: EventEmitter<MGPOptional<RulesConfig>> = new EventEmitter<MGPOptional<RulesConfig>>();

    public configDemo: DemoNodeInfo;

    public rulesConfigForm: FormGroup = new FormGroup({});

    public gameName: string; // Instanciated onInit

    private chosenConfig: string = '';

    public constructor(activatedRoute: ActivatedRoute,
                       private readonly cdr: ChangeDetectorRef)
    {
        super(activatedRoute);
    }

    public getChosenConfig(): string {
        return this.chosenConfig;
    }

    public ngOnInit(): void {
        this.assertParamsAreCoherent();
        this.gameName = this.getGameName();
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        this.setChosenConfig(this.rulesConfigDescription.getDefaultConfig().name(), false);
        if (this.userIsCreator) {
            this.setConfigDemo(config);
        } else {
            const configToDisplay: RulesConfig = Utils.getNonNullable(this.rulesConfigToDisplay);
            this.setConfigDemo(configToDisplay);
        }
        if (this.isCustomisable() === false) {
            return this.updateCallback.emit(MGPOptional.of({}));
        }
    }

    private setConfigDemo(config: RulesConfig): void {
        if (this.stateType.isPresent()) {
            // eslint-disable-next-line dot-notation
            const node: AbstractNode = new GameNode(this.stateType.get()['getInitialState'](config));
            this.configDemo = {
                click: MGPOptional.empty(),
                name: this.gameName,
                node,
            };
            this.cdr.detectChanges();
        }
    }

    public getConfigDemo(): DemoNodeInfo {
        return this.configDemo;
    }

    private generateForm(config: RulesConfig, configurable: boolean): void {
        const group: ConfigFormJSON = {};

        Object.keys(config).forEach((parameterName: string) => {
            const value: ConfigDescriptionType =
                this.getRulesConfigDescriptionValue(parameterName,
                                                    config[parameterName]);

            group[parameterName] = this.getFormControl(value, configurable);
        });
        this.rulesConfigForm = new FormGroup(group);
    }

    private assertParamsAreCoherent(): void {
        if (this.userIsCreator === false) {
            Utils.assert(this.rulesConfigToDisplay != null,
                         'Config should be provided to non-creator in RulesConfigurationComponent');
        }
    }

    private getRulesConfigDescriptionValue(name: string, defaultValue: ConfigDescriptionType): ConfigDescriptionType {
        if (this.userIsCreator === false) {
            const configuration: RulesConfig = Utils.getNonNullable(this.rulesConfigToDisplay);
            return configuration[name];
        } else {
            return defaultValue;
        }
    }

    private getFormControl(value: ConfigDescriptionType, configurable: boolean): FormControl {
        const formControl: FormControl = new FormControl(value);
        if (configurable === false) {
            formControl.disable();
        }
        formControl.valueChanges.subscribe(() => {
            this.onUpdate();
        });
        return formControl;
    }

    public onUpdate(): void {
        if (this.userIsCreator === false) {
            ErrorLoggerService.logError('RulesConfiguration', 'Only creator should be able to modify rules config');
        } else if (this.chosenConfig !== 'Custom') {
            ErrorLoggerService.logError('RulesConfiguration', 'Only Customifiable config should be modified!');
        } else {
            const rulesConfig: RulesConfig = {};
            const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
            const parameterNames: string[] = Object.keys(config);
            for (const parameterName of parameterNames) {
                if (this.isValid(parameterName)) {
                    rulesConfig[parameterName] = this.rulesConfigForm.controls[parameterName].value;
                } else {
                    // This informs the parent component that an invalid update has been done
                    this.updateCallback.emit(MGPOptional.empty());
                    return; // In order not to send update when form is invalid
                }
            }
            this.setConfigDemo(rulesConfig);
            this.updateCallback.emit(MGPOptional.of(rulesConfig));
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

    public isValid(field: string): boolean {
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        const value: ConfigDescriptionType = config[field];
        if (typeof value === 'number') {
            const fieldValue: number = this.rulesConfigForm.controls[field].value;
            const validity: MGPValidation = this.rulesConfigDescription.getValidator(field)(fieldValue);
            return validity.isSuccess();
        } else {
            Utils.expectToBe(typeof value, 'boolean');
            // Angular make those controls invalid when they are boolean, not sure why
            return true; // So we return false cause they cannot be invalid, checked or not, its always valid
        }
    }

    public getErrorMessage(field: string): string {
        const fieldValue: number | null = this.rulesConfigForm.controls[field].value;
        const validity: MGPValidation = this.rulesConfigDescription.getValidator(field)(fieldValue);
        return validity.getReason();
    }

    public getFields(): string[] {
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        return Object.keys(config);
    }

    public onChange(event: Event): void {
        const select: HTMLSelectElement = event.target as HTMLSelectElement;
        this.setChosenConfig(select.value);
    }

    private setChosenConfig(configName: string, emit: boolean = true): void {
        this.chosenConfig = configName;
        let config: RulesConfig;
        if (this.chosenConfig === 'Custom') {
            config = this.rulesConfigDescription.getDefaultConfig().config;
            this.generateForm(config, this.userIsCreator);
        } else {
            config = this.rulesConfigDescription.getConfig(this.chosenConfig);
            this.generateForm(config, false);
            if (emit) {
                this.updateCallback.emit(MGPOptional.of(config)); // As standard config are always legal
            }
        }
        this.setConfigDemo(config);
    }

    public isCustomisable(): boolean {
        const config: RulesConfig = this.rulesConfigDescription.getDefaultConfig().config;
        return Object.keys(config).length > 0;
    }

}
