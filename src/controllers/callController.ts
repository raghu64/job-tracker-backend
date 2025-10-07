import type { Request, Response } from "express"
import { getDb } from "../db.js"
import { ObjectId } from "mongodb"

const COLLECTION = 'call'

export async function createCall(req: Request, res: Response) {
    const db = getDb()

    const call = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const result = await db.collection(COLLECTION).insertOne(call)
    res.json({...call, _id: result.insertedId})
}

export async function getAllCalls(req: Request, res: Response) {
    const db = getDb()

    const calls = await db.collection(COLLECTION).find({}).toArray()

    res.json(calls)
}


export async function updateCall(req: Request, res: Response) {
    const db = getDb()
    const id = req.params.id
    console.log("updating call with id : ", id)

    delete req.body._id
    console.log(req.body)

    await db.collection(COLLECTION).updateOne(
        {_id: new ObjectId(id)},
        {$set: { ...req.body, updatedAt: new Date() }}
    )
    // console.log("updated call")
    const updated = await db.collection(COLLECTION).findOne({"_id": new ObjectId(id)})
    console.log(`updated call: ${updated}`)
    res.json(updated)
}


export async function deleteCall(req: Request, res: Response) {
    const db = getDb()
    const id = req.params.id

    await db.collection(COLLECTION).deleteOne({"_id": new ObjectId(id)})

    res.sendStatus(204)
}