import User from '../models/user.js'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const router = express.Router()

const secret = process.env.secret

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-password')
    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send({ userList })
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
        res.status(500).json({ message: 'The user with the given ID was not found.' })
    }
    res.status(200).send({ user })
})

router.put('/:id', async (req, res) => {
    const userExist = await User.findById(req.params.id)
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.password
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            email: req.body.email,
            password: newPassword,
            type: req.body.type,
            status: req.body.status,
            isAdmin: req.body.isAdmin
        },
        { new: true }
    )

    if (!user) return res.status(400).send('the user cannot be created!')

    res.send({ user })
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email })

    if (!user) {
        return res.status(400).send('The user not found')
    }

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )

        res.status(200).send({ user: user, token: token })
    } else {
        res.status(400).send('password is wrong!')
    }
})

router.post('/register', async (req, res) => {
    console.log(req.body)
    let user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        type: req.body.type,
        status: req.body.status,
        isAdmin: req.body.isAdmin
    })
    user = await user.save()

    if (!user)
        return res.status(400).json({ success: false, message: 'the user cannot be created!' })
    const token = jwt.sign(
        {
            userId: user.id,
            isAdmin: user.isAdmin
        },
        secret,
        { expiresIn: '1d' }
    )
    res.send({ user, token })
})

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({ success: true, message: 'the user is deleted!' })
            } else {
                return res.status(404).json({ success: false, message: 'user not found!' })
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err })
        })
})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments({})

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    })
})

export default router
