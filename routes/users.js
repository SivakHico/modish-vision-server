import User from '../models/user.js'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const router = express.Router()
import Developer from '../models/developer.js'
// import Company from '../models/company.js'

const secret = process.env.secret

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-password')
    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send({ userList })
})

router.get(`/check-token`, async (req, res) => {
    // 1. does the user have a authorization token?
    // (check req.token)
    // 2. does the token match a user in the database?
    // (check req.token.id with User.findById(req.token.id))
    // 3. if so, send back a success message with the user's info and user's userProfile info
    // 3.b ) if not, send back a null message
    if (req.token) {
        try {
            const user = await User.findById(req.token.userId)
            if (user) {
                // now check their profile in Developer or Company models
                if (user.type === 'developer') {
                    const developer = await Developer.find({ user: user._id })
                    res.send({ user, profile: developer, message: 'welcome back developer!' })
                } else if (user.type === 'company') {
                    // const company = await Company.find({
                    //     user: user._id
                    // })
                    // res.send({ user, profile: company, message: 'welcome back company!' })
                }
                res.send({ user })
            } else {
                res.send({ user: null, message: 'token invalid, user not found' })
            }
        } catch (error) {
            res.send({ user: null, message: 'something went wrong, please try again later' })
        }
    } else {
        res.send({ user: null, message: 'user not logged in' })
    }
})

// router.get('/:id', async (req, res) => {
//     const user = await User.findById(req.params.id).select('-password')

//     if (!user) {
//         res.status(500).json({ message: 'The user with the given ID was not found.' })
//     }
//     res.status(200).send({ user })
// })

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email })

    if (!user) {
        console.log('The user not found')
    }

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign(
            {
                userId: user._id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )

        // ( to verify the token, use jwt.verify(token, secret) )

        // jwt.verify(token, secret, (err, decoded) => {
        //     if (err) {
        //         console.log(err)
        //     }
        //     if (decoded) {
        //         console.log(decoded)
        //     }
        // })

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
            userId: user._id,
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
