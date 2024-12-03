const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Array to store articles (acts as an in-memory database)
let articles = [];
let idCounter = 1;

// Endpoint to add articles
app.post('/articles', (req, res) => {
    const { title, content, tags } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    const newArticle = {
        id: idCounter++,
        title,
        content,
        tags: tags || [],
        createdAt: new Date().toISOString()
    };

    articles.push(newArticle);
    res.status(201).json(newArticle);
});

// Endpoint to search articles by keyword or tag
app.get('/articles/search', (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    const results = articles.filter(article =>
        article.title.includes(query) || article.content.includes(query) || article.tags.includes(query)
    );

    // Sorting by relevance (frequency of keywords in title and content)
    results.sort((a, b) => {
        const aRelevance = (a.title.match(new RegExp(query, 'g')) || []).length +
                           (a.content.match(new RegExp(query, 'g')) || []).length;
        const bRelevance = (b.title.match(new RegExp(query, 'g')) || []).length +
                           (b.content.match(new RegExp(query, 'g')) || []).length;
        return bRelevance - aRelevance; // Sort descending by relevance
    });

    res.json(results);
});

// Endpoint to retrieve a full article by ID
app.get('/articles/:id', (req, res) => {
    const { id } = req.params;
    const article = articles.find(a => a.id === parseInt(id));

    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
