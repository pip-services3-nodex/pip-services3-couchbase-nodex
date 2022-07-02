"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouchbasePersistence = void 0;
/** @module persistence */
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_6 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_7 = require("pip-services3-commons-nodex");
const CouchbaseConnection_1 = require("../connect/CouchbaseConnection");
/**
 * Abstract persistence component that stores data in Couchbase
 * and is based using Couchbaseose object relational mapping.
 *
 * This is the most basic persistence component that is only
 * able to store data items of any type. Specific CRUD operations
 * over the data items must be implemented in child classes by
 * accessing <code>this._collection</code> or <code>this._model</code> properties.
 *
 * ### Configuration parameters ###
 *
 * - bucket:                      (optional) Couchbase bucket name
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
 *   - auto_create:               (optional) automatically create missing bucket (default: false)
 *   - auto_index:                (optional) automatically create primary index (default: false)
 *   - flush_enabled:             (optional) bucket flush enabled (default: false)
 *   - bucket_type:               (optional) bucket type (default: couchbase)
 *   - ram_quota:                 (optional) RAM quota in MB (default: 100)
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:discovery:\*:\*:1.0</code>        (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services
 * - <code>\*:credential-store:\*:\*:1.0</code> (optional) Credential stores to resolve credentials
 *
 * ### Example ###
 *
 *     class MyCouchbasePersistence extends CouchbasePersistence<MyData> {
 *
 *       public constructor() {
 *           base("mydata", "mycollection", new MyDataCouchbaseSchema());
 *     }
 *
 *     public getByName(correlationId: string, name: string): Promise<MyData> {
 *         let criteria = { name: name };
 *         return new Promise((resolve, reject) => {
 *            this._model.findOne(criteria, (err, value) => {
 *                if (err == null) resolve(value);
 *                else reject(err);
 *            });
 *         });
 *     }
 *
 *     public set(correlatonId: string, item: MyData, callback: (err) => void): void {
 *         let criteria = { name: item.name };
 *         let options = { upsert: true, new: true };
 *         return new Promise((resolve, reject) => {
 *            this._model.findOneAndUpdate(criteria, item, options, (err, value) => {
 *                if (err == null) resolve(value);
 *                else reject(err);
 *            });
 *         });
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
 *     let item = await persistence.set("123", { name: "ABC" });
 *     item = await persistence.getByName("123", "ABC");
 *     console.log(item);                   // Result: { name: "ABC" }
 */
