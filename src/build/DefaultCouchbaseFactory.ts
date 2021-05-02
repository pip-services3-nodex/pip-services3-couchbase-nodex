/** @module build */
import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { CouchbaseConnection } from '../connect/CouchbaseConnection';

/**
 * Creates Couchbase components by their descriptors.
 * 
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[CouchbaseConnection]]
 */
export class DefaultCouchbaseFactory extends Factory {
    private static readonly CouchbaseConnectionDescriptor: Descriptor = new Descriptor("pip-services", "connection", "couchbase", "*", "1.0");

    /**
	 * Create a new instance of the factory.
	 */
    public constructor() {
        super();
        this.registerAsType(DefaultCouchbaseFactory.CouchbaseConnectionDescriptor, CouchbaseConnection);
    }
}
