const Cart = require("../Models/cartModel");
const Product = require("../Models/productModel");
const Offer = require("../Models/offerModel");
const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");

exports.addItemToCart = asyncErrorHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new CustomError("Product not found", 404));
  }

  let cart = await Cart.findOne({ user: userId, isActive: true });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  cart.totalPrice += product.price * quantity;

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

exports.applyOfferToCart = asyncErrorHandler(async (req, res, next) => {
  const { offerCode } = req.body;
  const userId = req.user._id;

  const offer = await Offer.findOne({ code: offerCode, isActive: true });
  if (!offer) {
    return next(new CustomError("Offer not found or expired", 404));
  }

  let cart = await Cart.findOne({ user: userId, isActive: true });
  if (!cart) {
    return next(new CustomError("No active cart found for this user", 404));
  }

  cart.appliedOffers.push({
    offer: offer._id,
    discountAmount: (cart.totalPrice * offer.discount) / 100,
  });
  cart.totalPrice -= (cart.totalPrice * offer.discount) / 100;

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

exports.getCart = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId, isActive: true }).populate(
    "items.product appliedOffers.offer"
  );
  if (!cart) {
    return next(new CustomError("No active cart found for this user", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

exports.removeItemFromCart = asyncErrorHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId, isActive: true });
  if (!cart) {
    return next(new CustomError("No active cart found for this user", 404));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex > -1) {
    const product = await Product.findById(productId);
    cart.totalPrice -= cart.items[itemIndex].quantity * product.price;
    cart.items.splice(itemIndex, 1);
    await cart.save();
  }

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});
