import { GobanConfig } from '../../../app/jscaip/GobanConfig';

export type PenteConfig = GobanConfig & {

    capturesNeededToWin: number;

    nInARow: number;

    sizeOfSandwich: number;

};
