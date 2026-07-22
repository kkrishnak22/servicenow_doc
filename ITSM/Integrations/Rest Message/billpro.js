function callBillProRestAPI(data) {
  try {
    var currentDateObj = new GlideDate();

    var inputString = "adani" + currentDateObj.getByFormat("yyyyMMdd");
    var digest = new GlideDigest();
    var sha_key = digest.getSHA1Hex(inputString).toLowerCase();
    var r = new sn_ws.RESTMessageV2(
      "x_adga_project_a_0.ATEL_BillPro_Integration",
      "New Station Request",
    );
    // HTTP Header - Req

    r.setStringParameterNoEscape("sha_key", sha_key);
    // Content Variables - Req Body
    r.setStringParameterNoEscape("station_id", data.station_id);
    r.setStringParameterNoEscape("consumer_name", data.consumer_name);
    r.setStringParameterNoEscape("consumer_id", data.consumer_id);
    r.setStringParameterNoEscape("station_name", data.station_name);
    r.setStringParameterNoEscape("board", data.board);
    r.setStringParameterNoEscape("req_id", data.req_id);
    r.setStringParameterNoEscape("circle", data.circle);

    var response = r.execute();
    var responseBody = response.getBody();
    var httpStatus = response.getStatusCode();

    // gs.info("responseBody: " + responseBody);
    // gs.info("httpStatus: " + httpStatus);

    return responseBody;
  } catch (ex) {
    var message = "BillPro REST API Call Failed: " + ex.message;
    gs.error(message);
    return message;
  }
}
