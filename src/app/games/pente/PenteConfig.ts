import { GobanConfig } from 'src/app/jscaip/GobanConfig';

export type PenteConfig = GobanConfig & {

    winAfterNCapture: number;

    nInARow: number;

    sizeOfSandwich: number;

};
