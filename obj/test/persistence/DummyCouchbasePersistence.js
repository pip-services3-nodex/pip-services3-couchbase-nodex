"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyCouchbasePersistence = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const IdentifiableCouchbasePersistence_1 = require("../../src/persistence/IdentifiableCouchbasePersistence");
class DummyCouchbasePersistence extends IdentifiableCouchbasePersistence_1.IdentifiableCouchbasePersistence {
    constructor() {
        super('test', 'dummies');
    }
    getPageByFilter(correlationId, filter, paging) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let key = filter.getAsNullableString('key');
        let filterCondition = null;
        if (key != null) {
            filterCondition = "key='" + key + "'";
        }
        return super.getPageByFilter(correlationId, filterCondition, paging, null, null);
    }
    getCountByFilter(correlationId, filter) {
        filter = filter || new pip_services3_commons_nodex_1.FilterParams();
        let key = filter.getAsNullableString('key');
        let filterCondition = null;
        if (key != null) {
            filterCondition = "key='" + key + "'";
        }
        return super.getCountByFilter(correlationId, filterCondition);
    }
}
exports.DummyCouchbasePersistence = DummyCouchbasePersistence;
//# sourceMappingURL=DummyCouchbasePersistence.js.map