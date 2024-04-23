const express = require('express');
const cloudinary = require('cloudinary').v2;
const imageModel = require('./Model/imageModel');
const sharp = require('sharp');
const multer = require('multer');
require('./Mongo.js');

const app = express();
const upload = multer(); 

cloudinary.config({ 
  cloud_name: 'ds4kxxmnn', 
  api_key: '115896147985788', 
  api_secret: 'MSoUWXOPWc8cM4CmL3IgwgrSszI' 
});

const sizes = [

  { width: 100, height: 100 },
  { width: 200, height: 200 },
  { width: 300, height: 300 },
  { width: 400, height: 400 }
];

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file; 
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];

    for (const size of sizes) {
      const resizedBuffer = await sharp(file.buffer)
        .resize(size.width, size.height)
        .toBuffer();

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });

        uploadStream.end(resizedBuffer);
      });

      uploadedUrls.push(result.url);
    }

    const data = new imageModel({ imageUrls: uploadedUrls });
    const savedData = await data.save();

    res.json({ imageUrls: uploadedUrls }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/read',async(req,res)=>{
  const data=await imageModel.find({});
  res.send(data);
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
