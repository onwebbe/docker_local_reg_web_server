var express = require('express');
var router = express.Router();
var request = require('superagent');

/* GET users listing. */
router.get('/getImageList', async function(req, res, next) {
  try {
    let imageList = await getImageInfoList(req);
    let response = {
      success: true,
      data: imageList
    }
    res.send(response);
  } catch(e) {
    res.send({
      success: false,
      msg: e
    });
  }
  
});

async function getImageInfoList(req) {
  return new Promise( async (resolve, reject) => {
    let host = req.query['apihost'];
    let port = req.query['apiport'];
    let apiVersion = req.get('apiVersion');
    try {
      let imageList = await getImageList(host, port);
      let finalImageList = await getTagInfoList(imageList, host, port);
      resolve(finalImageList);
    } catch(e) {
      reject(e);
    }
  });
}
function getTagInfoList(imageList, host, port) {
  return new Promise( async (resolve, reject) => {
    let tagsPromiseList = [];
    let imageItemList = [];
    for (let i = 0; i < imageList.length; i++) {
      let imageName = imageList[i];
      let imageWithTag = {
        tags: []
      };
      try {
        imageWithTag = await getTagInfo(imageName, host, port);
      } catch (e){
        imageWithTag = {
          tags: [],
          error: 'Failed to get tag Info'
        };
      }
      
      let tags = imageWithTag.tags;
      let tagList = [];
      for (let j = 0; j < tags.length; j++) {
        let tag = tags[j];
        tagList.push({
          tagName: tag,
          error: null
        })
      }
      let imageItem = {
        imageName: imageWithTag.name,
        tags: tagList
      }
      imageItemList.push(imageItem);
    }
    resolve(imageItemList);
    // Promise.all(tagsPromiseList).then((tagsList) => {
    //   let imageItemList = [];
    //   for (let j = 0; i < tagsList.length; j++) {
    //     let imageItem = {
    //       imageName: imageList[j],
    //       tags: tagsList[j]
    //     }
    //     imageItemList.push(imageItem);
    //   }
    //   resolve(imageItemList);
    // });
  });
}
function getTagInfo(imageName, host, port) {
  return new Promise( async (resolve, reject) => {
    var url = 'http://' + host + ':' + port + '/v2/' + imageName + '/tags/list';
    request
      .get(url)
      .set('Content-Type', 'application/json')
      .end(function(err, requestRes){
        if (err) {
          reject(err);
        };
        if (requestRes) {
          resolve(requestRes.body);
        } else {
          reject('failed to get tag info for image:'  + imageName);
        }
        
    });
  });
}
function getImageList (host, port) {
  return new Promise( async (resolve, reject) => {
    var url = 'http://' + host + ':' + port + '/v2/_catalog';
    request
      .get(url)
      .set('Content-Type', 'application/json')
      .end(function(err, requestRes){
        if (err) {
          reject(err);
        };
        if (requestRes) {
          resolve(requestRes.body.repositories);
        } else {
          reject('Error in get docker info');
        }
        
    });
  });
}
module.exports = router;
