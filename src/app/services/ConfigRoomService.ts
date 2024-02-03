import { Injectable } from '@angular/core';
import { FirstPlayer, ConfigRoom, PartStatus, PartType } from '../domain/ConfigRoom';
import { ConfigRoomDAO } from '../dao/ConfigRoomDAO';
import { Debug, FirestoreJSONObject } from 'src/app/utils/utils';
import { MGPOptional } from '../utils/MGPOptional';
import { Subscription } from 'rxjs';
import { MGPValidation } from '../utils/MGPValidation';
import { MinimalUser } from '../domain/MinimalUser';
import { FirestoreCollectionObserver } from '../dao/FirestoreCollectionObserver';
import { FirestoreDocument, IFirestoreDAO } from '../dao/FirestoreDAO';
import { RulesConfig } from '../jscaip/RulesConfigUtil';
import { BackendService } from './BackendService';

@Injectable({
    providedIn: 'root',
})
@Debug.log
export class ConfigRoomService {

    public constructor(private readonly configRoomDAO: ConfigRoomDAO,
                       private readonly backendService: BackendService)
    {
    }

    public subscribeToChanges(gameId: string, callback: (doc: MGPOptional<ConfigRoom>) => void): Subscription {
        return this.configRoomDAO.subscribeToChanges(gameId, callback);
    }

    public subscribeToCandidates(gameId: string, callback: (candidates: MinimalUser[]) => void): Subscription {
        let candidates: MinimalUser[] = [];
        const observer: FirestoreCollectionObserver<MinimalUser> = new FirestoreCollectionObserver(
            (created: FirestoreDocument<MinimalUser>[]) => {
                for (const candidate of created) {
                    candidates.push(candidate.data);
                }
                callback(candidates);
            },
            (modified: FirestoreDocument<MinimalUser>[]) => {
                // This should never happen, but we can still update the candidates list just in case
                for (const modifiedCandidate of modified) {
                    candidates = candidates.map((candidate: MinimalUser) => {
                        if (candidate.id === modifiedCandidate.data.id) {
                            return modifiedCandidate.data;
                        } else {
                            return candidate;
                        }
                    });
                }
                callback(candidates);
            },
            (deleted: FirestoreDocument<MinimalUser>[]) => {
                for (const deletedCandidate of deleted) {
                    candidates = candidates.filter((candidate: MinimalUser) =>
                        candidate.id !== deletedCandidate.data.id);
                }
                callback(candidates);
            });
        const subCollection: IFirestoreDAO<FirestoreJSONObject> =
            this.configRoomDAO.subCollectionDAO(gameId, 'candidates');
        return subCollection.observingWhere([], observer);
    }

    public joinGame(gameId: string): Promise<MGPValidation> {
        return this.backendService.joinGame(gameId);
    }

    public removeCandidate(gameId: string, candidate: MinimalUser): Promise<void> {
        return this.backendService.removeCandidate(gameId, candidate.id);
    }

    public proposeConfig(gameId: string,
                         partType: PartType,
                         maximalMoveDuration: number,
                         firstPlayer: FirstPlayer,
                         totalPartDuration: number,
                         rulesConfig: MGPOptional<RulesConfig>)
    : Promise<void>
    {
        return this.backendService.proposeConfig(gameId, {
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            partType: partType.value,
            maximalMoveDuration,
            totalPartDuration,
            firstPlayer: firstPlayer.value,
            rulesConfig: rulesConfig.getOrElse({}),
        });
    }

    public setChosenOpponent(gameId: string, chosenOpponent: MinimalUser): Promise<void> {
        return this.backendService.selectOpponent(gameId, chosenOpponent);
    }

    public reviewConfig(gameId: string): Promise<void> {
        return this.backendService.reviewConfig(gameId);
    }

    public reviewConfigAndRemoveChosenOpponent(gameId: string): Promise<void> {
        return this.backendService.reviewConfigAndRemoveChosenOpponent(gameId);
    }
}
