const Lead = require("../../../../models/lead");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function create(req, res) {
  try {
    const { status } = req.body;

    // Get the highest numeric leadId
    const lastLead = await Lead.findOne({}).sort({ $natural: -1 }); // Or fallback to numeric max

    // Convert safely to number
    let lastLeadNumber = 0;
    if (lastLead && !isNaN(lastLead.leadId)) {
      lastLeadNumber = parseInt(lastLead.leadId);
    } else {
      // Optional fallback: get max with aggregation in case of gaps
      const maxResult = await Lead.aggregate([
        {
          $group: {
            _id: null,
            maxLeadId: { $max: { $toInt: "$leadId" } },
          },
        },
      ]);

      lastLeadNumber = maxResult[0]?.maxLeadId || 0;
    }

    const currentLeadId = lastLeadNumber + 1;

    if (status === true) {
      const newLead = new Lead({
        leadId: currentLeadId.toString(),
        status: true,
      });

      await newLead.save();
    }

    return successResponse(res, 200, "Lead processed", {
      leadId: currentLeadId,
      created: status === true,
      nextLeadId: currentLeadId + 1,
    });
  } catch (error) {
    console.error("Error creating lead:", error.message);
    return errorResponse(
      res,
      500,
      "An error occurred while processing your request"
    );
  }
}

module.exports = create;
