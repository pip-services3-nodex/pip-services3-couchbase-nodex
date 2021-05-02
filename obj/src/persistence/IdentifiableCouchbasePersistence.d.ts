/** @module persistence */
import { ConfigParams } from 'pip-services3-commons-nodex';
import { AnyValueMap } from 'pip-services3-commons-nodex';
import { IIdentifiable } from 'pip-services3-commons-nodex';
import { IWriter } from 'pip-services3-data-nodex';
import { IGetter } from 'pip-services3-data-nodex';
import { ISetter } from 'pip-services3-data-nodex';
import { CouchbasePersistence } from './CouchbasePersistence';
/**
 * Abstract persistence component that stores data in Couchbase
 * and implements a number of CRUD operations over data items with unique ids.
 * The data items must implement [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/data.iidentifiable.html IIdentifiable]] interface.
 *
 * In basic scenarios child classes shall only override [[getPageByFilter]],
 * [[getListByFilter]] or [[deleteByFilter]] operations with specific filter function.
 * All other operations can be used out of the box.
 *
 * In complex scenarios child classes can implement additional operations by
 * accessing <code>this._collection</code> and <code>this._model</code> properties.

 * ### Configuration parameters ###
 *
 * - bucket:                      (optional) Couchbase bucket name
 * - collection:                  (optional) Couchbase collection name
 * - connection(s):
 *   - discovery_key:             (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *   - host:                      host name or IP address
 *   - port:                      port number (default: 27017)
 *   - uri:                       resource URI or connection string with all parameters in it
 * - credential(s):
 *   - store_key:                 (optional) a key to retrieve the credentials from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]]
 *   - username:                  (optional) user name
 *   - password:                  (optional) user password
 * - options:
 *   - max_pool_size:             (optional) maximum connection pool size (default: 2)
 *   - keep_alive:                (optional) enable connection keep alive (default: true)
 *   - connect_timeout:           (optional) connection timeout in milliseconds (default: 5 sec)
 *   - auto_reconnect:            (optional) enable auto reconnection (default: true)
 *   - max_page_size:             (optional) maximum page size (default: 100)
 *   - debug:                     (optional) enable debug output (default: false).
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages components to pass log messages
 * - <code>\*:discovery:\*:\*:1.0</code>        (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services
 * - <code>\*:credential-store:\*:\*:1.0</code> (optional) Credential stores to resolve credentials
 *
 * ### Example ###
 *
 *     class MyCouchbasePersistence extends CouchbasePersistence<MyData, string> {
 *
 *     public constructor() {
 *         base("mybucket", "mydata", new MyDataCouchbaseSchema());
 *     }
 *
 *     private composeFilter(filter: FilterParams): any {
 *         filter = filter || new FilterParams();
 *         let criteria = [];
 *         let name = filter.getAsNullableString('name');
 *         if (name != null)
 *             criteria.push({ name: name });
 *         return criteria.length > 0 ? { $and: criteria } : null;
 *     }
 *
 *     public getPageByFilter(correlationId: string, filter: FilterParams,
 *         paging: PagingParams): Promise<DataPage<MyData>> {
 *         return base.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null);
 *     }
 *
 *     }
 *
 *     let persistence = new MyCouchbasePersistence();
 *     persistence.configure(ConfigParams.fromTuples(
 *         "host", "localhost",
 *         "port", 27017
 *     ));
 *
 *     await persitence.open("123");
 *
 *     let item = await persistence.create("123", { id: "1", name: "ABC" });
 *     let page = await persistence.getPageByFilter(
 *       "123",
 *       FilterParams.fromTuples("name", "ABC"),
 *       null
 *     );
 *     console.log(page.data);          // Result: { id: "1", name: "ABC" }
 *
 *     item = await persistence.deleteById("123", "1");
 */
export declare class IdentifiableCouchbasePersistence<T extends IIdentifiable<K>, K> extends CouchbasePersistence<T> implements IWriter<T, K>, IGetter<T, K>, ISetter<T> {
    /**
     * Creates a new instance of the persistence component.
     *
     * @param bucket    (optional) a bucket name.
     * @param collection    (optional) a collection name.
     */
    constructor(bucket: string, collection: string);
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config: ConfigParams): void;
    /**
     * Generates a list of unique ids for specific collection in the bucket
     * @param value a public unique ids.
     * @returns a unique bucket ids.
     */
    protected generateBucketIds(value: K[]): string[];
    /**
     * Gets a list of data items retrieved by given unique ids.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param ids               ids of data items to be retrieved
     * @returns                 a list with requested data items.
     */
    getListByIds(correlationId: string, ids: K[]): Promise<T[]>;
    /**
     * Gets a data item by its unique id.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param id                an id of data item to be retrieved.
     * @returns                 a found data item.
     */
    getOneById(correlationId: string, id: K): Promise<T>;
    /**
     * Creates a data item.
     *
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param item              an item to be created.
     * @returns                 the created item.
     */
    create(correlationId: string, item: T): Promise<T>;
    /**
     * Sets a data item. If the data item exists it updates it,
     * otherwise it create a new data item.
     *
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param item              a item to be set.
     * @returns                 the updated item.
     */
    set(correlationId: string, item: T): Promise<T>;
    /**
     * Updates a data item.
     *
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param item              an item to be updated.
     * @returns                 the updated item.
     */
    update(correlationId: string, item: T): Promise<T>;
    /**
     * Updates only few selected fields in a data item.
     *
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param id                an id of data item to be updated.
     * @param data              a map with fields to be updated.
     * @returns                 the updated item.
     */
    updatePartially(correlationId: string, id: K, data: AnyValueMap): Promise<T>;
    /**
     * Deleted a data item by it's unique id.
     *
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param id                an id of the item to be deleted
     * @returns                 the deleted item.
     */
    deleteById(correlationId: string, id: K): Promise<T>;
    /**
     * Deletes multiple data items by their unique ids.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param ids               ids of data items to be deleted.
     */
    deleteByIds(correlationId: string, ids: K[]): Promise<void>;
}
