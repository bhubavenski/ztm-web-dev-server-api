import express from 'express';
import cors from 'cors';
import knex from 'knex';
const app = express();

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'smart-brain',
  },
});

import { TUser } from '@/types/schema.js';

app.use(cors());

app.use(express.json());

app.get('/', async (req, res) => {
  const users = await db('users').select('*');
  res.json(users);
});

app.post('/signin', (req, res) => {
  if (
    req.body.email === db.users[0].email &&
    req.body.password === db.users[0].password
  ) {
    res.json(db.users[0]);
  } else {
    res.status(400).json('error logging in');
  }
});

app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existingUser = await db('users').select('*').where('email','=',email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const newUser: TUser = {
    name,
    email,
    joined: new Date(),
  };
  db('users')
    .returning('*')
    .insert(newUser)
    .then((resp) => res.json(resp as unknown as TUser))
    .catch((err) => res.status(400).json(err));
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db
    .select('*')
    .from('users')
    .where({ id })
    .then((user: TUser[]) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('Not found');
      }
    })
    .catch((err) => res.status(400).json('error getting user'));
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries)=>res.json(entries[0].entries)).catch((err)=>res.status(400).json('unable to get entries'));
});

app.listen(3001, () => {
  console.log('Server is running on port 3001: http://localhost:3001/');
});
