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
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const DummyPersistenceFixture_1 = require("../fixtures/DummyPersistenceFixture");
const DummyCouchbasePersistence_1 = require("./DummyCouchbasePersistence");
const CouchbaseConnection_1 = require("../../src/connect/CouchbaseConnection");
suite('DummyCouchbaseConnection', () => {
    let connection;
    let persistence;
    let fixture;
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
        persistence = new DummyCouchbasePersistence_1.DummyCouchbasePersistence();
        persistence.setReferences(pip_services3_commons_nodex_2.References.fromTuples(new pip_services3_commons_nodex_3.Descriptor("pip-services", "connection", "couchbase", "default", "1.0"), connection));
        fixture = new DummyPersistenceFixture_1.DummyPersistenceFixture(persistence);
        yield connection.open(null);
        yield persistence.open(null);
        yield persistence.clear(null);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield persistence.close(null);
        yield connection.close(null);
    }));
    test('Crud Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testCrudOperations();
    }));
    test('Batch Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testBatchOperations();
    }));
    test('Paging', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testPaging();
    }));
});
//# sourceMappingURL=DummyCouchbaseConnection.test.js.map