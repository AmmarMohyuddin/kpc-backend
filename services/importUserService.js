require("dotenv").config();
const axios = require("axios");
const parser = require("xml2js").parseStringPromise;
const mongoose = require("mongoose");
const dbConnection = require("../db/Connection");
const ImportUser = require("../models/importUser");

const username = process.env.ORACLE_IMPORT_USER_USERNAME;
const password = process.env.ORACLE_IMPORT_USER_PASSWORD;

async function importUsers() {
  await dbConnection();

  const url = process.env.ORACLE_IMPORT_USER_URL;

  const soapRequest = `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:pub="http://xmlns.oracle.com/oxp/service/PublicReportService">
       <soap:Header/>
       <soap:Body>
          <pub:runReport>
             <pub:reportRequest>
                <pub:attributeFormat>xml</pub:attributeFormat>
                <pub:reportAbsolutePath>/Custom/BABDEV/PERSON_DETAILS_MOB.xdo</pub:reportAbsolutePath>
                <pub:sizeOfDataChunkDownload>-1</pub:sizeOfDataChunkDownload>
             </pub:reportRequest>
          </pub:runReport>
       </soap:Body>
    </soap:Envelope>
  `;

  try {
    const response = await axios.post(url, soapRequest, {
      headers: {
        "Content-Type": "application/soap+xml; charset=utf-8",
      },
      auth: {
        username,
        password,
      },
    });

    const result = await parser(response.data);
    const envelope = result["env:Envelope"];
    const body = envelope["env:Body"][0];
    const runReportResponse = body["ns2:runReportResponse"];

    if (runReportResponse && runReportResponse[0]) {
      const reportReturn = runReportResponse[0]["ns2:runReportReturn"][0];
      const base64Data = reportReturn["ns2:reportBytes"][0];

      const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");

      const jsonData = await parser(decodedData);

      const reportData = jsonData["DATA_DS"]?.["G_1"];
      if (!Array.isArray(reportData)) {
        throw new Error("Expected report data to be an array");
      }
      console.log(reportData);
      const formattedData = reportData.map((item) => ({
        person_number: item.PERSON_NUMBER ? item.PERSON_NUMBER[0] : "",
        full_name: item.DISPLAY_NAME ? item.DISPLAY_NAME[0] : "",
        email: item.EMP_EMAIL ? item.EMP_EMAIL[0] : "",
        legal_employer: item.LEGAL_EMPLOYER ? item.LEGAL_EMPLOYER[0] : "",
        business_unit: item.BU_NAME ? item.BU_NAME[0] : "",
        department: item.DEPT ? item.DEPT[0] : "",
        department_code: item.DEPT_ID ? item.DEPT_ID[0] : "",
        manager_name: item.MGR_NAME ? item.MGR_NAME[0] : "",
        manager_email: item.MGR_EMAIL ? item.MGR_EMAIL[0] : "",
        position: item.POSITION ? item.POSITION[0] : "",
      }));

      const validData = formattedData.filter(
        (entry) =>
          entry.person_number &&
          entry.full_name &&
          entry.legal_employer &&
          entry.business_unit &&
          entry.department
      );

      console.log("Formatted data:", formattedData);
      console.log("Valid data:", validData);

      if (validData.length > 0) {
        for (const user of validData) {
          const existingUser = await ImportUser.findOne({
            person_number: user.person_number,
          });

          if (existingUser) {
            console.log(
              `User with person_number ${user.person_number} already exists. Skipping...`
            );
            continue;
          }

          try {
            await ImportUser.create(user);
            console.log(`User ${user.full_name} inserted successfully.`);
          } catch (err) {
            console.error(
              `Error inserting user ${user.full_name}:`,
              err.message
            );
          }
        }

        console.log("Data successfully saved to the database.");
      } else {
        console.log("No valid data to save.");
      }
    } else {
      console.log("Run report response is missing or malformed.");
    }
  } catch (error) {
    console.error(
      "Error fetching report data:",
      error.response?.data || error.message
    );
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

module.exports = importUsers;
