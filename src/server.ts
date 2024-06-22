import express from 'express'
import cors from 'cors'

const app = express();

import { TUser } from "@/types/schema.js";

const db = {
  users: [
    {
      id: '123',
      name: 'Jhon',
      email: 'jhon@gmail.com',
      password: 'cookies',
      entries: 1,
      date: new Date(),
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'bananas',
      entries: 0,
      date: new Date(),
    },
  ],
};

// app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use(express.json());

app.get('/', (req: any, res: any) => {
  res.json(db.users);
});

app.post('/signin', (req: any, res: any) => {
  if (
    req.body.email === db.users[0].email &&
    req.body.password === db.users[0].password
  ) {
    res.json(db.users[0]);
  } else {
    res.status(400).json('error logging in');
  }
});

app.post('/register', (req: any, res: any) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existingUser = db.users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  try {
    const id = db.users.length.toString();
    const newUser: TUser = {
      id,
      name,
      email,
      password,
      entries: 0,
      date: new Date(),
    };
    db.users.push(newUser);
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/profile/:id', (req: any, res: any) => {
  const { id } = req.params;
  let found = false;
  db.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(404).json('user not found');
  }
});

app.put('/image', (req: any, res: any) => {
  const { id } = req.body;
  let found = false;
  db.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(404).json('user not found');
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001: http://localhost:3001/');
});