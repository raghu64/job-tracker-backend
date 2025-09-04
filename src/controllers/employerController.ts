import { Request, Response } from "express";
import { getDb } from "../db";
import { ObjectId } from "mongodb";

const COLLECTION = "employer";

export async function createEmployer(req: Request, res: Response) {
  const db = getDb();

  const employer = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(employer);
  res.status(201).json({ ...employer, _id: result.insertedId });
}

export async function getAllEmployers(req: Request, res: Response) {
  const db = getDb();
  const employers = await db.collection(COLLECTION).find({}).toArray();
  res.json(employers);
}

export async function getEmployerById(req: Request, res: Response) {
  const db = getDb();
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid employer ID" });
  }

  const employer = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });

  if (!employer) {
    return res.status(404).json({ message: "Employer not found" });
  }

  res.json(employer);
}

export async function updateEmployer(req: Request, res: Response) {
  const db = getDb();
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid employer ID" });
  }

  await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...req.body, updatedAt: new Date() } }
  );

  const updatedEmployer = await db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });

  if (!updatedEmployer) {
    return res.status(404).json({ message: "Employer not found" });
  }

  res.json(updatedEmployer);
}

export async function deleteEmployer(req: Request, res: Response) {
  const db = getDb();
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid employer ID" });
  }

  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Employer not found" });
  }

  res.sendStatus(204);
}
