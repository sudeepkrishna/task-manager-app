const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const { ObjectID } = require("mongodb")
const auth = require('../middleware/auth')

//REST API to add a new task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,   //es6 spread shorthand
    owner: req.user._id
  })
  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

//API for getting all tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find()
    res.status(200).send(tasks)
  } catch (e) {
    res.status(400).send(e)
  }
})

//API for getting a particular task
router.get("/tasks/:id", async (req, res) => {
  const _id = req.params.id
  if (!ObjectID.isValid(_id)) {
    return res.status(400).send("ID not a valid ObjectID")
  }
  try {
    let task = await Task.findById(_id)
    if (!task) {
      return res.status(404).send("ID not found")
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send()
  }
  // Task.findById(_id).then((task) => {
  //     if(!task){
  //         return res.status(404).send('ID not found')
  //     }
  //     res.status(200).send(task)
  // }).catch((e) => {
  //     console.log(e)
  //     res.status(500).send()
  // })
})

//API for updating tasks
router.patch("/tasks/:id", async (req, res) => {
  const _id = req.params.id
  const requestedUpdates = Object.keys(req.body)
  const allowedUpdates = ["description", "completed"]
  const isValidUpdate = requestedUpdates.every((update) =>
    allowedUpdates.includes(update)
  )
  if (!isValidUpdate) {
    return res.status(400).send("Invalid update")
  }
  try {
    const task = await Task.findById(_id)
    requestedUpdates.forEach((update) => task[update] = req.body[update])
    await task.save()

    if (!task) {
      return res.status(404).send("No matching id")
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

//API for deleting a task by id
router.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) {
      return res.status(400).send("Task not found")
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router

