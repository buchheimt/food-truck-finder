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
exports.__esModule = true;
var axios_1 = require("axios");
var console_table_printer_1 = require("console-table-printer");
var readline_sync_1 = require("readline-sync");
var capitalize_1 = require("capitalize");
require("dotenv").config();
var PAGE_SIZE = 10;
var TARGET_TIME_ZONE = "America/Los_Angeles";
var FoodTruckFinder = /** @class */ (function () {
    function FoodTruckFinder() {
    }
    FoodTruckFinder.prototype.getCurrentDatetimeData = function () {
        // Convert current UTC time to PST
        var currentPSTDate = new Date(new Date().toLocaleString("en-US", {
            timeZone: TARGET_TIME_ZONE
        }));
        var currentHour = currentPSTDate.getHours();
        return {
            currentHour: "" + (currentHour < 10 ? "0" : "") + currentHour + ":00",
            dayorder: currentPSTDate.getDay()
        };
    };
    FoodTruckFinder.prototype.fetchFoodTrucks = function (pageNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, dayorder, currentHour, res, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.getCurrentDatetimeData(), dayorder = _a.dayorder, currentHour = _a.currentHour;
                        res = {};
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"]({
                                url: process.env.SOCRATA_BASE_URL,
                                method: "GET",
                                params: {
                                    $$app_token: process.env.SOCRATA_API_KEY,
                                    $limit: PAGE_SIZE,
                                    $offset: PAGE_SIZE * pageNumber,
                                    $order: "applicant",
                                    // Turns out 24 hour time with leading zeros compares properly alphanumerically
                                    $where: "start24<='" + currentHour + "' and end24>'" + currentHour + "'",
                                    // This should be zero-indexed like the js Date API
                                    dayorder: dayorder
                                }
                            })];
                    case 2:
                        res = _c.sent();
                        if (!res.data) {
                            throw new Error();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _b = _c.sent();
                        console.log("Unable to fetch results from Socrata API");
                        process.exit();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, res.data];
                }
            });
        });
    };
    FoodTruckFinder.prototype.fetchPage = function (pageNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var foodTrucks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchFoodTrucks(pageNumber)];
                    case 1:
                        foodTrucks = _a.sent();
                        return [2 /*return*/, foodTrucks.map(function (_a) {
                                var applicant = _a.applicant, location = _a.location, start24 = _a.start24, end24 = _a.end24, dayofweekstr = _a.dayofweekstr;
                                if (process.env.NODE_ENV === "development") {
                                    return {
                                        NAME: capitalize_1.words(applicant),
                                        ADDRESS: capitalize_1.words(location),
                                        OPEN: start24,
                                        CLOSE: end24,
                                        DAY: dayofweekstr
                                    };
                                }
                                else {
                                    return {
                                        NAME: capitalize_1.words(applicant),
                                        ADDRESS: capitalize_1.words(location)
                                    };
                                }
                            })];
                }
            });
        });
    };
    FoodTruckFinder.prototype.displayTrucks = function (foodTrucks, pageNumber) {
        console_table_printer_1.printTable(foodTrucks);
        var resultStart = pageNumber * PAGE_SIZE + 1;
        var resultEnd = Math.min((pageNumber + 1) * PAGE_SIZE, pageNumber * PAGE_SIZE + foodTrucks.length);
        console.log("Viewing Page " + (pageNumber + 1) + " Results " + resultStart + "-" + resultEnd + "\n");
    };
    FoodTruckFinder.prototype.searchOpenFoodTrucks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var input, pageNumber, foodTrucks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!process.env.SOCRATA_BASE_URL || !process.env.SOCRATA_API_KEY) {
                            console.log("Invalid .env, make sure this file is configured per readme");
                            process.exit();
                        }
                        input = "";
                        pageNumber = 0;
                        _a.label = 1;
                    case 1:
                        if (!(input.toUpperCase() !== "Q")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.fetchPage(pageNumber)];
                    case 2:
                        foodTrucks = _a.sent();
                        if (foodTrucks.length === 0) {
                            console.log("No more results to display");
                            return [3 /*break*/, 3];
                        }
                        else if (foodTrucks.length < PAGE_SIZE) {
                            this.displayTrucks(foodTrucks, pageNumber);
                            console.log("This is the final page of results");
                            return [3 /*break*/, 3];
                        }
                        else {
                            this.displayTrucks(foodTrucks, pageNumber);
                            pageNumber++;
                            console.log("Press (Q) to quit");
                            console.log("Press any other key to view next page");
                            input = readline_sync_1.question(">>");
                        }
                        return [3 /*break*/, 1];
                    case 3:
                        console.log("Enjoy!");
                        return [2 /*return*/];
                }
            });
        });
    };
    return FoodTruckFinder;
}());
new FoodTruckFinder().searchOpenFoodTrucks();
