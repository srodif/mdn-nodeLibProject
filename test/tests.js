const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app.js'); // Replace with the actual path to your Express app file

const expect = chai.expect;

chai.use(chaiHttp);

describe('/status route', () => {
  it('should return JSON with status "healthy"', (done) => {
    chai
      .request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status').that.equals('healthy');
        done();
      });
  });
});
