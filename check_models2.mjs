const fs = require('fs');

const apiKey = "AIzaSyDlDhuOBEG07npAVa6b9ylBH509JDgXpdg";

async function checkModels() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
    const data = await response.json();
    fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkModels();
