import { DynamicMiddleware } from './dynamic.middleware';

describe('DynamicMiddleware', () => {
  let dm, handler, m1, app, mockResponse;

  describe('wraps a normal middleware function and', () => {
    it('forward all requests to it', () => {
      handler(null, mockResponse, null);

      expect(mockResponse.invocations[0]).toEqual('1');
    });

    it('allow it to be disabled during runtime', () => {
      dm.disable();

      handler(null, mockResponse, null);

      expect(mockResponse.statusCode).toEqual(404);
    });

    it('allow it to be enabled during runtime', () => {
      dm.disable();

      handler(null, mockResponse, null);
      try {
        dm._init(1);
      } catch (e) {
        expect(e.message).toEqual(
          'invalid middleware argument, must be a function or an array of functions or an array of loadbalance weighted entries'
        );
      }

      expect(mockResponse.statusCode).toEqual(404);

      dm.enable();

      handler(null, mockResponse, null);

      expect(mockResponse.statusCode).toEqual(200);
    });

    it('allow it to be replaced during runtime', () => {
      dm.replace((req, res) => {
        res.end('2');
      });

      handler(null, mockResponse, null);

      expect(mockResponse.invocations[0]).toEqual('2');
    });

    beforeEach(() => {
      dm = new DynamicMiddleware(m1);

      handler = dm.handler();
    });
  });

  it('wraps an error middleware', done => {
    const error = {};
    const errorDm = new DynamicMiddleware(err => {
      expect(error).toEqual(err);
      done();
    });

    const errorHandler = errorDm.errorHandler();
    errorHandler(error, {}, {}, done);
  });

  beforeEach(() => {
    m1 = (req, res) => {
      res.statusCode = 200;
      res.end('1');
    };

    app = new App();

    mockResponse = new Response();
  });
});

function App() {
  this.stack = [];
}

App.prototype.use = function(route, fn) {
  this.stack.push({ route, handle: fn });
};

function Response() {
  this.invocations = [];
  this.statusCode = undefined;
}

Response.prototype.end = function(v) {
  this.invocations.push(v);
};
