import { Request, Response } from "express"
import { getDb } from "../db"
import { ObjectId } from "mongodb"

const COLLECTION = 'job'

export async function createJob(req: Request, res: Response) {
    const db = getDb()

    const job = {
        ...req.body,
        consultant: new ObjectId(req.user!.id),
        createdAt: new Date()
    }

    const result = await db.collection(COLLECTION).insertOne(job)
    res.json({...job, _id: result.insertedId})
}


export async function getMyJobs(req: Request, res: Response) {
    const db = getDb()
    const jobs = await db.collection(COLLECTION)
                            .find({consultant: new ObjectId(req.user!.id)})
                            .toArray()
    res.json(jobs)
}


export async function getAllJobs(req: Request, res: Response) {
    const db = getDb()

    const jobs = await db.collection('jobs').find({}).toArray()

    res.json(jobs)
}


export async function updateJob(req: Request, res: Response) {
    const db = getDb()
    const id = req.params.id

    await db.collection(COLLECTION).updateOne(
        {_id: new ObjectId(id)},
        {$set: req.body}
    )

    const updated = await db.collection(COLLECTION).findOne({"_id": new ObjectId(id)})

    res.json(updated)
}


export async function deleteJob(req: Request, res: Response) {
    const db = getDb()
    const id = req.params.id

    await db.collection(COLLECTION).deleteOne({"_id": new ObjectId(id)})

    res.sendStatus(204)
}