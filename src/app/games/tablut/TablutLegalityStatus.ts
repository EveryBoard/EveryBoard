import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Table } from 'src/app/utils/ArrayUtils';
import { TablutCase } from './TablutCase';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class TablutLegalityStatus implements LegalityStatus {
    legal: MGPValidation;

    resultingBoard: MGPOptional<Table<TablutCase>>;
}
