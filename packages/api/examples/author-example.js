// Example usage of Author API with Graffiticode L0158

// 1. Basic Author API initialization with item edit mode
const basicAuthorInit = {
  type: "author",
  mode: "item_edit",
  data: {
    reference: "my-item-123"
  }
};

// 2. Author API with custom widget types (limiting available widgets)
const authorWithCustomWidgets = {
  type: "author", 
  mode: "item_edit",
  widgetTypes: ["mcq", "shorttext", "longtext", "formula"],
  data: {
    reference: "limited-widgets-item"
  }
};

// 3. Author API with custom widget templates
const authorWithTemplates = {
  type: "author",
  mode: "item_edit",
  widgetTypes: ["mcq", "shorttext"],
  customWidgets: [
    {
      name: "Math MCQ Template",
      widgettype: "mcq",
      template: {
        type: "mcq",
        data: {
          stimulus: "Solve: {{var:equation}}",
          options: [
            { label: "A", value: "{{var:option_a}}" },
            { label: "B", value: "{{var:option_b}}" },
            { label: "C", value: "{{var:option_c}}" },
            { label: "D", value: "{{var:option_d}}" }
          ],
          validation: {
            scoring_type: "exactMatch",
            valid_response: {
              score: 1,
              value: ["{{var:correct_answer}}"]
            }
          }
        }
      }
    },
    {
      name: "Essay Question Template",
      widgettype: "longtext",
      template: {
        type: "longtext",
        data: {
          stimulus: "Write an essay about {{var:topic}}",
          max_length: 1000,
          show_word_count: true,
          show_word_limit: "always"
        }
      }
    }
  ],
  data: {
    reference: "custom-template-item"
  }
};

// 4. Author API in item list mode (browse existing items)
const authorItemList = {
  type: "author",
  mode: "item_list",
  data: {}
};

// 5. Author API with pre-populated item and questions
const authorWithContent = {
  type: "author",
  mode: "item_edit",
  item: {
    reference: "prepopulated-item",
    questions: [
      {
        type: "mcq",
        reference: "q1",
        data: {
          stimulus: "What is 2 + 2?",
          options: [
            { label: "A", value: "3" },
            { label: "B", value: "4" },
            { label: "C", value: "5" },
            { label: "D", value: "6" }
          ],
          validation: {
            scoring_type: "exactMatch",
            valid_response: {
              score: 1,
              value: ["B"]
            }
          }
        }
      },
      {
        type: "shorttext",
        reference: "q2",
        data: {
          stimulus: "What is the capital of France?",
          validation: {
            scoring_type: "exactMatch",
            valid_response: {
              score: 1,
              value: "Paris"
            }
          }
        }
      }
    ]
  }
};

// Example Graffiticode dialect usage:
// AUTHOR({
//   mode: "item_edit",
//   widgetTypes: ["mcq", "shorttext", "longtext"],
//   customWidgets: [...],
//   item: {...}
// })

// To initialize the Author API:
// INIT({
//   type: "author",
//   mode: "item_edit",
//   widgetTypes: ["mcq", "shorttext"],
//   data: {...}
// })

module.exports = {
  basicAuthorInit,
  authorWithCustomWidgets,
  authorWithTemplates,
  authorItemList,
  authorWithContent
};
