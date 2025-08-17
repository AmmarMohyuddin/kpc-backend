const axios = require("axios");
const getAccessToken = require("../accessToken/token");

async function fetchCustomers() {
  const token = await getAccessToken();

  const config = {
    method: "get",
    url: `https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/getCustomers?limit=10000`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.request(config);
  return response.data;
}

module.exports = fetchCustomers;
