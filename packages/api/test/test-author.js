#!/usr/bin/env node

// Test script for Author API integration
// Run with: node test/test-author.js

import { buildInitAuthor, buildCreateAuthor } from '../src/author.js';
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

async function testCreateAuthor() {
  console.log('\n=== Testing Author Item Creation ===\n');
  
  const createAuthor = buildCreateAuthor({ 
    sdk, 
    key, 
    secret, 
    domain, 
    dataApi: mockDataApi 
  });
  
  // Test 1: Basic Author creation
  const basicAuthor = await createAuthor({
    mode: 'item_edit',
    reference: 'test-item-1'
  });
  console.log('Test 1 - Basic Author:', basicAuthor.type === 'author' ? 'PASS' : 'FAIL');
  
  // Test 2: Author with config
  const authorWithConfig = await createAuthor({
    mode: 'item_edit',
    reference: 'test-item-2',
    config: {
      widget_templates: {
        filter: {
          widgettype: ['mcq', 'shorttext']
        }
      }
    }
  });
  console.log('Test 2 - Author with config:', 
    authorWithConfig.data.reference ? 'PASS' : 'FAIL');
  
  // Test 3: Author with user and organisation
  const fullAuthor = await createAuthor({
    mode: 'item_list',
    organisation_id: 123,
    user: {
      id: 'user-123',
      firstname: 'Test',
      lastname: 'User'
    },
    config: {
      item_list: {
        toolbar: {
          add: true,
          browse: true
        }
      }
    }
  });
  console.log('Test 3 - Full Author config:', 
    fullAuthor.data.user ? 'PASS' : 'FAIL');
}

async function runTests() {
  console.log('Starting Author API Tests...');
  console.log('=====================================');
  
  try {
    await testAuthorInit();
    await testCreateAuthor();
    
    console.log('\n=====================================');
    console.log('All tests completed!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the tests
runTests();