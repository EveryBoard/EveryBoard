import { MGPResult, Part } from './icurrentpart';

export class PartMocks {
    public static readonly INITIAL: Part = new Part('Quarto', 'creator', -1, [], MGPResult.UNACHIEVED.toInterface());

    public static readonly STARTING: Part = new Part('Quarto', 'creator', 0, [], MGPResult.UNACHIEVED.toInterface(), 'firstCandidate');
}
