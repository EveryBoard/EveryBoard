import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from './TaflPawn';

export class TaflLegalityStatus implements LegalityStatus {

    legal: MGPValidation;

    resultingBoard: Table<TaflPawn>;
}
