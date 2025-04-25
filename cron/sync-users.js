const cron = require("../utils/cron");
const serviceForSalesPersons = require("../services/importSalespersonService");
const serviceForCustomers = require("../services/importCustomerService");

cron.schedule("0 * * * *", async () => {
  try {
    console.log("Starting syncing users...");
    await serviceForSalesPersons();
    await serviceForCustomers();
    console.log("Users synced successfully.");
  } catch (error) {
    console.error("Error processing:", error.message);
  }
});
