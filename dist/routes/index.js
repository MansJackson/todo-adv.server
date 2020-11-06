"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
router.get('/', function (req, res) {
    res.json({ msg: 'hello world' });
});
router.post('/register', function (req, res) {
});
router.post('/login', function (req, res) {
});
exports.default = router;
//# sourceMappingURL=index.js.map