import Developer from '../models/developer.js'
import City from '../models/city.js'
import User from '../models/user.js'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
const router = express.Router()

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {
    //let filter = {}
    //if (req.query.city) {
    //    filter = { city: req.query.cities.split(',') }
    //}

    const developerList = await Developer.find()

    if (!developerList) {
        res.status(500).json({ success: false })
    }
    res.send({ developerList })
})

router.get(`/:id`, async (req, res) => {
    const developer = await Developer.findById(req.params.id).populate('city')

    if (!developer) {
        res.status(500).json({ success: false })
    }
    res.send({ developer })
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    console.log(req.body)
    const city = await City.findOne({ name: req.body.city })
    console.log(city)
    if (!city) return res.status(400).send('Invalid City')

    const userDoc = await User.findById(req.body.user_id)
    if (!userDoc) return res.status(400).send('Invalid User ID')
    // const file = req.file
    // if (!file) return res.status(400).send('No image in the request')
    // const fileName = file.filename
    // const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    // image: `${basePath}${fileName}`,

    let developer = new Developer({
        user_id: req.body.user_id,
        email: req.body.email,
        salutation: req.body.gender,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        image: req.body.image,
        birthday: req.body.birthday,
        phonenumber: req.body.phone,
        linkedin: req.body.linkedin,
        github: req.body.github,
        specialist: req.body.specialist,
        experience: req.body.experience,
        city: city._id
    })

    developer = await developer.save()
    if (!developer) return res.status(500).send('The Developer cannot be created')
    res.send({ developer })
})

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid Category')

    const product = await Product.findById(req.params.id)
    if (!product) return res.status(400).send('Invalid Product!')

    const file = req.file
    let imagepath

    if (file) {
        const fileName = file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        imagepath = `${basePath}${fileName}`
    } else {
        imagepath = product.image
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    )

    if (!updatedProduct) return res.status(500).send('the product cannot be updated!')
    res.send({ updatedProduct })
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({ success: true, message: 'the product is deleted!' })
            } else {
                return res.status(404).json({ success: false, message: 'product not found!' })
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err })
        })
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments({})

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    })
})

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count)

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send({ products })
})

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const files = req.files
    let imagesPaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`)
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    )

    if (!product) return res.status(500).send('the gallery cannot be updated!')

    res.send({ product })
})

export default router
