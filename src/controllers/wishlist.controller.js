const express = require("express");

const Bag = require("../models/bag.model");

const User = require("../models/user.model");

const Product = require("../models/product.model");

const router = express.Router();

router.get("/", (req, res) => {
    return res.render("ejs/emptyWL");
});

router.get("/:userId", async(req, res) => {
    try {
        let user = await User.findById(req.params.userId);

        let bag = user.wishListItems;

        if (bag.length === 0) {
            return res.render("ejs/emptyWL");
        }

        // console.log(bag);

        let prodArr = [];
        for (let i = 0; i < bag.length; i++) {
            let product = await Product.findById(bag[i].productId);
            prodArr.push([product, 1]);
        }

        return res.render("ejs/wishlist", { items: prodArr });
    } catch (err) {
        res.send(err.message);
    }
});

router.post("/add", async(req, res) => {
    let { userId, prodId } = req.body;
    let user = await User.findById(userId).lean().exec();

    let bag = user.wishListItems;

    for (let i = 0; i < bag.length; i++) {
        if (bag[i].productId == prodId) {
            return res.send("Item Already Added");
        }
    }

    user = await User.findByIdAndUpdate(
            userId, { wishListItems: [...bag, { productId: prodId }] }, { new: true }
        )
        .lean()
        .exec();
    return res.json(user);
});

router.post("/deleteItem/", async(req, res) => {
    let { userId, prodId } = req.body;
    let user = await User.findById(userId).lean().exec();

    let bag = user.wishListItems;

    let newBag = bag.filter((item) => {
        return item.productId != prodId;
    });

    user = await User.findByIdAndUpdate(
            userId, { wishListItems: newBag }, { new: true }
        )
        .lean()
        .exec();
    return res.json(user);
});
module.exports = router;