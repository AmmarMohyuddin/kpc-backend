const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const Item = require("../../../../models/item");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function listOpportunities(req, res) {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const { OPPORTUNITY_ID, LEAD_NUMBER, DATE } = req.query.params || req.query;

    const params = {};

    if (OPPORTUNITY_ID) {
      params.OPPORTUNITY_ID = OPPORTUNITY_ID;
    } else if (LEAD_NUMBER) {
      params.LEAD_NUMBER = LEAD_NUMBER;
    } else if (DATE) {
      params.DATE = DATE;
    } else {
      // ✅ Only apply pagination when no filter is present
      params.limit = parseInt(limit);
      params.offset = parseInt(offset);
    }

    console.log("➡️ Params Sent to Oracle API:", params);

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getOpportunity`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });

    // 3️⃣ Parse response
    const oracleData = response.data;

    let opportunities =
      oracleData.items
        ?.map((item) => {
          try {
            return JSON.parse(item.opportunity_json);
          } catch {
            return null;
          }
        })
        .filter(Boolean) || [];

    // 4️⃣ Collect all ITEM_IDs across all opportunities
    const allItemIds = opportunities.flatMap((opp) =>
      opp.ORDER_LINES ? opp.ORDER_LINES.map((line) => line.ITEM_ID) : []
    );

    if (allItemIds.length > 0) {
      // 5️⃣ Fetch all items in one go
      const items = await Item.find(
        { inventory_item_id: { $in: allItemIds } },
        { sub_cat: 1, item_number: 1, item_detail: 1, inventory_item_id: 1 }
      );

      // Build lookup map
      const itemMap = items.reduce((acc, item) => {
        acc[item.inventory_item_id] = item;
        return acc;
      }, {});

      // 6️⃣ Enrich opportunities with item details
      opportunities = opportunities.map((opp) => {
        if (!opp.ORDER_LINES) return opp;

        const enrichedLines = opp.ORDER_LINES.map((line) => {
          const itemDetails = itemMap[line.ITEM_ID];
          return itemDetails
            ? {
                ...line,
                SUB_CAT: itemDetails.sub_cat,
                ITEM_DETAIL: itemDetails.item_detail,
                ITEM_NUMBER: itemDetails.item_number,
              }
            : line;
        });

        return { ...opp, ORDER_LINES: enrichedLines };
      });
    }

    // 7️⃣ Return structured response
    return successResponse(res, 200, "Opportunities fetched successfully", {
      opportunities,
      pagination:
        OPPORTUNITY_ID || LEAD_NUMBER || DATE
          ? null // ✅ No pagination when filters are applied
          : {
              limit: oracleData.limit,
              offset: oracleData.offset,
              hasMore: oracleData.hasMore,
            },
    });
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

module.exports = listOpportunities;
