import Replicate from 'replicate';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');

// Body parser middleware for handling POST data
app.use('/public', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
      if (path.extname(filePath) === '.css') {
          res.setHeader('Content-Type', 'text/css');
      }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// index 

app.get('/', (req, res) => {
  let heading = 'The Sandwich Saver';
  let directions = "Welcome to the Sandwich Saver! Please enter the ingredients in your leftover sandwich and we'll give you ideas on how to use them up!";

  res.render('pages/index', {
    heading: heading,
    directions: directions,
  });
});

// Handle POST request to add ingredient
app.post('/addIngredient', (req, res) => {
  const text = req.body.ingredient;
  if (text && text.trim() !== '') {
    // Process the ingredient addition here (if needed)
    console.log('Received ingredient:', text);
    res.status(200).send('Ingredient added successfully!');
  } else {
    res.status(400).send('Invalid ingredient data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/getsuggestions', async (req, res) => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    userAgent: 'https://www.npmjs.com/package/create-replicate'
  });

  const ingredients = req.body.ingredients;
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).send('No ingredients provided');
  }

  const input = {
    top_k: 0,
    top_p: 0.9,
    prompt: `Take the following list of leftover sandwich ingredients and recommend recipes that can be cooked utilizing all ingredients. All ingredients must be used but do not have to be used in the same recipe. You can recommend no more than three recipes total. Please assume that the amount of ingredients provided is equal to that of a 6-inch sub at Subway. \nDo NOT preface your response. For each individual recipe, please format included ingredients as a bulleted list and recipe instructions as a numbered list. If the recipes require any additional ingredients, please ensure they are included in the bulleted list.\n\nHere is your list of ingredients: ${ingredients.join(', ')}`,
    max_tokens: 512,
    min_tokens: 0,
    temperature: 1,
    system_prompt: "You are a culinary expert with experience in a diverse range of culinary recipes from different international cultures. ",
    length_penalty: 1,
    stop_sequences: ",",
    prompt_template: "system\n\nYou are a helpful assistantuser\n\n{prompt}assistant\n\n",
    presence_penalty: 1.15,
    log_performance_metrics: false
  };

  try {
    const suggestions = [];
    for await (const event of replicate.stream("meta/meta-llama-3-70b-instruct", { input })) {
      suggestions.push(event.toString());
    }
    res.status(200).json({ suggestions: suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).send('Error generating suggestions');
  }
});