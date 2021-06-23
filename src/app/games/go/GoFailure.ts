import { MGPValidation } from 'src/app/utils/MGPValidation';

export class GoFailure {

    public static readonly ILLEGAL_KO: string = 'Ce mouvement est un ko, vous devez jouer ailleurs avant de pouvoir rejouer dans cette case';

    public static readonly CANNOT_PASS_AFTER_PASSED_PHASE: MGPValidation = MGPValidation.failure('We are nor in playing nor in passed phase, you must mark stone as dead or alive or accept current board.');

    public static readonly CANNOT_ACCEPT_BEFORE_COUNTING_PHRASE: MGPValidation = MGPValidation.failure('not countig or not accept');
}
