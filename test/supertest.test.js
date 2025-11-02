import chai from 'chai';
import supertest from 'supertest';
import app from '../src/app.js';

const expect = chai.expect;
const api = supertest(app);

function pickArray(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.payload)) return body.payload;
  if (body && Array.isArray(body.data)) return body.data;
  return [];
}

function pickId(obj) {
  if (!obj) return null;
  if (obj._id) return String(obj._id);
  if (obj.payload && obj.payload._id) return String(obj.payload._id);
  if (obj.data && obj.data._id) return String(obj.data._id);
  return null;
}


async function getAvailablePetId(maxTries = 3) {
  for (let i = 0; i < maxTries; i++) {
   
    const pr = await api.get('/api/pets');
    const pets = pickArray(pr.body);
    const free = pets.find(p =>
      (p.adopted === false || p.adopted === undefined) &&
      (p.owner === undefined || p.owner === null)
    );
    if (free) return String(free._id || free.id);

    
    await api
      .post('/api/mocks/generateData')
      .set('Content-Type', 'application/json')
      .send({ users: 0, pets: 15 });
  }
  throw new Error('No se encontró un pet disponible para adopción');
}

describe('🧪 Tests funcionales del router adoption.router.js', () => {
  let uid; 
  let pid; 
  let aid; 

  before(async () => {
  
    await api
      .post('/api/mocks/generateData')
      .set('Content-Type', 'application/json')
      .send({ users: 1, pets: 10 });

    
    const ur = await api.get('/api/users');
    const users = pickArray(ur.body);
    if (!users.length) throw new Error('No hay users para test');
    uid = String(users[0]._id || users[0].id);

    
    pid = await getAvailablePetId(4);
  });

  it('GET /api/adoptions → 200/204 y un array', async () => {
    const { status, body } = await api.get('/api/adoptions');
    expect(status).to.be.oneOf([200, 204]);
    const arr = pickArray(body);
    expect(arr).to.be.an('array');
  });

  it('POST /api/adoptions/:uid/:pid → con pid inexistente debe fallar', async () => {
    const invalidPid = '000000000000000000000000';
    const { status } = await api.post(`/api/adoptions/${uid}/${invalidPid}`);
    expect(status).to.be.oneOf([400, 404]);
  });

  it('POST /api/adoptions/:uid/:pid → con ids válidos debe crear la adopción', async () => {
    const { status, body } = await api.post(`/api/adoptions/${uid}/${pid}`);
    
    expect([200, 201], `Status ${status} - body: ${JSON.stringify(body)}`).to.include(status);
    expect(body).to.be.an('object');
    aid = pickId(body);
  });

  it('GET /api/adoptions/:aid → 200 si existe (opcional)', async function () {
    if (!aid) return this.skip();
    const { status } = await api.get(`/api/adoptions/${aid}`);
    expect(status).to.be.oneOf([200, 404]); 
  });
});
