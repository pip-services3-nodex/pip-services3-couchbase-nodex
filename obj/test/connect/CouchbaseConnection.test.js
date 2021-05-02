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
const process = require('process');
const assert = require('chai').assert;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const CouchbaseConnection_1 = require("../../src/connect/CouchbaseConnection");
suite('DummyCouchbaseConnection', () => {
    let connection;
    let couchbaseUri = process.env['COUCHBASE_URI'];
    let couchbaseHost = process.env['COUCHBASE_HOST'] || 'localhost';
    let couchbasePort = process.env['COUCHBASE_PORT'] || 8091;
    let couchbaseUser = process.env['COUCHBASE_USER'] || 'Administrator';
    let couchbasePass = process.env['COUCHBASE_PASS'] || 'password';
    if (couchbaseUri == null && couchbaseHost == null) {
        return;
    }
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        let dbConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples('bucket', 'test', 'options.auto_create', true, 'options.auto_index', true, 'connection.uri', couchbaseUri, 'connection.host', couchbaseHost, 'connection.port', couchbasePort, 'connection.operation_timeout', 2, 
        // 'connection.durability_interval', 0.0001,
        // 'connection.durabilty_timeout', 4,
        'connection.detailed_errcodes', 1, 'credential.username', couchbaseUser, 'credential.password', couchbasePass);
        connection = new CouchbaseConnection_1.CouchbaseConnection();
        connection.configure(dbConfig);
        yield connection.open(null);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.close(null);
    }));
    test('Connection Parameters', () => {
        assert.isNotNull(connection.getBucket());
        assert.equal("test", connection.getBucketName());
        assert.isNotNull(connection.getConnection());
    });
});
//# sourceMappingURL=CouchbaseConnection.test.js.map