class CouchbasePersistence {
    /**
     * Creates a new instance of the persistence component.
     *
     * @param bucket    (optional) a bucket name.
     * @param collection    (optional) a collection name.
     */
    constructor(bucket, collection) {
        this._maxPageSize = 100;
        /**
         * The dependency resolver.
         */
        this._dependencyResolver = new pip_services3_commons_nodex_5.DependencyResolver(CouchbasePersistence._defaultConfig);
        /**
         * The logger.
         */
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        /**
         * The configuration options.
         */
        this._options = new pip_services3_commons_nodex_2.ConfigParams();
        this._bucketName = bucket;
        this._collectionName = collection;
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        config = config.setDefaults(CouchbasePersistence._defaultConfig);
        this._config = config;
        this._dependencyResolver.configure(config);
        this._bucketName = config.getAsStringWithDefault('bucket', this._bucketName);
        this._options = this._options.override(config.getSection("options"));
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._references = references;
        this._logger.setReferences(references);
        // Get connection
        this._dependencyResolver.setReferences(references);
        this._connection = this._dependencyResolver.getOneOptional('connection');
        // Or create a local one
        if (this._connection == null) {
            this._connection = this.createConnection();
            this._localConnection = true;
        }
        else {
            this._localConnection = false;
        }
    }
    /**
     * Unsets (clears) previously set references to dependent components.
     */
    unsetReferences() {
        this._connection = null;
    }
    createConnection() {
        let connection = new CouchbaseConnection_1.CouchbaseConnection(this._bucketName);
        if (this._config) {
            connection.configure(this._config);
        }
        if (this._references) {
            connection.setReferences(this._references);
        }
        return connection;
    }
    /**
     * Converts object value from internal to public format.
     *
     * @param value     an object in internal format to convert.
     * @returns converted object in public format.
     */
    convertToPublic(value) {
        if (value && value.toJSON) {
            value = value.toJSON();
        }
        if (value) {
            delete value._c;
        }
        return value;
    }
    /**
     * Convert object value from public to internal format.
     *
     * @param value     an object in public format to convert.
     * @returns converted object in internal format.
     */
    convertFromPublic(value) {
        if (value) {
            value = Object.assign({}, value);
            value._c = this._collectionName;
        }
        return value;
    }
    /**
     * Converts the given object from the public partial format.
     *
     * @param value     the object to convert from the public partial format.
     * @returns the initial object.
     */
    convertFromPublicPartial(value) {
        return this.convertFromPublic(value);
    }
    quoteIdentifier(value) {
        if (value == null || value == "")
            return value;
        if (value[0] == '`')
            return value;
        return '`' + value + '`';
    }
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen() {
        return this._opened;
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._opened) {
                return;
            }
            if (this._connection == null) {
                this._connection = this.createConnection();
                this._localConnection = true;
            }
            if (this._localConnection) {
                yield this._connection.open(correlationId);
            }
            if (this._connection == null) {
                throw new pip_services3_commons_nodex_4.InvalidStateException(correlationId, 'NO_CONNECTION', 'Couchbase connection is missing');
            }
            if (!this._connection.isOpen()) {
                throw new pip_services3_commons_nodex_3.ConnectionException(correlationId, "CONNECT_FAILED", "Couchbase connection is not opened");
            }
            this._cluster = this._connection.getConnection();
            this._bucket = this._connection.getBucket();
            this._bucketName = this._connection.getBucketName();
            let couchbase = require('couchbase');
            this._query = couchbase.N1qlQuery;
            this._opened = true;
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._opened) {
                return;
            }
            if (this._connection == null) {
                throw new pip_services3_commons_nodex_4.InvalidStateException(correlationId, 'NO_CONNECTION', 'Couchbase connection is missing');
            }
            if (this._localConnection) {
                yield this._connection.close(correlationId);
            }
            this._opened = false;
            this._cluster = null;
            this._bucket = null;
            this._query = null;
        });
    }
    /**
     * Clears component state.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    clear(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Return error if collection is not set
            if (this._bucketName == null) {
                throw new Error('Bucket name is not defined');
            }
            yield new Promise((resolve, reject) => {
                this._bucket.manager().flush((err) => {
                    if (err != null) {
                        err = new pip_services3_commons_nodex_3.ConnectionException(correlationId, "FLUSH_FAILED", "Couchbase bucket flush failed").withCause(err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    }
    /**
     * Creates a filters that includes a collection name in it.
     * @param filter a user-defined filter
     * @returns a filter that includes a collection name.
     */
    createBucketFilter(filter) {
        let collectionFilter = "_c='" + this._collectionName + "'";
        if (filter != null) {
            return collectionFilter + " AND " + filter;
        }
        return collectionFilter;
    }
    /**
     * Gets a page of data items retrieved by a given filter and sorted according to sort parameters.
     *
     * This method shall be called by a public getPageByFilter method from child class that
     * receives FilterParams and converts them into a filter function.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param filter            (optional) a filter query string after WHERE clause
     * @param paging            (optional) paging parameters
     * @param sort              (optional) sorting string after ORDER BY clause
     * @param select            (optional) projection string after SELECT clause
     * @returns                 the requested data page.
     */
    getPageByFilter(correlationId, filter, paging, sort, select) {
        return __awaiter(this, void 0, void 0, function* () {
            select = select != null ? select : "*";
            let statement = "SELECT " + select + " FROM " + this.quoteIdentifier(this._bucketName);
            // Adjust max item count based on configuration
            paging = paging || new pip_services3_commons_nodex_6.PagingParams();
            let skip = paging.getSkip(-1);
            let take = paging.getTake(this._maxPageSize);
            let pagingEnabled = paging.total;
            filter = this.createBucketFilter(filter);
            statement += " WHERE " + filter;
            if (sort != null) {
                statement += " ORDER BY " + sort;
            }
            if (skip >= 0) {
                statement += " OFFSET " + skip;
            }
            statement += " LIMIT " + take;
            let query = this._query.fromString(statement);
            // Todo: Make it configurable?
            query.consistency(this._query.Consistency.STATEMENT_PLUS);
            let items = yield new Promise((resolve, reject) => {
                this._bucket.query(query, [], (err, items) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(items);
                });
            });
            this._logger.trace(correlationId, "Retrieved %d from %s", items.length, this._bucketName);
            items = items.map(item => select == "*" ? item[this._bucketName] : item);
            items = items.map(this.convertToPublic);
            items = items.filter(item => item != null);
            if (pagingEnabled) {
                statement = "SELECT COUNT(*) FROM " + this.quoteIdentifier(this._bucketName)
                    + " WHERE " + filter;
                query = this._query.fromString(statement);
                let count = yield new Promise((resolve, reject) => {
                    this._bucket.query(query, [], (err, counts) => {
                        if (err != null) {
                            reject(err);
                            return;
                        }
                        let count = counts ? counts[0]['$1'] : 0;
                        resolve(count);
                    });
                });
                return new pip_services3_commons_nodex_7.DataPage(items, count);
            }
            else {
                return new pip_services3_commons_nodex_7.DataPage(items);
            }
        });
    }
    /**
     * Gets a number of data items retrieved by a given filter.
     *
     * This method shall be called by a public getCountByFilter method from child class that
     * receives FilterParams and converts them into a filter function.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param filter            (optional) a filter query string after WHERE clause
     * @returns                  a number of data items that satisfy the filter.
     */
    getCountByFilter(correlationId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            filter = this.createBucketFilter(filter);
            let statement = "SELECT COUNT(*) FROM " + this.quoteIdentifier(this._bucketName)
                + " WHERE " + filter;
            let query = this._query.fromString(statement);
            let count = yield new Promise((resolve, reject) => {
                this._bucket.query(query, [], (err, counts) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let count = counts ? counts[0]['$1'] : 0;
                    resolve(count);
                });
            });
            this._logger.trace(correlationId, "Counted %d items in %s", count, this._bucketName);
            return count;
        });
    }
    /**
     * Gets a list of data items retrieved by a given filter and sorted according to sort parameters.
     *
     * This method shall be called by a public getListByFilter method from child class that
     * receives FilterParams and converts them into a filter function.
     *
     * @param correlationId    (optional) transaction id to trace execution through call chain.
     * @param filter           (optional) a filter JSON object
     * @param paging           (optional) paging parameters
     * @param sort             (optional) sorting JSON object
     * @param select           (optional) projection JSON object
     * @param callback         callback function that receives a data list or error.
     */
    getListByFilter(correlationId, filter, sort, select) {
        return __awaiter(this, void 0, void 0, function* () {
            select = select != null ? select : "*";
            let statement = "SELECT " + select + " FROM " + this.quoteIdentifier(this._bucketName);
            // Adjust max item count based on configuration
            filter = this.createBucketFilter(filter);
            statement += " WHERE " + filter;
            if (sort != null) {
                statement += " ORDER BY " + sort;
            }
            let query = this._query.fromString(statement);
            // Todo: Make it configurable?
            query.consistency(this._query.Consistency.REQUEST_PLUS);
            let items = yield new Promise((resolve, reject) => {
                this._bucket.query(query, [], (err, items) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(items);
                });
            });
            this._logger.trace(correlationId, "Retrieved %d from %s", items.length, this._bucketName);
            items = items.map(item => select == "*" ? item[this._bucketName] : item);
            items = items.map(this.convertToPublic);
            items = items.filter(item => item != null);
            return items;
        });
    }
    /**
    * Gets a random item from items that match to a given filter.
    *
    * This method shall be called by a public getOneRandom method from child class that
    * receives FilterParams and converts them into a filter function.
    *
    * @param correlationId     (optional) transaction id to trace execution through call chain.
    * @param filter            (optional) a filter JSON object
    * @returns                 a random item that satisfies the filter.
    */
    getOneRandom(correlationId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let statement = "SELECT COUNT(*) FROM " + this.quoteIdentifier(this._bucketName);
            // Adjust max item count based on configuration
            filter = this.createBucketFilter(filter);
            statement += " WHERE " + filter;
            let query = this._query.fromString(statement);
            // Todo: Make it configurable?
            query.consistency(this._query.Consistency.REQUEST_PLUS);
            let count = yield new Promise((resolve, reject) => {
                this._bucket.query(query, [], (err, counts) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    let count = counts != null ? counts[0] : 0;
                    resolve(count);
                });
            });
            statement = "SELECT * FROM " + this.quoteIdentifier(this._bucketName)
                + " WHERE " + filter;
            let skip = Math.trunc(Math.random() * count);
            statement += " OFFSET " + skip + " LIMIT 1";
            query = this._query.fromString(statement);
            let items = yield new Promise((resolve, reject) => {
                this._bucket.query(query, [], (err, items) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(items);
                });
            });
            if (items != null && items.length > 0)
                this._logger.trace(correlationId, "Retrieved random item from %s", this._bucketName);
            items = items.map(this.convertToPublic);
            return items[0];
        });
    }
    /**
    * Generates unique id for specific collection in the bucket
    * @param value a public unique id.
    * @returns a unique bucket id.
    */
    generateBucketId(value) {
        if (value == null)
            return null;
        return this._collectionName + value.toString();
    }
    /**
     * Creates a data item.
     *
     * @param correlation_id    (optional) transaction id to trace execution through call chain.
     * @param item              an item to be created.
     * @returns                 the created item.
     */
    create(correlationId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (item == null) {
                return null;
            }
            // Assign unique id
            let newItem = Object.assign({}, item);
            let id = newItem.id || pip_services3_commons_nodex_1.IdGenerator.nextLong();
            let objectId = this.generateBucketId(id);
            newItem = this.convertFromPublic(newItem);
            yield new Promise((resolve, reject) => {
                this._bucket.insert(objectId, newItem, (err, result) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
            this._logger.trace(correlationId, "Created in %s with id = %s", this._bucketName, id);
            newItem = this.convertToPublic(newItem);
            return newItem;
        });
    }
    /**
    * Deletes data items that match to a given filter.
    *
    * This method shall be called by a public deleteByFilter method from child class that
    * receives FilterParams and converts them into a filter function.
    *
    * @param correlationId     (optional) transaction id to trace execution through call chain.
    * @param filter            (optional) a filter JSON object.
    */
    deleteByFilter(correlationId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let statement = "DELETE FROM " + this.quoteIdentifier(this._bucketName);
            // Adjust max item count based on configuration
            filter = this.createBucketFilter(filter);
            statement += " WHERE " + filter;
            let query = this._query.fromString(statement);
            let count = yield new Promise((resolve, reject) => {
                this._bucket.query(query, [], (err, counts) => {
                    if (err != null) {
                        reject(err);
                    }
                    let count = counts != null ? counts[0] : 0;
                    resolve(count);
                });
            });
            this._logger.trace(correlationId, "Deleted %d items from %s", count, this._bucketName);
        });
    }
}
exports.CouchbasePersistence = CouchbasePersistence;
CouchbasePersistence._defaultConfig = pip_services3_commons_nodex_2.ConfigParams.fromTuples("bucket", null, "dependencies.connection", "*:connection:couchbase:*:1.0", 
// connections.*
// credential.*
"options.auto_create", false, "options.auto_index", true, "options.flush_enabled", true, "options.bucket_type", "couchbase", "options.ram_quota", 100);
//# sourceMappingURL=CouchbasePersistence.js.map