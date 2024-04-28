import request from 'supertest'; 
import app from '../server.js'; // Import your Express app instance

import Reel from '../models/reel.js'; // Import your Reel model
describe('Reel API Endpoints', () => {
  // Test for adding a new reel
  test('should add a new reel', async () => {
    const newReelData = {
      // Provide the necessary data for creating a new reel
      // For example:
      userName: 'TestUser',
      url: 'https://example.com',
      // Add other necessary fields
    };

    // Send a POST request to the /api/reel endpoint with the newReelData
    const response = await request(app)
      .post('/api/reel')
      .send(newReelData);

    // Expect the response status to be 201 (Created)
    expect(response.status).toBe(201);

    // Optionally, you can verify the response body
    // For example, if your controller returns the created reel
    expect(response.body).toHaveProperty('_id'); // Assuming your reel model has an _id field
    expect(response.body.userName).toBe(newReelData.userName);
    expect(response.body.url).toBe(newReelData.url);
    // Add other assertions as needed
  });


});


jest.mock('../models/reel.js', () => ({
  find: jest.fn(),
}));

describe('GET /reel', () => {
  test('should get all reels', async () => {
    // Define mock data for reels
    const reelsData = [
      { _id: '1', userName: 'User1', url: 'https://example.com/reel1' },
      { _id: '2', userName: 'User2', url: 'https://example.com/reel2' },
    ];

    // Mock the behavior of Reel.find() to return a Promise that resolves with the reelsData when called
    Reel.find.mockResolvedValue(reelsData);

    // Send a GET request to the /api/reel endpoint
    const response = await request(app).get('/api/reel');

    // Expect the response status to be 200
    expect(response.status).toBe(200);

    // Optionally, you can verify the response body
    expect(response.body).toEqual(reelsData);
  });
});

describe('GET /api/products', () => {
    test('should get all products', async () => {
      // Send a GET request to the /api/products endpoint
      const response = await request(app).get('/api/products');
  
      // Expect the response status to be 200 (OK)
      expect(response.status).toBe(200);
  
      // Expect the response body to be an array
      expect(Array.isArray(response.body)).toBe(true);
  
      // Add more assertions to validate the response body as needed
    });
  });
  
  describe('POST /api/products', () => {
    test('should add a new product', async () => {
      const newProductData = {
        name: 'Test Product',
        price: 99.99,
        // Add other necessary fields
      };
  
      // Send a POST request to the /api/products endpoint with the newProductData
      const response = await request(app)
        .post('/api/products')
        .send(newProductData);
  
      // Expect the response status to be 201 (Created)
      expect(response.status).toBe(201);
  
      // Optionally, you can verify the response body
      // For example, if your controller returns the created product
      expect(response.body).toHaveProperty('_id'); // Assuming your product model has an _id field
      expect(response.body.name).toBe(newProductData.name);
      expect(response.body.price).toBe(newProductData.price);
      // Add other assertions as needed
    });
  
    // Add more test cases for edge cases or validation errors
  });
  