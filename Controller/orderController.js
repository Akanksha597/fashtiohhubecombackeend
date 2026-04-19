const asyncErrorHandler = require("../Utils/errorHandler");
const CustomError = require("../Utils/customError");
const Order = require("../Models/orderModel");
const Count = require("../Models/countModel");
const Product = require("../Models/productModel");
const ProductController = require("../Controller/productController");

exports.createOrder = asyncErrorHandler(async (req, res, next) => {
  let order = req.body;
  const count = await getOrderCounter();
   
  console.log("order is dbcart ::: ", order.dbCart);

  
  const products = order.dbCart;
  const productValidator = await productDataValidation(products, next);

  console.log("productValidator :: ", productValidator);

  if (productValidator && productValidator.errorProduct.length) {
    console.log("productValidator.errorProduct", productValidator.errorProduct);
  } else {
  }
  order.orderStatus = "ORDERED";
  order.orderNo = count + 1;

  const orderCreated = await Order.create(order);
  updateOrderCounter(order.orderNo);
  updateProductStock(productValidator.newProduct);
  res.status(201).json({
    status: "success",
    data: {
      orderCreated,
    },
  });
});
//

async function getOrderCounter() {
  return new Promise(async (resolve, reject) => {
    try {
      let count = await Count.findOne({ url: "getCounter" });

      if (!count) {
        count = new Count({
          url: "getCounter",
          countNumber: 1,
        });
        await count.save();
      }
      resolve(count.countNumber || 1);
    } catch (error) {
      reject(error);
    }
  });
}

async function updateOrderCounter(count) {
  const filter = { url: "getCounter" };
  const updatedcount = {
    $set: {
      countNumber: count,
    },
  };
  const result = await Count.updateOne(filter, updatedcount);
}

async function updateProductStock(products) {
  console.log("updateProductStock" + updateProductStock);
  for (const product of products) {
    try {
      console.log(product);

      ProductController.findAndUpdateProduct(product.productId, product);
      console.log("this function is called findAndUpdateProduct ");
    } catch (error) {
      console.log("error", error.message);
    }
  }
}

function productDataValidation(products, next) {
  return new Promise(async (resolve, reject) => {
    try {
      let newProduct = [];
      let errorProduct = [];

      for (const pro of products) {
        const dbProduct = await Product.findById(pro.productId);
        if (!dbProduct) {
          errorProduct.push(pro);
          continue;
        }

        if (dbProduct.unitPricePairs && dbProduct.unitPricePairs.length > 0) {
          // Check if any unit pair matches the conditions
          let matchFound = false;

          for (const ele of dbProduct.unitPricePairs) {
            if (ele.unit === pro.unit && ele.stock >= pro.qty && ele.price === pro.price) {
              matchFound = true;
              newProduct.push({
                ...pro,
                qty: parseInt(ele.stock) - parseInt(pro.qty),
                _id: ele._id,
              });
              break; // Exit loop as a match is found
            }
          }

          // If no match is found, push the product into errorProduct
          if (!matchFound) {
            errorProduct.push(pro);
          }
        } else {
          errorProduct.push(pro);
        }
      }

      const resp = {
        newProduct,
        errorProduct,
      };

      resolve(resp);
    } catch (error) {
      console.error("Error in productDataValidation:", error);
      reject(error);
    }
  });
}


exports.getOrder = asyncErrorHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "customer products.product coupon"
  );
  if (!order) {
    const error = new CustomError("Order with the given ID is not found!", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});


exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    paymentStatus,
    deliveryStatus,
    orderType,
    paymentMethod,
    startDate,
    endDate,
    shippingCity,
    shippingState,
    email,
    mobile,
  } = req.query;

  console.log("Received query parameters:", {
    page,
    limit,
    email,
    mobile,
    paymentStatus,
    deliveryStatus,
    orderType,
    paymentMethod,
    shippingCity,
    shippingState,
  });

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (isNaN(pageNumber) || pageNumber <= 0) {
    return next(
      new CustomError("Invalid page number. Must be a positive integer.", 400)
    );
  }

  if (isNaN(limitNumber) || limitNumber <= 0) {
    return next(
      new CustomError("Invalid limit number. Must be a positive integer.", 400)
    );
  }

  try {
    const query = {};

    // If email or mobile is present, prioritize and return orders based on them
    if (email || mobile) {
      if (email) query.customerEmail = email;
      if (mobile) query.customerPhoneNumber = mobile;
    
      const skip = (pageNumber - 1) * limitNumber; // Calculate skip value for pagination
    
      const orders = await Order.find(query)
        .populate("dbCart.productId")
        .populate("coupon")
        .sort({ createdAt: -1 }) // Fetch in reverse order by createdAt
        .skip(skip) // Apply pagination
        .limit(limitNumber); // Apply limit
    
      const totalOrders = await Order.countDocuments(query); // Count total matching documents
    
      return res.status(200).json({
        status: "success",
        result: orders.length,
        page: pageNumber,
        totalPages: Math.ceil(totalOrders / limitNumber),
        totalOrders,
        data: {
          orders,
        },
      });
    }

    // Build the query object based on other filters
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (deliveryStatus) query.deliveryStatus = deliveryStatus;
    if (orderType) query.orderType = orderType;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (shippingCity)
      query["shippingAddress.city"] = { $regex: shippingCity, $options: "i" };
    if (shippingState)
      query["shippingAddress.state"] = { $regex: shippingState, $options: "i" };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (pageNumber - 1) * limitNumber;

    const orders = await Order.find(query)
      .populate("dbCart.productId")
      .populate("coupon")
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limitNumber);

    const totalOrders = await Order.countDocuments(query);

    // Generate summary report if no specific filters are applied
    let summaryReport = null;
    if (Object.keys(query).length === 0) {
      summaryReport = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
            byPaymentStatus: {
              $push: { status: "$paymentStatus", count: 1 },
            },
            byDeliveryStatus: {
              $push: { status: "$deliveryStatus", count: 1 },
            },
            byOrderType: {
              $push: { type: "$orderType", count: 1 },
            },
          },
        },
      ]);
    }

    res.status(200).json({
      status: "success",
      result: orders.length,
      page: pageNumber,
      totalPages: Math.ceil(totalOrders / limitNumber),
      totalOrders,
      data: {
        orders,
        report: summaryReport,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return next(
      new CustomError("An error occurred while fetching orders.", 500)
    );
  }
});






exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedOrder) {
    const error = new CustomError("Order with the given ID is not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: "success",
    data: {
      order: updatedOrder,
    },
  });
});

exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);
  if (!deletedOrder) {
    const error = new CustomError("Order with the given ID is not found", 404);
    return next(error);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

//this controller used for fetching total order count according to parameter

exports.getOrderStats = asyncErrorHandler(async (req, res, next) => {
  const { paymentStatus, deliveryStatus, paymentMethod } = req.query;
  try {
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (deliveryStatus) query.deliveryStatus = deliveryStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    // Fetch the total order count based on the query
    const totalOrders = await Order.countDocuments(query);
    res.status(200).json({
      status: "success",
      data: {
        totalOrders,
        filters: {
          paymentStatus: paymentStatus || null,
          deliveryStatus: deliveryStatus || null,
          paymentMethod: paymentMethod || null,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error.message);
    return next(
      new CustomError("An error occurred while fetching order statistics.", 500)
    );
  }
});

exports.getCancelledOrRefundOrders = asyncErrorHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const skip = (page - 1) * limit;
    const searchQuery = keyword
      ? {
          $or: [
            { orderStatus: "CANCELLED", paymentStatus: "PAID", },
            { "accountDetails.accountNumber": { $exists: true, $ne: "" } },
            { orderNo: { $regex: keyword, $options: "i" } },
            { customerEmail: { $regex: keyword, $options: "i" } },
            { customerPhoneNumber: { $regex: keyword, $options: "i" } }
          ],
        }
      : {
          $or: [
            { orderStatus: "CANCELLED" , paymentStatus: "Paid",},
            { "accountDetails.accountNumber": { $exists: true, $ne: "" } }
          ],
        };

    const orders = await Order.find(searchQuery)
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(searchQuery);

    res.status(200).json({
      status: "success",
      data: {
        totalOrders,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        orders,
      },
    });
  } catch (error) {
    console.error("Error fetching cancelled or refund orders:", error.message);
    return next(
      new CustomError("An error occurred while fetching orders.", 500)
    );
  }
});
