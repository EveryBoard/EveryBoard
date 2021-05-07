import { Player } from 'src/app/jscaip/Player';
import { JSONValue } from 'src/app/utils/utils';

export type RequestCode =
    'DrawProposed' | 'DrawAccepted' | 'DrawRefused' |
    'AddedTime' |
    'TakeBackAsked' | 'TakeBackAccepted' | 'TakeBackRefused' |
    'RematchProposed' | 'RematchAccepted';

export type Request = { code: RequestCode, data: JSONValue };


function make(code: RequestCode, data: JSONValue): Request {
    return { code, data };
}

function makeWithPlayer(code: RequestCode): (player: Player) => Request {
    return (player: Player) => {
        return make(code, { player: player.value });
    };
}

export namespace Request {
    export const drawProposed: (player: Player) => Request = makeWithPlayer('DrawProposed');
    export const drawAccepted: Request = make('DrawAccepted', {});
    export const drawRefused: (player: Player) => Request = makeWithPlayer('DrawRefused');

    export const addedTime: (player: Player) => Request = makeWithPlayer('AddedTime');

    export const takeBackAsked: (player: Player) => Request = makeWithPlayer('TakeBackAsked');
    export const takeBackRefused: (player: Player) => Request = makeWithPlayer('TakeBackRefused');
    export const takeBackAccepted: (player: Player) => Request = makeWithPlayer('TakeBackAccepted');

    export const rematchProposed: (player: Player) => Request = makeWithPlayer('RematchProposed');
    export function rematchAccepted(typeGame: string, partId: string): Request {
        return make('RematchAccepted', { typeGame, partId });
    }
}
