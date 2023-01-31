const router = global.router;
const jwt_decode = require("jwt-decode");

const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB.DocumentClient();
const docClient = new AWS.DynamoDB.DocumentClient();
//const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const tableName = "notifications";
const indexNameRecipient = "recipient-index"; // this is matched with username
const indexNameRecipientSeen = "recipient-seen-index"; // this is matched with username and seen
const defaultReqLimit = 5; // amount of results to request at once at a maximum

const utils = require("../utils/index");

/**
 *  Deletes given uids for this user
 *  OPTIONAL param reqLimit, otherwise is 'defaultReqLimit'
 *  OPTIONAL param queryKey
 *  OPTIONAL param deletePostQuery = true
 * @ returns error, data, queryKey
 */
router.get("/notifications/poll", async function (req, res) {
  if (req.query.seen && req.query.unseen) {
    res.jsonp({ error: "Error: cannot have both params seen and unseen" });
    return;
  }
  let username = utils.getUsernameFromReq(req);
  if (req.query.debug != null) username = req.query.debug;
  if (username == null) {
    res.jsonp({ error: "Error: username is null: " + username });
    return;
  }

  var kce = "Recipient = :val";
  var eav = {
    ":val": username,
  };
  var _indexName = indexNameRecipient;

  var reqLimit =
    req.query.reqLimit != null ? req.query.reqLimit : defaultReqLimit;
  var params = {
    TableName: tableName,
    IndexName: _indexName,
    Limit: reqLimit,
    KeyConditionExpression: kce,
    ExpressionAttributeValues: eav,
  };
  if (req.query.key != null)
    params.ExclusiveStartKey = JSON.parse(req.query.key);
  console.log(params);
  ddb.query(params, function (err, data) {
    console.log(data);
    var ret = {
      error: err,
      key: data != null ? data.LastEvaluatedKey : null,
      data:
        data == null
          ? null
          : data.Items == null
          ? data.Item == null
            ? data
            : data.Item
          : data.Items,
    };
    if (req.query.deletePostQuery == null) {
      res.jsonp(ret);
      return;
    }

    var ddata = data;

    var uids = [];
    if (data == null) return res.jsonp(ret);
    for (var i in data.Items) {
      var d = data.Items[i];
      uids.push(d.UID);
    }
    var _items = uids;
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
    if (
      req.query.deletePostQuery == null ||
      req.query.deletePostQuery == undefined
    )
      return res.jsonp(ret);
    docClient.batchWrite(params, async function (err, data) {
      if (err) {
        // case: did not delete items
      } else {
        // case: did delete items
      }
      res.jsonp(ret);
    });
  });
});

module.exports = router;
