const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const Item = require("../../../../models/item");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function detailOpportunity(req, res) {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Opportunity ID is required");

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API
    const response = await axios.get(
      `${API_BASE_URL}/getOpportunity?OPPORTUNITY_ID=${id}&limit=10000`,
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

    // 🔄 Collect all ITEM_IDs across opportunities
    const allItemIds = opportunities.flatMap((opp) =>
      opp.ORDER_LINES ? opp.ORDER_LINES.map((line) => line.ITEM_ID) : []
    );

    if (allItemIds.length > 0) {
      // 4️⃣ Fetch all items in one go
      const items = await Item.find(
        { inventory_item_id: { $in: allItemIds } },
        { sub_cat: 1, item_number: 1, item_detail: 1, inventory_item_id: 1 }
      );

      // Build lookup map { ITEM_ID: details }
      const itemMap = items.reduce((acc, item) => {
        acc[item.inventory_item_id] = item;
        return acc;
      }, {});

      // 5️⃣ Enrich opportunities
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

    // 6️⃣ Return clean response
    return successResponse(
      res,
      200,
      "Opportunity details fetched successfully",
      opportunities
    );
  } catch (error) {
    console.error("❌ Error fetching opportunity details:", error.message);

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

module.exports = detailOpportunity;
