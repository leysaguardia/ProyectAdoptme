

import { Router } from 'express';
import mongoose from 'mongoose';

import { generateMockUsers, generateMockPets } from '../utils/mocking.js';

import UserModel from '../dao/models/User.js';
import PetModel  from '../dao/models/Pet.js';


const router = Router();



router.get('/mockingpets', (req, res) => {
  const count = Number(req.query.count) || 100;
  const pets = generateMockPets(count);
  return res.json({ status: 'success', count: pets.length, payload: pets });
});


router.get('/mockingusers', async (req, res, next) => {
  try {
    const count = Number(req.query.count) || 50;
    const users = await generateMockUsers(count);
    return res.json({ status: 'success', count: users.length, payload: users });
  } catch (err) { next(err); }
});


router.post('/generateData', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const usersCount = Number(req.body?.users) || 0;
    const petsCount  = Number(req.body?.pets)  || 0;


    const usersMock = usersCount > 0 ? await generateMockUsers(usersCount) : [];
    const petsMock  = petsCount  > 0 ? generateMockPets(petsCount) : [];

  
    const insertedUsers = usersMock.length
      ? await UserModel.insertMany(usersMock.map(u => ({
          _id: u._id,
          first_name: u.first_name,
          last_name:  u.last_name,
          email:      u.email,
          age:        u.age,
          password:   u.password,
          role:       u.role,
          pets:       []
        })), { session })
      : [];

 
    const userIds = insertedUsers.map(u => u._id);
    const petsReady = petsMock.map(p => ({
      _id: p._id,
      name: p.name,
      specie: p.specie,
      adopted: p.adopted,
      owner: userIds.length && Math.random() < 0.5
        ? userIds[Math.floor(Math.random() * userIds.length)]
        : undefined
    }));

    const insertedPets = petsReady.length
      ? await PetModel.insertMany(petsReady, { session })
      : [];

    
    const bucket = new Map();
    for (const pet of insertedPets) {
      if (pet.owner) {
        const k = String(pet.owner);
        if (!bucket.has(k)) bucket.set(k, []);
        bucket.get(k).push(pet._id);
      }
    }
    for (const [ownerId, petIds] of bucket.entries()) {
      await UserModel.updateOne(
        { _id: ownerId },
        { $push: { pets: { $each: petIds } } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      status: 'success',
      inserted: { users: insertedUsers.length, pets: insertedPets.length }
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
});


export default router;

