const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database()

exports.main = async (event, context) => {
  const {
    paggeNo,
    paggeSize
  } = event
  const data = await db
    .collection('products')
    .where({
      
    })
    .get()
  return data
};
