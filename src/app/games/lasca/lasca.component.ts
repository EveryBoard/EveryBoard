import { Component } from '@angular/core';
import { RectangularGameComponent } from 'src/app/components/game-components/rectangular-game-component/RectangularGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LascaMove } from './LascaMove';
import { LascaRules } from './LascaRules';
import { LascaSpace, LascaState } from './LascaState';

@Component({
    selector: 'app-lasca', // Juneau why !
    templateUrl: './lasca.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class LascaComponent extends RectangularGameComponent<LascaRules,
                                                                LascaMove,
                                                                LascaState,
                                                                LascaSpace>
{

    public lastMove: MGPOptional<LascaMove> = MGPOptional.empty();
    public selectedPiece: MGPOptional<Coord> = MGPOptional.empty();
    public LascaSpace: typeof LascaSpace = LascaSpace;

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.hasAsymetricBoard = true;
        this.rules = new LascaRules(LascaState);
        this.availableMinimaxes = [
            // new LascaMinimax(this.rules, 'LascaMinimax'), TODOTODO
        ];
        // this.encoder = LascaMove.encoder; TODOTODO
        // this.tutorial = new LascaTutorial().tutorial; TODOTODO
        this.canPass = false;
        this.updateBoard();
    }
    public backgroundColor(x: number, y: number): string {
        if (x+y % 2 === 0) {
            return 'dark-grey';
        } else {
            return 'light-grey';
        }
    }
    public isPlayerZero(piece: LascaSpace): boolean {
        return piece.getCommander().player === Player.ZERO;
    }
    public piecePlayerClass(piece: LascaSpace): string {
        return this.getPlayerClass(piece.getCommander().player);
    }
    public updateBoard(): void {
        const state: LascaState = this.getState();
        this.board = state.getCopiedBoard();
        this.lastMove = this.rules.node.move;
    }
    public onClick(x: number, y: number): MGPValidation {
        return MGPValidation.SUCCESS;
    }
}
