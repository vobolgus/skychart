/**
 * Path testing utility for Vercel deployment
 * Add this to src/utils/pathTest.js
 */

// Define possible path patterns
const pathPatterns = [
    // Absolute from domain root
    { prefix: '/', name: 'absolute-root' },
    // Relative paths with different prefixes
    { prefix: './', name: 'relative-dot' },
    { prefix: '../', name: 'relative-dot-dot' },
    // No prefix (browser-relative)
    { prefix: '', name: 'no-prefix' },
    // From src folder
    { prefix: '/src/', name: 'src-prefix' },
];

// Resource types to test
const resourceTypes = [
    { path: 'styles/main.css', type: 'CSS' },
    { path: 'data/translations.js', type: 'JS Module' },
    { path: 'public/photos_avif/M1.avif', type: 'Image' },
];

// Results storage
const pathResults = {};

/**
 * Test all path combinations to find which ones work
 * @returns {Promise<Object>} Results of path tests
 */
export async function testAllPaths() {
    console.log('[PathTest] Starting path testing');

    for (const pattern of pathPatterns) {
        pathResults[pattern.name] = { success: 0, total: 0, details: {} };

        for (const resource of resourceTypes) {
            const fullPath = `${pattern.prefix}${resource.path}`;
            const testName = `${resource.type}: ${fullPath}`;
            pathResults[pattern.name].total++;

            try {
                console.log(`[PathTest] Testing ${testName}`);
                const response = await fetch(fullPath);

                if (response.ok) {
                    console.log(`[PathTest] ✅ Success: ${testName}`);
                    pathResults[pattern.name].success++;
                    pathResults[pattern.name].details[testName] = {
                        success: true,
                        status: response.status
                    };
                } else {
                    console.log(`[PathTest] ❌ Failed: ${testName} (${response.status})`);
                    pathResults[pattern.name].details[testName] = {
                        success: false,
                        status: response.status
                    };
                }
            } catch (error) {
                console.error(`[PathTest] ❌ Error: ${testName}`, error);
                pathResults[pattern.name].details[testName] = {
                    success: false,
                    error: error.message
                };
            }
        }
    }

    // Identify best pattern
    let bestPattern = null;
    let highestSuccessRate = -1;

    for (const [name, results] of Object.entries(pathResults)) {
        const successRate = results.success / results.total;
        if (successRate > highestSuccessRate) {
            highestSuccessRate = successRate;
            bestPattern = name;
        }
    }

    console.log(`[PathTest] Complete. Best pattern: ${bestPattern} (${highestSuccessRate * 100}% success)`);

    return {
        results: pathResults,
        bestPattern: bestPattern,
        bestPatternPrefix: pathPatterns.find(p => p.name === bestPattern)?.prefix
    };
}

// Export the test function and also attach to window for console debugging
export const PathTest = { testAllPaths };

// Automatically run tests if ?test-paths is in URL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('test-paths')) {
        console.log('[PathTest] Auto-running path tests...');
        testAllPaths().then(results => {
            console.log('[PathTest] Results:', results);

            // Create result display
            const resultDiv = document.createElement('div');
            resultDiv.style.position = 'fixed';
            resultDiv.style.top = '10px';
            resultDiv.style.right = '10px';
            resultDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
            resultDiv.style.color = 'white';
            resultDiv.style.padding = '10px';
            resultDiv.style.borderRadius = '5px';
            resultDiv.style.maxWidth = '80%';
            resultDiv.style.maxHeight = '80%';
            resultDiv.style.overflow = 'auto';
            resultDiv.style.zIndex = '10000';
            resultDiv.style.fontFamily = 'monospace';
            resultDiv.innerHTML = `
        <h3>Path Test Results</h3>
        <p><strong>Best pattern:</strong> ${results.bestPattern} (${results.bestPatternPrefix})</p>
        <pre>${JSON.stringify(results.results, null, 2)}</pre>
      `;

            document.body.appendChild(resultDiv);
        });
    }
});