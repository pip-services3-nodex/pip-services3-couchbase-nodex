import { IDummyPersistence } from './IDummyPersistence';
export declare class DummyPersistenceFixture {
    private _dummy1;
    private _dummy2;
    private _dummy3;
    private _persistence;
    constructor(persistence: IDummyPersistence);
    testCrudOperations(): Promise<void>;
    testBatchOperations(): Promise<void>;
    testPaging(): Promise<void>;
}
