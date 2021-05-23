import { Component } from '@angular/core';
import { AbstractGameComponent }
    from 'src/app/components/game-components/abstract-game-component/AbstractGameComponent';
import { Encoder } from 'src/app/jscaip/Encoder';
import { PentagoLegalityStatus } from './PentagoLegalityStatus';
import { PentagoMove } from './PentagoMove';
import { PentagoState } from './PentagoState';

@Component({
    selector: 'app-epaminondas',
    templateUrl: './epaminondas.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class PentagoComponent extends AbstractGameComponent<PentagoMove,
                                                            PentagoState,
                                                            PentagoLegalityStatus>
{

    public encoder: Encoder<PentagoMove>;

    public updateBoard(): void {
        throw new Error('Method not implemented.');
    }
}
