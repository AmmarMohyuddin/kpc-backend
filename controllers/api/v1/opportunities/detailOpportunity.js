const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const Item = require("../../../../models/item");
const salesPerson = require("../../../../models/salesperson");
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

    // 4️⃣ Fetch all items in one go
    let itemMap = {};
    if (allItemIds.length > 0) {
      const items = await Item.find(
        { inventory_item_id: { $in: allItemIds } },
        { sub_cat: 1, item_number: 1, item_detail: 1, inventory_item_id: 1 }
      );

      itemMap = items.reduce((acc, item) => {
        acc[item.inventory_item_id] = item;
        return acc;
      }, {});
    }

    // 5️⃣ Enrich opportunities
    opportunities = await Promise.all(
      opportunities.map(async (opp) => {
        // Attach item details
        let enrichedLines = opp.ORDER_LINES || [];
        if (opp.ORDER_LINES) {
          enrichedLines = opp.ORDER_LINES.map((line) => {
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
        }

        // Attach SALESPERSON_ID from local DB
        let salespersonId = null;
        if (opp.SALESPERSON_NAME) {
          const salesPersonObj = await salesPerson.findOne({
            salesperson_name: opp.SALESPERSON_NAME,
          });
          salespersonId = salesPersonObj?.salesperson_id || null;
        }

        return {
          ...opp,
          ORDER_LINES: enrichedLines,
          SALESPERSON_ID: salespersonId,
        };
      })
    );

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
