const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function leadChart(req, res) {
  try {
    // 1. Get Access Token
    const accessToken = await getAccessToken();

    // 2. Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getLeads`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 3. Parse response
    const oracleData = response.data;
    const leads = oracleData.items;

    // 4. Calculate lead count
    const leadCount = leads.length;

    // 5. Calculate last 6 months lead counts
    const currentDate = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Generate last 6 months (only month names)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const month = monthNames[date.getMonth()];
      last6Months.push(month);
    }

    // Count leads for each of the last 6 months
    const monthlyLeadCounts = {};
    last6Months.forEach((month) => {
      monthlyLeadCounts[month] = 0;
    });

    leads.forEach((lead) => {
      if (lead.creation_date) {
        const leadDate = new Date(lead.creation_date);
        const leadMonth = monthNames[leadDate.getMonth()];

        if (monthlyLeadCounts.hasOwnProperty(leadMonth)) {
          monthlyLeadCounts[leadMonth]++;
        }
      }
    });

    // 6. Prepare response data
    const responseData = {
      total_leads: leadCount,
      monthly_counts: monthlyLeadCounts,
    };

    // 7. Return clean structured response
    return successResponse(
      res,
      200,
      "Leads data fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("❌ Error fetching leads:", error.message);

    if (error.response) {
      return errorResponse(
        res,
        error.response.status,
        error.response.data?.message || "Oracle API error"
      );
    }

    return errorResponse(res, 500, "Internal Server Error");
  }
}

module.exports = leadChart;
