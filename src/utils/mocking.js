
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;


export async function generateMockUsers(count = 50) {
  const hashed = await bcrypt.hash('coder123', SALT_ROUNDS);
  const users = [];

  for (let i = 0; i < count; i++) {
    const _id = new mongoose.Types.ObjectId();
    const first = faker.person.firstName();
    const last  = faker.person.lastName();

    const local = faker.internet.email({ firstName: first, lastName: last }).split('@')[0];

    users.push({
      _id,
      first_name: first,
      last_name: last,
      email: `${local}+${_id}@example.com`,
      age: faker.number.int({ min: 18, max: 80 }),
      password: hashed,                           
      role: Math.random() < 0.15 ? 'admin' : 'user',
      pets: [],                                     
    });
  }
  return users;
}


 
export function generateMockPets(count = 100) {
  const species = ['dog', 'cat', 'bird', 'rabbit', 'hamster'];
  return Array.from({ length: count }).map(() => ({
    _id: new mongoose.Types.ObjectId(),
    name: faker.person.firstName(),
    specie: faker.helpers.arrayElement(species),
    adopted: faker.datatype.boolean(),
    __v: 0
  }));
}
