const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function opportunityChart(req, res) {
  try {
    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API
    const response = await axios.get(
      `${API_BASE_URL}/getOpportunity?limit=10000`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // 3️⃣ Parse opportunities
    let opportunities =
      response.data.items
        ?.map((item) => {
          try {
            return JSON.parse(item.opportunity_json);
          } catch {
            return null;
          }
        })
        .filter(Boolean) || [];

    // 4️⃣ Fixed month names array (Jan → Dec)
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

    // 5️⃣ Initialize counts for all months
    const monthlyOpportunityCounts = {};
    monthNames.forEach((m) => {
      monthlyOpportunityCounts[m] = 0;
    });

    // 6️⃣ Count opportunities by CREATION_DATE
    opportunities.forEach((opp) => {
      if (opp.CREATION_DATE) {
        const oppDate = new Date(opp.CREATION_DATE);
        const month = monthNames[oppDate.getMonth()];
        monthlyOpportunityCounts[month]++;
      }
    });

    // 7️⃣ Prepare response with total count + monthly mapping
    const responseData = {
      total_opportunities: opportunities.length,
      monthly_counts: monthlyOpportunityCounts,
    };

    return successResponse(
      res,
      200,
      "Opportunities chart data fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("❌ Error fetching opportunities:", error.message);

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

module.exports = opportunityChart;
