const router = global.router;
const jwt_decode = require("jwt-decode");

const AWS = require("aws-sdk");
const tableName = "notifications";
const docClient = new AWS.DynamoDB.DocumentClient();

// false to rely on cognito auth
const debug = false;
const debugUsername = "participant";

const utils = require("../utils/index");

/**
 * Param: uids: comma seperated list of UIDS to delete
 * Param: uid
 */
router.post("/notifications/delete", async function (req, res) {
  if (username == null) username = utils.getUsernameFromReq(req);
  if (username == null) {
    res.jsonp({ error: "Query param 'uid' does not exist" });
    return;
  }

  if (req.query.uids == null) {
    res.jsonp({ error: "Query param 'uids' does not exist" });
    return;
  }

  var _items = req.query.uids.split(",");
  if (_items == null) {
    res.jsonp({ error: "Query param 'uids' is not a list seperated by ," });
    return;
  }
  if (_items == null && req.query.uids) _items = [req.query.uids];
  var items = [];
  for (var item in _items)
    items.push({
      DeleteRequest: { Key: { UID: _items[item], Recipient: username } },
    });
  var params = {
    RequestItems: {
      [tableName]: items,
    },
  };
  await docClient.batchWrite(params, function (err, data) {
    if (err) {
      // case: did not delete items
    } else {
      // case: did delete items
    }
    res.jsonp({ error: err, success: true });
  });
});

module.exports = router;
