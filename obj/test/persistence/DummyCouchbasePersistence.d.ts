import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableCouchbasePersistence } from '../../src/persistence/IdentifiableCouchbasePersistence';
import { Dummy } from '../fixtures/Dummy';
import { IDummyPersistence } from '../fixtures/IDummyPersistence';
export declare class DummyCouchbasePersistence extends IdentifiableCouchbasePersistence<Dummy, string> implements IDummyPersistence {
    constructor();
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<Dummy>>;
    getCountByFilter(correlationId: string, filter: FilterParams): Promise<number>;
}
