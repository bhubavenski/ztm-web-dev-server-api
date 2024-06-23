import express from 'express';
import cors from 'cors';
import knex from 'knex';
import bcrypt from 'bcrypt';
import { TUser } from '@/types/schema.js';

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

app.use(cors());

app.use(express.json());

app.get('/', async (req, res) => {
  const users = await db('users').select('*');
  res.json(users);
});

app.post('/signin', (req, res) => {
  db.select('email', 'hash')
    .from('login')
    .where('email', '=', req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', req.body.email)
          .then((user) => {
            return res.json(user[0]);
          })
          .catch((err) => res.status(400).json('unable to get user'));
      } else {
        res.status(400).json('wrong credentials');
      }
    })
    .catch((err) => res.status(400).json('wrong credentials'));
});

app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const existingUser = await db('users').select('*').where('email', '=', email);

  if (existingUser[0]) {
    return res.status(409).json('Email already in use');
  }

  const hash = bcrypt.hashSync(password, 10);

  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then((loginEmail) => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json('unable to register'));
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*')
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
    .then((entries) => res.json(entries[0].entries))
    .catch((err) => res.status(400).json('unable to get entries'));
});

app.listen(3001, () => {
  console.log('Server is running on port 3001: http://localhost:3001/');
});
