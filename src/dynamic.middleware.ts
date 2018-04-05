export class DynamicMiddleware {
  private _disabled: boolean;
  private _middleware;
  constructor(middleware?) {
    if (middleware) {
      this._init(middleware);
      this._disabled = false;
    }
  }

  /**
   * create a handler that can be used by express/connect
   *
   * @returns {(req, res, next) => any} a connect/express middleware
   */
  handler() {

    return (req, res, next) => {
      if (this._disabled) {
        res.statusCode = 404;
        return res.end();
      }

      this._middleware(req, res, next);
    };
  }

  errorHandler() {
    return (err, req, res, next) => {
      if (this._disabled) {
        res.statusCode = 404;
        return res.end();
      }

      this._middleware(err, req, res, next);
    };
  }

  /**
   * disable this middleware, once disable it will respond to requests with 404 status code
   */
  disable() {
    this._disabled = true;
  }

  /**
   * enable this middleware
   */
  enable() {
    this._disabled = false;
  }

  /**
   * replace the underlying middleware with something else
   */
  replace(middleware) {
    this._init(middleware);
  }

  _init(middleware) {

    // non empty constructor with a single middleware without weights
    if (typeof(middleware) !== 'function') {
      throw new Error('invalid middleware argument, must be a function or an array of functions or an array of loadbalance weighted entries');
    }

    this._middleware = middleware;
  }
}
