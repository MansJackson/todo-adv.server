"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.writeFile = exports.getFile = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
exports.getFile = function (fileName) {
    try {
        var file = fs_1.default.readFileSync(path_1.default.join(__dirname, '../', fileName)).toString();
        try {
            return JSON.parse(file);
        }
        catch (_a) {
            return {};
        }
    }
    catch (err) {
        throw new Error("Something went wrong when trying to get " + fileName + ". Does it exist?");
    }
};
exports.writeFile = function (fileName, data) {
    try {
        fs_1.default.writeFileSync(path_1.default.join(__dirname, '../', fileName), data);
    }
    catch (err) {
        throw new Error("Something went wrong when trying to write to: " + fileName);
    }
};
exports.createUser = function (user) {
    var db = exports.getFile('db.json');
    try {
        db.users = __spreadArrays(db.users, [user]);
    }
    catch (_a) {
        db.users = [user];
    }
    exports.writeFile('db.json', JSON.stringify(db));
};
//# sourceMappingURL=util.js.map