import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

import { AbstractReversiComponent } from '../common/abstract-reversi.component';

import { ToricReversiRules } from './ToricReversiRules';

@Component({
    selector: 'app-toric-reversi',
    templateUrl: '../common/abstract-reversi.component.html',
    styleUrls: ['../../../components/game-components/game-component/game-component.scss'],
    imports: [NgClass],
})
export class ToricReversiComponent extends AbstractReversiComponent<ToricReversiRules> {

    public constructor() {
        super('ToricReversi');
    }

}
