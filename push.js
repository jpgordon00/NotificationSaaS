const router = global.router;

const utils = require("../utils/index");

const multer = require("multer");

const fs = require("fs");

const uploadPath = "./uploads/";

const AWS = require("aws-sdk");

// Create DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
var docClient = new AWS.DynamoDB.DocumentClient();

var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, uploadPath);
  },
  filename: function (request, file, callback) {
    callback(null, file.originalname);
  },
});

// handle all file cleanup code
function cleanup(req, res) {
  // delete all files
  for (var f in req.files) {
    for (var ff in req.files[f]) {
      fs.unlinkSync(uploadPath + req.files[f][ff].originalname);
    }
  }
}

/**
 * Param:
 *        uid : username of user
 *        bodies: comma seperated list of bodis
 *        titles : comma seprated list of title
 * deletePostQuery
 */
router.post(
  "/notifications/push",
  multer({ storage: storage }).fields([{ name: "images", maxCount: 100 }]),
  async function (req, res) {
    var username = utils.getUsernameFromReq(req);
    if (req.query.debug != null) username = req.query.debug;
    if (username == null) {
      res.jsonp({ error: "Query param 'uid' does not exist" });
      return;
    }

    if (req.query.titles == null || req.query.bodies == null) {
      res.jsonp({ error: "Query param 'titles' or 'bodies' does not exist" });
      return;
    }

    console.log(process.env.AWS_ACCESS_KEY_ID);

    var titles = req.query.titles.split(",");
    var bodies = req.query.bodies.split(",");
    if (titles == null && req.query.titles) titles = [req.query.titles];
    if (bodies == null && req.query.bodies) bodies = [req.query.bodies];
    if (titles == null || bodies == null) {
      res.jsonp({
        error:
          "Query param 'titles' or 'bodies' does not exist as list seperated by, ",
      });
      return;
    }
    utils.pushNotification(
      username,
      titles,
      bodies,
      req.query.deletePostQuery == null ? true : req.query.deletePostQuery,
      res,
      req.files
    );
    cleanup(req, res);
  }
);

module.exports = router;
