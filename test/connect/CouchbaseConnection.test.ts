const process = require('process');
const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { CouchbaseConnection } from '../../src/connect/CouchbaseConnection';

suite('DummyCouchbaseConnection', ()=> {
    let connection: CouchbaseConnection;

    let couchbaseUri = process.env['COUCHBASE_URI'];
    let couchbaseHost = process.env['COUCHBASE_HOST'] || 'localhost';
    let couchbasePort = process.env['COUCHBASE_PORT'] || 8091;
    let couchbaseUser = process.env['COUCHBASE_USER'] || 'Administrator';
    let couchbasePass = process.env['COUCHBASE_PASS'] || 'password';

    if (couchbaseUri == null && couchbaseHost == null) {
        return;
    }

    setup(async () => {
        let dbConfig = ConfigParams.fromTuples(
            'bucket', 'test',
            'options.auto_create', true,
            'options.auto_index', true,
            'connection.uri', couchbaseUri,
            'connection.host', couchbaseHost,
            'connection.port', couchbasePort,
            'connection.operation_timeout', 2,
            // 'connection.durability_interval', 0.0001,
            // 'connection.durabilty_timeout', 4,
            'connection.detailed_errcodes', 1,
            'credential.username', couchbaseUser,
            'credential.password', couchbasePass
        );

        connection = new CouchbaseConnection();
        connection.configure(dbConfig);

        await connection.open(null);
    });

    teardown(async () => {
        await connection.close(null);
    });

    test('Connection Parameters', () => {
        assert.isNotNull(connection.getBucket());
        assert.equal("test", connection.getBucketName());
        assert.isNotNull(connection.getConnection());
    });

});