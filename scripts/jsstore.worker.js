/*!
 * @license :jsstore - V4.3.5 - 08/07/2021
 * https://github.com/ujjwalguptaofficial/JsStore
 * Copyright (c) 2021 @Ujjwal Gupta; Licensed MIT
 */
var JsStoreWorker =
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


    __webpack_require__.d(__webpack_exports__, "QueryManager", function () {
      return (
        /* reexport */
        query_manager_QueryManager
      );
    }); // CONCATENATED MODULE: ./src/common/utils/promise_resolve.ts


    var promiseResolve = function (value) {
      return Promise.resolve(value);
    }; // CONCATENATED MODULE: ./src/common/utils/promise.ts


    var promise = function (cb) {
      return new Promise(cb);
    }; // CONCATENATED MODULE: ./src/common/enums.ts


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
    })(CONNECTION_STATUS || (CONNECTION_STATUS = {})); // CONCATENATED MODULE: ./src/worker/model/table_meta.ts


    var TableMeta =
    /** @class */
    function () {
      function TableMeta(table) {
        this.columns = [];
        this.autoIncColumnValue = {};
        this.columns = this.setColumn(table.columns);
        this.name = table.name;
        this.alter = table.alter || {};
      }

      TableMeta.prototype.setColumn = function (tableColumns) {
        var columns = [];

        var _loop_1 = function (columnName) {
          var column = tableColumns[columnName];
          column.name = columnName;

          if (column.autoIncrement) {
            this_1.autoIncColumnValue[columnName] = 0;
          }

          if (column.primaryKey) {
            this_1.primaryKey = columnName;
          }

          column.enableSearch = column.enableSearch == null ? true : column.enableSearch;
          var existingColumnIndex = this_1.columns.indexOf(function (q) {
            return q.name === columnName;
          });

          if (existingColumnIndex < 0) {
            columns.push(column);
          } else {
            var existingColumn = this_1.columns[existingColumnIndex];
            Object.assign(existingColumn, column);
          }
        };

        var this_1 = this;

        for (var columnName in tableColumns) {
          _loop_1(columnName);
        }

        return columns;
      };

      return TableMeta;
    }(); // CONCATENATED MODULE: ./src/worker/meta_helper.ts


    var meta_helper_MetaHelper =
    /** @class */
    function () {
      function MetaHelper() {}

      MetaHelper.autoIncrementKey = function (tableName, columnName) {
        return "JsStore_" + tableName + "_" + columnName + "_Value";
      };

      MetaHelper.set = function (key, value, util) {
        if (!util.tx) {
          util.createTransaction([MetaHelper.tableName]);
        }

        var store = util.objectStore(MetaHelper.tableName);
        return promise(function (res, rej) {
          var req = store.put({
            key: key,
            value: value
          });

          req.onsuccess = function () {
            res();
          };

          req.onerror = rej;
        });
      };

      MetaHelper.get = function (key, util) {
        if (!util.tx) {
          util.createTransaction([MetaHelper.tableName]);
        }

        var store = util.objectStore(MetaHelper.tableName);
        return promise(function (res, rej) {
          var req = store.get(util.keyRange(key));

          req.onsuccess = function () {
            var result = req.result;
            res(result && result.value);
          };

          req.onerror = rej;
        });
      };

      MetaHelper.remove = function (key, util) {
        if (!util.tx) {
          util.createTransaction([MetaHelper.tableName]);
        }

        var store = util.objectStore(MetaHelper.tableName);
        return promise(function (res, rej) {
          var req = store.delete(util.keyRange(key));
          req.onsuccess = res;
          req.onerror = rej;
        });
      };

      MetaHelper.tableName = "JsStore_Meta";
      MetaHelper.dbSchema = "JsStore_DbSchema";
      return MetaHelper;
    }(); // CONCATENATED MODULE: ./src/worker/model/db_meta.ts


    var db_meta_DbMeta =
    /** @class */
    function () {
      return function (db) {
        this.name = db.name;
        this.version = db.version || 1;
        db.tables.push({
          name: meta_helper_MetaHelper.tableName,
          columns: {
            key: {
              primaryKey: true
            },
            value: {
              enableSearch: false
            }
          }
        });
        this.tables = db.tables.map(function (table) {
          return new TableMeta(table);
        });
      };
    }(); // CONCATENATED MODULE: ./src/common/utils/for_obj.ts


    var forObj = function (obj, cb) {
      for (var key in obj) {
        cb(key, obj[key]);
      }
    }; // CONCATENATED MODULE: ./src/worker/utils/log_helper.ts


    var log_helper_LogHelper =
    /** @class */
    function () {
      function LogHelper(type, info) {
        this.type = type;
        this.info_ = info;
        this.message = this.getMsg_();
      }

      LogHelper.prototype.log = function (msg) {
        if (this.status) {
          console.log(msg);
        }
      };

      LogHelper.prototype.throw = function () {
        throw this.get();
      };

      LogHelper.prototype.logError = function () {
        console.error(this.get());
      };

      LogHelper.prototype.get = function () {
        return {
          message: this.message,
          type: this.type
        };
      };

      LogHelper.prototype.getMsg_ = function () {
        var errMsg;

        switch (this.type) {
          case ERROR_TYPE.NotArray:
            errMsg = "Supplied value is not an array";
            break;

          case ERROR_TYPE.UndefinedColumn:
            errMsg = "Column is undefined in Where";
            break;

          case ERROR_TYPE.UndefinedValue:
            errMsg = "Value is undefined in Where";
            break;

          case ERROR_TYPE.UndefinedColumnName:
            errMsg = "Column name is undefined '" + this.info_['TableName'] + "'";
            break;

          case ERROR_TYPE.UndefinedDbName:
            errMsg = "Database name is not supplied";
            break;

          case ERROR_TYPE.UndefinedColumnValue:
            errMsg = "Column value is undefined";
            break;

          case ERROR_TYPE.NoValueSupplied:
            errMsg = "No value is supplied";
            break;

          case ERROR_TYPE.InvalidOp:
            errMsg = "Invalid Op Value '" + this.info_['Op'] + "'";
            break;

          case ERROR_TYPE.ColumnNotExist:
            errMsg = this.info_['isOrder'] ? "Column '" + this.info_['column'] + "' in order query does not exist" : "Column '" + this.info_['column'] + "' does not exist";
            break;

          case ERROR_TYPE.EnableSearchOff:
            errMsg = "Search is turned off for the Column '" + this.info_['column'] + "'";
            break;

          case ERROR_TYPE.NullValue:
            errMsg = "Null value is not allowed for column '" + this.info_['ColumnName'] + "'";
            break;

          case ERROR_TYPE.WrongDataType:
            errMsg = "Supplied value for column '" + this.info_['column'] + "' have wrong data type";
            break;

          case ERROR_TYPE.TableNotExist:
            errMsg = "Table '" + this.info_['tableName'] + "' does not exist";
            break;

          case ERROR_TYPE.DbNotExist:
            errMsg = "Database with name " + this.info_['dbName'] + " does not exist";
            break;

          case ERROR_TYPE.NotObject:
            errMsg = "supplied value is not object";
            break;

          case ERROR_TYPE.InvalidOp:
            errMsg = "Invalid Config '" + this.info_['Config'] + " '";
            break;

          case ERROR_TYPE.DbBlocked:
            errMsg = "database is blocked, cant be deleted right now";
            break;

          case ERROR_TYPE.NullValueInWhere:
            errMsg = "Null/undefined is not allowed in where. Column '" + this.info_['column'] + "' has null";
            break;

          case ERROR_TYPE.MethodNotExist:
            errMsg = "method '" + this.info_ + "' does not exist.";
            break;

          case ERROR_TYPE.IndexedDbNotSupported:
            errMsg = "Browser does not support indexeddb";
            break;

          case ERROR_TYPE.InvalidJoinQuery:
          case ERROR_TYPE.InvalidGroupQuery:
          case ERROR_TYPE.InvalidOrderQuery:
          case ERROR_TYPE.ImportScriptsFailed:
            errMsg = this.info_;
            break;

          case ERROR_TYPE.InvalidMiddleware:
            errMsg = "No function " + this.info_ + " is found.";
            break;

          default:
            if (!this.type) {
              this.type = ERROR_TYPE.Unknown;
            }

            errMsg = this.message;
            break;
        }

        return errMsg;
      };

      return LogHelper;
    }(); // CONCATENATED MODULE: ./src/worker/idbutil/index.ts


    var idbutil_IDBUtil =
    /** @class */
    function () {
      function IDBUtil() {
        this.logger = new log_helper_LogHelper(null);
      }

      IDBUtil.prototype.emptyTx = function () {
        if (!this.tx) return;
        this.tx.oncomplete = null;
        this.tx.onabort = null;
        this.tx.onerror = null;
        this.tx = null;
      };

      IDBUtil.prototype.createTransactionIfNotExist = function (tables, mode) {
        if (!this.tx) {
          this.createTransaction(tables, mode);
        }
      };

      IDBUtil.prototype.createTransaction = function (tables, mode) {
        var _this = this;

        if (mode === void 0) {
          mode = IDB_MODE.ReadWrite;
        }

        this.tx = this.con.transaction(tables, mode);
        return promise(function (res, rej) {
          _this.tx.oncomplete = res;
          _this.tx.onabort = res;
          _this.tx.onerror = rej;
        });
      };

      IDBUtil.prototype.keyRange = function (value, op) {
        var keyRange;

        switch (op) {
          case QUERY_OPTION.Between:
            keyRange = IDBKeyRange.bound(value.low, value.high, false, false);
            break;

          case QUERY_OPTION.GreaterThan:
            keyRange = IDBKeyRange.lowerBound(value, true);
            break;

          case QUERY_OPTION.GreaterThanEqualTo:
            keyRange = IDBKeyRange.lowerBound(value);
            break;

          case QUERY_OPTION.LessThan:
            keyRange = IDBKeyRange.upperBound(value, true);
            break;

          case QUERY_OPTION.LessThanEqualTo:
            keyRange = IDBKeyRange.upperBound(value);
            break;

          default:
            keyRange = IDBKeyRange.only(value);
            break;
        }

        return keyRange;
      };

      IDBUtil.prototype.objectStore = function (name) {
        return this.tx.objectStore(name);
      };

      IDBUtil.prototype.abortTransaction = function () {
        if (this.tx) {
          this.tx.abort();
        }
      };

      IDBUtil.prototype.close = function () {
        var _this = this;

        if (this.con) {
          this.con.close();
        } // wait for 100 ms before success


        return promise(function (res) {
          _this.con = null;
          setTimeout(res, 100);
        });
      };

      IDBUtil.prototype.initDb = function (db) {
        var _this = this;

        var isDbCreated = false;
        var dbVersion = db.version;
        var oldVersion;
        return promise(function (res, rej) {
          var dbOpenRequest = indexedDB.open(db.name, dbVersion);

          dbOpenRequest.onsuccess = function () {
            _this.con = dbOpenRequest.result;

            _this.con.onversionchange = function (e) {
              // if (e.newVersion === null) { // An attempt is made to delete the db
              e.target.close(); // Manually close our connection to the db
              // }
            };

            res({
              isCreated: isDbCreated,
              oldVersion: oldVersion,
              newVersion: dbVersion
            });
          };

          dbOpenRequest.onerror = function (e) {
            console.error("error", e);
            rej(e);
          };

          dbOpenRequest.onupgradeneeded = function (e) {
            oldVersion = e.oldVersion;
            var target = e.target;
            var upgradeConnection = target.result;
            isDbCreated = true;
            var transaction = target.transaction;
            var storeNames = upgradeConnection.objectStoreNames;

            var createObjectStore = function (table) {
              var option = table.primaryKey ? {
                keyPath: table.primaryKey
              } : {
                autoIncrement: true
              };
              var store = upgradeConnection.createObjectStore(table.name, option);
              table.columns.forEach(function (column) {
                addColumn(store, column);
              });
            };

            var addColumn = function (store, column) {
              var columnName = column.name;

              if (column.enableSearch && !store.indexNames.contains(columnName)) {
                var options = column.primaryKey ? {
                  unique: true
                } : {
                  unique: column.unique
                };
                options['multiEntry'] = column.multiEntry;
                var keyPath = column.keyPath == null ? columnName : column.keyPath;
                store.createIndex(columnName, keyPath, options);
              }
            };

            var deleteColumn = function (store, table, columnName) {
              var index = table.columns.findIndex(function (q) {
                return q.name === columnName;
              });

              if (index >= 0) {
                table.columns.splice(index, 1);
                store.deleteIndex(columnName);
              }
            };

            db.tables.forEach(function (table) {
              if (!storeNames.contains(table.name)) {
                return createObjectStore(table);
              }

              var store = transaction.objectStore(table.name);

              for (var i = oldVersion + 1; i <= dbVersion; i++) {
                var alterQuery = table.alter[i];

                if (alterQuery) {
                  if (alterQuery.add) {
                    var newColumns = table.setColumn(alterQuery.add);
                    newColumns.forEach(function (column) {
                      addColumn(store, column);
                      table.columns.push(column);
                    });
                  }

                  forObj(alterQuery.drop || {}, function (columnName) {
                    deleteColumn(store, table, columnName);
                  });
                  forObj(alterQuery.modify || {}, function (columnName, column) {
                    var shouldDelete = column.multiEntry || column.keyPath || column.unique;
                    var targetColumn = table.columns.find(function (q) {
                      return q.name === columnName;
                    });
                    var newColumn = Object.assign(targetColumn, column);
                    newColumn.name = columnName;

                    if (shouldDelete) {
                      deleteColumn(store, table, columnName);
                      addColumn(store, newColumn);
                      table.columns.push(newColumn);
                    }
                  });
                }
              }
            });

            var _loop_1 = function (i) {
              var storeName = storeNames.item(i);
              var tableIndex = db.tables.findIndex(function (qry) {
                return qry.name === storeName;
              });

              if (tableIndex < 0) {
                upgradeConnection.deleteObjectStore(storeName);
              }
            };

            for (var i = 0, length_1 = storeNames.length; i < length_1; i++) {
              _loop_1(i, length_1);
            }
          };
        });
      };

      return IDBUtil;
    }(); // CONCATENATED MODULE: ./src/common/utils/promise_all.ts


    var promiseAll = function (promises) {
      return Promise.all(promises);
    }; // CONCATENATED MODULE: ./src/worker/utils/promise_reject.ts


    var promiseReject = function (value) {
      return Promise.reject(value);
    }; // CONCATENATED MODULE: ./src/worker/utils/get_error.ts


    var getError = function (e) {
      if (e instanceof log_helper_LogHelper) {
        e.logError();
        return e.get();
      } else {
        var error = void 0;

        if (e.name) {
          error = new log_helper_LogHelper(e.name);
          error.message = e.message;
        } else {
          error = new log_helper_LogHelper(e.target.error.name);
          error.message = e.target.error.message;
        }

        error.logError();
        return error.get();
      }
    }; // CONCATENATED MODULE: ./src/worker/utils/get_error_from_exception.ts


    var getErrorFromException = function (ex, type) {
      if (type === void 0) {
        type = ERROR_TYPE.InvalidQuery;
      }

      ex.name = type;
      return getError(ex);
    }; // CONCATENATED MODULE: ./src/worker/executors/base.ts


    var base_Base =
    /** @class */
    function () {
      function Base() {
        // db: DbMeta;
        this.rowAffected = 0;
        this.isTxQuery = false;
        this.results = [];
      }

      Object.defineProperty(Base.prototype, "db", {
        get: function () {
          return this.util.db;
        },
        enumerable: false,
        configurable: true
      }); // get tableName() {
      //     return (this.query as SelectQuery).from || (this.query as InsertQuery).into
      // }

      Base.prototype.table = function (name) {
        var tableName = name || this.tableName;
        return this.db.tables.find(function (q) {
          return q.name === tableName;
        });
      };

      Base.prototype.primaryKey = function (tableName) {
        return this.table(tableName).primaryKey;
      };

      Base.prototype.getColumnInfo = function (columnName, tableName) {
        return this.table(tableName).columns.find(function (column) {
          return column.name === columnName;
        });
      };

      Base.prototype.onException = function (ex, type) {
        console.error(ex);
        this.util.abortTransaction();
        return promiseReject(getErrorFromException(ex, type));
      };

      return Base;
    }(); // CONCATENATED MODULE: ./src/worker/utils/get_data_type.ts


    var getDataType = function (value) {
      if (value == null) {
        return DATA_TYPE.Null;
      }

      var type = typeof value;

      switch (type) {
        case 'object':
          if (Array.isArray(value)) {
            return DATA_TYPE.Array;
          }

          if (value instanceof Date) {
            return DATA_TYPE.DateTime;
          }

      }

      return type;
    }; // CONCATENATED MODULE: ./src/worker/utils/is_null.ts


    var isNull = function (value) {
      if (value == null) {
        return true;
      } else {
        switch (typeof value) {
          case 'string':
            return value.length === 0;

          case 'number':
            return isNaN(value);
        }
      }

      return false;
    }; // CONCATENATED MODULE: ./src/worker/executors/insert/values_checker.ts


    var values_checker_ValuesChecker =
    /** @class */
    function () {
      function ValuesChecker(table, autoIncValues) {
        this.table = table;
        this.autoIncrementValue = autoIncValues;
      }

      ValuesChecker.prototype.checkAndModifyValues = function (query) {
        var _this = this;

        var err;
        this.query = query;
        var values = query.values;
        var ignoreIndexes = [];
        values.every(function (item, index) {
          err = _this.checkAndModifyValue(item);

          if (query.ignore && err) {
            ignoreIndexes.push(index);
            err = null;
          }

          return err ? false : true;
        });
        ignoreIndexes.forEach(function (index) {
          values.splice(index, 1);
        });
        return {
          err: err,
          values: values
        };
      };

      ValuesChecker.prototype.checkAndModifyValue = function (value) {
        var _this = this;

        var error;
        this.table.columns.every(function (column) {
          error = _this.checkAndModifyColumnValue_(column, value);
          return error ? false : true;
        });
        return error;
      };

      ValuesChecker.prototype.checkNotNullAndDataType_ = function (column, value) {
        // check not null schema
        if (column.notNull && isNull(value[column.name])) {
          return this.getError(ERROR_TYPE.NullValue, {
            ColumnName: column.name
          });
        } // check datatype
        else if (column.dataType && !isNull(value[column.name]) && getDataType(value[column.name]) !== column.dataType) {
            return this.getError(ERROR_TYPE.WrongDataType, {
              column: column.name
            });
          }
      };

      ValuesChecker.prototype.checkAndModifyColumnValue_ = function (column, value) {
        var columnValue = value[column.name]; // check auto increment scheme

        if (column.autoIncrement) {
          // if value is null, then create the autoincrement value
          if (isNull(columnValue)) {
            value[column.name] = ++this.autoIncrementValue[column.name];
          } else {
            if (getDataType(columnValue) === DATA_TYPE.Number) {
              // if column value is greater than autoincrement value saved, then make the
              // column value as autoIncrement value
              if (columnValue > this.autoIncrementValue[column.name]) {
                this.autoIncrementValue[column.name] = columnValue;
              }
            }
          }
        } // check Default Schema
        else if (column.default !== undefined && isNull(columnValue)) {
            value[column.name] = column.default;
          }

        var query = this.query;

        if (query.validation) {
          return this.checkNotNullAndDataType_(column, value);
        }
      };

      ValuesChecker.prototype.getError = function (error, details) {
        return new log_helper_LogHelper(error, details);
      };

      return ValuesChecker;
    }(); // CONCATENATED MODULE: ./src/worker/executors/update/schema_checker.ts


    var schema_checker_SchemaChecker =
    /** @class */
    function () {
      function SchemaChecker(table) {
        this.table = table;
      }

      SchemaChecker.prototype.check = function (setValue, tblName) {
        var _this = this;

        var log;

        if (typeof setValue === DATA_TYPE.Object) {
          if (this.table) {
            // loop through table column and find data is valid
            this.table.columns.every(function (column) {
              if (column.name in setValue) {
                log = _this.checkByColumn_(column, setValue[column.name]);
              }

              return log ? false : true;
            });
          } else {
            log = new log_helper_LogHelper(ERROR_TYPE.TableNotExist, {
              tableName: tblName
            });
          }
        } else {
          log = new log_helper_LogHelper(ERROR_TYPE.NotObject);
        }

        return log;
      };

      SchemaChecker.prototype.checkByColumn_ = function (column, value) {
        // check not null schema
        if (column.notNull === true && isNull(value)) {
          return new log_helper_LogHelper(ERROR_TYPE.NullValue, {
            ColumnName: column.name
          });
        } // check datatype


        var type = getDataType(value);
        var checkFurther = value != null;

        if (column.dataType && checkFurther) {
          if (type !== column.dataType && type !== 'object') {
            return new log_helper_LogHelper(ERROR_TYPE.WrongDataType, {
              column: column.name
            });
          }
        } // check allowed operators


        if (checkFurther && type === 'object') {
          var allowedOp = ['+', '-', '*', '/', '{push}'];

          for (var prop in value) {
            if (allowedOp.indexOf(prop) < 0 && column.dataType && type !== column.dataType) {
              return new log_helper_LogHelper(ERROR_TYPE.WrongDataType, {
                column: column.name
              });
            }
          }
        }
      };

      return SchemaChecker;
    }(); // CONCATENATED MODULE: ./src/worker/executors/query_helper.ts


    var query_helper_QueryHelper =
    /** @class */
    function () {
      function QueryHelper(dbSchema) {
        this.db = dbSchema;
      }

      QueryHelper.prototype.validate = function (api, query) {
        switch (api) {
          case API.Select:
          case API.Remove:
          case API.Count:
            return this.checkSelect(query);

          case API.Insert:
            return this.checkInsertQuery(query);

          case API.Update:
            return this.checkUpdate(query);
        }
      };

      QueryHelper.prototype.getTable_ = function (tableName) {
        return this.db.tables.find(function (q) {
          return q.name === tableName;
        });
      };

      QueryHelper.prototype.isInsertQryValid = function (query) {
        var table = this.getTable_(query.into);
        var log;

        if (table) {
          switch (getDataType(query.values)) {
            case DATA_TYPE.Array:
              break;

            case DATA_TYPE.Null:
              log = new log_helper_LogHelper(ERROR_TYPE.NoValueSupplied);
              break;

            default:
              log = new log_helper_LogHelper(ERROR_TYPE.NotArray);
          }
        } else {
          log = new log_helper_LogHelper(ERROR_TYPE.TableNotExist, {
            tableName: query.into
          });
        }

        return {
          table: table,
          log: log
        };
      };

      QueryHelper.prototype.checkUpdate = function (query) {
        var err = new schema_checker_SchemaChecker(this.getTable_(query.in)).check(query.set, query.in);
        if (err) return err;

        if (query.where != null) {
          err = this.checkForNullInWhere_(query);
          if (err) return err;
          this.addGreatAndLessToNotOp_(query);
        }
      };

      QueryHelper.prototype.checkSelect = function (query) {
        var table = this.getTable_(query.from);

        if (!table) {
          return new log_helper_LogHelper(ERROR_TYPE.TableNotExist, {
            tableName: query.from
          });
        }

        if (query.where) {
          var err = this.checkForNullInWhere_(query);
          if (err) return err;
          this.addGreatAndLessToNotOp_(query);
        }
      };

      QueryHelper.prototype.checkForNullInWhere_ = function (query) {
        for (var columnName in query.where) {
          if (query.where[columnName] == null) {
            return new log_helper_LogHelper(ERROR_TYPE.NullValueInWhere, {
              column: columnName
            });
          }
        }
      };

      QueryHelper.prototype.addGreatAndLessToNotOp_ = function (query) {
        var whereQuery = query.where;

        var containsNot = function (qry, keys) {
          return keys.findIndex(function (key) {
            return qry[key][QUERY_OPTION.NotEqualTo] != null;
          }) >= 0;
        };

        var addToSingleQry = function (qry, keys) {
          var value;
          keys.forEach(function (prop) {
            value = qry[prop];

            if (value[QUERY_OPTION.NotEqualTo] != null) {
              qry[prop][QUERY_OPTION.GreaterThan] = value[QUERY_OPTION.NotEqualTo];

              if (qry[QUERY_OPTION.Or] === undefined) {
                qry[QUERY_OPTION.Or] = {};
                qry[QUERY_OPTION.Or][prop] = {};
              } else if (qry[QUERY_OPTION.Or][prop] === undefined) {
                qry[QUERY_OPTION.Or][prop] = {};
              }

              qry[QUERY_OPTION.Or][prop][QUERY_OPTION.LessThan] = value[QUERY_OPTION.NotEqualTo];
              delete qry[prop][QUERY_OPTION.NotEqualTo];
            }
          });
          return qry;
        };

        switch (getDataType(whereQuery)) {
          case DATA_TYPE.Object:
            var queryKeys = Object.keys(whereQuery);

            if (containsNot(whereQuery, queryKeys)) {
              if (queryKeys.length === 1) {
                query.where = addToSingleQry(whereQuery, queryKeys);
              } else {
                var whereTmpQry_1 = [];
                queryKeys.forEach(function (prop) {
                  var _a;

                  whereTmpQry_1.push(addToSingleQry((_a = {}, _a[prop] = whereQuery[prop], _a), [prop]));
                });
                query.where = whereTmpQry_1;
              }
            }

            break;

          default:
            var whereTmp_1 = [];
            whereQuery.forEach(function (qry) {
              var qryKeys = Object.keys(qry);

              if (containsNot(qry, qryKeys)) {
                qry = addToSingleQry(qry, qryKeys);
              }

              whereTmp_1.push(qry);
            });
            query.where = whereTmp_1;
        }
      };

      QueryHelper.prototype.checkInsertQuery = function (query) {
        var validResult = this.isInsertQryValid(query);
        var table = validResult.table;
        var error = validResult.log;
        if (error) return error;
        if (query.skipDataCheck) return;
        var valueCheckerInstance = new values_checker_ValuesChecker(table, table.autoIncColumnValue);

        var _a = valueCheckerInstance.checkAndModifyValues(query),
            values = _a.values,
            err = _a.err;

        query.values = values;
        return err;
      };

      return QueryHelper;
    }(); // CONCATENATED MODULE: ./src/worker/executors/insert/index.ts


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

    var insert_Insert =
    /** @class */
    function (_super) {
      __extends(Insert, _super);

      function Insert(query, util) {
        var _this = _super.call(this) || this;

        _this.valuesAffected_ = [];

        if (query.validation == null) {
          query.validation = true;
        }

        _this.query = query;
        _this.util = util;
        _this.tableName = query.into;
        return _this;
      }

      Insert.prototype.execute = function (beforeInsert) {
        var _this = this;

        var db = this.db;
        var err = new query_helper_QueryHelper(db).validate(API.Insert, this.query);
        if (err) return promiseReject(err);
        return beforeInsert().then(function () {
          return _this.insertData_(db).then(function () {
            return _this.query.return ? _this.valuesAffected_ : _this.rowAffected;
          });
        }).catch(function (err) {
          _this.util.abortTransaction();

          return promiseReject(err);
        });
      };

      Insert.prototype.insertData_ = function (db) {
        var _this = this;

        var onInsertData;
        var addMethod;
        var query = this.query;

        if (query.return) {
          onInsertData = function (value) {
            _this.valuesAffected_.push(value);
          };
        } else {
          onInsertData = function () {
            ++_this.rowAffected;
          };
        }

        addMethod = function () {
          var idbMethod = query.upsert ? "put" : "add";

          if (query.ignore && !_this.isTxQuery) {
            return function (value) {
              var tx = _this.util.con.transaction(query.into, IDB_MODE.ReadWrite);

              var objectStore = tx.objectStore(query.into);
              return objectStore[idbMethod](value);
            };
          }

          if (!_this.isTxQuery) {
            _this.util.createTransaction([query.into, meta_helper_MetaHelper.tableName]);
          }

          _this.objectStore = _this.util.objectStore(_this.tableName);
          return function (value) {
            return _this.objectStore[idbMethod](value);
          };
        }();

        return promiseAll(query.values.map(function (value) {
          return promise(function (res, rej) {
            var addResult = addMethod(value);

            addResult.onerror = function (err) {
              if (query.ignore) {
                res();
              } else {
                rej(err);
              }
            };

            addResult.onsuccess = function () {
              onInsertData(value);
              res();
            };
          });
        })).then(function () {
          meta_helper_MetaHelper.set(meta_helper_MetaHelper.dbSchema, db, _this.util);
        });
      };

      return Insert;
    }(base_Base); // CONCATENATED MODULE: ./src/worker/utils/set_cross_browser_idb.ts


    // CONCATENATED MODULE: ./src/worker/constants/index.ts
    var IS_WORKER = typeof self.alert === 'undefined' && typeof ServiceWorkerGlobalScope === 'undefined';

    var IS_IDB_SUPPORTED = function () {
      try {
        if (!indexedDB) {
          indexedDB = self.mozIndexedDB || self.webkitIndexedDB || self.msIndexedDB;
        }

        if (indexedDB) {
          IDBTransaction = IDBTransaction || self.webkitIDBTransaction || self.msIDBTransaction;
          self.IDBKeyRange = self.IDBKeyRange || self.webkitIDBKeyRange || self.msIDBKeyRange;
        } else {
          return false;
        }
      } catch (ex) {
        return false;
      }

      return true;
    }(); // CONCATENATED MODULE: ./src/worker/utils/get_keys.ts


    var getKeys = function (value) {
      return Object.keys(value);
    }; // CONCATENATED MODULE: ./src/worker/utils/is_array.ts


    var isArray = function (value) {
      return Array.isArray(value);
    }; // CONCATENATED MODULE: ./src/worker/utils/is_object.ts


    var isObject = function (value) {
      return typeof value === 'object';
    }; // CONCATENATED MODULE: ./src/worker/utils/get_length.ts


    var getLength = function (value) {
      return getKeys(value).length;
    }; // CONCATENATED MODULE: ./src/worker/utils/get_object_first_key.ts


    var getObjectFirstKey = function (value) {
      for (var key in value) {
        return key;
      }
    }; // CONCATENATED MODULE: ./src/worker/executors/select/base_select.ts


    // CONCATENATED MODULE: ./src/worker/executors/select/then_evaluator.ts
    var then_evaluator_ThenEvaluator =
    /** @class */
    function () {
      function ThenEvaluator() {}

      ThenEvaluator.prototype.setCaseAndValue = function (caseQuery, value) {
        this.caseQuery_ = caseQuery;
        this.setValue(value);
      };

      ThenEvaluator.prototype.setCaseAndColumn = function (caseQuery, columnName) {
        this.caseQuery_ = caseQuery;
        this.setColumn(columnName);
        return this;
      };

      ThenEvaluator.prototype.setColumn = function (columnName) {
        this.columnName_ = columnName;
        this.caseColumnQuery_ = this.caseQuery_[this.columnName_];
        this.length_ = this.caseColumnQuery_.length;
        return this;
      };

      ThenEvaluator.prototype.setValue = function (value) {
        this.value = value;
        return this;
      };

      ThenEvaluator.prototype.evaluate = function () {
        for (var i = 0; i < this.length_; i++) {
          if (this.checkCase_(this.caseColumnQuery_[i]) === true) {
            return this.caseColumnQuery_[i].then;
          }
        }

        var lastThen = this.caseColumnQuery_[this.length_ - 1].then;
        return lastThen == null ? this.value[this.columnName_] : lastThen;
      };

      ThenEvaluator.prototype.checkCase_ = function (cond) {
        for (var queryOption in cond) {
          switch (queryOption) {
            case QUERY_OPTION.GreaterThan:
              if (this.value[this.columnName_] > cond[queryOption]) {
                return true;
              }

              break;

            case QUERY_OPTION.Equal:
              if (this.value[this.columnName_] === cond[queryOption]) {
                return true;
              }

              break;

            case QUERY_OPTION.LessThan:
              if (this.value[this.columnName_] < cond[queryOption]) {
                return true;
              }

              break;

            case QUERY_OPTION.GreaterThanEqualTo:
              if (this.value[this.columnName_] >= cond[queryOption]) {
                return true;
              }

              break;

            case QUERY_OPTION.LessThanEqualTo:
              if (this.value[this.columnName_] <= cond[queryOption]) {
                return true;
              }

              break;

            case QUERY_OPTION.NotEqualTo:
              if (this.value[this.columnName_] !== cond[queryOption]) {
                return true;
              }

              break;

            case QUERY_OPTION.Between:
              if (this.value[this.columnName_] > cond[queryOption].low && this.value[this.columnName_] < cond[queryOption].high) {
                return true;
              }

              break;
          }

          return false;
        }
      };

      return ThenEvaluator;
    }(); // CONCATENATED MODULE: ./src/worker/executors/select/not_where.ts


    var executeWhereUndefinedLogic = function () {
      var _this = this;

      var cursorRequest;

      if (this.query.order && this.query.order.idbSorting !== false && this.query.order.by) {
        if (this.objectStore.indexNames.contains(this.query.order.by)) {
          var orderType = this.query.order.type && this.query.order.type.toLowerCase() === 'desc' ? 'prev' : 'next';
          this.sorted = true;
          cursorRequest = this.objectStore.index(this.query.order.by).openCursor(null, orderType);
        } else {
          return promiseReject(new log_helper_LogHelper(ERROR_TYPE.ColumnNotExist, {
            column: this.query.order.by,
            isOrder: true
          }));
        }
      } else {
        cursorRequest = this.objectStore.openCursor();
      }

      var onSuccess = function () {
        if (_this.shouldEvaluateLimitAtEnd === false && _this.shouldEvaluateSkipAtEnd === false) {
          if (_this.skipRecord && _this.limitRecord) {
            return executeSkipAndLimit;
          } else if (_this.skipRecord) {
            return executeSkip;
          } else if (_this.limitRecord) {
            return executeLimit;
          }
        }

        return executeSimple;
      }();

      return promise(function (res, rej) {
        cursorRequest.onerror = rej;
        cursorRequest.onsuccess = onSuccess.call(_this, res);
      });
    };

    var executeSkipAndLimit = function (onFinished) {
      var _this = this;

      var recordSkipped = false,
          cursor;
      return function (e) {
        cursor = e.target.result;

        if (cursor) {
          if (recordSkipped && _this.results.length !== _this.limitRecord) {
            _this.pushResult(cursor.value);

            cursor.continue();
          } else {
            recordSkipped = true;
            cursor.advance(_this.skipRecord);
          }
        } else {
          onFinished();
        }
      };
    };

    var executeSkip = function (onFinished) {
      var _this = this;

      var recordSkipped = false,
          cursor;
      return function (e) {
        cursor = e.target.result;

        if (cursor) {
          if (recordSkipped) {
            _this.pushResult(cursor.value);

            cursor.continue();
          } else {
            recordSkipped = true;
            cursor.advance(_this.skipRecord);
          }
        } else {
          onFinished();
        }
      };
    };

    var executeSimple = function (onFinished) {
      var _this = this;

      var cursor;
      return function (e) {
        cursor = e.target.result;

        if (cursor) {
          _this.pushResult(cursor.value);

          cursor.continue();
        } else {
          onFinished();
        }
      };
    };

    var executeLimit = function (onFinished) {
      var _this = this;

      var cursor;
      return function (e) {
        cursor = e.target.result;

        if (cursor && _this.results.length !== _this.limitRecord) {
          _this.pushResult(cursor.value);

          cursor.continue();
        } else {
          onFinished();
        }
      };
    }; // CONCATENATED MODULE: ./src/worker/utils/remove_space.ts


    var removeSpace = function (value) {
      return value.replace(/\s/g, '');
    }; // CONCATENATED MODULE: ./src/worker/executors/select/order_by.ts


    var getOrderColumnInfo = function (orderColumn) {
      var column;

      if (this.query.join == null) {
        column = this.getColumnInfo(orderColumn);
      } else {
        var splittedByDot = removeSpace(orderColumn).split(".");
        orderColumn = splittedByDot[1];
        column = this.getColumnInfo(orderColumn, splittedByDot[0]);
      }

      if (column == null) {
        var valueFromFirstColumn = this.results[0][orderColumn];

        if (valueFromFirstColumn) {
          return {
            dataType: getDataType(valueFromFirstColumn),
            name: orderColumn
          };
        }

        throw new log_helper_LogHelper(ERROR_TYPE.ColumnNotExist, {
          column: orderColumn,
          isOrder: true
        });
      }

      return column;
    };

    var compareStringInDesc_ = function (a, b) {
      return b.localeCompare(a);
    };

    var compareStringinAsc_ = function (a, b) {
      return a.localeCompare(b);
    };

    var compareDefaultInDesc_ = function (a, b) {
      return new String(b).localeCompare(a);
    };

    var compareDefaultinAsc_ = function (a, b) {
      return new String(a).localeCompare(b);
    };

    var compareNumberInDesc_ = function (a, b) {
      return b - a;
    };

    var compareNumberinAsc_ = function (a, b) {
      return a - b;
    };

    var compareDateInDesc_ = function (a, b) {
      return b.getTime() - a.getTime();
    };

    var compareDateInAsc_ = function (a, b) {
      return a.getTime() - b.getTime();
    };

    var getValInDesc_ = function (value1, value2, caseQuery) {
      for (var columnName in caseQuery) {
        this.thenEvaluator.setCaseAndValue(caseQuery, value1);
        var column1 = this.thenEvaluator.setColumn(columnName).evaluate();
        this.thenEvaluator.setCaseAndValue(caseQuery, value2);
        var column2 = this.thenEvaluator.setColumn(columnName).evaluate();

        switch (typeof value1[column1]) {
          case DATA_TYPE.String:
            return compareStringInDesc_(value1[column1], value2[column2]);

          default:
            return compareNumberInDesc_(value1[column1], value2[column2]);
        }
      }
    };

    var getValInAsc_ = function (value1, value2, caseQuery) {
      for (var columnName in caseQuery) {
        this.thenEvaluator.setCaseAndValue(caseQuery, value1);
        var column1 = this.thenEvaluator.setColumn(columnName).evaluate();
        this.thenEvaluator.setCaseAndValue(caseQuery, value2);
        var column2 = this.thenEvaluator.setColumn(columnName).evaluate();

        switch (typeof value1[column1]) {
          case DATA_TYPE.String:
            return compareStringinAsc_(value1[column1], value2[column2]);

          default:
            return compareNumberinAsc_(value1[column1], value2[column2]);
        }
      }
    };

    var getValueComparer_ = function (column, order) {
      switch (column.dataType) {
        case DATA_TYPE.String:
          return order.type === 'asc' ? compareStringinAsc_ : compareStringInDesc_;

        case DATA_TYPE.Number:
          return order.type === 'asc' ? compareNumberinAsc_ : compareNumberInDesc_;

        case DATA_TYPE.DateTime:
          return order.type === 'asc' ? compareDateInAsc_ : compareDateInDesc_;

        default:
          return order.type === 'asc' ? compareDefaultinAsc_ : compareDefaultInDesc_;
      }
    };

    var orderBy_ = function (order) {
      var _a;

      var _this = this;

      order.type = getOrderType_(order.type);
      var orderColumn = order.by;

      if (orderColumn != null && typeof orderColumn === DATA_TYPE.Object) {
        if (order.type === "asc") {
          this.results.sort(function (a, b) {
            return getValInAsc_.call(_this, a, b, orderColumn);
          });
        } else {
          this.results.sort(function (a, b) {
            return getValInDesc_.call(_this, a, b, orderColumn);
          });
        }
      } else {
        var columnInfo = getOrderColumnInfo.call(this, orderColumn);

        if (columnInfo != null) {
          var orderMethod_1 = getValueComparer_(columnInfo, order);
          orderColumn = columnInfo.name;

          if (order.case == null) {
            this.results.sort(function (a, b) {
              return orderMethod_1(a[orderColumn], b[orderColumn]);
            });
          } else {
            this.thenEvaluator.setCaseAndColumn((_a = {}, _a[orderColumn] = order.case, _a), orderColumn);
            this.results.sort(function (a, b) {
              return orderMethod_1(_this.thenEvaluator.setValue(a).evaluate(), _this.thenEvaluator.setValue(b).evaluate());
            });
          }
        }
      }
    };

    var getOrderType_ = function (type) {
      return type == null ? 'asc' : type.toLowerCase();
    };

    var processOrderBy = function () {
      var order = this.query.order;

      if (order && this.results.length > 0 && !this.sorted) {
        var orderQueryType = getDataType(order);

        if (orderQueryType === DATA_TYPE.Object) {
          orderBy_.call(this, order);
        } else if (orderQueryType === DATA_TYPE.Array) {
          orderBy_.call(this, order[0]);

          var _loop_1 = function (i) {
            // if (this.error == null) {
            var prevOrderQueryBy = order[i - 1].by;
            var currentOrderQuery = order[i];
            var currentorderQueryBy = currentOrderQuery.by;
            var orderColumnDetail = getOrderColumnInfo.call(this_1, currentorderQueryBy);

            if (orderColumnDetail != null) {
              currentorderQueryBy = orderColumnDetail.name;
              currentOrderQuery.type = getOrderType_(currentOrderQuery.type);
              var orderMethod_2 = getValueComparer_(orderColumnDetail, currentOrderQuery);
              this_1.results.sort(function (a, b) {
                if (a[prevOrderQueryBy] === b[prevOrderQueryBy]) {
                  return orderMethod_2(a[currentorderQueryBy], b[currentorderQueryBy]);
                }

                return 0;
              });
            }
          };

          var this_1 = this;

          for (var i = 1, length_1 = order.length; i < length_1; i++) {
            _loop_1(i, length_1);
          }
        }
      }
    };

    var processAggregateQry = function () {
      var datas = this.results;
      var datasLength = datas.length;
      var results = {};
      var columnToAggregate; // free results memory

      this.results = undefined;

      var getCount = function () {
        var result = 0;

        for (var i in datas) {
          result += datas[i][columnToAggregate] ? 1 : 0;
        }

        return result;
      };

      var getMax = function () {
        var result = 0;

        for (var i in datas) {
          result = result > datas[i][columnToAggregate] ? result : datas[i][columnToAggregate];
        }

        return result;
      };

      var getMin = function () {
        var result = Infinity,
            value = Infinity;

        for (var i in datas) {
          value = datas[i][columnToAggregate] ? datas[i][columnToAggregate] : Infinity;
          result = result < value ? result : value;
        }

        return result;
      };

      var getSum = function () {
        var result = 0;

        for (var i in datas) {
          result += datas[i][columnToAggregate];
        }

        return result;
      };

      var getAvg = function () {
        var result = 0;

        for (var i in datas) {
          result += datas[i][columnToAggregate];
        }

        return result / datasLength;
      };

      for (var prop in this.query.aggregate) {
        var aggregateColumn = this.query.aggregate[prop];
        var aggregateValType = getDataType(aggregateColumn);
        var aggregateCalculator = void 0;

        switch (prop) {
          case 'count':
            aggregateCalculator = getCount;
            break;

          case 'max':
            aggregateCalculator = getMax;
            break;

          case 'min':
            aggregateCalculator = getMin;
            break;

          case 'sum':
            aggregateCalculator = getSum;
            break;

          case 'avg':
            aggregateCalculator = getAvg;
            break;
        }

        switch (aggregateValType) {
          case DATA_TYPE.String:
            columnToAggregate = aggregateColumn;
            results[prop + "(" + columnToAggregate + ")"] = aggregateCalculator();
            break;

          case DATA_TYPE.Array:
            for (var key in aggregateColumn) {
              columnToAggregate = aggregateColumn[key];
              results[prop + "(" + columnToAggregate + ")"] = aggregateCalculator();
            }

        }
      } // add results to the first index of result


      for (var prop in results) {
        datas[0][prop] = results[prop];
      }

      this.results = [datas[0]];
    }; // CONCATENATED MODULE: ./src/worker/executors/select/group_by.ts


    var processGroupBy = function () {
      var groupBy = this.query.groupBy;
      var datas = this.results;
      var lookUpObj = {}; // free results memory

      this.results = this.query.groupBy = null;

      if (getDataType(groupBy) !== DATA_TYPE.Object) {
        if (getDataType(groupBy) === DATA_TYPE.String) {
          for (var i in datas) {
            lookUpObj[datas[i][groupBy]] = datas[i];
          }
        } else {
          var objKey = void 0;

          for (var i in datas) {
            objKey = "";

            for (var column in groupBy) {
              objKey += datas[i][groupBy[column]];
            }

            lookUpObj[objKey] = datas[i];
          }
        }
      } else {
        var caseQueryLength = Object.keys(groupBy).length;

        if (caseQueryLength === 1) {
          var groupByColumn = getObjectFirstKey(groupBy);
          this.thenEvaluator.setCaseAndColumn(groupBy, groupByColumn);

          for (var i in datas) {
            lookUpObj[this.thenEvaluator.setValue(datas[i]).evaluate()] = datas[i];
          }
        } else {
          var objKey = void 0;

          for (var i in datas) {
            objKey = "";
            this.thenEvaluator.setCaseAndValue(groupBy, datas[i]);

            for (var column in groupBy) {
              objKey += this.thenEvaluator.setColumn(column).evaluate();
            }

            lookUpObj[objKey] = datas[i];
          }
        }
      } // free datas memory


      datas = [];

      for (var i in lookUpObj) {
        datas.push(lookUpObj[i]);
      }

      this.results = datas;
    };

    var executeAggregateGroupBy = function () {
      var grpQry = this.query.groupBy;
      var datas = this.results; // free results memory

      this.results = undefined;
      var lookUpObj = {}; // assign aggregate

      var aggregateQry = this.query.aggregate;
      var objKey;
      var value;
      var columnToAggregate;

      var calculateAggregate = function () {
        var getCount = function () {
          value = lookUpObj[objKey]; // get old value

          value = value ? value["count(" + columnToAggregate + ")"] : 0; // add with old value if data exist

          value += datas[index][columnToAggregate] ? 1 : 0;
          return value;
        };

        var getMax = function () {
          value = lookUpObj[objKey]; // get old value

          value = value ? value["max(" + columnToAggregate + ")"] : 0;
          datas[index][columnToAggregate] = datas[index][columnToAggregate] ? datas[index][columnToAggregate] : 0; // compare between old value and new value

          return value > datas[index][columnToAggregate] ? value : datas[index][columnToAggregate];
        };

        var getMin = function () {
          value = lookUpObj[objKey]; // get old value

          value = value ? value["min(" + columnToAggregate + ")"] : Infinity;
          datas[index][columnToAggregate] = datas[index][columnToAggregate] ? datas[index][columnToAggregate] : Infinity; // compare between old value and new value

          return value < datas[index][columnToAggregate] ? value : datas[index][columnToAggregate];
        };

        var getSum = function () {
          value = lookUpObj[objKey]; // get old value

          value = value ? value["sum(" + columnToAggregate + ")"] : 0; // add with old value if data exist

          value += datas[index][columnToAggregate] ? datas[index][columnToAggregate] : 0;
          return value;
        };

        var getAvg = function () {
          value = lookUpObj[objKey]; // get old sum value

          var sumOfColumn = value ? value["sum(" + columnToAggregate + ")"] : 0; // add with old value if data exist

          sumOfColumn += datas[index][columnToAggregate] ? datas[index][columnToAggregate] : 0;
          datas[index]["sum(" + columnToAggregate + ")"] = sumOfColumn; // get old count value

          value = value ? value["count(" + columnToAggregate + ")"] : 0; // add with old value if data exist

          value += datas[index][columnToAggregate] ? 1 : 0;
          datas[index]["count(" + columnToAggregate + ")"] = value;
        };

        for (var prop in aggregateQry) {
          var aggregateColumn = aggregateQry[prop];
          var aggregateValType = getDataType(aggregateColumn);
          var aggregateCalculator = void 0;

          switch (prop) {
            case QUERY_OPTION.Count:
              aggregateCalculator = getCount;
              break;

            case QUERY_OPTION.Max:
              aggregateCalculator = getMax;
              break;

            case QUERY_OPTION.Min:
              aggregateCalculator = getMin;
              break;

            case QUERY_OPTION.Sum:
              aggregateCalculator = getSum;
              break;

            case QUERY_OPTION.Avg:
              aggregateCalculator = getAvg;
              break;
          }

          switch (aggregateValType) {
            case DATA_TYPE.String:
              columnToAggregate = aggregateColumn;
              datas[index][prop + "(" + columnToAggregate + ")"] = aggregateCalculator();
              break;

            case DATA_TYPE.Array:
              for (var item in aggregateColumn) {
                columnToAggregate = aggregateColumn[item];
                datas[index][prop + "(" + columnToAggregate + ")"] = aggregateCalculator();
              }

          }
        }
      };

      if (getDataType(grpQry) === DATA_TYPE.String) {
        for (var index in datas) {
          objKey = datas[index][grpQry];
          calculateAggregate();
          lookUpObj[objKey] = datas[index];
        }
      } else {
        for (index in datas) {
          objKey = "";

          for (var column in grpQry) {
            objKey += datas[index][grpQry[column]];
          }

          calculateAggregate();
          lookUpObj[objKey] = datas[index];
        }
      } // free datas memory


      datas = [];

      for (var i in lookUpObj) {
        datas.push(lookUpObj[i]);
      } // Checking for avg and if exist then fill the datas;


      if (aggregateQry.avg) {
        if (getDataType(aggregateQry.avg) === DATA_TYPE.String) {
          for (index in datas) {
            var sumForAvg = datas[index]["sum(" + aggregateQry.avg + ")"],
                countForAvg = datas[index]["count(" + aggregateQry.avg + ")"];
            datas[index]["avg(" + aggregateQry.avg + ")"] = sumForAvg / countForAvg;

            if (aggregateQry.count !== aggregateQry.avg) {
              delete datas[index]["count(" + aggregateQry.avg + ")"];
            }

            if (aggregateQry.sum !== aggregateQry.avg) {
              delete datas[index]["sum(" + aggregateQry.avg + ")"];
            }
          }
        } else {
          var isCountTypeString = getDataType(aggregateQry.count) === DATA_TYPE.String;
          var isSumTypeString = getDataType(aggregateQry.sum) === DATA_TYPE.String;

          for (index in datas) {
            for (var column in aggregateQry.avg) {
              var avgColumn = aggregateQry.avg[column],
                  sum = datas[index]["sum(" + avgColumn + ")"],
                  count = datas[index]["count(" + avgColumn + ")"];
              datas[index]["avg(" + avgColumn + ")"] = sum / count;

              if (isCountTypeString) {
                if (aggregateQry.count !== avgColumn) {
                  delete datas[index]["count(" + avgColumn + ")"];
                } else if (aggregateQry.count.indexOf(avgColumn) === -1) {
                  delete datas[index]["count(" + avgColumn + ")"];
                }
              }

              if (isSumTypeString) {
                if (aggregateQry.sum !== avgColumn) {
                  delete datas[index]["sum(" + avgColumn + ")"];
                } else if (aggregateQry.sum.indexOf(avgColumn) === -1) {
                  delete datas[index]["sum(" + avgColumn + ")"];
                }
              }
            }
          }
        }
      }

      this.results = datas;
    }; // CONCATENATED MODULE: ./src/worker/executors/select/where.ts


    var executeSkipAndLimitForWhere_ = function (onFinish) {
      var _this = this;

      var recordSkipped = false;
      return function (e) {
        var cursor = e.target.result;

        if (cursor) {
          if (recordSkipped && _this.results.length !== _this.limitRecord) {
            var value = cursor.value;

            if (_this.shouldAddValue(value)) {
              _this.pushResult(value);
            }

            cursor.continue();
          } else {
            recordSkipped = true;
            cursor.advance(_this.skipRecord);
          }
        } else {
          onFinish();
        }
      };
    };

    var executeSkipForWhere_ = function (onFinish) {
      var _this = this;

      var recordSkipped = false;
      return function (e) {
        var cursor = e.target.result;

        if (cursor) {
          if (recordSkipped) {
            var value = cursor.value;

            if (_this.shouldAddValue(value)) {
              _this.pushResult(value);
            }

            cursor.continue();
          } else {
            recordSkipped = true;
            cursor.advance(_this.skipRecord);
          }
        } else {
          onFinish();
        }
      };
    };

    var executeLimitForWhere_ = function (onFinish) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (cursor && _this.results.length !== _this.limitRecord) {
          var value = cursor.value;

          if (_this.shouldAddValue(value)) {
            _this.pushResult(value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    };

    var executeSimpleForWhere_ = function (onFinish) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (cursor) {
          var value = cursor.value;

          if (_this.shouldAddValue(value)) {
            _this.pushResult(value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    }; // CONCATENATED MODULE: ./src/worker/utils/get_regex_from_like.ts


    var getRegexFromLikeExpression = function (likeExpression) {
      var filterValues = likeExpression.split('%');
      var filterValue;
      var occurence;

      if (filterValues[1]) {
        filterValue = filterValues[1];
        occurence = filterValues.length > 2 ? OCCURENCE.Any : OCCURENCE.Last;
      } else {
        filterValue = filterValues[0];
        occurence = OCCURENCE.First;
      }

      switch (occurence) {
        case OCCURENCE.First:
          return new RegExp("^" + filterValue, 'i');

        case OCCURENCE.Last:
          return new RegExp(filterValue + "$", 'i');

        default:
          return new RegExp("" + filterValue, 'i');
      }
    }; // CONCATENATED MODULE: ./src/worker/utils/clone.ts


    var clone_isObject = function (value) {
      return getDataType(value) === 'object' && !(value instanceof RegExp);
    };

    var clone = function (obj) {
      if (clone_isObject(obj)) {
        var copy = {};

        for (var i in obj) {
          copy[i] = obj[i] != null && clone_isObject(obj[i]) ? clone(obj[i]) : obj[i];
        }

        return copy;
      }

      return obj;
    }; // CONCATENATED MODULE: ./src/worker/utils/compare.ts


    var compare = function (value, compareValue, symbol) {
      var type1 = getDataType(value);
      var type2 = getDataType(compareValue);
      if (type1 !== type2) return false;

      if (type1 === DATA_TYPE.DateTime) {
        value = value.getTime();
        compareValue = compareValue.getTime();
      }

      switch (symbol) {
        // greater than
        case QUERY_OPTION.GreaterThan:
          return value > compareValue;
        // less than

        case QUERY_OPTION.LessThan:
          return value < compareValue;
        // less than equal

        case QUERY_OPTION.LessThanEqualTo:
          return value <= compareValue;
        // greather than equal

        case QUERY_OPTION.GreaterThanEqualTo:
          return value >= compareValue;
        // Not equal to

        case QUERY_OPTION.NotEqualTo:
          return value !== compareValue;

        default:
          return value === compareValue;
      }
    }; // CONCATENATED MODULE: ./src/worker/executors/where_checker.ts

    /**
     * For matching the different column value existance for where option
     *
     * @export
     * @class WhereChecker
     */


    var where_checker_WhereChecker =
    /** @class */
    function () {
      function WhereChecker(where, checkFlag) {
        this.where = clone(where);
        this.checkFlag = checkFlag;
      }

      WhereChecker.prototype.remove = function (props) {
        var last = props.pop();
        var value = props.reduce(function (prev, curr) {
          return prev && prev[curr];
        }, this.where);
        delete value[last];
      };

      WhereChecker.prototype.check = function (rowValue) {
        var status = true;
        if (!this.checkFlag) return status;

        for (var columnName in this.where) {
          if (!status) {
            return status;
          }

          var whereColumnValue = this.where[columnName];
          var columnValue = rowValue[columnName];

          if (getDataType(whereColumnValue) === "object") {
            for (var key in whereColumnValue) {
              if (!status) {
                return status;
              }

              switch (key) {
                case QUERY_OPTION.In:
                  status = this.checkIn(columnName, columnValue);
                  break;

                case QUERY_OPTION.Like:
                  status = this.checkLike_(columnName, columnValue);
                  break;

                case QUERY_OPTION.Regex:
                  status = this.checkRegex(columnName, columnValue);
                  break;

                case QUERY_OPTION.Between:
                case QUERY_OPTION.GreaterThan:
                case QUERY_OPTION.LessThan:
                case QUERY_OPTION.GreaterThanEqualTo:
                case QUERY_OPTION.LessThanEqualTo:
                case QUERY_OPTION.NotEqualTo:
                  status = this.checkComparisionOp_(columnName, columnValue, key);
                  break;

                default:
                  status = false;
              }
            }
          } else {
            status = compare(whereColumnValue, columnValue);
          }
        }

        return status;
      };

      WhereChecker.prototype.checkIn = function (column, value) {
        return this.where[column][QUERY_OPTION.In].find(function (q) {
          return compare(q, value);
        }) != null;
      };

      WhereChecker.prototype.checkLike_ = function (column, value) {
        return getRegexFromLikeExpression(this.where[column][QUERY_OPTION.Like]).test(value);
      };

      WhereChecker.prototype.checkRegex = function (column, value) {
        return this.where[column][QUERY_OPTION.Regex].test(value);
      };

      WhereChecker.prototype.checkComparisionOp_ = function (column, value, symbol) {
        var compareValue = this.where[column][symbol];

        if (symbol != QUERY_OPTION.Between) {
          return compare(value, compareValue, symbol);
        }

        return compare(value, compareValue.low, '>=') && compare(value, compareValue.high, '<=');
      };

      return WhereChecker;
    }(); // CONCATENATED MODULE: ./src/worker/executors/base_fetch.ts


    var base_fetch_extends = undefined && undefined.__extends || function () {
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

    var base_fetch_BaseFetch =
    /** @class */
    function (_super) {
      base_fetch_extends(BaseFetch, _super);

      function BaseFetch() {
        var _this = _super !== null && _super.apply(this, arguments) || this;

        _this.shouldEvaluateLimitAtEnd = false;
        _this.shouldEvaluateSkipAtEnd = false;
        return _this;
      }

      BaseFetch.prototype.goToWhereLogic = function () {
        var query = this.query;
        var firstColumn = getObjectFirstKey(query.where);

        if (this.objectStore.indexNames.contains(firstColumn)) {
          var value = query.where[firstColumn];

          if (getDataType(value) === 'object') {
            var checkFlag = getLength(value) > 1 || getLength(query.where) > 1;
            this.whereCheckerInstance = new where_checker_WhereChecker(query.where, checkFlag);
            var key = getObjectFirstKey(value);
            this.whereCheckerInstance.remove([firstColumn, key]);

            switch (key) {
              case QUERY_OPTION.Like:
                {
                  var regexVal = getRegexFromLikeExpression(value[QUERY_OPTION.Like]);
                  return this.executeRegexLogic(firstColumn, regexVal);
                }

              case QUERY_OPTION.Regex:
                return this.executeRegexLogic(firstColumn, value[QUERY_OPTION.Regex]);

              case QUERY_OPTION.In:
                return this.executeInLogic(firstColumn, value[QUERY_OPTION.In]);

              case QUERY_OPTION.Between:
              case QUERY_OPTION.GreaterThan:
              case QUERY_OPTION.LessThan:
              case QUERY_OPTION.GreaterThanEqualTo:
              case QUERY_OPTION.LessThanEqualTo:
                return this.executeWhereLogic(firstColumn, value, key, "next");

              case QUERY_OPTION.Aggregate:
                break;

              default:
                return this.executeWhereLogic(firstColumn, value, null, "next");
            }
          } else {
            var checkFlag = getLength(query.where) > 1;
            this.whereCheckerInstance = new where_checker_WhereChecker(query.where, checkFlag);
            this.whereCheckerInstance.remove([firstColumn]);
            return this.executeWhereLogic(firstColumn, value, null, "next");
          }
        } else {
          var column = this.getColumnInfo(firstColumn);
          var error = column == null ? new log_helper_LogHelper(ERROR_TYPE.ColumnNotExist, {
            column: firstColumn
          }) : new log_helper_LogHelper(ERROR_TYPE.EnableSearchOff, {
            column: firstColumn
          });
          return promiseReject(error);
        }
      };

      return BaseFetch;
    }(base_Base); // CONCATENATED MODULE: ./src/worker/executors/select/in.ts


    var executeSkipAndLimitForIn_ = function (onFinish, skipOrPush) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (_this.results.length !== _this.limitRecord && cursor) {
          var value = cursor.value;

          if (_this.shouldAddValue(value)) {
            skipOrPush(value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    };

    var executeSkipForIn_ = function (onFinish, skipOrPush) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (cursor) {
          var value = cursor.value;

          if (_this.shouldAddValue(value)) {
            skipOrPush(value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    };

    var executeLimitForIn_ = function (onFinish) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (cursor && _this.results.length !== _this.limitRecord) {
          var value = cursor.value;

          if (_this.shouldAddValue(value)) {
            _this.pushResult(cursor.value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    };

    var executeSimpleForIn_ = function (onFinish) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (cursor) {
          var value = cursor.value;

          if (_this.shouldAddValue(value)) {
            _this.pushResult(value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    }; // CONCATENATED MODULE: ./src/worker/executors/select/regex.ts


    var executeSkipAndLimitForRegex_ = function (onFinish, skipOrPush) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (_this.results.length !== _this.limitRecord && cursor) {
          if (_this.shouldAddValue(cursor)) {
            skipOrPush(cursor.value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    };

    var executeSkipForRegex_ = function (onFinish, skipOrPush) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (cursor) {
          if (_this.shouldAddValue(cursor)) {
            skipOrPush(cursor.value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    };

    var executeLimitForRegex_ = function (onFinish) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (_this.results.length !== _this.limitRecord && cursor) {
          if (_this.shouldAddValue(cursor)) {
            _this.pushResult(cursor.value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    };

    var executeSimpleForRegex_ = function (onFinish) {
      var _this = this;

      return function (e) {
        var cursor = e.target.result;

        if (cursor) {
          if (_this.shouldAddValue(cursor)) {
            _this.pushResult(cursor.value);
          }

          cursor.continue();
        } else {
          onFinish();
        }
      };
    }; // CONCATENATED MODULE: ./src/worker/executors/select/join.ts


    var __assign = undefined && undefined.__assign || function () {
      __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];

          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }

        return t;
      };

      return __assign.apply(this, arguments);
    };

    var join_Join =
    /** @class */
    function () {
      function Join(select) {
        this.joinQueryStack_ = [];
        this.currentQueryStackIndex_ = 0;
        this.tablesFetched = [];
        this.results = [];
        this.select = select;
      }

      Object.defineProperty(Join.prototype, "query", {
        get: function () {
          return this.select.query;
        },
        enumerable: false,
        configurable: true
      });

      Join.prototype.getTable = function (name) {
        return this.select.table(name);
      };

      Join.prototype.executeSelect = function (query) {
        // this.select.util.emptyTx();
        return new select_Select(query, this.select.util).execute();
      };

      Join.prototype.execute = function () {
        var _this = this;

        var query = this.query;
        this.joinQueryStack_ = getDataType(query.join) === DATA_TYPE.Object ? [query.join] : query.join; // get the data for first table

        var tableName = query.from;
        var tablesToFetch = [tableName];

        for (var i = 0, length_1 = this.joinQueryStack_.length; i < length_1; i++) {
          var item = this.joinQueryStack_[i];
          var jointblInfo = this.getJoinTableInfo_(item.on); // table 1 is fetched & table2 needs to be fetched for join

          if (item.with === jointblInfo.table1.table) {
            jointblInfo = {
              table1: jointblInfo.table2,
              table2: jointblInfo.table1
            };
          }

          var err = this.checkJoinQuery_(jointblInfo, item);

          if (err) {
            return promiseReject(err);
          }

          this.joinQueryStack_[i].joinTableInfo = jointblInfo;
          tablesToFetch.push(item.with);
        }

        if (!this.select.isTxQuery) {
          this.select.util.createTransaction(tablesToFetch);
        }

        return this.executeSelect({
          from: tableName,
          where: query.where,
          case: query.case,
          flatten: query.flatten
        }).then(function (results) {
          _this.results = results.map(function (item) {
            var _a;

            return _a = {}, _a[_this.currentQueryStackIndex_] = item, _a;
          });

          _this.tablesFetched.push(tableName);

          return _this.startExecutingJoinLogic_();
        });
      };

      Join.prototype.onJoinQueryFinished_ = function () {
        var _this = this; // const query = this.query;


        if (this.results.length > 0) {
          try {
            var results_1 = [];
            var tables = Object.keys(this.results[0]);
            var tablesLength_1 = tables.length;

            var mapWithAlias_1 = function (query, value) {
              if (query.as != null) {
                for (var key in query.as) {
                  if (value[query.as[key]] === undefined) {
                    value[query.as[key]] = value[key];
                    delete value[key];
                  }
                }
              }

              return value;
            };

            this.results.forEach(function (result) {
              var data = result["0"]; // first table data

              for (var i = 1; i < tablesLength_1; i++) {
                var query = _this.joinQueryStack_[i - 1];
                data = __assign(__assign({}, data), mapWithAlias_1(query, result[i]));
              }

              results_1.push(data);
            });
            this.select['results'] = results_1;
            this.select.setLimitAndSkipEvaluationAtEnd_();
            this.select.query.flatten = null;

            try {
              this.select.processOrderBy();
            } catch (ex) {
              return promiseReject(new log_helper_LogHelper(ERROR_TYPE.InvalidOrderQuery, ex.message));
            }

            try {
              this.select.processGroupDistinctAggr();
            } catch (ex) {
              return promiseReject(new log_helper_LogHelper(ERROR_TYPE.InvalidGroupQuery, ex.message));
            }
          } catch (ex) {
            return promiseReject(new log_helper_LogHelper(ERROR_TYPE.InvalidJoinQuery, ex.message));
          }
        }
      };

      Join.prototype.startExecutingJoinLogic_ = function () {
        var _this = this;

        var joinQuery = this.joinQueryStack_[this.currentQueryStackIndex_];

        if (joinQuery) {
          try {
            var jointblInfo_1 = joinQuery.joinTableInfo;
            return this.executeSelect({
              from: joinQuery.with,
              where: joinQuery.where,
              case: joinQuery.case,
              flatten: joinQuery.flatten
            }).then(function (results) {
              _this.jointables(joinQuery.type, jointblInfo_1, results);

              _this.tablesFetched.push(jointblInfo_1.table2.table);

              ++_this.currentQueryStackIndex_;
              return _this.startExecutingJoinLogic_();
            });
          } catch (ex) {
            return promiseReject(new log_helper_LogHelper(ERROR_TYPE.InvalidJoinQuery, ex.message));
          }
        } else {
          return this.onJoinQueryFinished_();
        }
      };

      Join.prototype.jointables = function (joinType, jointblInfo, secondtableData) {
        var _this = this;

        var results = [];
        var column1 = jointblInfo.table1.column;
        var column2 = jointblInfo.table2.column;
        var table1Index = this.tablesFetched.indexOf(jointblInfo.table1.table);
        var table2Index = this.currentQueryStackIndex_ + 1;

        var performInnerJoin = function () {
          var index = 0;

          _this.results.forEach(function (valueFromFirstTable) {
            secondtableData.forEach(function (valueFromSecondTable) {
              if (valueFromFirstTable[table1Index][column1] === valueFromSecondTable[column2]) {
                results[index] = __assign({}, valueFromFirstTable);
                results[index++][table2Index] = valueFromSecondTable;
              }
            });
          });
        };

        var performleftJoin = function () {
          var index = 0;
          var valueMatchedFromSecondTable;
          var callBack;
          var columnDefaultValue = {};

          _this.getTable(jointblInfo.table2.table).columns.forEach(function (col) {
            columnDefaultValue[col.name] = null;
          });

          _this.results.forEach(function (valueFromFirstTable) {
            valueMatchedFromSecondTable = [];

            if (table2Index === 1) {
              callBack = function (valueFromSecondTable) {
                if (valueFromFirstTable[table1Index][column1] === valueFromSecondTable[column2]) {
                  valueMatchedFromSecondTable.push(valueFromSecondTable);
                }
              };
            } else {
              callBack = function (valueFromSecondTable) {
                var value = valueFromFirstTable[table1Index];

                if (value != null && value[column1] === valueFromSecondTable[column2]) {
                  valueMatchedFromSecondTable.push(valueFromSecondTable);
                }
              };
            }

            secondtableData.forEach(callBack);

            if (valueMatchedFromSecondTable.length === 0) {
              valueMatchedFromSecondTable = [columnDefaultValue];
            }

            valueMatchedFromSecondTable.forEach(function (value) {
              results[index] = __assign({}, valueFromFirstTable);
              results[index++][table2Index] = value;
            });
          });
        };

        switch (joinType) {
          case "left":
            performleftJoin();
            break;

          default:
            performInnerJoin();
        }

        this.results = results;
      };

      Join.prototype.getJoinTableInfo_ = function (joinOn) {
        joinOn = removeSpace(joinOn);
        var splittedjoinOn = joinOn.split("=");
        var splittedjoinOnbydotFirst = splittedjoinOn[0].split(".");
        var splittedjoinOnbydotSecond = splittedjoinOn[1].split(".");
        var info = {
          table1: {
            table: splittedjoinOnbydotFirst[0],
            column: splittedjoinOnbydotFirst[1]
          },
          table2: {
            table: splittedjoinOnbydotSecond[0],
            column: splittedjoinOnbydotSecond[1]
          }
        };
        return info;
      };

      Join.prototype.checkJoinQuery_ = function (jointblInfo, qry) {
        var table1 = jointblInfo.table1;
        var table2 = jointblInfo.table2;
        var tableSchemaOf1stTable = this.getTable(table1.table);
        var tableSchemaOf2ndTable = this.getTable(table2.table);
        var err; // check on info & with info 

        if (qry.with !== table2.table) {
          err = new log_helper_LogHelper(ERROR_TYPE.InvalidJoinQuery, "on value should contains value of with");
        } // check for column existance


        if (tableSchemaOf1stTable.columns.find(function (q) {
          return q.name === table1.column;
        }) == null) {
          err = new log_helper_LogHelper(ERROR_TYPE.InvalidJoinQuery, "column " + table1.column + " does not exist in table " + table1.table);
        } else if (tableSchemaOf2ndTable.columns.find(function (q) {
          return q.name === table2.column;
        }) == null) {
          err = new log_helper_LogHelper(ERROR_TYPE.InvalidJoinQuery, "column " + table2.column + " does not exist in table " + table2.table);
        } // check for column match in both table


        if (qry.as == null) {
          qry.as = {};
        }

        tableSchemaOf1stTable.columns.every(function (column) {
          var columnFound = tableSchemaOf2ndTable.columns.find(function (q) {
            return q.name === column.name && q.name !== table1.column;
          });

          if (columnFound != null && qry.as[columnFound.name] == null) {
            err = new log_helper_LogHelper(ERROR_TYPE.InvalidJoinQuery, "column " + column.name + " exist in both table " + table1.table + " & " + table2.table);
            return false;
          }

          return true;
        });
        return err;
      };

      return Join;
    }(); // CONCATENATED MODULE: ./src/worker/executors/select/index.ts


    var select_extends = undefined && undefined.__extends || function () {
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

    var select_assign = undefined && undefined.__assign || function () {
      select_assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];

          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }

        return t;
      };

      return select_assign.apply(this, arguments);
    };

    var __spreadArray = undefined && undefined.__spreadArray || function (to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) to[j] = from[i];

      return to;
    };

    var select_Select =
    /** @class */
    function (_super) {
      select_extends(Select, _super);

      function Select(query, util) {
        var _this = _super.call(this) || this;

        _this.sorted = false;
        _this.isSubQuery = false;
        _this.thenEvaluator = new then_evaluator_ThenEvaluator();

        _this.returnResult_ = function () {
          if (_this.results.length > 0) {
            if (_this.query.flatten) {
              var flattendData_1 = [];
              var indexToDelete_1 = {};

              _this.query.flatten.forEach(function (column) {
                _this.results.forEach(function (data, i) {
                  data[column].forEach(function (item) {
                    var _a;

                    flattendData_1.push(select_assign(select_assign({}, data), (_a = {}, _a[column] = item, _a)));
                  });
                  indexToDelete_1[i] = true;
                });
              });

              var itemsDeleted_1 = 0;
              getKeys(indexToDelete_1).forEach(function (key) {
                _this.results.splice(Number(key) - itemsDeleted_1, 1);

                ++itemsDeleted_1;
              });
              _this.results = _this.results.concat(flattendData_1);
            }

            _this.processGroupDistinctAggr();

            _this.processOrderBy();

            if (_this.shouldEvaluateSkipAtEnd) {
              _this.results.splice(0, _this.query.skip);
            }

            if (_this.shouldEvaluateLimitAtEnd) {
              _this.results = _this.results.slice(0, _this.query.limit);
            }
          }

          return _this.results;
        };

        _this.query = query;
        _this.util = util;
        _this.tableName = query.from;

        _this.setPushResult();

        if (isArray(_this.query.where)) {
          _this.isArrayQry = true;

          _this.setLimitAndSkipEvaluationAtEnd_();
        } else {
          _this.skipRecord = query.skip;
          _this.limitRecord = query.limit;
        }

        if (query.order) {
          if (isArray(query.order) || query.order.case || isObject(query.order.by)) {
            _this.query.order.idbSorting = false;
          }

          _this.setLimitAndSkipEvaluationAtEnd_();
        } else if (query.groupBy) {
          _this.setLimitAndSkipEvaluationAtEnd_();
        }

        return _this;
      }

      Select.prototype.execute = function (beforeExecute) {
        var _this = this;

        var pResult;

        if (!beforeExecute) {
          beforeExecute = function () {
            return promiseResolve(null);
          };
        }

        try {
          var err = new query_helper_QueryHelper(this.db).validate(API.Select, this.query);
          if (err) return promiseReject(err);
          return beforeExecute().then(function () {
            _this.initTransaction_();

            if (_this.query.join == null) {
              if (_this.query.where != null) {
                if (isArray(_this.query.where)) {
                  pResult = _this.processWhereArrayQry();
                } else {
                  pResult = _this.processWhere_();
                }
              } else {
                pResult = _this.executeWhereUndefinedLogic();
              }
            } else {
              pResult = _this.executeJoinQuery();
            }

            return pResult.then(_this.returnResult_.bind(_this));
          });
        } catch (ex) {
          return this.onException(ex);
        }
      };

      Select.prototype.processWhereArrayQry = function () {
        var _this = this;

        this.isArrayQry = true;
        var whereQuery = this.query.where;
        var pKey = this.primaryKey();
        var isFirstWhere = true,
            output = [],
            operation;

        var isItemExist = function (keyValue) {
          return output.findIndex(function (item) {
            return item[pKey] === keyValue;
          }) >= 0;
        };

        var onSuccess = function () {
          if (operation === QUERY_OPTION.And) {
            var doAnd = function () {
              var andResults = [];

              _this.results.forEach(function (item) {
                if (isItemExist(item[pKey])) {
                  andResults.push(item);
                }
              });

              output = andResults;
              andResults = null;
            };

            if (isFirstWhere === true) {
              output = _this.results;
            } else if (output.length > 0) {
              doAnd();
            }
          } else {
            if (output.length > 0) {
              _this.results = __spreadArray(__spreadArray([], output), _this.results);

              _this.removeDuplicates();

              output = _this.results;
            } else {
              output = _this.results;
            }
          }

          isFirstWhere = false;

          if (whereQuery.length > 0) {
            _this.results = [];
            return processFirstQry();
          } else {
            _this.results = output;
          }
        };

        var processFirstQry = function () {
          _this.query.where = whereQuery.shift();

          if (_this.query.where[QUERY_OPTION.Or]) {
            if (getLength(_this.query.where) === 1) {
              operation = QUERY_OPTION.Or;
              _this.query.where = _this.query.where[QUERY_OPTION.Or];
            } else {
              operation = QUERY_OPTION.And;
            }
          } else {
            operation = QUERY_OPTION.And;
          }

          return _this.processWhere_().then(onSuccess);
        };

        return processFirstQry();
      };

      Select.prototype.initTransaction_ = function () {
        if (!this.isTxQuery) {
          this.util.createTransactionIfNotExist([this.tableName], IDB_MODE.ReadOnly);
        }

        this.objectStore = this.util.objectStore(this.tableName);
      };

      Select.prototype.processWhere_ = function () {
        var _this = this;

        this.shouldAddValue = function (value) {
          return _this.whereCheckerInstance.check(value);
        };

        if (this.query.where.or) {
          this.processOrLogic_();
        }

        return this.goToWhereLogic().then(function () {
          return _this.onWhereEvaluated();
        });
      };

      Select.prototype.onWhereEvaluated = function () {
        if (this.isOr) {
          return this.orQuerySuccess_();
        }
      };

      Select.prototype.orQueryFinish_ = function () {
        this.isOr = false;
        this.results = this.orInfo.results; // free or info memory

        this.orInfo = null;
        this.removeDuplicates(); // this.onQueryFinished();
      };

      Select.prototype.orQuerySuccess_ = function () {
        this.orInfo.results = __spreadArray(__spreadArray([], this.orInfo.results), this.results);

        if (!this.query.limit || this.query.limit > this.orInfo.results.length) {
          this.results = [];
          var key = getObjectFirstKey(this.orInfo.orQuery);

          if (key != null) {
            var where = {};
            where[key] = this.orInfo.orQuery[key];
            delete this.orInfo.orQuery[key];
            this.query.where = where;
            return this.goToWhereLogic().then(this.onWhereEvaluated.bind(this));
          }
        }

        return this.orQueryFinish_();
      };

      Select.prototype.processOrLogic_ = function () {
        this.isOr = true;
        var where = this.query.where;
        this.orInfo = {
          orQuery: where.or,
          results: []
        }; // free or memory

        delete where.or;
      };

      return Select;
    }(base_fetch_BaseFetch);

    select_Select.prototype.executeInLogic = function (column, values) {
      var _this = this;

      var skip = this.skipRecord;

      var skipOrPush = function (val) {
        if (skip === 0) {
          _this.pushResult(val);
        } else {
          --skip;
        }
      };

      var onSuccess = function () {
        if (_this.shouldEvaluateLimitAtEnd === false && _this.shouldEvaluateSkipAtEnd === false) {
          if (_this.skipRecord && _this.limitRecord) {
            return executeSkipAndLimitForIn_;
          } else if (_this.skipRecord) {
            return executeSkipForIn_;
          } else if (_this.limitRecord) {}
        }

        return executeSimpleForIn_;
      }();

      var columnStore = this.objectStore.index(column);

      var runInLogic = function (value) {
        return promise(function (res, rej) {
          var cursorRequest = columnStore.openCursor(_this.util.keyRange(value));
          cursorRequest.onsuccess = onSuccess.call(_this, res, skipOrPush);
          cursorRequest.onerror = rej;
        });
      };

      return promiseAll(values.map(function (val) {
        return runInLogic(val);
      }));
    };

    select_Select.prototype.executeWhereUndefinedLogic = executeWhereUndefinedLogic;

    select_Select.prototype.executeWhereLogic = function (column, value, op, dir) {
      var _this = this;

      value = op ? value[op] : value;
      var cursorRequest = this.objectStore.index(column).openCursor(this.util.keyRange(value, op), dir);

      var onSuccess = function () {
        if (_this.shouldEvaluateLimitAtEnd === false && _this.shouldEvaluateSkipAtEnd === false) {
          if (_this.skipRecord && _this.limitRecord) {
            return executeSkipAndLimitForWhere_;
          } else if (_this.skipRecord) {
            return executeSkipForWhere_;
          } else if (_this.limitRecord) {
            return executeLimitForWhere_;
          }
        }

        return executeSimpleForWhere_;
      }();

      return promise(function (res, rej) {
        cursorRequest.onerror = rej;
        cursorRequest.onsuccess = onSuccess.call(_this, res);
      });
    };

    select_Select.prototype.executeRegexLogic = function (column, exp) {
      var _this = this;

      var skip = this.skipRecord;

      var skipOrPush = function (val) {
        if (skip === 0) {
          _this.pushResult(val);
        } else {
          --skip;
        }
      };

      this.shouldAddValue = function (cursor) {
        return exp.test(cursor.key) && _this.whereCheckerInstance.check(cursor.value);
      };

      var cursorRequest = this.objectStore.index(column).openCursor();

      var onSuccess = function () {
        if (_this.shouldEvaluateLimitAtEnd === false && _this.shouldEvaluateSkipAtEnd === false) {
          if (_this.skipRecord && _this.limitRecord) {
            return executeSkipAndLimitForRegex_;
          } else if (_this.skipRecord) {
            return executeSkipForRegex_;
          } else if (_this.limitRecord) {
            return executeLimitForRegex_;
          }
        }

        return executeSimpleForRegex_;
      }();

      return promise(function (res, rej) {
        cursorRequest.onerror = rej;
        cursorRequest.onsuccess = onSuccess.call(_this, res, skipOrPush);
      });
    };

    select_Select.prototype.setLimitAndSkipEvaluationAtEnd_ = function () {
      if (this.query.limit) {
        this.shouldEvaluateLimitAtEnd = true;
      }

      if (this.query.skip) {
        this.shouldEvaluateSkipAtEnd = true;
      }
    };

    select_Select.prototype.setPushResult = function () {
      var _this = this;

      if (this.query.case) {
        this.pushResult = function (value) {
          _this.thenEvaluator.setCaseAndValue(_this.query.case, value);

          for (var columnName in _this.query.case) {
            value[columnName] = _this.thenEvaluator.setColumn(columnName).evaluate();
          }

          _this.results.push(value);
        };
      } else {
        this.pushResult = function (value) {
          _this.results.push(value);
        };
      }
    };

    select_Select.prototype.removeDuplicates = function () {
      var datas = this.results; // free results memory

      this.results = null;
      var key = this.primaryKey();
      var lookupObject = {};

      for (var i = 0, len = datas.length; i < len; i++) {
        lookupObject[datas[i][key]] = datas[i];
      }

      datas = [];

      for (var i in lookupObject) {
        datas.push(lookupObject[i]);
      }

      this.results = datas;
    };

    select_Select.prototype.executeJoinQuery = function () {
      return new join_Join(this).execute();
    };

    select_Select.prototype.processGroupDistinctAggr = function () {
      if (this.query.distinct) {
        var groupBy = [];
        var result = this.results[0];

        for (var key in result) {
          groupBy.push(key);
        }

        var primaryKey = this.primaryKey(),
            index = groupBy.indexOf(primaryKey);
        groupBy.splice(index, 1);
        this.query.groupBy = groupBy.length > 0 ? groupBy : null;
      }

      if (this.query.groupBy) {
        if (this.query.aggregate) {
          this.executeAggregateGroupBy();
        } else {
          this.processGroupBy();
        }
      } else if (this.query.aggregate) {
        this.processAggregateQry();
      }
    };

    select_Select.prototype.processOrderBy = processOrderBy;
    select_Select.prototype.processAggregateQry = processAggregateQry;
    select_Select.prototype.executeAggregateGroupBy = executeAggregateGroupBy;
    select_Select.prototype.processGroupBy = processGroupBy; // CONCATENATED MODULE: ./src/worker/executors/count/not_where.ts

    // CONCATENATED MODULE: ./src/worker/executors/count/index.ts
    var count_extends = undefined && undefined.__extends || function () {
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

    var count_Count =
    /** @class */
    function (_super) {
      count_extends(Count, _super);

      function Count(query, util) {
        var _this = _super.call(this) || this;

        _this.resultCount = 0;
        _this.query = query;
        _this.util = util;
        _this.tableName = query.from;
        return _this;
      }

      Count.prototype.execute = function (beforeExecute) {
        var _this = this;

        var queryHelper = new query_helper_QueryHelper(this.db);
        var query = this.query;
        var err = queryHelper.validate(API.Count, query);

        if (err) {
          return promiseReject(err);
        }

        return beforeExecute().then(function () {
          var result;

          try {
            var getDataFromSelect = function () {
              var selectInstance = new select_Select(_this.query, _this.util);
              selectInstance.isTxQuery = _this.isTxQuery;
              return selectInstance.execute().then(function (results) {
                _this.resultCount = results.length;
              });
            };

            _this.initTransaction_();

            if (query.join == null) {
              if (query.where != null) {
                if (query.where.or || isArray(_this.query.where)) {
                  result = getDataFromSelect();
                } else {
                  result = _this.goToWhereLogic();
                }
              } else {
                result = _this.executeWhereUndefinedLogic();
              }
            } else {
              result = getDataFromSelect();
            }
          } catch (ex) {
            _this.onException(ex);
          }

          return result.then(function () {
            return _this.resultCount;
          });
        });
      };

      Count.prototype.initTransaction_ = function () {
        if (!this.isTxQuery) {
          this.util.createTransaction([this.query.from], IDB_MODE.ReadOnly);
        }

        this.objectStore = this.util.objectStore(this.query.from);
      };

      return Count;
    }(base_fetch_BaseFetch);

    count_Count.prototype.executeWhereUndefinedLogic = function () {
      var _this = this;

      var countRequest;

      var onSuccess = function () {
        if (_this.objectStore.count) {
          countRequest = _this.objectStore.count();
          return function (onFinish) {
            return function () {
              _this.resultCount = countRequest.result;
              onFinish();
            };
          };
        } else {
          var cursor_1;
          countRequest = _this.objectStore.openCursor();
          return function (onFinish) {
            return function (e) {
              cursor_1 = e.target.result;

              if (cursor_1) {
                ++_this.resultCount;
                cursor_1.continue();
              } else {
                onFinish();
              }
            };
          };
        }
      }();

      return promise(function (res, rej) {
        countRequest.onerror = rej;
        countRequest.onsuccess = onSuccess(res);
      });
    };

    count_Count.prototype.executeWhereLogic = function (column, value, op) {
      var _this = this;

      value = op ? value[op] : value;
      var cursorRequest;
      var cursor;
      return promise(function (res, rej) {
        if (getLength(_this.query.where) === 1 && _this.objectStore.count) {
          cursorRequest = _this.objectStore.index(column).count(_this.util.keyRange(value, op));

          cursorRequest.onsuccess = function () {
            _this.resultCount = cursorRequest.result;
            res();
          };
        } else {
          cursorRequest = _this.objectStore.index(column).openCursor(_this.util.keyRange(value, op));

          cursorRequest.onsuccess = function (e) {
            cursor = e.target.result;

            if (cursor) {
              if (_this.whereCheckerInstance.check(cursor.value)) {
                ++_this.resultCount;
              }

              cursor.continue();
            } else {
              res();
            }
          };
        }

        cursorRequest.onerror = rej;
      });
    };

    count_Count.prototype.executeRegexLogic = function (column, exp) {
      var _this = this;

      var cursor;
      var cursorRequest = this.objectStore.index(column).openCursor();

      this.shouldAddValue = function (cursor) {
        return exp.test(cursor.key) && _this.whereCheckerInstance.check(cursor.value);
      };

      return promise(function (res, rej) {
        cursorRequest.onerror = rej;

        cursorRequest.onsuccess = function (e) {
          cursor = e.target.result;

          if (cursor) {
            if (_this.shouldAddValue(cursor)) {
              ++_this.resultCount;
            }

            cursor.continue();
          } else {
            res();
          }
        };
      });
    };

    count_Count.prototype.executeInLogic = function (column, values) {
      var _this = this;

      var cursor;
      var columnStore = this.objectStore.index(column);

      var runInLogic = function (value) {
        var keyRange = _this.util.keyRange(value);

        if (_this.objectStore.count) {
          return promise(function (res, rej) {
            var cursorRequest = columnStore.count(keyRange);

            cursorRequest.onsuccess = function (e) {
              _this.resultCount += e.target.result;
              res();
            };

            cursorRequest.onerror = rej;
          });
        }

        return promise(function (res, rej) {
          var cursorRequest = columnStore.openCursor(keyRange);

          cursorRequest.onsuccess = function (e) {
            cursor = e.target.result;

            if (cursor) {
              if (_this.whereCheckerInstance.check(cursor.value)) {
                ++_this.resultCount;
              }

              cursor.continue();
            } else {
              res();
            }
          };

          cursorRequest.onerror = rej;
        });
      };

      return promiseAll(values.map(function (val) {
        return runInLogic(val);
      }));
    }; // CONCATENATED MODULE: ./src/worker/utils/resolve.ts


    var variableFromPath = function (path) {
      var properties = isArray(path) ? path : path.split(".");
      return properties.reduce(function (prev, curr) {
        return prev && prev[curr];
      }, self);
    }; // CONCATENATED MODULE: ./src/worker/executors/update/update_value.ts


    var updateValue = function (query, storedValue) {
      var setValue = query.set;
      var mapSet = query.mapSet;

      if (mapSet) {
        var result = mapSet(setValue, storedValue);

        if (result != null) {
          setValue = result;
        }
      }

      for (var key in setValue) {
        var columnSetValue = setValue[key];

        if (getDataType(columnSetValue) !== DATA_TYPE.Object) {
          storedValue[key] = columnSetValue;
        } else {
          for (var op in columnSetValue) {
            var value = columnSetValue[op];

            switch (op) {
              case '+':
                storedValue[key] += value;
                break;

              case '-':
                storedValue[key] -= value;
                break;

              case '*':
                storedValue[key] *= value;
                break;

              case '/':
                storedValue[key] /= value;
                break;

              case '{push}':
                storedValue[key].push(value);
                break;

              default:
                storedValue[key] = columnSetValue;
            }

            break;
          }
        }
      }

      return storedValue;
    }; // CONCATENATED MODULE: ./src/worker/executors/update/not_where.ts


    // CONCATENATED MODULE: ./src/worker/executors/update/index.ts
    var update_extends = undefined && undefined.__extends || function () {
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

    var update_Update =
    /** @class */
    function (_super) {
      update_extends(Update, _super);

      function Update(query, util) {
        var _this = _super.call(this) || this;

        _this.query = query;
        _this.util = util;
        _this.tableName = query.in;
        var mapSet = query.mapSet;

        if (mapSet) {
          var method = getDataType(mapSet) === DATA_TYPE.String ? variableFromPath(mapSet) : mapSet;

          if (!method) {
            throw new log_helper_LogHelper(ERROR_TYPE.MethodNotExist, mapSet);
          }

          query.mapSet = method;
        }

        return _this;
      }

      Update.prototype.execute = function (beforeExecute) {
        var _this = this;

        var query = this.query;

        try {
          var queryHelper = new query_helper_QueryHelper(this.db);
          var err = queryHelper.validate(API.Update, query);
          if (err) return promiseReject(err);
          return beforeExecute().then(function () {
            _this.initTransaction();

            var pResult;

            if (query.where != null) {
              if (query.where.or || isArray(query.where)) {
                pResult = _this.executeComplexLogic_();
              } else {
                pResult = _this.goToWhereLogic();
              }
            } else {
              pResult = _this.executeWhereUndefinedLogic();
            }

            return pResult.then(function () {
              return _this.rowAffected;
            });
          });
        } catch (ex) {
          return this.onException(ex);
        }
      };

      Update.prototype.executeComplexLogic_ = function () {
        var _this = this;

        var query = this.query;
        var selectObject = new select_Select({
          from: query.in,
          where: query.where,
          ignoreCase: query.ignoreCase
        }, this.util);
        selectObject.isTxQuery = this.isTxQuery;
        return selectObject.execute().then(function (results) {
          var _a, _b;

          var key = _this.primaryKey(query.in);

          var inQuery = [];
          results.forEach(function (value) {
            inQuery.push(value[key]);
          });
          results = null;
          var whereQry = (_a = {}, _a[key] = (_b = {}, _b[QUERY_OPTION.In] = inQuery, _b), _a);
          _this.query.where = whereQry;

          _this.initTransaction();

          return _this.goToWhereLogic();
        });
      };

      Update.prototype.initTransaction = function () {
        var tableName = this.query.in;

        if (!this.isTxQuery) {
          this.util.createTransaction([tableName]);
        }

        this.objectStore = this.util.objectStore(tableName);
      };

      return Update;
    }(base_fetch_BaseFetch);

    update_Update.prototype.executeWhereUndefinedLogic = function () {
      var _this = this;

      var cursorRequest = this.objectStore.openCursor();
      return promise(function (res, rej) {
        cursorRequest.onsuccess = function (e) {
          var cursor = e.target.result;

          if (cursor) {
            try {
              var cursorUpdateRequest = cursor.update(updateValue(_this.query, cursor.value));

              cursorUpdateRequest.onsuccess = function () {
                ++_this.rowAffected;
                cursor.continue();
              };

              cursorUpdateRequest.onerror = rej;
            } catch (ex) {
              rej(ex);
            }
          } else {
            res();
          }
        };

        cursorRequest.onerror = rej;
      });
    };

    update_Update.prototype.executeWhereLogic = function (column, value, op) {
      var _this = this;

      var query = this.query;
      value = op ? value[op] : value;
      var cursorRequest = this.objectStore.index(column).openCursor(this.util.keyRange(value, op));
      return promise(function (res, rej) {
        cursorRequest.onsuccess = function (e) {
          var cursor = e.target.result;

          if (cursor) {
            if (_this.whereCheckerInstance.check(cursor.value)) {
              try {
                var cursorUpdateRequest = cursor.update(updateValue(query, cursor.value));

                cursorUpdateRequest.onsuccess = function () {
                  ++_this.rowAffected;
                  cursor.continue();
                };

                cursorUpdateRequest.onerror = rej;
              } catch (ex) {
                rej(ex);
              }
            } else {
              cursor.continue();
            }
          } else {
            res();
          }
        };

        cursorRequest.onerror = rej;
      });
    };

    update_Update.prototype.executeRegexLogic = function (column, exp) {
      var _this = this;

      var cursor;
      var cursorOpenRequest = this.objectStore.index(column).openCursor();

      this.shouldAddValue = function (cursor) {
        return exp.test(cursor.key) && _this.whereCheckerInstance.check(cursor.value);
      };

      return promise(function (res, rej) {
        cursorOpenRequest.onsuccess = function (e) {
          cursor = e.target.result;

          if (cursor) {
            if (_this.shouldAddValue(cursor)) {
              try {
                var cursorUpdateRequest = cursor.update(updateValue(_this.query, cursor.value));

                cursorUpdateRequest.onsuccess = function () {
                  ++_this.rowAffected;
                  cursor.continue();
                };

                cursorUpdateRequest.onerror = rej;
              } catch (ex) {
                rej(ex);
              }
            } else {
              cursor.continue();
            }
          } else {
            res();
          }
        };

        cursorOpenRequest.onerror = rej;
      });
    };

    update_Update.prototype.executeInLogic = function (column, values) {
      var _this = this;

      var columnStore = this.objectStore.index(column);
      var query = this.query;

      var runInLogic = function (value) {
        return promise(function (res, rej) {
          var cursorRequest = columnStore.openCursor(_this.util.keyRange(value));

          cursorRequest.onsuccess = function (e) {
            var cursor = e.target.result;

            if (cursor) {
              var value_1 = cursor.value;

              if (_this.whereCheckerInstance.check(value_1)) {
                try {
                  var cursorUpdateRequest = cursor.update(updateValue(query, value_1));

                  cursorUpdateRequest.onsuccess = function () {
                    ++_this.rowAffected;
                    cursor.continue();
                  };

                  cursorUpdateRequest.onerror = rej;
                } catch (ex) {
                  rej(ex);
                }
              } else {
                cursor.continue();
              }
            } else {
              res();
            }
          };

          cursorRequest.onerror = rej;
        });
      };

      return promiseAll(values.map(function (val) {
        return runInLogic(val);
      }));
    }; // CONCATENATED MODULE: ./src/worker/intersect/index.ts


    var intersect_extends = undefined && undefined.__extends || function () {
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

    var intersect_assign = undefined && undefined.__assign || function () {
      intersect_assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];

          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }

        return t;
      };

      return intersect_assign.apply(this, arguments);
    };

    var intersect_Intersect =
    /** @class */
    function (_super) {
      intersect_extends(Intersect, _super);

      function Intersect(intersectQry, util) {
        var _this = _super.call(this) || this;

        _this.query = intersectQry;
        _this.util = util;
        return _this;
      }

      Intersect.prototype.execute = function () {
        var _this = this;

        var intersectQry = this.query;
        var index = 0;
        var hashMap = {};
        var hashMapTemp = {};
        var isQueryForSameTable = true;
        var queries = intersectQry.queries;
        var queryLength = queries.length;
        queries.every(function (qry, i) {
          if (i + 1 < queryLength && qry.from !== queries[i + 1].from) {
            isQueryForSameTable = false;
            return false;
          }

          return true;
        });
        var getHashKey;

        if (isQueryForSameTable) {
          var pKey_1 = this.primaryKey(queries[0].from);

          getHashKey = function (val) {
            return val[pKey_1];
          };
        } else {
          getHashKey = function (val) {
            var columnValKey = "";

            for (var key in val) {
              columnValKey += val[key];
            }

            return columnValKey;
          };
        }

        var select;

        var fetchData = function () {
          if (index < queryLength) {
            select = new select_Select(queries[index], _this.util);
            return select.execute().then(function (selectResult) {
              hashMap = {};
              selectResult.forEach(function (val) {
                var columnValKey = getHashKey(val);

                if (index === 0) {
                  hashMapTemp[columnValKey] = val;
                } else if (hashMapTemp[columnValKey] != null) {
                  hashMap[columnValKey] = val;
                }
              });

              if (index > 0) {
                hashMapTemp = intersect_assign({}, hashMap);
              }

              ++index;
              return fetchData();
            });
          } else {
            var results_1 = [];
            var resultPusher = void 0;
            var skip_1 = intersectQry.skip;
            var limit_1 = intersectQry.limit;

            var onFinished = function () {
              select['results'] = results_1;
              Object.assign(select.query, {
                order: intersectQry.order,
                join: {}
              });
              select.processOrderBy();
              select.processGroupDistinctAggr();
              return select['results'];
            };

            var shouldStopLoop_1 = false;

            var pushResult_1 = function () {
              results_1.push(hashMap[key_1]);
            };

            var checkLimitAndPush_1 = function () {
              if (results_1.length < limit_1) {
                pushResult_1();
              } else {
                shouldStopLoop_1 = true;
              }
            };

            var skipChecker_1 = function (callBack) {
              if (skip_1 === 0) {
                callBack();
              } else {
                --skip_1;
              }
            };

            if (intersectQry.skip && intersectQry.limit) {
              resultPusher = function () {
                skipChecker_1(function () {
                  checkLimitAndPush_1();
                });
              };
            } else if (intersectQry.limit) {
              resultPusher = checkLimitAndPush_1;
            } else if (intersectQry.skip) {
              resultPusher = function () {
                skipChecker_1(function () {
                  pushResult_1();
                });
              };
            } else {
              resultPusher = function () {
                pushResult_1();
              };
            }

            if (limit_1) {
              for (var key_1 in hashMap) {
                resultPusher(key_1);

                if (shouldStopLoop_1) {
                  break;
                }
              }
            } else {
              for (key_1 in hashMap) {
                resultPusher(key_1);
              }
            }

            return onFinished();
          }
        };

        return fetchData();
      };

      return Intersect;
    }(base_Base); // CONCATENATED MODULE: ./src/worker/executors/drop_db.ts


    var drop_db_DropDb =
    /** @class */
    function () {
      function DropDb() {}

      DropDb.prototype.execute = function (dbName) {
        return promise(function (res, rej) {
          var dropDbRequest = indexedDB.deleteDatabase(dbName);

          dropDbRequest.onblocked = function () {
            var err = new log_helper_LogHelper(ERROR_TYPE.DbBlocked);
            return rej(getError(err));
          };

          dropDbRequest.onerror = function (e) {
            return rej(getError(e));
          };

          dropDbRequest.onsuccess = function () {
            res();
          };
        });
      };

      return DropDb;
    }(); // CONCATENATED MODULE: ./src/worker/union/index.ts


    var union_extends = undefined && undefined.__extends || function () {
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

    var union_Union =
    /** @class */
    function (_super) {
      union_extends(Union, _super);

      function Union(query, util) {
        var _this = _super.call(this) || this;

        _this.query = query;
        _this.util = util;
        return _this;
      }

      Union.prototype.execute = function () {
        var _this = this;

        var query = this.query;
        var index = 0;
        var hashMap = {};
        var isQueryForSameTable = true;
        var queryLength = query.length;
        query.every(function (qry, i) {
          if (i + 1 < queryLength && qry.from !== query[i + 1].from) {
            isQueryForSameTable = false;
            return false;
          }

          return true;
        });
        var getHashKey;

        if (isQueryForSameTable) {
          var pKey_1 = this.primaryKey(query[0].from);

          getHashKey = function (val) {
            return val[pKey_1];
          };
        } else {
          getHashKey = function (val) {
            var columnValKey = "";

            for (var key in val) {
              columnValKey += val[key];
            }

            return columnValKey;
          };
        }

        var select;

        var fetchData = function () {
          if (index < query.length) {
            select = new select_Select(query[index++], _this.util);
            return select.execute().then(function (selectResult) {
              selectResult.forEach(function (val) {
                hashMap[getHashKey(val)] = val;
              });
              return fetchData();
            });
          } else {
            var results = [];

            for (var key in hashMap) {
              results.push(hashMap[key]);
            }

            return results;
          }
        };

        return fetchData();
      };

      return Union;
    }(base_Base); // CONCATENATED MODULE: ./src/worker/executors/remove/not_where.ts


    // CONCATENATED MODULE: ./src/worker/executors/remove/index.ts
    var remove_extends = undefined && undefined.__extends || function () {
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

    var remove_Remove =
    /** @class */
    function (_super) {
      remove_extends(Remove, _super);

      function Remove(query, util) {
        var _this = _super.call(this) || this;

        _this.query = query;
        _this.util = util;
        _this.tableName = query.from;
        return _this;
      }

      Remove.prototype.execute = function (beforeExecute) {
        var _this = this;

        var queryHelper = new query_helper_QueryHelper(this.db);
        var query = this.query;
        var err = queryHelper.validate(API.Remove, query);
        if (err) return promiseReject(err);
        var pResult;
        return beforeExecute().then(function () {
          try {
            _this.initTransaction_();

            if (query.where != null) {
              if (isArray(query.where)) {
                pResult = _this.processWhereArrayQry();
              } else {
                pResult = _this.processWhere_();
              }
            } else {
              pResult = _this.executeWhereUndefinedLogic();
            }
          } catch (ex) {
            return _this.onException(ex);
          }

          return pResult.then(function () {
            return _this.rowAffected;
          });
        });
      };

      Remove.prototype.processWhereArrayQry = function () {
        var _this = this;

        var selectObject = new select_Select(this.query, this.util);
        selectObject.isTxQuery = this.isTxQuery;
        return selectObject.execute().then(function (results) {
          var _a, _b;

          var keyList = [];

          var pkey = _this.primaryKey(_this.query.from);

          results.forEach(function (item) {
            keyList.push(item[pkey]);
          });
          results = null;
          var whereQry = (_a = {}, _a[pkey] = (_b = {}, _b[QUERY_OPTION.In] = keyList, _b), _a);
          _this.query[QUERY_OPTION.Where] = whereQry;
          return _this.processWhere_();
        });
      };

      Remove.prototype.processWhere_ = function () {
        var _this = this;

        if (this.query.where.or) {
          this.processOrLogic();
        }

        return this.goToWhereLogic().then(function () {
          return _this.onWhereEvaluated();
        });
      };

      Remove.prototype.initTransaction_ = function () {
        if (!this.isTxQuery) {
          this.util.createTransaction([this.query.from]);
        }

        this.objectStore = this.util.objectStore(this.query.from);
      };

      Remove.prototype.onWhereEvaluated = function () {
        if (this.isOr) {
          return this.orQuerySuccess_();
        }
      };

      Remove.prototype.orQuerySuccess_ = function () {
        var _this = this;

        var key = getObjectFirstKey(this._orInfo.OrQuery);

        if (key != null) {
          var where = {};
          where[key] = this._orInfo.OrQuery[key];
          delete this._orInfo.OrQuery[key];
          this.query.where = where;
          return this.goToWhereLogic().then(function () {
            return _this.onWhereEvaluated();
          });
        } else {
          this.isOr = true;
        }
      };

      Remove.prototype.processOrLogic = function () {
        this.isOr = true;
        var where = this.query.where;
        this._orInfo = {
          OrQuery: where.or
        }; // free or memory

        delete where.or;
      };

      return Remove;
    }(base_fetch_BaseFetch);

    remove_Remove.prototype.executeInLogic = function (column, values) {
      var _this = this;

      var columnIndex = this.objectStore.index(column);

      var runInLogic = function (value) {
        return promise(function (res, rej) {
          var cursorRequest = columnIndex.openCursor(_this.util.keyRange(value));

          cursorRequest.onsuccess = function (e) {
            var cursor = e.target.result;

            if (cursor) {
              if (_this.whereCheckerInstance.check(cursor.value)) {
                cursor.delete();
                ++_this.rowAffected;
              }

              cursor.continue();
            } else {
              res();
            }
          };

          cursorRequest.onerror = rej;
        });
      };

      return promiseAll(values.map(function (val) {
        return runInLogic(val);
      }));
    };

    remove_Remove.prototype.executeWhereUndefinedLogic = function () {
      var _this = this;

      var cursor;
      var cursorRequest = this.objectStore.openCursor();
      return promise(function (res, rej) {
        cursorRequest.onsuccess = function (e) {
          cursor = e.target.result;

          if (cursor) {
            cursor.delete();
            ++_this.rowAffected;
            cursor.continue();
          } else {
            res();
          }
        };

        cursorRequest.onerror = rej;
      });
    };

    remove_Remove.prototype.executeWhereLogic = function (column, value, op) {
      var _this = this;

      var cursor, cursorRequest;
      value = op ? value[op] : value;
      cursorRequest = this.objectStore.index(column).openCursor(this.util.keyRange(value, op));
      return promise(function (res, rej) {
        cursorRequest.onsuccess = function (e) {
          cursor = e.target.result;

          if (cursor) {
            if (_this.whereCheckerInstance.check(cursor.value)) {
              cursor.delete();
              ++_this.rowAffected;
            }

            cursor.continue();
          } else {
            res();
          }
        };

        cursorRequest.onerror = rej;
      });
    };

    remove_Remove.prototype.executeRegexLogic = function (column, exp) {
      var _this = this;

      var cursor;
      var cursorRequest = this.objectStore.index(column).openCursor();

      this.shouldAddValue = function (cursor) {
        return exp.test(cursor.key) && _this.whereCheckerInstance.check(cursor.value);
      };

      return promise(function (res, rej) {
        cursorRequest.onsuccess = function (e) {
          cursor = e.target.result;

          if (cursor) {
            if (_this.shouldAddValue(cursor)) {
              cursor.delete();
              ++_this.rowAffected;
            }

            cursor.continue();
          } else {
            res();
          }
        };

        cursorRequest.onerror = rej;
      });
    }; // CONCATENATED MODULE: ./src/worker/executors/clear/index.ts


    var clear_extends = undefined && undefined.__extends || function () {
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

    var clear_Clear =
    /** @class */
    function (_super) {
      clear_extends(Clear, _super);

      function Clear(tableName, util) {
        var _this = _super.call(this) || this;

        _this.query = tableName;
        _this.util = util;
        _this.tableName = tableName;
        return _this;
      }

      Clear.prototype.execute = function (beforeExecute) {
        var _this = this;

        var tableName = this.query;

        if (!this.isTxQuery) {
          this.util.createTransaction([tableName, meta_helper_MetaHelper.tableName]);
        }

        return beforeExecute().then(function () {
          var clearRequest = _this.util.objectStore(tableName).clear();

          try {
            return promise(function (res, rej) {
              clearRequest.onsuccess = function () {
                var currentTable = _this.table(tableName);

                for (var columnName in currentTable.autoIncColumnValue) {
                  currentTable.autoIncColumnValue[columnName] = 0;
                }

                meta_helper_MetaHelper.set(meta_helper_MetaHelper.dbSchema, _this.util.db, _this.util).then(function () {
                  res();
                }).catch(rej);
              };

              clearRequest.onerror = rej;
            });
          } catch (ex) {
            return _this.onException(ex);
          }
        });
      };

      return Clear;
    }(base_Base); // CONCATENATED MODULE: ./src/worker/executors/transaction/index.ts


    var transaction_extends = undefined && undefined.__extends || function () {
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

    var transaction_Transaction =
    /** @class */
    function (_super) {
      transaction_extends(Transaction, _super);

      function Transaction(qry, util) {
        var _this = _super.call(this) || this;

        _this.results = {};
        _this.reqQueue = [];
        _this.isQueryExecuting = false;
        _this.isTxStarted_ = false;
        _this.query = qry;
        _this.util = util;
        return _this;
      }

      Transaction.prototype.execute = function (cb) {
        var _this = this;

        this.beforeExecute = cb;
        var err = this.validate();
        if (err) return promiseReject(err);
        this.startExecution_();
        return promise(function (res, rej) {
          _this.onSuccess = res;
          _this.onError = rej;
        }).then(function (result) {
          _this.beforeExecute = null;

          _this.log("transaction finished");

          return result;
        });
      };

      Transaction.prototype.validate = function () {
        var query = this.query;
        var notExistingTable = this.notExistingTable_(query.tables);

        if (notExistingTable) {
          return new log_helper_LogHelper(ERROR_TYPE.TableNotExist, {
            tableName: notExistingTable
          });
        }

        var methodName = query.method;
        var txLogic = variableFromPath(methodName);

        if (!txLogic) {
          return new log_helper_LogHelper(ERROR_TYPE.MethodNotExist, methodName);
        }
      };

      Transaction.prototype.startExecution_ = function () {
        var _this = this;

        var query = this.query;

        var select = function (qry) {
          return _this.pushReq_({
            name: API.Select,
            query: qry
          });
        };

        var insert = function (qry) {
          return _this.pushReq_({
            name: API.Insert,
            query: qry
          });
        };

        var update = function (qry) {
          return _this.pushReq_({
            name: API.Update,
            query: qry
          });
        };

        var remove = function (qry) {
          return _this.pushReq_({
            name: API.Remove,
            query: qry
          });
        };

        var count = function (qry) {
          return _this.pushReq_({
            name: API.Count,
            query: qry
          });
        };

        var methodName = query.method;
        var txLogic = variableFromPath(methodName);
        this.log("transaction query started");
        return txLogic.call(this, {
          data: query.data,
          insert: insert,
          select: select,
          update: update,
          remove: remove,
          count: count,
          setResult: function (key, value) {
            _this.results[key] = value;
          },
          getResult: function (key) {
            return _this.results[key];
          },
          abort: function (msg) {
            _this.abortTx_(msg);
          },
          start: function () {
            _this.startTx_();
          }
        });
      };

      Transaction.prototype.log = function (message) {
        this.util.logger.log(message);
      };

      Transaction.prototype.startTx_ = function () {
        var _this = this;

        try {
          this.isTxStarted_ = true;
          var tableNames = this.query.tables;
          tableNames = tableNames.concat(meta_helper_MetaHelper.tableName);
          this.util.createTransaction(tableNames).then(function () {
            _this.onSuccess(_this.results);
          }).catch(function (err) {
            _this.onError(err);
          });
          return this.processExecutionOfQry_();
        } catch (ex) {
          this.onError(this.onException(ex));
        }
      };

      Transaction.prototype.onReqFinished_ = function (result) {
        var finisehdRequest = this.reqQueue.shift();
        this.log("finished request : " + finisehdRequest.name + " ");

        if (finisehdRequest) {
          if (result.error) {
            this.abortTx_("automatic abort of transaction due to error occured");
            this.log("transaction aborted due to error occured");
            this.onError(result.error);
          } else {
            this.isQueryExecuting = false;

            if (finisehdRequest.onSuccess) {
              finisehdRequest.onSuccess(result);
            }

            this.processExecutionOfQry_();
          }
        }
      };

      Transaction.prototype.abortTx_ = function (msg) {
        this.reqQueue = [];
        this.util.abortTransaction();
        this.log("transaction aborted. Msg : " + msg);
      };

      Transaction.prototype.executeRequest_ = function (request) {
        this.isQueryExecuting = true;
        var requestObj;
        this.log("executing request : " + request.name + " ");
        var onReqFinished = this.onReqFinished_.bind(this);
        var query = request.query;

        switch (request.name) {
          case API.Select:
            requestObj = new select_Select(query, this.util);
            break;

          case API.Insert:
            requestObj = new insert_Insert(query, this.util);
            break;

          case API.Update:
            requestObj = new update_Update(query, this.util);
            break;

          case API.Remove:
            requestObj = new remove_Remove(query, this.util);
            break;

          case API.Count:
            requestObj = new count_Count(query, this.util);
            break;
        }

        requestObj.isTxQuery = true;
        requestObj.execute(this.beforeExecute).then(onReqFinished).catch(function (err) {
          onReqFinished({
            error: err
          });
        });
      };

      Transaction.prototype.pushReq_ = function (request) {
        var _this = this;

        var push = function () {
          _this.reqQueue.push(request);
        };

        var promiseObj = promise(function (resolve, reject) {
          request.onSuccess = function (result) {
            resolve(result);
          };

          request.onError = function (error) {
            reject(error);
          };
        });

        if (this.isTxStarted_ === true) {
          push();
          this.processExecutionOfQry_();
        } else {
          push();
        }

        this.log("request pushed : " + request.name);
        return promiseObj;
      };

      Transaction.prototype.processExecutionOfQry_ = function () {
        if (this.isQueryExecuting === false) {
          if (this.reqQueue.length > 0) {
            this.executeRequest_(this.reqQueue[0]);
          }
        }
      };

      Transaction.prototype.notExistingTable_ = function (tables) {
        var _this = this;

        var invalidTable = null;
        tables.every(function (tableName) {
          var table = _this.table(tableName);

          if (table == null) {
            invalidTable = tableName;
            return false;
          }

          return true;
        });
        return invalidTable;
      };

      return Transaction;
    }(base_Base); // CONCATENATED MODULE: ./src/worker/utils/db_schema.ts


    var userDbSchema = function (db) {
      var database = {
        name: db.name,
        version: db.version,
        tables: []
      };
      db.tables.forEach(function (table) {
        var tableAsObj = {
          name: table.name,
          columns: {}
        };
        table.columns.forEach(function (column) {
          tableAsObj.columns[column.name] = column;
        });
        database.tables.push(tableAsObj);
      });
      return database;
    }; // CONCATENATED MODULE: ./src/worker/query_manager.ts


    var query_manager_QueryManager =
    /** @class */
    function () {
      function QueryManager(fn) {
        this.middlewares = [];
        this.util = new idbutil_IDBUtil();
        this.onQryFinished = IS_WORKER ? function (result) {
          self.postMessage(result);
        } : fn;
      }

      Object.defineProperty(QueryManager.prototype, "db", {
        get: function () {
          return this.util.db;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(QueryManager.prototype, "logger", {
        get: function () {
          return this.util.logger;
        },
        enumerable: false,
        configurable: true
      });

      QueryManager.prototype.executeMiddleware_ = function (request) {
        var _this = this;

        var lastIndex = getLength(this.middlewares) - 1;

        if (lastIndex < 0) {
          return promiseResolve();
        }

        var middlewareContext = {};
        var db = this.db;
        Object.defineProperty(middlewareContext, 'database', {
          get: function () {
            return userDbSchema(db);
          }
        });
        return promise(function (res) {
          var index = 0;

          var callNextMiddleware = function () {
            if (index <= lastIndex) {
              var promiseResult = variableFromPath(_this.middlewares[index++])(request, middlewareContext);

              if (!promiseResult || !promiseResult.then) {
                promiseResult = Promise.resolve(promiseResult);
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

      QueryManager.prototype.executeQuery = function (request, cb) {
        var queryResult;
        var query = request.query;

        switch (request.name) {
          case API.OpenDb:
            cb();
            queryResult = this.openDb(query);
            break;

          case API.InitDb:
            cb();
            queryResult = this.initDb(query);
            break;

          case API.CloseDb:
            cb();
            queryResult = this.closeDb();
            break;

          case API.Insert:
            queryResult = new insert_Insert(query, this.util).execute(cb);
            break;

          case API.Select:
            queryResult = new select_Select(query, this.util).execute(cb);
            break;

          case API.Count:
            queryResult = new count_Count(query, this.util).execute(cb);
            break;

          case API.Update:
            queryResult = new update_Update(query, this.util).execute(cb);
            break;

          case API.Intersect:
            cb();
            queryResult = new intersect_Intersect(query, this.util).execute();
            break;

          case API.DropDb:
            cb();
            queryResult = this.dropDb();
            break;

          case API.Terminate:
            cb();
            queryResult = this.terminate();
            break;

          case API.Union:
            cb();
            queryResult = new union_Union(query, this.util).execute();
            break;

          case API.Remove:
            queryResult = new remove_Remove(query, this.util).execute(cb);
            break;

          case API.Clear:
            queryResult = new clear_Clear(query, this.util).execute(cb);
            break;

          case API.Transaction:
            queryResult = new transaction_Transaction(query, this.util).execute(cb);
            break;

          case API.Get:
            cb();
            queryResult = meta_helper_MetaHelper.get(query, this.util);
            break;

          case API.Set:
            cb();
            queryResult = meta_helper_MetaHelper.set(query.key, query.value, this.util);
            break;

          case API.ImportScripts:
            cb();
            queryResult = this.importScripts_(request);
            break;

          case API.ChangeLogStatus:
            cb();
            this.logger.status = query;
            queryResult = Promise.resolve();
            break;

          case API.Middleware:
            cb();
            var value = variableFromPath(query);

            if (!value) {
              return promiseReject(new log_helper_LogHelper(ERROR_TYPE.InvalidMiddleware, query));
            }

            this.middlewares.push(query);
            return promiseResolve();

          default:
            console.error('The Api:-' + request.name + ' does not support.');
            queryResult = promiseResolve();
        }

        this.logger.log("Executing query " + request.name + " in web worker");
        return queryResult;
      };

      QueryManager.prototype.callResultMiddleware = function (middlewares, result) {
        return promise(function (res) {
          var index = 0;
          var lastIndex = getLength(middlewares) - 1;

          var callNextMiddleware = function () {
            if (index <= lastIndex) {
              var promiseResult = middlewares[index++](result);

              if (!(promiseResult instanceof Promise)) {
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

      QueryManager.prototype.callBeforeMiddleware = function (middlewares) {
        return promise(function (res) {
          var index = 0;
          var lastIndex = getLength(middlewares) - 1;

          var callNextMiddleware = function () {
            if (index <= lastIndex) {
              var promiseResult = middlewares[index++]();

              if (!(promiseResult instanceof Promise)) {
                promiseResult = promiseResolve(promiseResult);
              }

              promiseResult.then(callNextMiddleware);
            } else {
              res();
            }
          };

          callNextMiddleware();
        });
      };

      QueryManager.prototype.run = function (request) {
        var _this = this;

        var onResultCallback = [];
        var beforeExecuteCallback = [];

        request.onResult = function (cb) {
          onResultCallback.push(function (result) {
            return cb(result);
          });
        };

        request.beforeExecute = function (cb) {
          beforeExecuteCallback.push(function (result) {
            return cb(result);
          });
        };

        this.executeMiddleware_(request).then(function () {
          return _this.executeQuery(request, function () {
            return _this.callBeforeMiddleware(beforeExecuteCallback);
          }).then(function (result) {
            return _this.callResultMiddleware(onResultCallback, result).then(function (modifiedResult) {
              _this.returnResult_({
                result: modifiedResult
              });
            });
          });
        }).catch(function (ex) {
          onResultCallback = [];
          var err = getError(ex);

          _this.returnResult_({
            error: err
          });
        });
      };

      QueryManager.prototype.importScripts_ = function (request) {
        return promise(function (res, rej) {
          try {
            importScripts.apply(void 0, request.query);
            res();
          } catch (e) {
            var err = new log_helper_LogHelper(ERROR_TYPE.ImportScriptsFailed, e.message);
            rej(err);
          }
        });
      };

      QueryManager.prototype.returnResult_ = function (result) {
        this.logger.log("Query finished inside web worker");

        if (this.util) {
          this.util.emptyTx();
        }

        this.onQryFinished(result);
      };

      QueryManager.prototype.dropDb = function () {
        var dbName = this.db.name;
        return this.terminate().then(function () {
          return new drop_db_DropDb().execute(dbName);
        });
      };

      QueryManager.prototype.closeDb = function () {
        return this.util.close();
      };

      QueryManager.prototype.terminate = function () {
        var _this = this;

        return this.closeDb().then(function () {
          _this.util.db = null;
        });
      };

      QueryManager.prototype.openDb = function (query) {
        var _this = this;

        return this.closeDb().then(function () {
          var pResult;

          if (_this.db && query.name === _this.db.name) {
            pResult = _this.initDb();
          } else {
            pResult = _this.initDb({
              name: query.name,
              tables: [],
              version: query.version
            });
          }

          return pResult.then(function () {
            return _this.db;
          });
        });
      };

      QueryManager.prototype.initDb = function (dataBase) {
        var _this = this;

        if (!IS_IDB_SUPPORTED) {
          return promiseReject(new log_helper_LogHelper(ERROR_TYPE.IndexedDbNotSupported));
        }

        var dbMeta = dataBase ? new db_meta_DbMeta(dataBase) : this.db;
        this.util = new idbutil_IDBUtil();
        return promise(function (res, rej) {
          _this.util.initDb(dbMeta).then(function (dbInfo) {
            if (dbInfo.isCreated) {
              meta_helper_MetaHelper.get(meta_helper_MetaHelper.dbSchema, _this.util).then(function (value) {
                if (value) {
                  value.tables.forEach(function (table, index) {
                    var targetTable = dbMeta.tables[index];

                    if (targetTable) {
                      targetTable.autoIncColumnValue = table.autoIncColumnValue;
                    }
                  });
                }

                _this.util.db = dbMeta;
                dbInfo.database = userDbSchema(_this.db);
                meta_helper_MetaHelper.set(meta_helper_MetaHelper.dbSchema, dbMeta, _this.util).then(function () {
                  res(dbInfo);
                });
              });
            } else {
              meta_helper_MetaHelper.get(meta_helper_MetaHelper.dbSchema, _this.util).then(function (value) {
                _this.util.db = value;
                dbInfo.database = userDbSchema(_this.db);
                res(dbInfo);
              });
            }
          }).catch(rej);
        });
      };

      return QueryManager;
    }(); // CONCATENATED MODULE: ./src/worker/index.ts


    if (IS_WORKER) {
      var manager_1 = new query_manager_QueryManager();

      self.onmessage = function (e) {
        manager_1.run(e.data);
      };
    }
    /***/

  }
  /******/

});