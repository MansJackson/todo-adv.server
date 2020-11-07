"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var uuid_1 = require("uuid");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var dotenv_1 = __importDefault(require("dotenv"));
var util_1 = require("../util");
dotenv_1.default.config();
var router = express_1.default.Router();
router.post('/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, hashedPW;
    return __generator(this, function (_b) {
        console.log('body', req.body);
        _a = req.body, email = _a.email, password = _a.password;
        if (!util_1.isValidEmail(email)) {
            res.status(400).json({ message: 'invalid Email' });
        }
        else if (util_1.emailExists(email)) {
            res.status(409).json({ message: 'resource already exists' });
        }
        else {
            try {
                hashedPW = bcrypt_1.default.hashSync(password, process.env.saltRounds);
                util_1.createUser(__assign(__assign({}, req.body), { id: uuid_1.v4(), password: hashedPW }));
                res.status(201).json({ message: 'User created' });
            }
            catch (err) {
                res.status(500).json({ message: 'Something went wrong when trying create user' });
            }
        }
        return [2 /*return*/];
    });
}); });
router.post('/login', function (req, res) {
    var _a = req.body, email = _a.email, password = _a.password;
    console.log(email, password);
    var user = util_1.getUserByEmail(email);
    if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
    else {
        var valiLogin = bcrypt_1.default.compareSync(password, user.password);
        if (!valiLogin) {
            res.status(401).json({ message: 'Invalid credentials' });
        }
        res.cookie('juid', jsonwebtoken_1.default.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET), { expires: new Date(Date.now() + 900000), httpOnly: true });
        res.status(200).json({ message: 'User signed in succesfully' });
    }
});
router.post('/email_exists', function (req, res) {
    var email = req.body.email;
    if (!util_1.isValidEmail(email)) {
        res.status(400).json({ message: 'invalid Email' });
    }
    else if (util_1.emailExists(email)) {
        res.status(409).json({ message: 'resource already exists' });
    }
    else {
        res.status(200).json({ message: 'Email is available' });
    }
});
exports.default = router;
//# sourceMappingURL=index.js.map