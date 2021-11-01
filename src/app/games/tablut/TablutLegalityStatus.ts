import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Table } from 'src/app/utils/ArrayUtils';
import { TablutCase } from './TablutCase';

export class TablutLegalityStatus implements LegalityStatus {
    legal: MGPValidation;

    resultingBoard: Table<TablutCase> | null;
}
