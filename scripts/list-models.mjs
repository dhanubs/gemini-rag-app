import 'dotenv/config';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
    console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables');
    process.exit(1);
}

console.log('Using API Key:', apiKey.substring(0, 10) + '...');
console.log('\nFetching available models...\n');

try {
    // Use fetch to call the API directly
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('=== AVAILABLE MODELS ===\n');
    
    if (data.models) {
        for (const model of data.models) {
            console.log(`Model: ${model.name}`);
            console.log(`  Display Name: ${model.displayName}`);
            console.log(`  Description: ${model.description || 'N/A'}`);
            console.log(`  Supported Generation Methods: ${model.supportedGenerationMethods?.join(', ')}`);
            console.log(`  Input Token Limit: ${model.inputTokenLimit}`);
            console.log(`  Output Token Limit: ${model.outputTokenLimit}`);
            console.log('---');
        }
        
        console.log('\n=== MODELS SUPPORTING generateContent ===\n');
        const contentModels = data.models.filter(m => 
            m.supportedGenerationMethods?.includes('generateContent')
        );
        
        contentModels.forEach(model => {
            const shortName = model.name.replace('models/', '');
            console.log(`✓ ${shortName}`);
        });
        
    } else {
        console.log('No models found');
    }
    
} catch (error) {
    console.error('Error listing models:', error.message);
}
