/*!
 * @license :jsstore - V4.3.5 - 08/07/2021
 * https://github.com/ujjwalguptaofficial/JsStore
 * Copyright (c) 2021 @Ujjwal Gupta; Licensed MIT
 */
var JsStore =
/******/
function (modules) {
  // webpackBootstrap

  /******/
  // The module cache

  /******/
  var installedModules = {};
  /******/

  /******/
  // The require function

  /******/

  function __webpack_require__(moduleId) {
    /******/

    /******/
    // Check if module is in cache

    /******/
    if (installedModules[moduleId]) {
      /******/
      return installedModules[moduleId].exports;
      /******/
    }
    /******/
    // Create a new module (and put it into the cache)

    /******/


    var module = installedModules[moduleId] = {
      /******/
      i: moduleId,

      /******/
      l: false,

      /******/
      exports: {}
      /******/

    };
    /******/

    /******/
    // Execute the module function

    /******/

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/

    /******/
    // Flag the module as loaded

    /******/

    module.l = true;
    /******/

    /******/
    // Return the exports of the module

    /******/

    return module.exports;
    /******/
  }
  /******/

  /******/

  /******/
  // expose the modules object (__webpack_modules__)

  /******/


  __webpack_require__.m = modules;
  /******/

  /******/
  // expose the module cache

  /******/

  __webpack_require__.c = installedModules;
  /******/

  /******/
  // define getter function for harmony exports

  /******/

  __webpack_require__.d = function (exports, name, getter) {
    /******/
    if (!__webpack_require__.o(exports, name)) {
      /******/
      Object.defineProperty(exports, name, {
        enumerable: true,
        get: getter
      });
      /******/
    }
    /******/

  };
  /******/

  /******/
  // define __esModule on exports

  /******/


  __webpack_require__.r = function (exports) {
    /******/
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      /******/
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: 'Module'
      });
      /******/
    }
    /******/


    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    /******/
  };
  /******/

  /******/
  // create a fake namespace object

  /******/
  // mode & 1: value is a module id, require it

  /******/
  // mode & 2: merge all properties of value into the ns

  /******/
  // mode & 4: return value when already ns object

  /******/
  // mode & 8|1: behave like require

  /******/


  __webpack_require__.t = function (value, mode) {
    /******/
    if (mode & 1) value = __webpack_require__(value);
    /******/

    if (mode & 8) return value;
    /******/

    if (mode & 4 && typeof value === 'object' && value && value.__esModule) return value;
    /******/

    var ns = Object.create(null);
    /******/

    __webpack_require__.r(ns);
    /******/


    Object.defineProperty(ns, 'default', {
      enumerable: true,
      value: value
    });
    /******/

    if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) {
      return value[key];
    }.bind(null, key));
    /******/

    return ns;
    /******/
  };
  /******/

  /******/
  // getDefaultExport function for compatibility with non-harmony modules

  /******/


  __webpack_require__.n = function (module) {
    /******/
    var getter = module && module.__esModule ?
    /******/
    function () {
      return module['default'];
    } :
    /******/
    function () {
      return module;
    };
    /******/

    __webpack_require__.d(getter, 'a', getter);
    /******/


    return getter;
    /******/
  };
  /******/

  /******/
  // Object.prototype.hasOwnProperty.call

  /******/


  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/

  /******/
  // __webpack_public_path__

  /******/


  __webpack_require__.p = "";
  /******/

  /******/

  /******/
  // Load entry module and return exports

  /******/

  return __webpack_require__(__webpack_require__.s = 2);
  /******/
}(
/************************************************************************/

/******/
{
  /***/
  2:
  /***/
  function (module, __webpack_exports__, __webpack_require__) {
    "use strict"; // ESM COMPAT FLAG

    __webpack_require__.r(__webpack_exports__); // EXPORTS


    __webpack_require__.d(__webpack_exports__, "Connection", function () {
      return (
        /* reexport */
        connection_Connection
      );
    });

    __webpack_require__.d(__webpack_exports__, "ERROR_TYPE", function () {
      return (
        /* reexport */
        ERROR_TYPE
      );
    });

    __webpack_require__.d(__webpack_exports__, "WORKER_STATUS", function () {
      return (
        /* reexport */
        WORKER_STATUS
      );
    });

    __webpack_require__.d(__webpack_exports__, "DATA_TYPE", function () {
      return (
        /* reexport */
        DATA_TYPE
      );
    });

    __webpack_require__.d(__webpack_exports__, "API", function () {
      return (
        /* reexport */
        API
      );
    });

    __webpack_require__.d(__webpack_exports__, "EVENT", function () {
      return (
        /* reexport */
        EVENT
      );
    });

    __webpack_require__.d(__webpack_exports__, "QUERY_OPTION", function () {
      return (
        /* reexport */
        QUERY_OPTION
      );
    });

    __webpack_require__.d(__webpack_exports__, "IDB_MODE", function () {
      return (
        /* reexport */
        IDB_MODE
      );
    });

    __webpack_require__.d(__webpack_exports__, "OCCURENCE", function () {
      return (
        /* reexport */
        OCCURENCE
      );
    });

    __webpack_require__.d(__webpack_exports__, "CONNECTION_STATUS", function () {
      return (
        /* reexport */
        CONNECTION_STATUS
      );
    });

    __webpack_require__.d(__webpack_exports__, "promise", function () {
      return (
        /* reexport */
        promise
      );
    });

    __webpack_require__.d(__webpack_exports__, "promiseAll", function () {
      return (
        /* reexport */
        promiseAll
      );
    });

    __webpack_require__.d(__webpack_exports__, "promiseResolve", function () {
      return (
        /* reexport */
        promiseResolve
      );
    });

    __webpack_require__.d(__webpack_exports__, "forObj", function () {
      return (
        /* reexport */
        forObj
      );
    }); // CONCATENATED MODULE: ./src/main/log_helper.ts


    var LogHelper =
    /** @class */
    function () {
      function LogHelper(type, info) {
        this.type = type;
        this._info = info;
        this.message = this.getMsg();
      }

      LogHelper.prototype.throw = function () {
        throw this;
      };

      LogHelper.prototype.log = function (msg) {
        if (this.status) {
          console.log(msg);
        }
      };

      LogHelper.prototype.logError = function () {
        console.error(this.get());
      };

      LogHelper.prototype.logWarning = function () {
        console.warn(this.get());
      };

      LogHelper.prototype.get = function () {
        return {
          message: this.message,
          type: this.type
        };
      };

      LogHelper.prototype.getMsg = function () {
        var errMsg;

        switch (this.type) {
          default:
            errMsg = this.message;
            break;
        }

        return errMsg;
      };

      return LogHelper;
    }(); // CONCATENATED MODULE: ./src/common/enums.ts


    var ERROR_TYPE;

    (function (ERROR_TYPE) {
      ERROR_TYPE["InvalidUpdateColumn"] = "invalid_update_column";
      ERROR_TYPE["UndefinedColumn"] = "undefined_column";
      ERROR_TYPE["UndefinedValue"] = "undefined_value";
      ERROR_TYPE["UndefinedColumnName"] = "undefined_column_name";
      ERROR_TYPE["UndefinedDbName"] = "undefined_database_name";
      ERROR_TYPE["UndefinedColumnValue"] = "undefined_column_value";
      ERROR_TYPE["NotArray"] = "not_array";
      ERROR_TYPE["NoValueSupplied"] = "no_value_supplied";
      ERROR_TYPE["ColumnNotExist"] = "column_not_exist";
      ERROR_TYPE["EnableSearchOff"] = "enable_search_off";
      ERROR_TYPE["InvalidOp"] = "invalid_operator";
      ERROR_TYPE["NullValue"] = "null_value";
      ERROR_TYPE["WrongDataType"] = "wrong_data_type";
      ERROR_TYPE["TableNotExist"] = "table_not_exist";
      ERROR_TYPE["DbNotExist"] = "db_not_exist";
      ERROR_TYPE["ConnectionAborted"] = "connection_aborted";
      ERROR_TYPE["ConnectionClosed"] = "connection_closed";
      ERROR_TYPE["NotObject"] = "not_object";
      ERROR_TYPE["InvalidConfig"] = "invalid_config";
      ERROR_TYPE["DbBlocked"] = "Db_blocked";
      ERROR_TYPE["IndexedDbNotSupported"] = "indexeddb_not_supported";
      ERROR_TYPE["NullValueInWhere"] = "null_value_in_where";
      ERROR_TYPE["InvalidJoinQuery"] = "invalid_join_query";
      ERROR_TYPE["InvalidOrderQuery"] = "invalid_order_query";
      ERROR_TYPE["InvalidQuery"] = "invalid_query";
      ERROR_TYPE["InvalidGroupQuery"] = "invalid_group_query";
      ERROR_TYPE["ImportScriptsFailed"] = "import_scripts_failed";
      ERROR_TYPE["MethodNotExist"] = "method_not_exist";
      ERROR_TYPE["Unknown"] = "unknown";
      ERROR_TYPE["InvalidMiddleware"] = "invalid_middleware";
    })(ERROR_TYPE || (ERROR_TYPE = {}));

    var WORKER_STATUS;

    (function (WORKER_STATUS) {
      WORKER_STATUS["Registered"] = "registerd";
      WORKER_STATUS["Failed"] = "failed";
      WORKER_STATUS["NotStarted"] = "not_started";
    })(WORKER_STATUS || (WORKER_STATUS = {}));

    var DATA_TYPE;

    (function (DATA_TYPE) {
      DATA_TYPE["String"] = "string";
      DATA_TYPE["Object"] = "object";
      DATA_TYPE["Array"] = "array";
      DATA_TYPE["Number"] = "number";
      DATA_TYPE["Boolean"] = "boolean";
      DATA_TYPE["Null"] = "null";
      DATA_TYPE["DateTime"] = "date_time";
    })(DATA_TYPE || (DATA_TYPE = {}));

    var API;

    (function (API) {
      API["InitDb"] = "init_db";
      API["Get"] = "get";
      API["Set"] = "set";
      API["Select"] = "select";
      API["Insert"] = "insert";
      API["Update"] = "update";
      API["Remove"] = "remove";
      API["OpenDb"] = "open_db";
      API["Clear"] = "clear";
      API["DropDb"] = "drop_db";
      API["Count"] = "count";
      API["ChangeLogStatus"] = "change_log_status";
      API["Terminate"] = "terminate";
      API["Transaction"] = "transaction";
      API["CloseDb"] = "close_db";
      API["Union"] = "union";
      API["Intersect"] = "intersect";
      API["ImportScripts"] = "import_scripts";
      API["Middleware"] = "middleware";
    })(API || (API = {}));

    var EVENT;

    (function (EVENT) {
      EVENT["RequestQueueEmpty"] = "requestQueueEmpty";
      EVENT["RequestQueueFilled"] = "requestQueueFilled";
      EVENT["Upgrade"] = "upgrade";
      EVENT["Create"] = "create";
      EVENT["Open"] = "open";
    })(EVENT || (EVENT = {}));

    var QUERY_OPTION;

    (function (QUERY_OPTION) {
      QUERY_OPTION["Where"] = "where";
      QUERY_OPTION["Like"] = "like";
      QUERY_OPTION["Regex"] = "regex";
      QUERY_OPTION["In"] = "in";
      QUERY_OPTION["Equal"] = "=";
      QUERY_OPTION["Between"] = "-";
      QUERY_OPTION["GreaterThan"] = ">";
      QUERY_OPTION["LessThan"] = "<";
      QUERY_OPTION["GreaterThanEqualTo"] = ">=";
      QUERY_OPTION["LessThanEqualTo"] = "<=";
      QUERY_OPTION["NotEqualTo"] = "!=";
      QUERY_OPTION["Aggregate"] = "aggregate";
      QUERY_OPTION["Max"] = "max";
      QUERY_OPTION["Min"] = "min";
      QUERY_OPTION["Avg"] = "avg";
      QUERY_OPTION["Count"] = "count";
      QUERY_OPTION["Sum"] = "sum";
      QUERY_OPTION["Or"] = "or";
      QUERY_OPTION["Skip"] = "skip";
      QUERY_OPTION["Limit"] = "limit";
      QUERY_OPTION["And"] = "and";
      QUERY_OPTION["IgnoreCase"] = "ignoreCase";
      QUERY_OPTION["Then"] = "then";
    })(QUERY_OPTION || (QUERY_OPTION = {}));

    var IDB_MODE;

    (function (IDB_MODE) {
      IDB_MODE["ReadOnly"] = "readonly";
      IDB_MODE["ReadWrite"] = "readwrite";
    })(IDB_MODE || (IDB_MODE = {}));

    var OCCURENCE;

    (function (OCCURENCE) {
      OCCURENCE["First"] = "f";
      OCCURENCE["Last"] = "l";
      OCCURENCE["Any"] = "a";
    })(OCCURENCE || (OCCURENCE = {}));

    var CONNECTION_STATUS;

    (function (CONNECTION_STATUS) {
      CONNECTION_STATUS["Connected"] = "connected";
      CONNECTION_STATUS["Closed"] = "closed";
      CONNECTION_STATUS["NotStarted"] = "not_started";
      CONNECTION_STATUS["UnableToStart"] = "unable_to_start";
      CONNECTION_STATUS["ClosedByJsStore"] = "closed_by_jsstore";
    })(CONNECTION_STATUS || (CONNECTION_STATUS = {})); // CONCATENATED MODULE: ./src/common/utils/promise.ts


    var promise = function (cb) {
      return new Promise(cb);
    }; // CONCATENATED MODULE: ./src/common/utils/promise_resolve.ts


    var promiseResolve = function (value) {
      return Promise.resolve(value);
    }; // CONCATENATED MODULE: ./src/main/event_bus.ts


    var __spreadArray = undefined && undefined.__spreadArray || function (to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) to[j] = from[i];

      return to;
    };

    var EventBus =
    /** @class */
    function () {
      function EventBus(ctx) {
        this._events = {};
        this._ctx = ctx;
      }

      EventBus.prototype.on = function (event, cb) {
        if (this._events[event] == null) {
          this._events[event] = [];
        }

        this._events[event].push(cb);

        return this;
      };

      EventBus.prototype.off = function (event, cb) {
        if (this._events[event]) {
          if (cb) {
            var index = this._events[event].indexOf(cb);

            this._events[event].splice(index, 1);
          } else {
            this._events[event] = [];
          }
        }
      };

      EventBus.prototype.emit = function (event) {
        var _this = this;

        var args = [];

        for (var _i = 1; _i < arguments.length; _i++) {
          args[_i - 1] = arguments[_i];
        }

        var events = this._events[event] || [];
        var index = 0;
        var length = events.length;
        var results = [];

        var callMethod = function () {
          var eventCb = events[index++];

          if (eventCb) {
            var result = eventCb.call.apply(eventCb, __spreadArray([_this._ctx], args));
            return result && result.then ? result : Promise.resolve(result);
          }
        };

        return new Promise(function (res) {
          var checkAndCall = function () {
            if (index < length) {
              callMethod().then(function (result) {
                results.push(result);
                checkAndCall();
              });
            } else {
              res(results);
            }
          };

          checkAndCall();
        });
      };

      EventBus.prototype.destroy = function () {
        this._events = null;
        this._ctx = null;
      };

      return EventBus;
    }(); // CONCATENATED MODULE: ./src/main/connection_helper.ts


    var connection_helper_ConnectionHelper =
    /** @class */
    function () {
      function ConnectionHelper(worker) {
        this.isConOpened_ = false;
        this.isDbIdle_ = true;
        this.requestQueue_ = [];
        this.isCodeExecuting_ = false;
        this.inactivityTimer_ = -1000;
        this.middlewares = [];
        this.eventBus_ = new EventBus(this); // these apis have special permissions. These apis dont wait for database open.

        this.whiteListApi_ = [API.InitDb, API.OpenDb, API.Get, API.Set, API.ChangeLogStatus, API.Terminate, API.DropDb];
        this.isRuningInWorker = true;
        this.logger = new LogHelper(null);

        if (worker) {
          this.worker_ = worker;
          this.worker_.onmessage = this.onMessageFromWorker_.bind(this);
        } else {
          this.isRuningInWorker = false;
          this.initQueryManager_();
        }
      }

      Object.defineProperty(ConnectionHelper.prototype, "jsstoreWorker", {
        get: function () {
          return this.$worker || self['JsStoreWorker'];
        },
        enumerable: false,
        configurable: true
      });

      ConnectionHelper.prototype.initQueryManager_ = function () {
        var workerRef = this.jsstoreWorker;

        if (workerRef) {
          this.queryManager = new workerRef.QueryManager(this.processFinishedQuery_.bind(this));
        }
      };

      ConnectionHelper.prototype.onMessageFromWorker_ = function (msg) {
        this.processFinishedQuery_(msg.data);
      };

      ConnectionHelper.prototype.processFinishedQuery_ = function (message) {
        var finishedRequest = this.requestQueue_.shift();

        if (finishedRequest) {
          this.logger.log("request " + finishedRequest.name + " finished");

          if (message.error) {
            finishedRequest.onError(message.error);
          } else {
            switch (finishedRequest.name) {
              case API.OpenDb:
              case API.InitDb:
                this.isConOpened_ = true;
                break;

              case API.Terminate:
                this.isConOpened_ = false;

                if (this.isRuningInWorker === true) {
                  this.worker_.terminate();
                }

              case API.DropDb:
                this.isConOpened_ = false;
                this.requestQueue_ = [];
                this.isDbIdle_ = true;
                break;

              case API.CloseDb:
                if (this.requestQueue_.length > 0) {
                  this.openDb_();
                } else {
                  this.isDbIdle_ = true;
                  this.eventBus_.emit(EVENT.RequestQueueEmpty, []);
                }

                break;
            }

            finishedRequest.onSuccess(message.result);
          }

          this.isCodeExecuting_ = false;
          this.executeQry_();
        }
      };

      ConnectionHelper.prototype.openDb_ = function () {
        this.prcoessExecutionOfQry_({
          name: API.OpenDb,
          query: {
            name: this.database.name,
            version: this.database.version
          },
          onSuccess: function () {},
          onError: function (err) {
            console.error(err);
          }
        }, 0);
      };

      ConnectionHelper.prototype.executeMiddleware_ = function (input) {
        var _this = this;

        return promise(function (res) {
          var index = 0;
          var lastIndex = _this.middlewares.length - 1;

          var callNextMiddleware = function () {
            if (index <= lastIndex) {
              var promiseResult = _this.middlewares[index++](input);

              if (!promiseResult || !promiseResult.then) {
                promiseResult = promiseResolve(promiseResult);
              }

              promiseResult.then(function () {
                callNextMiddleware();
              });
            } else {
              res();
            }
          };

          callNextMiddleware();
        });
      };

      ConnectionHelper.prototype.callResultMiddleware = function (middlewares, result) {
        return promise(function (res) {
          var index = 0;
          var lastIndex = middlewares.length - 1;

          var callNextMiddleware = function () {
            if (index <= lastIndex) {
              var promiseResult = middlewares[index++](result);

              if (!promiseResult.then) {
                promiseResult = promiseResolve(promiseResult);
              }

              promiseResult.then(function (modifiedResult) {
                result = modifiedResult;
                callNextMiddleware();
              });
            } else {
              res(result);
            }
          };

          callNextMiddleware();
        });
      };

      ConnectionHelper.prototype.pushApi = function (request) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          var middlewares = [];

          request.onResult = function (cb) {
            middlewares.push(function (result) {
              return cb(result);
            });
          };

          _this.executeMiddleware_(request).then(function () {
            request.onSuccess = function (result) {
              _this.callResultMiddleware(middlewares, result).then(function (modifiedResult) {
                resolve(modifiedResult);
              }).catch(function (err) {
                request.onError(err);
              });
            };

            request.onError = function (err) {
              middlewares = [];
              reject(err);
            };

            if (_this.requestQueue_.length === 0) {
              _this.eventBus_.emit(EVENT.RequestQueueFilled, []);

              var isConnectionApi = [API.CloseDb, API.DropDb, API.OpenDb, API.Terminate].indexOf(request.name) >= 0;

              if (!isConnectionApi && _this.isDbIdle_ && _this.isConOpened_) {
                _this.openDb_();
              } else {
                clearTimeout(_this.inactivityTimer_);
              }
            }

            _this.prcoessExecutionOfQry_(request);
          }).catch(reject);
        });
      };

      ConnectionHelper.prototype.prcoessExecutionOfQry_ = function (request, index) {
        this.isDbIdle_ = false;

        if (index != null) {
          this.requestQueue_.splice(index, 0, request);
        } else {
          this.requestQueue_.push(request);
        }

        this.logger.log("request pushed: " + request.name);
        this.executeQry_();
      };

      ConnectionHelper.prototype.executeQry_ = function () {
        var _this = this;

        var requestQueueLength = this.requestQueue_.length;

        if (!this.isCodeExecuting_ && requestQueueLength > 0) {
          if (this.isConOpened_ === true) {
            this.sendRequestToWorker_(this.requestQueue_[0]);
            return;
          }

          var allowedQueryIndex = this.requestQueue_.findIndex(function (item) {
            return _this.whiteListApi_.indexOf(item.name) >= 0;
          }); // shift allowed query to zeroth index

          if (allowedQueryIndex >= 0) {
            this.requestQueue_.splice(0, 0, this.requestQueue_.splice(allowedQueryIndex, 1)[0]);
            this.sendRequestToWorker_(this.requestQueue_[0]);
          }
        } else if (requestQueueLength === 0 && this.isDbIdle_ === false && this.isConOpened_) {
          this.inactivityTimer_ = setTimeout(function () {
            _this.prcoessExecutionOfQry_({
              name: API.CloseDb,
              onSuccess: function () {},
              onError: function (err) {
                console.error(err);
              }
            });
          }, 100);
        }
      };

      ConnectionHelper.prototype.sendRequestToWorker_ = function (request) {
        this.isCodeExecuting_ = true;
        this.logger.log("request executing: " + request.name);
        var requestForWorker = {
          name: request.name,
          query: request.query
        };

        if (this.isRuningInWorker === true) {
          this.worker_.postMessage(requestForWorker);
        } else {
          this.queryManager.run(requestForWorker);
        }
      };

      return ConnectionHelper;
    }(); // CONCATENATED MODULE: ./src/main/connection.ts


    var __extends = undefined && undefined.__extends || function () {
      var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function (d, b) {
          d.__proto__ = b;
        } || function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };

        return extendStatics(d, b);
      };

      return function (d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);

        function __() {
          this.constructor = d;
        }

        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();

    var connection_Connection =
    /** @class */
    function (_super) {
      __extends(Connection, _super);

      function Connection(worker) {
        return _super.call(this, worker) || this;
      }
      /**
       * initiate DataBase
       *
       * @param {IDataBase} dataBase
       * @returns
       * @memberof Connection
       */


      Connection.prototype.initDb = function (dataBase) {
        var _this = this;

        this.database = dataBase;
        return this.pushApi({
          name: API.InitDb,
          query: dataBase
        }).then(function (result) {
          var promiseObj;
          var db = result.database;

          if (result.isCreated) {
            if (result.oldVersion) {
              promiseObj = _this.eventBus_.emit(EVENT.Upgrade, db, result.oldVersion, result.newVersion);
            } else {
              promiseObj = _this.eventBus_.emit(EVENT.Create, db);
            }
          }

          return (promiseObj || promiseResolve()).then(function () {
            return _this.eventBus_.emit(EVENT.Open, db);
          }).then(function () {
            return result.isCreated;
          });
        });
      };
      /**
       * drop dataBase
       *
       * @returns
       * @memberof Connection
       */


      Connection.prototype.dropDb = function () {
        return this.pushApi({
          name: API.DropDb
        });
      };
      /**
       * select data from table
       *
       * @template T
       * @param {ISelectQuery} query
       * @returns
       * @memberof Connection
       */


      Connection.prototype.select = function (query) {
        return this.pushApi({
          name: API.Select,
          query: query
        });
      };
      /**
       * get no of record from table
       *
       * @param {ICountQuery} query
       * @returns
       * @memberof Connection
       */


      Connection.prototype.count = function (query) {
        return this.pushApi({
          name: API.Count,
          query: query
        });
      };
      /**
       * insert data into table
       *
       * @template T
       * @param {IInsertQuery} query
       * @returns
       * @memberof Connection
       */


      Connection.prototype.insert = function (query) {
        return this.pushApi({
          name: API.Insert,
          query: query
        });
      };
      /**
       * update data into table
       *
       * @param {IUpdateQuery} query
       * @returns
       * @memberof Connection
       */


      Connection.prototype.update = function (query) {
        return this.pushApi({
          name: API.Update,
          query: query
        });
      };
      /**
       * remove data from table
       *
       * @param {IRemoveQuery} query
       * @returns
       * @memberof Connection
       */


      Connection.prototype.remove = function (query) {
        return this.pushApi({
          name: API.Remove,
          query: query
        });
      };
      /**
       * delete all data from table
       *
       * @param {string} tableName
       * @returns
       * @memberof Connection
       */


      Connection.prototype.clear = function (tableName) {
        return this.pushApi({
          name: API.Clear,
          query: tableName
        });
      };

      Object.defineProperty(Connection.prototype, "logStatus", {
        /**
         * set log status
         *
         * @param {boolean} status
         * @memberof Connection
         */
        set: function (status) {
          this.logger.status = status;
          this.pushApi({
            name: API.ChangeLogStatus,
            query: status
          });
        },
        enumerable: false,
        configurable: true
      });
      /**
       * open database
       *
       * @param {string} dbName
       * @returns
       * @memberof Connection
       */

      Connection.prototype.openDb = function (dbName, version) {
        var _this = this;

        return this.pushApi({
          name: API.OpenDb,
          query: {
            version: version,
            name: dbName
          }
        }).then(function (dataBase) {
          _this.database = dataBase;
          return dataBase;
        });
      };
      /**
       * returns list of database created
       *
       * @returns
       * @memberof Connection
       */


      Connection.prototype.getDbList = function () {
        console.warn("Api getDbList is recommended to use for debugging only. Do not use in code.");
        return indexedDB.databases();
      };
      /**
       * get the value from keystore table
       *
       * @template T
       * @param {string} key
       * @returns
       * @memberof Connection
       */


      Connection.prototype.get = function (key) {
        return this.pushApi({
          name: API.Get,
          query: key
        });
      };
      /**
       * set the value in keystore table
       *
       * @param {string} key
       * @param {*} value
       * @returns
       * @memberof Connection
       */


      Connection.prototype.set = function (key, value) {
        return this.pushApi({
          name: API.Set,
          query: {
            key: key,
            value: value
          }
        });
      };
      /**
       * terminate the connection
       *
       * @returns
       * @memberof Connection
       */


      Connection.prototype.terminate = function () {
        return this.pushApi({
          name: API.Terminate
        });
      };
      /**
       * execute transaction
       *
       * @template T
       * @param {ITranscationQuery} query
       * @returns
       * @memberof Connection
       */


      Connection.prototype.transaction = function (query) {
        return this.pushApi({
          name: API.Transaction,
          query: query
        });
      };

      Connection.prototype.on = function (event, eventCallBack) {
        this.eventBus_.on(event, eventCallBack);
      };

      Connection.prototype.off = function (event, eventCallBack) {
        this.eventBus_.off(event, eventCallBack);
      };

      Connection.prototype.union = function (query) {
        return this.pushApi({
          name: API.Union,
          query: query
        });
      };

      Connection.prototype.intersect = function (query) {
        return this.pushApi({
          name: API.Intersect,
          query: query
        });
      };

      Connection.prototype.addPlugin = function (plugin, params) {
        return plugin.setup(this, params);
      };

      Connection.prototype.addMiddleware = function (middleware, forWorker) {
        if (forWorker) {
          return this.pushApi({
            name: API.Middleware,
            query: middleware
          });
        }

        this.middlewares.push(middleware);
        return Promise.resolve();
      };
      /**
       * import scripts in jsstore web worker.
       * Scripts method can be called using transaction api.
       *
       * @param {...string[]} urls
       * @returns
       * @memberof Connection
       */


      Connection.prototype.importScripts = function () {
        var urls = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          urls[_i] = arguments[_i];
        }

        return this.pushApi({
          name: API.ImportScripts,
          query: urls
        });
      };

      return Connection;
    }(connection_helper_ConnectionHelper); // CONCATENATED MODULE: ./src/common/utils/promise_all.ts


    var promiseAll = function (promises) {
      return Promise.all(promises);
    }; // CONCATENATED MODULE: ./src/common/utils/for_obj.ts


    var forObj = function (obj, cb) {
      for (var key in obj) {
        cb(key, obj[key]);
      }
    }; // CONCATENATED MODULE: ./src/common/utils/index.ts
    // CONCATENATED MODULE: ./src/common/index.ts
    // CONCATENATED MODULE: ./src/main/index.ts

    /***/

  }
  /******/

});