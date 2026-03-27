import { NgIf } from '@angular/common';
import { Component, input, InputSignal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { MGPOptional } from '@everyboard/lib';

import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { RulesConfigDescription } from '../../wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfigurationComponent } from '../../wrapper-components/rules-configuration/rules-configuration.component';


@Component({
    selector: 'app-view-config',
    templateUrl: './view-config.html',
    imports: [NgIf, RulesConfigurationComponent, FaIconComponent],
})
export class ViewConfigComponent {

    public readonly rulesConfig: InputSignal<MGPOptional<RulesConfig>> = input.required<MGPOptional<RulesConfig>>();
    public readonly rulesConfigDescription: InputSignal<MGPOptional<RulesConfigDescription<RulesConfig>>> =
        input.required<MGPOptional<RulesConfigDescription<RulesConfig>>>();
    public readonly gameName: InputSignal<string> = input.required<string>();

    public faCog: IconDefinition = faCog;
    public viewConfig: boolean = false;

    public openConfig(): void {
        this.viewConfig = true;
    }

    public closeConfig(): void {
        this.viewConfig = false;
    }

}
