"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCouchbaseFactory = void 0;
/** @module build */
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const CouchbaseConnection_1 = require("../connect/CouchbaseConnection");
/**
 * Creates Couchbase components by their descriptors.
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[CouchbaseConnection]]
 */
class DefaultCouchbaseFactory extends pip_services3_components_nodex_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.registerAsType(DefaultCouchbaseFactory.CouchbaseConnectionDescriptor, CouchbaseConnection_1.CouchbaseConnection);
    }
}
exports.DefaultCouchbaseFactory = DefaultCouchbaseFactory;
DefaultCouchbaseFactory.CouchbaseConnectionDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "connection", "couchbase", "*", "1.0");
//# sourceMappingURL=DefaultCouchbaseFactory.js.map