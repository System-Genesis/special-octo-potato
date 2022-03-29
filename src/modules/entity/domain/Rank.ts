import { Result, err, ok } from 'neverthrow';
import { BasicValueObject } from '../../../core/domain/BasicValueObject';
import config from 'config';

// TODO: maybe inject config to a factory class that creates ranks
const ranks: string[] = config.get('valueObjects.rank.values');

export class Rank extends BasicValueObject<string> {
    private static isValid(rank: string) {
        return ranks.includes(rank);
    }

    public static create(rank: string): Result<Rank, string> {
        if (!Rank.isValid(rank)) {
            return err(`invalid rank: ${rank}`);
        }
        return ok(new Rank(rank));
    }
}
