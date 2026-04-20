const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const CustomError = require("./Utils/customError");
const globalErrorHandler = require("./Controller/errorController");
const userRoutes = require("./Routes/userRoutes");
const authRoute = require("./Routes/authRoute");
const productRoute = require("./Routes/productRoute");
const categorytRoute = require("./Routes/categoryRoutes");
const orderRoute = require("./Routes/orderRoute");
const couponRoute = require("./Routes/couponRoutes");
const offerRoute = require("./Routes/offerRoute");
const cartRoute = require("./Routes/cartRoutes");
const campaignRoute = require("./Routes/campaignRoute");
const healthChecker = require("./Routes/healthChecker");
const taxRoutes = require("./Routes/taxRoutes");
const unitRoutes = require("./Routes/unitRoutes")
const employeeRoutes = require("./Routes/employeeRoutes")
const banner = require("./Routes/bannerRoutes") 
const queriesRoutes = require("./Routes/queriesRoutes")
const shippingRouter = require("./Routes/shippingRoutes")

const video = require('./Routes/videoRoute')

const bulk = require('./Routes/bulkOrderRoutes')
const review = require('./Routes/reviewRoutes')
const rolePermissionRoute = require("./Routes/rolesPermissionsRoutes");
// const setting = require("./Routes/settingRoutes")
app.use(helmet());
let limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message:
    "We have received too many requests from this IP. Please try after 1 hour.",
});
app.use("/", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(sanitize());
app.use(xss());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/healthcheck", healthChecker);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/categories", categorytRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/coupons", couponRoute);
app.use("/api/v1/offers", offerRoute);
app.use("/api/v1/campaigns", campaignRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/tax",taxRoutes);
app.use("/api/v1/unit",unitRoutes)
app.use("/api/v1/employee",employeeRoutes);
app.use("/api/v1/queries",queriesRoutes)
app.use("/api/v1/banner",banner);
app.use("/api/v1/shipping",shippingRouter);

app.use("/api/v1/video",video);
// app.use("/api/v1/crop",crop);
app.use("/api/v1/bulk",bulk);
app.use("/api/v1/review",review);
app.use("/api/v1/roles", rolePermissionRoute);
// app.use("/api/v1/setting", setting);

app.all("*", (req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on the server!`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
