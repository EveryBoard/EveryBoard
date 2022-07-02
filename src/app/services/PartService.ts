import { Injectable } from '@angular/core';
import { PartDAO } from '../dao/PartDAO';
import { Part } from '../domain/Part';
import { Player } from '../jscaip/Player';

@Injectable({
    providedIn: 'root',
})

export class PartService {
    public constructor(private readonly partDAO: PartDAO) {
    }
    public async updateAndBumpIndex(id: string,
                                    user: Player,
                                    lastIndex: number,
                                    update: Partial<Part>)
    : Promise<void>
    {
        update = {
            ...update,
            lastUpdate: {
                index: lastIndex + 1,
                player: user.value,
            },
        };
        return this.partDAO.update(id, update);
    }
}
