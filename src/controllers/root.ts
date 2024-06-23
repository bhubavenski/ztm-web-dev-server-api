import { Request, Response } from "express";
import knex from "knex";

export const rootHandler = (db: knex.Knex<any, unknown[]>) => async (req: Request, res: Response) => {
  const users = await db('users').select('*');
  res.json(users);
};
