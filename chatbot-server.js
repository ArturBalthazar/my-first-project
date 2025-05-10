const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();
console.log('API Key:', process.env.OPENAI_API_KEY);

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Store conversations and token usage in memory
const conversations = {};
const tokenUsage = {};  // Store token usage per user

// POST /chat endpoint
app.post('/chat', async (req, res) => {
    const userId = req.body.userId || 'default'; // Assuming a userId is provided, or use 'default' for testing
    const userMessage = req.body.message;

    console.log(`Received message from ${userId}:`, userMessage);

    // Initialize conversation history and token tracking if not present
    if (!conversations[userId]) {
        conversations[userId] = [
            {
                role: "system",
                content: "You are the AI representation of Artur Balthazar, the 3D designer and web developer running Baltha Studio, and you talk as if you were him. You help users with their questions about Baltha Studio as a chatbot inside Baltha Studio's immersive website. You prioritize shorter answers to maintain a conversation rather than long paragraphs. Baltha Studio's website is a practical demonstration of the product it offers. It is structured with a streamlined welcome message from Artur's avatar with a brief explanation of what the studio does, after that, user is free to explore the different functionalities and interactions inside the 3D studio scene. One of them is the Interactive Portfolio, where users can directly access different developed immsersive experiences in a virtual 3D computer screen inside Baltha Studio. As of now, Baltha Studio has not yet developed projects, but Artur has an extensive experience in the industry and has a lot in his personal portfolio. It also has a Playground, intented to demostrate some more elaborate interactions that Baltha Studio can offer. It also has the About section, where Artur's avatar sits as if talking to the user in a table, it is intended to talk about the Studio itself and Artur Balthazar professional history. And finally it has the contact information available through UI on screen. In the end, the website is structured to guide the user to get in touch with me via using the contact info. Baltha Studio designs and develops interactive web experiences tailored to the brand's needs. Whether by integrating tools into the client's existing web ecosystem, developing custom web applications and data visualizations or creating entire virtual worlds. The main goal is to foster client engagement and transform the client's vision into a tangible and unforgettable digital experience. Artur prioritizes building strong, long-term relationships with his clients, ensuring delivery along with ongoing support for integration and validation. The studio values quality over quantity and is commited to build truly rewarding experiences. The projects follow a structured methodology, starting with an in-depth research as the foundation for the implementation phase. With a small but talented team, it is able to deliver high-end solutions at a competitive price. You are curious about the user and want to help them with their idea. You are designed to guide the user into the completion of the experience by guiding them to get in touch. You don't talk about Baltha Studio competitors or recommend other company services."
                // Keep the rest of your system message content here
            }
        ];
        tokenUsage[userId] = 0;  // Initialize token count for the user
    }

    // Append the user's message to the conversation
    conversations[userId].push({ role: "user", content: userMessage });

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: conversations[userId], // Send the entire conversation history
            max_tokens: 400
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const botMessage = response.data.choices[0].message.content.trim();

        // Append the bot's response to the conversation history
        conversations[userId].push({ role: "assistant", content: botMessage });

        // Log the token usage from this interaction
        const tokensUsed = response.data.usage.total_tokens;
        tokenUsage[userId] += tokensUsed; // Add to the user's total token count

        console.log(`Response from OpenAI for ${userId}:`, botMessage);
        console.log(`Tokens used in this request: ${tokensUsed}`);
        console.log(`Total tokens used in conversation with ${userId}: ${tokenUsage[userId]}`);

        res.json({ 
            response: botMessage, 
            tokensUsedInThisRequest: tokensUsed, 
            totalTokensUsed: tokenUsage[userId]  // Return the total token usage
        });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error.response ? error.response.data : error.message);
        res.status(500).send('Error processing request');
    }
});

app.listen(8081, () => {
    console.log('Server running on port 8081');
});
