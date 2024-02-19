const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const bodyParser = require('body-parser');
const express = require('express')
const cors = require('cors')
const fs = require('fs').promises;
require('dotenv').config();
const fileType = require('file-type');

const app = express()
app.use(bodyParser.raw({ type: 'audio/*' , limit: '10mb' }));
app.use(cors())
const logger = require('./logger'); 
app.use(logger());

const port = process.env.PORT || 8080;
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;
const model = process.env.model || 'es-LA_Telephony';
const customizationId = process.env.LANGUAGE_CUSTOMIZATION_ID;

function getBufferFileExtension(buffer) {
  // Get file type information directly from the buffer
  const fileInfo = fileType(buffer);

  // Extract file extension
  if (fileInfo) {
    return fileInfo.ext;
  } else {
    // If file type cannot be determined, return 'unknown'.
    return 'unknown';
  }
}

/* * * * *
 * IBM CLOUD: Use the following code only to
 * authenticate to IBM Cloud.
 * * * * */

const { IamAuthenticator } = require('ibm-watson/auth');
const speechToText = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: apiKey,
  }),
  serviceUrl: apiUrl,
});

/*
const { CloudPakForDataAuthenticator } = require('ibm-watson/auth');
 const speechToText = new SpeechToTextV1({
   authenticator: new CloudPakForDataAuthenticator({
     username: '{username}',
     password: '{password}',
     url: 'https://{cpd_cluster_host}{:port}',
  }),
  serviceUrl: '{url}',
 })
*/
/*

* * * * *
 * Add words to the model.
 * * * * *

const addWordsParams = {
  customizationId: '8acb6748-8706-412e-959c-724f500670a9',
  words: [
    {word: 'banco', display_as: 'Banco'},
    {word: 'galicia', display_as: 'Galicia'},
    {word: 'tarjeta'},
    {word: 'gold', display_as: 'Gold'},
    {word: 'visa', display_as: 'Visa'},
    {word: 'american', display_as: 'American'},
    {word: 'homebanking'},
  ],
};

 * * * * *
 * Train custom model
 * * * * *

const trainLanguageModelParams = {
    customizationId: '8acb6748-8706-412e-959c-724f500670a9',
};

 * * * * *
 * Get language model
 * * * * *
const getLanguageModelParams = {
  customizationId: '8acb6748-8706-412e-959c-724f500670a9',
};

speechToText.addWords(addWordsParams)
  .then(result => {
    console.log("OK")
    speechToText.trainLanguageModel(trainLanguageModelParams)
      .then(result => {
        speechToText.getLanguageModel(getLanguageModelParams)
          .then(languageModel => {
            console.log(JSON.stringify(languageModel, null, 2));
          })
          .catch(err => {
            console.log('error:', err);
          });
      })
      .catch(err => {
        console.log('error:', err);
      });
  })
  .catch(err => {
    console.log('error:', err);
  });

      */

// Endpoint to use speech to text, you need to add the audio in binary format in the body.
app.post('/stt', async (req, res, err) => {
  try {
    // Get the audio data from the request body
    const audioData = req.body;

    // Get the extension of the audio file
    const extension = await getBufferFileExtension(audioData);

    const params = {
      audio: audioData,
      languageCustomizationId: customizationId,
      contentType: `audio/${extension}`,
      model: model,
    };

    // Do the transcription
    const transcriptionResult = await speechToText.recognize(params);

    // Get the transcription
    const transcriptionText = transcriptionResult.result.results.map(result => result.alternatives[0].transcript).join(' ');

    await fs.appendFile('logs.txt', transcriptionText + '\n');
    res.status(200).json({ transcription: transcriptionText });
    
  } catch (error) {
    console.error('Error saving audio file:', error);
    res.status(error.code).send({error: error});
  }
});

app.get('/logs', async (req, res) => {
  try {

    const pathFile = './logs.txt';

    const content = await fs.readFile(pathFile, 'utf-8');

    await fs.appendFile('logs.txt', '\n');
    res.status(200).send(content);
  } catch (error) {
    console.error('Error reading log file:', error.message);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
