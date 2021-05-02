import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';

import { IdentifiableCouchbasePersistence } from '../../src/persistence/IdentifiableCouchbasePersistence';
import { Dummy } from '../fixtures/Dummy';
import { IDummyPersistence } from '../fixtures/IDummyPersistence';

export class DummyCouchbasePersistence 
    extends IdentifiableCouchbasePersistence<Dummy, string> 
    implements IDummyPersistence
{
    public constructor() {
        super('test', 'dummies');
    }

    public getPageByFilter(correlationId: string, filter: FilterParams,
        paging: PagingParams): Promise<DataPage<Dummy>> {
        filter = filter || new FilterParams();
        let key = filter.getAsNullableString('key');

        let filterCondition = null;
        if (key != null) {
            filterCondition = "key='" + key + "'";
        }

        return super.getPageByFilter(correlationId, filterCondition, paging, null, null);
    }

    public getCountByFilter(correlationId: string, filter: FilterParams): Promise<number> {
        filter = filter || new FilterParams();
        let key = filter.getAsNullableString('key');

        let filterCondition = null;
        if (key != null) {
            filterCondition = "key='" + key + "'";
        }

        return super.getCountByFilter(correlationId, filterCondition);
    }

}