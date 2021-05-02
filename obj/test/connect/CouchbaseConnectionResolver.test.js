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
const assert = require('chai').assert;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const CouchbaseConnectionResolver_1 = require("../../src/connect/CouchbaseConnectionResolver");
suite('CouchbaseConnectionResolver', () => {
    test('Single Connection', () => __awaiter(void 0, void 0, void 0, function* () {
        let config = pip_services3_commons_nodex_1.ConfigParams.fromTuples("connection.host", "localhost", "connection.port", "8091", "connection.database", "test");
        let resolver = new CouchbaseConnectionResolver_1.CouchbaseConnectionResolver();
        resolver.configure(config);
        let connection = yield resolver.resolve(null);
        assert.isNotNull(connection);
        assert.equal("couchbase://localhost:8091/test", connection.uri);
        assert.isUndefined(connection.username);
        assert.isUndefined(connection.password);
    }));
    test('Multiple Connections', () => __awaiter(void 0, void 0, void 0, function* () {
        let config = pip_services3_commons_nodex_1.ConfigParams.fromTuples("connections.1.host", "host1", "connections.1.port", "8091", "connections.1.database", "test", "connections.2.host", "host2", "connections.2.port", "8091", "connections.2.database", "test");
        let resolver = new CouchbaseConnectionResolver_1.CouchbaseConnectionResolver();
        resolver.configure(config);
        let connection = yield resolver.resolve(null);
        assert.isNotNull(connection);
        assert.equal("couchbase://host1:8091,host2:8091/test", connection.uri);
        assert.isUndefined(connection.username);
        assert.isUndefined(connection.password);
    }));
    test('Connection with Credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        let config = pip_services3_commons_nodex_1.ConfigParams.fromTuples("connection.host", "localhost", "connection.port", "8091", "connection.database", "test", "credential.username", "admin", "credential.password", "password123");
        let resolver = new CouchbaseConnectionResolver_1.CouchbaseConnectionResolver();
        resolver.configure(config);
        let connection = yield resolver.resolve(null);
        assert.isNotNull(connection);
        assert.equal("couchbase://localhost:8091/test", connection.uri);
        assert.equal("admin", connection.username);
        assert.equal("password123", connection.password);
    }));
});
//# sourceMappingURL=CouchbaseConnectionResolver.test.js.map