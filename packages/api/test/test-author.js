#!/usr/bin/env node

// Test script for Author API integration
// Run with: node test/test-author.js

import { buildInitAuthor, buildCreateAuthorItem } from '../src/author.js';
import LearnositySDK from 'learnosity-sdk-nodejs';

// Mock configuration (replace with actual keys in production)
const sdk = new LearnositySDK();
const key = process.env.LEARNOSITY_KEY || 'test-key';
const secret = process.env.LEARNOSITY_SECRET || 'test-secret';
const domain = 'localhost';

// Mock data API function
const mockDataApi = async ({ route, request }) => {
  console.log('Mock API call to:', route);
  console.log('Request:', JSON.stringify(request, null, 2));
  return { success: true };
};

async function testAuthorInit() {
  console.log('\n=== Testing Author API Initialization ===\n');
  
  const initAuthor = buildInitAuthor({ sdk, key, secret, domain });
  
  // Test 1: Basic initialization
  const basicInit = await initAuthor({
    mode: 'item_edit',
    data: { reference: 'test-item-1' }
  });
  console.log('Test 1 - Basic init:', basicInit ? 'PASS' : 'FAIL');
  
  // Test 2: With custom widget types
  const customWidgetInit = await initAuthor({
    mode: 'item_edit',
    widgetTypes: ['mcq', 'shorttext', 'formula'],
    data: { reference: 'test-item-2' }
  });
  console.log('Test 2 - Custom widgets:', customWidgetInit ? 'PASS' : 'FAIL');
  
  // Test 3: With custom widget templates
  const templateInit = await initAuthor({
    mode: 'item_edit',
    widgetTypes: ['mcq'],
    customWidgets: [
      {
        name: 'Math MCQ',
        widgettype: 'mcq',
        template: {
          type: 'mcq',
          data: {
            stimulus: 'Solve: {{var:equation}}'
          }
        }
      }
    ],
    data: { reference: 'test-item-3' }
  });
  console.log('Test 3 - Custom templates:', templateInit ? 'PASS' : 'FAIL');
}

async function testCreateAuthorItem() {
  console.log('\n=== Testing Author Item Creation ===\n');
  
  const createAuthorItem = buildCreateAuthorItem({ 
    sdk, 
    key, 
    secret, 
    domain, 
    dataApi: mockDataApi 
  });
  
  // Test 1: Create empty item
  const emptyItem = await createAuthorItem({
    item: { id: 'test-1' },
    widgetTypes: ['mcq', 'shorttext']
  });
  console.log('Test 1 - Empty item:', emptyItem.type === 'author' ? 'PASS' : 'FAIL');
  
  // Test 2: Create item with questions
  const itemWithQuestions = await createAuthorItem({
    item: {
      id: 'test-2',
      questions: [
        {
          type: 'mcq',
          reference: 'q1',
          data: {
            stimulus: 'What is 2 + 2?',
            options: [
              { label: 'A', value: '3' },
              { label: 'B', value: '4' }
            ]
          }
        }
      ]
    },
    widgetTypes: ['mcq'],
    mode: 'item_edit'
  });
  console.log('Test 2 - Item with questions:', 
    itemWithQuestions.data.reference ? 'PASS' : 'FAIL');
  
  // Test 3: Custom widgets and templates
  const customItem = await createAuthorItem({
    item: { id: 'test-3' },
    widgetTypes: ['mcq', 'formula'],
    customWidgets: [
      {
        name: 'Custom MCQ',
        widgettype: 'mcq'
      }
    ],
    mode: 'item_edit'
  });
  console.log('Test 3 - Custom widgets:', 
    customItem.data.customWidgets ? 'PASS' : 'FAIL');
}

async function runTests() {
  console.log('Starting Author API Tests...');
  console.log('=====================================');
  
  try {
    await testAuthorInit();
    await testCreateAuthorItem();
    
    console.log('\n=====================================');
    console.log('All tests completed!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runTests();