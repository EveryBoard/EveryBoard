/* eslint-disable max-len */
import { DvonnMove } from 'src/app/games/dvonn/dvonn-move/DvonnMove';
import { DvonnPartSlice } from 'src/app/games/dvonn/DvonnPartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { DidacticialStep } from 'src/app/components/wrapper-components/didacticial-game-wrapper/DidacticialStep';

export const dvonnDidacticial: DidacticialStep[] = [
    new DidacticialStep(
        'Déplacement',
        'Au Dvonn, ce que vous voyez sont les tours. Le numéro écrit dessus est la hauteur de la tour et le nombre de points qu’elle rapporte à son propriétaire. Son propriétaire est celui dont une pièce est au sommet de la tour. Seul son propriétaire peut la déplacer. Elle ne peut pas se déplacer si elle est entourée par 6 autres pièces. Elle se déplace d’autant de cases que sa hauteur en ligne droite. Cliquez sur la tour la plus à gauche et déplacez là d’une case à droite.',
        DvonnPartSlice.getInitialSlice(),
        [DvonnMove.of(new Coord(10, 2), new Coord(9, 2))],
        [],
        'BLBL',
        'FRFR',
    ),
];
