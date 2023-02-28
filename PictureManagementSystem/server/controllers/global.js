
const globalModel = require('../models/global');
const setGlobalCount = async(count) =>{
    await globalModel.findOneAndUpdate({id:'count'},{
        $set:{
            id:'count',
            content:{count:count}
        }
    },{
        upsert:true
    })
    return true;
} 
const getGlobalCount = async() => {
  const res = await globalModel.find({id:'count'})
  if(res.length === 0){
    await setGlobalCount(0)
    return 0;
  }
  return res[0].content.count;
}

const setGlobalTop = async(data) =>{
    await globalModel.findOneAndUpdate({id:'topPreSort'},{
        $set:{
            id:'topPreSort',
            content:data
        }
    },{
        upsert:true
    })
    return true;
} 
const getGlobalTop = async() => {
    const res = await globalModel.find({id:'topPreSort'})
    if(res.length === 0){
      await setGlobalTop(null)
      return null;
    }
    return res[0].content;
  }

module.exports = {
  getGlobalCount,
  getGlobalTop,
  setGlobalTop,
  setGlobalCount,
}