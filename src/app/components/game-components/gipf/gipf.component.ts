import { Component } from '@angular/core';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';
import { GipfLegalityStatus } from 'src/app/games/gipf/gipflegalitystatus';
import { GipfMove } from 'src/app/games/gipf/gipfmove/GipfMove';
import { GipfPartSlice } from 'src/app/games/gipf/gipfpartslice/GipfPartSlice';
import { GipfRules } from 'src/app/games/gipf/gipfrules/GipfRules';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Player } from 'src/app/jscaip/player/Player';
import { AbstractGameComponent } from '../AbstractGameComponent';

@Component({
    selector: 'app-gipf',
    templateUrl: './gipf.component.html',
})
export class GipfComponent extends AbstractGameComponent<GipfMove, GipfPartSlice, GipfLegalityStatus> {
    public rules: GipfRules = new GipfRules(GipfPartSlice);
}
