import { catalog } from "./catalog";
import { inventory } from "./inventory";
import { reports } from "./report";
import { accounting } from "./report/accounting";

export const ICONS = {
  mail: require("./mail.png"),
  location: require("./location.png"),
  receipt: require("./receipt.png"),
  password: require("./password.jpg"),
  cash_drawer: require("./cash_drawer.png"),
  expense: require("./expense.png"),
  printer: require("./printer.png"),
  scanner: require("./scanner.png"),
  settings: require("./settings.png"),
  shift: require("./shift.png"),
  stock: require("./stock.png"),
  transaction: require("./transaction.png"),

  catalog,
  reports,
  inventory,
  accounting,
};
