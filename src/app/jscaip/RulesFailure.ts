/* eslint-disable max-len */
// eslint-disable-next-line quotes
import { MGPValidation } from "../utils/MGPValidation";

export class RulesFailure {

    public static readonly CANNOT_CHOOSE_ENNEMY_PIECE: string = `Vous ne pouvez pas choisir une pièce de l'ennemi.`;

    public static readonly MUST_CLICK_ON_EMPTY_CASE: MGPValidation = MGPValidation.failure('Vous devez cliquer sur une case vide.');

    public static readonly CANNOT_SELF_CAPTURE: string = `Votre case d'arrivée doit être vide ou contenir une pièce ennemie.`;

    private constructor() {}
}
