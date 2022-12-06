import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import 'dotenv/config'
import citiesRoutes from './routes/cities.js'
import developersRoutes from './routes/developers.js'
import usersRoutes from './routes/users.js'
import cors from 'cors'
import authJwt from './helpers/jwt.js'
import errorHandler from './helpers/error-handler.js'
const PORT = process.env.PORT || 3000
const api = process.env.API_URL
const connectDB = process.env.CONNECT_DB
const app = express()
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
const secrt = process.env.STRIPE_PRIVATE_KEY
const stripe = new Stripe(secrt)

app.use(cors())
app.options('*', cors())
app.use(express.json())
app.use(morgan('tiny'))
// app.use(authJwt())
app.use(errorHandler)

app.use((req, res, next) => {
    console.log('req.headers.authorization', req.headers.authorization)
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.secret)
                req.token = decoded
                next()
            } catch (error) {
                console.log('error >>>>>>>>>>', error)
                next()
            }
        } else {
            next()
        }
    } else {
        next()
    }
})

app.use(`${api}/cities`, citiesRoutes)
app.use(`${api}/developers`, developersRoutes)
app.use(`${api}/users`, usersRoutes)

const storeItems = new Map([
    [
        1,
        {
            priceInCents: 2000,
            name: 'For a small one-off fee, you can then contact the Developers of your choice directly.'
        }
    ]
])

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map((item) => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/`
        })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

mongoose
    .connect(connectDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'linkthem'
    })
    .then(() => {
        console.log('DataBase Connection is Ready...')
    })
    .catch((err) => {
        console.log(err)
    })

app.listen(PORT, () => {
    console.log(`The Server is running now on port ${PORT}`)
})
