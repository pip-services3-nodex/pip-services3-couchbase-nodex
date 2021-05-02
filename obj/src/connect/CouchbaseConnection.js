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
exports.CouchbaseConnection = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const CouchbaseConnectionResolver_1 = require("../connect/CouchbaseConnectionResolver");
/**
 * Couchbase connection using plain couchbase driver.
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
 */
class CouchbaseConnection {
    /**
     * Creates a new instance of the connection component.
     *
     * @param bucketName the name of couchbase bucket
     */
    constructor(bucketName) {
        this._defaultConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples("bucket", null, 
        // connections.*
        // credential.*
        "options.auto_create", false, "options.auto_index", true, "options.flush_enabled", true, "options.bucket_type", "couchbase", "options.ram_quota", 100);
        /**
         * The logger.
         */
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        /**
         * The connection resolver.
         */
        this._connectionResolver = new CouchbaseConnectionResolver_1.CouchbaseConnectionResolver();
        /**
         * The configuration options.
         */
        this._options = new pip_services3_commons_nodex_1.ConfigParams();
        this._bucketName = bucketName;
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        config = config.setDefaults(this._defaultConfig);
        this._connectionResolver.configure(config);
        this._bucketName = config.getAsStringWithDefault('bucket', this._bucketName);
        this._options = this._options.override(config.getSection("options"));
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);
    }
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen() {
        // return this._connection.readyState == 1;
        return this._connection != null;
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield this._connectionResolver.resolve(correlationId);
            this._logger.debug(correlationId, "Connecting to couchbase");
            try {
                let couchbase = require('couchbase');
                this._connection = new couchbase.Cluster(connection.uri);
                if (connection.username) {
                    this._connection.authenticate(connection.username, connection.password);
                }
                let newBucket = false;
                let autocreate = this._options.getAsBoolean('auto_create');
                if (autocreate) {
                    let options = {
                        bucketType: this._options.getAsStringWithDefault('bucket_type', 'couchbase'),
                        ramQuotaMB: this._options.getAsLongWithDefault('ram_quota', 100),
                        flushEnabled: this._options.getAsBooleanWithDefault('flush_enabled', true) ? 1 : 0
                    };
                    yield new Promise((resolve, reject) => {
                        this._connection.manager().createBucket(this._bucketName, options, (err, result) => {
                            if (err && err.message && err.message.indexOf('name already exist') > 0) {
                                err = null;
                            }
                            if (err != null) {
                                reject(err);
                                return;
                            }
                            resolve();
                        });
                    });
                    newBucket = true;
                    // Delay to allow couchbase to initialize the bucket
                    // Otherwise opening will fail
                    yield new Promise((resolve, reject) => { setTimeout(resolve, 2000); });
                }
                this._bucket = yield new Promise((resolve, reject) => {
                    let bucket = this._connection.openBucket(this._bucketName, (err) => {
                        if (err != null) {
                            reject(err);
                            return;
                        }
                        resolve(bucket);
                    });
                });
                this._logger.debug(correlationId, "Connected to couchbase bucket %s", this._bucketName);
                let autoIndex = this._options.getAsBoolean('auto_index');
                if (newBucket || autoIndex) {
                    yield new Promise((resolve, reject) => {
                        this._bucket.manager().createPrimaryIndex({ ignoreIfExists: 1 }, (err) => {
                            if (err != null) {
                                reject(err);
                                return;
                            }
                            resolve();
                        });
                    });
                }
            }
            catch (ex) {
                this._connection = null;
                this._bucket = null;
                throw new pip_services3_commons_nodex_2.ConnectionException(correlationId, "CONNECT_FAILED", "Connection to couchbase failed").withCause(ex);
            }
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._bucket) {
                this._bucket.disconnect();
            }
            this._connection = null;
            this._bucket = null;
            this._logger.debug(correlationId, "Disconnected from couchbase bucket %s", this._bucketName);
        });
    }
    getConnection() {
        return this._connection;
    }
    getBucket() {
        return this._bucket;
    }
    getBucketName() {
        return this._bucketName;
    }
}
exports.CouchbaseConnection = CouchbaseConnection;
//# sourceMappingURL=CouchbaseConnection.js.map