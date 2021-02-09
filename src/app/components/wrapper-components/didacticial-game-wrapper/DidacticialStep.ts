import { AwaleMove } from 'src/app/games/awale/awale-move/AwaleMove';
import { AwalePartSlice } from 'src/app/games/awale/AwalePartSlice';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { Move } from 'src/app/jscaip/Move';

export class DidacticialStep {

    constructor(
        public readonly instruction: string,
        public readonly slice: GamePartSlice,
        public readonly acceptedMoves: ReadonlyArray<Move>,
        public readonly successMessage: string,
        public readonly failureMessage: string,
    ) {}
    public isMove(): boolean {
        return this.acceptedMoves.length > 0;
    }
}
export const awaleDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'L’awalé est un jeu d’égrènage, laissez moi vous montrer comment se distribuent les graines. Choisissez une pièce à vous, vous êtes le premier joueur, vos pierres sont en haut!',
        AwalePartSlice.getInitialSlice(),
        [
            new AwaleMove(0, 0),
            new AwaleMove(1, 0),
            new AwaleMove(2, 0),
            new AwaleMove(3, 0),
            new AwaleMove(4, 0),
            new AwaleMove(5, 0),
        ],
        'Voilà, regardez les 4 cases suivant dans l’ordre horloger, elle comptent maintenant 5 graines, c’est comme celà que les pierres se distribuent: une à une à partir de la case suivante dans l’ordre horloger de la maison d’où elles viennent!',
        'vous avez vu le message ? Allez ! Recommencez',
    ),
];
