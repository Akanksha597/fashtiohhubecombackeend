const mongoose = require("mongoose");

const rolesPermissionsSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Role reference is required"],
      unique: true,
    },
    permissions: {
      // Dashboard
      dashboard: { All_Dashboard: { type: Boolean, default: false } },

      // Products
      products: {
        AllProduct: { type: Boolean, default: false },
        AddProduct: { type: Boolean, default: false },
        EditProduct: { type: Boolean, default: false },
        PublishProduct: { type: Boolean, default: false },
      },

      // Categories
      categories: {
        AllCategories: { type: Boolean, default: false },
        AddCategories: { type: Boolean, default: false },
        EditCategories: { type: Boolean, default: false },
        TopCategories: { type: Boolean, default: false },
        deleteCategories: { type: Boolean, default: false },
      },

      // Units
      unit: {
        AllUnit: { type: Boolean, default: false },
        AddUnit: { type: Boolean, default: false },
        EditUnit: { type: Boolean, default: false },
        PublishUnit: { type: Boolean, default: false },
        deleteUnit: { type: Boolean, default: false },
      },

      // Stock
      stock: {
        AllStock: { type: Boolean, default: false },
        AddStock: { type: Boolean, default: false },
        EditStock: { type: Boolean, default: false },
        PublishStock: { type: Boolean, default: false },
        deleteStock: { type: Boolean, default: false },
      },

      // Orders
      order: {
        AllOrder: { type: Boolean, default: false },
        AddOrder: { type: Boolean, default: false },
        EditOrder: { type: Boolean, default: false },
        PublishOrder: { type: Boolean, default: false },
      },

      // Customers
      customer: {
        AllCustomer: { type: Boolean, default: false },
        AddCustomer: { type: Boolean, default: false },
        EditCustomer: { type: Boolean, default: false },
        PublishCustomer: { type: Boolean, default: false },
      },

      // Employee & Staff
      employeeStaff: {
        AllEmployee: { type: Boolean, default: false },
        AddEmployee: { type: Boolean, default: false },
        EditEmployee: { type: Boolean, default: false },
        PublishEmployee: { type: Boolean, default: false },
        deleteEmployee: { type: Boolean, default: false },
      },

      // Coupons
      coupon: {
        AllCoupen: { type: Boolean, default: false },
        AddCoupen: { type: Boolean, default: false },
        EditCoupen: { type: Boolean, default: false },
        PublishCoupen: { type: Boolean, default: false },
        deleteCoupen: { type: Boolean, default: false },
      },

      // Campaigns
      campaign: {
        AllCampaign: { type: Boolean, default: false },
        AddCampaign: { type: Boolean, default: false },
        EditCampaign: { type: Boolean, default: false },
        PublishCampaign: { type: Boolean, default: false },
        deleteCampaign: { type: Boolean, default: false },
      },

      // Roles & Permissions
      rolesAndPermissions: {
        AllROlesAndPermission: { type: Boolean, default: false },
        AddROlesAndPermission: { type: Boolean, default: false },
        EditROlesAndPermission: { type: Boolean, default: false },
        PublishROlesAndPermission: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },

      // Settings
      settings: {
        GeneralSetting: { type: Boolean, default: false },
        OrderSetting: { type: Boolean, default: false },
        SocialLoginSetting: { type: Boolean, default: false },
        top: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },

      // POS
      pos: {
        POS: { type: Boolean, default: false },
      },

      // Reports
      reports: {
        order: { type: Boolean, default: false },
        productSale: { type: Boolean, default: false },
        categorySale: { type: Boolean, default: false },
        salesAmount: { type: Boolean, default: false },
        deliveryStatus: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

const RolesPermissions = mongoose.model("RolesPermissions", rolesPermissionsSchema);
module.exports = RolesPermissions;
