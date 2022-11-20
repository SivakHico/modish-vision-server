import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import categoriesRoutes from './routes/categories.js'
import ordersRoutes from './routes/orders.js'
import productsRoutes from './routes/products.js'
import usersRoutes from './routes/users.js'
import cors from 'cors'
import 'dotenv/config'
import authJwt from './helpers/jwt.js'
import errorHandler from './helpers/error-handler.js'
const PORT = process.env.PORT || 3000
const api = process.env.API_URL
const connectDB = process.env.CONNECT_DB
const app = express()

app.use(cors())
app.options('*', cors())

app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)

app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/orders`, ordersRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/users`, usersRoutes)

mongoose
    .connect(connectDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'hico-shop'
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
