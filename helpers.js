function mobilenetConfig(){
    return{imgChannel:3,
      imgWidth: 224,
      imgHeight: 224,
      dbName: "embeddings",
      dbVersion:1,
      storeName:"mobilenet"
    }
  }
  
  function MNISTConfig(){
    return{imgChannel:1,
      imgWidth: 28,
      imgHeight: 28,
      dbName: "embeddings",
      dbVersion:1,
      storeName:"MNIST"
    }
  }
  
  function loadConfig(arch){
  
      if(arch=='CustomConvNet'){
          return  MNISTConfig()
      } else if (arch=='MobileNet'){
          return mobilenetConfig()
      } else{
          console.log("Unknow architecture")
      }
  }
  
  async function loadModel(modelURL){
    model= await tf.loadLayersModel(modelURL+".json");
    metaData = await load(modelURL);
    arch = metaData['arch']
    config = loadConfig(arch);
    imgChannel = config["imgChannel"];
    imgWidth = config["imgWidth"];
    imgHeight= config["imgHeight"];
      if(arch=='CustomConvNet'){
        console.log('CustomConvNet Loaded');
        predictButton.disabled = false;
        predictWebcamButton.disabled = false;  
        return await loadCustomConvnet(modelURL);
      } else if (arch=='MobileNet'){
        console.log('Mobilenet Loaded');
        return await loadMobilenet(modelURL);
      } else{
          console.log("Unknow architecture")
      }
  }
  
  async function predictExample(model,fileURL){
      if(arch=='CustomConvNet'){
          return predictCustomConvnet(model,fileURL)
      } else if (arch=='MobileNet'){
          return await predictMobilenet(model,fileURL)
      } else{
          console.log("Unknow architecture")
      }
  }
  
  async function loadMobilenet(modelURL){
    truncatedMobileNet = await loadTruncatedMobileNet();
    model= await tf.loadLayersModel(modelURL+".json");
    metaData = await load(modelURL);
    await model.setUserDefinedMetadata(metaData)
    return model
  }
  
  async function loadCustomConvnet(modelURL){
    model= await tf.loadLayersModel(modelURL+".json");
    metaData = await load(modelURL);
    await model.setUserDefinedMetadata(metaData)
    return model
  }
  async function load(url) {
    let obj = await (await fetch(url+'.txt')).json();
    console.log(obj);
    return obj
  }
  
  async function loadTruncatedMobileNet() {
    const mobilenet = await tf.loadLayersModel(
      'https://storage.googleapis.com/' +
          'tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
  
    const layer = mobilenet.getLayer(
        'conv_pw_13_relu');
    return tf.model({
      inputs: mobilenet.inputs,
      outputs: layer.output
    });
  }
  async function predictMobilenet(model,fileURL){
  data = await getImageValue(fileURL);
  label2intInv = model.getUserDefinedMetadata()['label2intInv']
  const predictedClass = tf.tidy(()=>{
    x0=tf.tensor(data["data"],[data["width"],data["height"],4]);//RGBALPHA and normalize (Assume input is 0 to 255) #TODO: normalize
    x = x0.slice([0,0,0],[data["width"],data["height"],imgChannel]);//RGB
    x = tf.image.resizeNearestNeighbor(x, [imgWidth,imgHeight], true);//RGB
    x=x.expandDims(0).toFloat().div(127).sub(1)
    x = truncatedMobileNet.predict(x);
    x = x.dataSync();
    x = Array.from(x);
    x = tf.tensor(x).expandDims(0);
    p = model.predict(x);
    return p.as1D().argMax();
    /*pArr = p.arraySync()[0]
    preds={}
    for(var i=0;i<pArr.length;i++){
    preds[label2intInv[i]]=pArr[i].toFixed(5)
    }
    return preds*/
  });
      const classId = (await predictedClass.data())[0];
      out = await label2intInv[classId];//predictedClass
      console.log(out)
      return out
  }
  
  async function predictCustomConvnet(model,fileURL){
    data = await getImageValue(fileURL);
    label2intInv = model.getUserDefinedMetadata()['label2intInv']
    const predictedClass = tf.tidy(()=>{
      x0=tf.tensor(data["data"],[data["width"],data["height"],4]);//RGBALPHA and normalize (Assume input is 0 to 255) #TODO: normalize
      x = x0.slice([0,0,0],[data["width"],data["height"],imgChannel]);//RGB
      x = tf.image.resizeNearestNeighbor(x, [imgWidth,imgHeight], true);//RGB
      x=x.expandDims(0).toFloat().div(127).sub(1)
      p = model.predict(x);
      return p.as1D().argMax();
      /*pArr = p.arraySync()[0]
      preds={}
      for(var i=0;i<pArr.length;i++){
      preds[label2intInv[i]]=pArr[i].toFixed(5)
      }
      return preds*/
    });
        const classId = (await predictedClass.data())[0];
        out = await label2intInv[classId];//predictedClass
        console.log(out)
        return out
    }
    function getImageValue(url) {
    return new Promise(async(resolve) => {
        //const response = await fetch(url);
        //const blob = await response.blob();
    
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
            getImageData(img)
        
            
    function getImageData(img){
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        var imageData = context.getImageData(0,0,img.width,img.height);
        var data = imageData.data;
  
        resolve({'data':Array.from(data),"width":img.width,"height":img.height});
    }
  }
  img.src=url;
  })
  }
  
  function getImageValue2(url) {
    return new Promise(async(resolve) => {
        const response = await fetch(url);
        const blob = await response.blob();
    
        var img = new Image();
        //img.crossOrigin = "anonymous";
        img.onload = function() {
            getImageData(img)
        
            
    function getImageData(img){
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        var imageData = context.getImageData(0,0,img.width,img.height);
        var data = imageData.data;
  
        resolve({'data':Array.from(data),"width":img.width,"height":img.height});
    }
  }
  img.src=URL.createObjectURL(blob);
  })
  }