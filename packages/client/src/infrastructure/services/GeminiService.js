// import apiClient from '../api/apiClient';
import config from '../../core/application/config';

/**
 * Service for interacting with the Gemini API
 */
class GeminiService {
  constructor() {
  this.apiKey = config.GEMINI_API_KEY;
  this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  this.maxRetries = 3;
  }

  /**
   * Analyze diff using Gemini API
   * @param { Object } diff - Diff object
   * @param { string } prompt - User prompt
   * @returns { Promise<Object> } - Analysis result
   */
  async analyzeDiff(diff, prompt) {
const retries = 0;
  let lastError = null;
  let missingFields = [];

  while (retries < this.maxRetries) {
  try {
  const enhancedPrompt = this.enhancePrompt(prompt, diff, missingFields);
  const response = await this.callGeminiAPI(enhancedPrompt);
  
  // Parse and validate the response
  const parsedResponse = this.parseResponse(response);
  const validationResult = this.validateResponse(parsedResponse);
  
  if (validationResult.isValid) {
    return parsedResponse;
  } else {
    // If response is not valid, retry with corrected prompt
    missingFields = validationResult.missingFields;
    retries++;
    console.warn(`Retry ${ retries }/${ this.maxRetries }: Missing fields in Gemini response`, missingFields);
  }
  } catch (error) {
  lastError = error;
  retries++;
  console.error(`Retry ${ retries }/${ this.maxRetries }: Error calling Gemini API`, error);
  }
  }

  // If we've exhausted retries, return partial response or throw error
  if (lastError) {
  console.error('Failed to get valid response from Gemini after multiple retries', lastError);
  throw new Error('Failed to analyze diff with AI: ' + lastError.message);
  }
  
  return {
  partial: true,
  missingFields,
  message: 'Partial analysis available. Some information could not be retrieved.'
  };
  }

  /**
   * Enhance the prompt with instructions and context
   * @param { string } userPrompt - Original user prompt
   * @param { Object } diff - Diff object
   * @param { Array } missingFields - Fields missing from previous attempts
   * @returns { string } - Enhanced prompt
   */
  enhancePrompt(userPrompt, diff, missingFields = []) {
  // Start with a system prompt that instructs Gemini how to respond
  const enhancedPrompt = `
You are a code review assistant analyzing a git diff. Please analyze the following diff and respond in a structured JSON format.

${ missingFields.length > 0 ? `Your previous response was missing these fields: ${ missingFields.join(', ') }. Please ensure they are included this time.` : '' }

Your response MUST be valid JSON with the following structure:
{
  'summary': 'Brief summary of the changes',
  'severity': 'high|medium|low',
  'issues': [
  {
  'title': 'Issue title',
  'description': 'Detailed description',
  'severity': 'high|medium|low',
  'location': {
  'file': 'path/to/file',
  'line': 'line number or range (optional)'
  }
  }
  ],
  'recommendations': [
  'Recommendation 1',
  'Recommendation 2'
  ],
  'complexity': {
  'overall': 'percentage change (number)',
  'filesIncreased': 'number of files with increased complexity',
  'filesDecreased': 'number of files with decreased complexity'
  }
}

User's request: ${ userPrompt }

Here is the diff to analyze:
\`\`\`
${ JSON.stringify(diff, null, 2) }
\`\`\`
`;

  return enhancedPrompt;
  }

  /**
   * Call the Gemini API
   * @param { string } prompt - Enhanced prompt
   * @returns { Promise<Object> } - Raw API response
   */
  async callGeminiAPI(prompt) {
  const url = `${ this.baseUrl }?key=${ this.apiKey }`;
  
  const requestBody = {
  contents: [
  {
    parts: [
    {
    text: prompt
    }
    ]
  }
  ],
  generationConfig: {
  temperature: 0.2,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  }
  };
  
  try {
  const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Gemini API error (${ response.status }): ${ errorText }`);
  }
  
  return await response.json();
  } catch (error) {
  console.error('Error calling Gemini API:', error);
  throw error;
  }
  }

  /**
   * Parse the Gemini API response
   * @param { Object } response - Raw API response
   * @returns { Object } - Parsed response
   */
  parseResponse(response) {
  try {
  // Extract the text content from the Gemini response
  const textContent = response.candidates[0].content.parts[0].text;
  
  // Find JSON in the response (in case there's additional text)
  const jsonMatch = textContent.match(/\{ [\s\S]*\ }/);
  
  if (!jsonMatch) {
  throw new Error('No JSON found in Gemini response');
  }
  
  // Parse the JSON
  const jsonResponse = JSON.parse(jsonMatch[0]);
  return jsonResponse;
  } catch (error) {
  console.error('Error parsing Gemini response:', error);
  throw new Error('Failed to parse AI response: ' + error.message);
  }
  }

  /**
   * Validate the parsed response
   * @param { Object } parsedResponse - Parsed response
   * @returns { Object } - Validation result
   */
  validateResponse(parsedResponse) {
  const requiredFields = ['summary', 'severity', 'issues', 'recommendations', 'complexity'];
  const missingFields = [];
  
  for (const field of requiredFields) {
  if (!(Object.hasOwn(parsedResponse, field) ? (Object.hasOwn(parsedResponse, field) ? parsedResponse[field] : undefined) : undefined)) {
  missingFields.push(field);
  }
  }
  
  // Check nested fields
  if (parsedResponse.complexity && !parsedResponse.complexity.overall) {
  missingFields.push('complexity.overall');
  }
  
  if (parsedResponse.issues && parsedResponse.issues.length > 0) {
  const issue = parsedResponse.issues[0];
  if (!issue.title) { missingFields.push('issues[].title'); }
  if (!issue.description) { missingFields.push('issues[].description'); }
  if (!issue.severity) { missingFields.push('issues[].severity'); }
  }
  
  return {
  isValid: missingFields.length === 0,
  missingFields
  };
  }
}

// Create and export a singleton instance
const geminiService = new GeminiService();
export default geminiService; 