// =============================================================================
// PERPLEXITY API INTEGRATION (SECURE VERSION)
// =============================================================================

const PERPLEXITY_CONFIG = {
    // ✅ API key is now on the backend - NOT here!
    apiEndpoint: '/.netlify/functions/perplexity-search',  // Changed to Netlify function
    model: 'sonar-deep-research',

    systemPrompt: `Please provide detailed, insightful responses about the books
    contained within the library.
    Always cite real references used in composing the response and add reference page numbers. Do not fabricate sources.
    Be scholarly but accessible.`,

    searchDomainFilter:
    ['idriesshahfoundation.org',
    'https://idriesshahfoundation.org/books/'],
};

/**
 * Query Perplexity API via secure backend function
 * @param {string} userQuery - The user's question
 * @returns {Promise<string>} - The AI response
 */
//async function queryPerplexityAPI(userQuery) {
//    try {
//        // Call our secure Netlify function instead of Perplexity directly
//        const response = await fetch(PERPLEXITY_CONFIG.apiEndpoint, {
//            method: 'POST',
//            headers: {
//                'Content-Type': 'application/json',
//            },
//            body: JSON.stringify({
//                query: userQuery,
//                systemPrompt: PERPLEXITY_CONFIG.systemPrompt
//            })
//        });
//
//        if (!response.ok) {
//            const errorData = await response.json().catch(() => ({}));
//            throw new Error(errorData.error || `Request failed: ${response.status}`);
//        }
//
//        const data = await response.json();
//        return data.content;
//
//    } catch (error) {
//        console.error('Perplexity API Error:', error);
//        throw error;
//    }
//}

// Rest of your code remains the same...


/**
 * Query Perplexity API for Idries Shah related questions
 * @param {string} userQuery - The user's question
 * @returns {Promise<string>} - The AI response
 */
async function queryPerplexityAPI(userQuery) {
    try {
        const response = await fetch('/.netlify/functions/perplexity-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: userQuery,
                systemPrompt: PERPLEXITY_CONFIG.systemPrompt,
                searchDomainFilter: PERPLEXITY_CONFIG.searchDomainFilter,
                model: PERPLEXITY_CONFIG.model,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.content;

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}


/**
 * Format markdown-style text for HTML display
 * @param {string} text - The text to format
 * @returns {string} - HTML formatted text
 */
function formatResponse(text) {
    // Convert markdown-style formatting to HTML
    let formatted = text
        // Bold text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    formatted = '<p>' + formatted + '</p>';

    // Handle lists
    formatted = formatted.replace(/<p>([•\-\*])\s/g, '<ul><li>')
        .replace(/<\/p><p>([•\-\*])\s/g, '</li><li>')
        .replace(/<\/p>(?!<\/li>)/g, '</ul></p>');

    return formatted;
}

/**
 * Initialize Perplexity search functionality
 */
function initializePerplexitySearch() {
    const searchBtn = document.getElementById('searchBtn');
    const queryInput = document.getElementById('perplexityQuery');
    const responseDiv = document.getElementById('searchResponse');
    const responseContent = document.getElementById('responseContent');
    const clearBtn = document.getElementById('clearResponse');
    const btnText = searchBtn.querySelector('.btn-text');
    const btnLoader = searchBtn.querySelector('.btn-loader');

    if (!searchBtn || !queryInput || !responseDiv || !responseContent) {
        console.error('Search elements not found in DOM');
        return;
    }

    // Handle search button click
    searchBtn.addEventListener('click', async () => {
        const query = queryInput.value.trim();

        if (!query) {
            alert('Please enter a question');
            return;
        }

        // Show loading state
        searchBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        responseDiv.style.display = 'block';
        responseContent.className = 'response-content loading';
        responseContent.textContent = 'Searching for insights...';

        try {
            // Call Perplexity API
            const response = await queryPerplexityAPI(query);

            // Display response
            responseContent.className = 'response-content';
            responseContent.innerHTML = formatResponse(response);

            // Scroll to response
            responseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            // Display error
            responseContent.className = 'response-content error';
            responseContent.textContent = `Error: ${error.message}. Please try again.`;
        } finally {
            // Reset button state
            searchBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

    // Handle Enter key in textarea (Ctrl+Enter or Cmd+Enter to submit)
    queryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            searchBtn.click();
        }
    });

    // Handle clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            responseDiv.style.display = 'none';
            responseContent.innerHTML = '';
            queryInput.value = '';
            queryInput.focus();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializePerplexitySearch();
    // ... rest of your existing initialization code ...
});

// Idries Shah Library Application with Expand/Collapse Functionality

// PDF Display Fix Functions - Added to fix PDF viewer blank display issue
function fixPDFViewerDisplay(pdfWindow) {
    if (!pdfWindow || pdfWindow.closed) return;

    setTimeout(() => {
        try {
            // Method 1: Try to access PDFViewerApplication directly
            if (pdfWindow.PDFViewerApplication && pdfWindow.PDFViewerApplication.pdfDocument) {
                const currentPage = pdfWindow.PDFViewerApplication.page || 1;
                // Force a page change to trigger rendering
                if (pdfWindow.PDFViewerApplication.pdfDocument.numPages > 1) {
                    pdfWindow.PDFViewerApplication.page = currentPage === 1 ? 2 : 1;
                    setTimeout(() => {
                        pdfWindow.PDFViewerApplication.page = currentPage;
                    }, 200);
                } else {
                    // For single page documents, force a zoom change
                    const currentZoom = pdfWindow.PDFViewerApplication.pdfViewer.currentScale;
                    pdfWindow.PDFViewerApplication.pdfViewer.currentScale = currentZoom * 1.01;
                    setTimeout(() => {
                        pdfWindow.PDFViewerApplication.pdfViewer.currentScale = currentZoom;
                    }, 200);
                }
            } else {
                // Method 2: Send message to trigger refresh
                pdfWindow.postMessage({type: 'refreshPDF', action: 'forceRender'}, '*');
            }
        } catch (error) {
            console.log('PDF fix attempt failed (likely due to cross-origin restrictions):', error);
            // Fallback: reload the PDF window
            try {
                pdfWindow.location.reload();
            } catch (reloadError) {
                console.log('PDF window reload also failed');
            }
        }
    }, 2000); // Wait 2 seconds for PDF to initialize
}

function generateFixedPDFUrl(originalUrl) {
    try {
        const url = new URL(originalUrl);
        // Add cache busting parameters
        url.searchParams.set('t', Date.now());
        url.searchParams.set('refresh', '1');
        // Ensure auto_viewer is set
        url.searchParams.set('auto_viewer', 'true');
        return url.toString();
    } catch (error) {
        // Fallback for invalid URLs
        const separator = originalUrl.includes('?') ? '&' : '?';
        return `${originalUrl}${separator}t=${Date.now()}&refresh=1`;
    }
}

function openPDFWithFix(originalPdfUrl) {
    const fixedUrl = generateFixedPDFUrl(originalPdfUrl);
    const pdfWindow = window.open(fixedUrl, '_blank', 'noopener,noreferrer');

    if (pdfWindow) {
        // Apply the display fix
        fixPDFViewerDisplay(pdfWindow);

        // Additional fix attempt after longer delay
        setTimeout(() => {
            fixPDFViewerDisplay(pdfWindow);
        }, 5000);
    }

    return pdfWindow;
}

// Message listener for cross-window communication
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'refreshPDF') {
        // This runs in the PDF viewer window
        setTimeout(() => {
            if (window.PDFViewerApplication && window.PDFViewerApplication.pdfDocument) {
                window.PDFViewerApplication.forceRendering();
            }
        }, 100);
    }
});

// Complete library data with all 10 categories
const libraryData = {
  "categories": {
    "1. Foundational Orientation": {
      "function": "Multiple entry points to core Sufi concepts",
      "approach": "Different angles on fundamental ideas - no hierarchy",
      "books": [
        {
          "title": "The Sufis",
          "main_url": "https://idriesshahfoundation.org/books/the-sufis/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true",
          "description": "Shah's seminal work introducing Sufism to Western audiences",
          "chapters": [
            {"title": "The Situation", "page": "xi", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=11"},
            {"title": "Preface", "page": "xiii", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=13"},
            {"title": "The Islanders — A Fable", "page": "1", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=19"},
            {"title": "The Background I: The Travellers and the Grapes", "page": "13", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=31"},
            {"title": "The Background II: The Elephant in the Dark", "page": "42", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=60"},
            {"title": "The Subtleties of Mulla Nasrudin", "page": "69", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=87"},
            {"title": "Sheikh Saadi of Shiraz", "page": "119", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=137"},
            {"title": "Fariduddin Attar, the Chemist", "page": "126", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=144"},
            {"title": "Our Master Jalaluddin Rumi", "page": "140", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=158"},
            {"title": "Ibn el-Arabi: The Greatest Sheikh", "page": "166", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=184"},
            {"title": "El-Ghazali of Persia", "page": "178", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=196"},
            {"title": "Omar Khayyam", "page": "199", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=217"},
            {"title": "The Secret Language I: The Coalmen", "page": "209", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=227"},
            {"title": "The Secret Language II: The Builders", "page": "221", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=239"},
            {"title": "The Secret Language III: The Philosopher's Stone", "page": "233", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=251"},
            {"title": "Mysteries in the West I: Strange Rites", "page": "250", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=268"},
            {"title": "Mysteries in the West II: The Chivalric Circle", "page": "264", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=282"},
            {"title": "Mysteries in the West III: The Head of Wisdom", "page": "274", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=292"},
            {"title": "Mysteries in the West IV: Francis of Assisi", "page": "277", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=295"},
            {"title": "Mysteries in the West V: The Secret Doctrine", "page": "285", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=303"},
            {"title": "The Higher Law", "page": "302", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=320"},
            {"title": "The Book of the Dervishes", "page": "316", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=334"},
            {"title": "The Dervish Orders", "page": "346", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=364"},
            {"title": "Seeker After Knowledge", "page": "373", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=391"},
            {"title": "The Creed of Love", "page": "383", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=401"},
            {"title": "Miracles and Magic", "page": "394", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=412"},
            {"title": "The Teacher, the Teaching, the Taught", "page": "417", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=435"},
            {"title": "The Far East", "page": "430", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=448"},
            {"title": "Annotations", "page": "442", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=460"},
            {"title": "Appendix I: Esoteric Interpretation of the Qur'an", "page": "484", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=502"},
            {"title": "Appendix II: The Rapidness", "page": "488", "url": "https://idriesshahfoundation.org/pdfviewer/the-sufis/?auto_viewer=true#page=506"}

          ]
        },

        {
          "title": "The Idries Shah Anthology",
          "main_url": "https://idriesshahfoundation.org/books/the-idries-shah-anthology/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true",
          "description": "Selections from across Shah's entire corpus",
          "chapters": [
              { title: "The Tale of The Sands", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=11" },
              { title: "Editor's Note", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=13" },
              { title: "On Sufism", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=19" },
              { title: "The Subtleties of Mulla Nasrudin", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=33" },
              { title: "Fables", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=65" },
              { title: "Poetry", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=96" },
              { title: "Proverbs and Aphorisms", page: 98, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=108" },
              { title: "Teaching-Stories", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=117" },
              { title: "Teachings of the Classics", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=197" },
              { title: "Methods of the Masters", page: 231, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=241" },
              { title: "Themes for Study and Contemplation", page: 260, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=270" },
              { title: "Topics", page: 284, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=294" },
              { title: "Table Talk", page: 367, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=377" },
              { title: "Travel Writing", page: 382, url: "https://idriesshahfoundation.org/pdfviewer/the-idries-shah-anthology/?auto_viewer=true#page=392" }
          ]
        },

        {
          "title": "Sufi Studies: East and West",
          "main_url": "https://idriesshahfoundation.org/books/sufi-studies-east-and-west/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true",
          "description": "Academic collection on Sufi influence across cultures",
          "chapters": [
              { title: "Foreword", page: "xxv", url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=25" },
              { title: "Introduction: Scope and Effect of Sufi Writings by Idries Shah", page: "xxvii", url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=xxvii" },
              { title: "I. Idries Shah: Background and Work", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=37" },
              { title: "II. Shah in his Eastern Context", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=52" },
              { title: "III. Projecting Sufi Thought in an Appropriate Context", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=67" },
              { title: "IV. Idries Shah: Bridge Between East and West – Humour, Philosophy, and Orientation", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=71" },
              { title: "V. Literary Comparisons and Effects", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=77" },
              { title: "VI. A Message and Method of Love, Harmony, and Brotherhood", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=93" },
              { title: "VII. Travel, Teaching, and Living in the East", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=131" },
              { title: "VIII. Historico–Literary Aspects of the Work of Idries Shah", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=140" },
              { title: "IX. Psychology of the Sufi Way to Individuation", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=147" },
              { title: "X. Spirituality, Science, and Psychology in the Sufi Way", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=178" },
              { title: "XI. Experience, Behaviour, and Doctrine in the Quest of Man", page: 166, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=202" },
              { title: "XII. Idries Shah and the Sufis", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=209" },
              { title: "XIII. Idries Shah: Philosopher, Writer, Poet – and the Traditional Teachers", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=217" },
              { title: "XIV. Dervish Tales", page: 190, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=226" },
              { title: "XV. Idries Shah: The Man, the Sufi, and the Guiding Teacher", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=231" },
              { title: "XVI. The Sufi Attitude", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=239" },
              { title: "XVII. Sufism in the Art of Idries Shah", page: 210, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=246" },
              { title: "XVIII. The Way to Ecstasy", page: 224, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=260" },
              { title: "XIX. Filling a Gap in Knowledge", page: 252, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=288" },
              { title: "XX. Possibilities of Eastern Moral Influence on Modern Civilisation", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=291" },
              { title: "XXI. Islam, Sufism, and Tolerance", page: 269, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=305" },
              { title: "XXII. Shah: Knowledge, Technique, and Influence", page: 275, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=311" },
              { title: "Appendix I: Note on Transliteration", page: 301, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=337" },
              { title: "Appendix II: Biographical Notes on the Contributors", page: 303, url: "https://idriesshahfoundation.org/pdfviewer/sufi-studies-east-and-west/?auto_viewer=true#page=339" }
          ]
        }


      ]
    },

    "2. Teaching Stories & Narratives": {
      "function": "Story collections operating on multiple levels simultaneously",
      "approach": "Each collection offers different narrative angles creating scatter effects",
      "books": [
        {
          "title": "Tales of the Dervishes",
          "main_url": "https://idriesshahfoundation.org/books/tales-of-the-dervishes/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true",
          "description": "Collection of teaching stories with postscripts explaining their use",
          "note": "Contains teaching stories like 'The Magic Horse', 'The Man with Inexplicable Life'",
          "chapters": [
              { title: "Preface", page: "xiii", url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=13" },
              { title: "The Three Fishes", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=15" },
              { title: "The Food of Paradise", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=17" },
              { title: "When the Waters Were Changed", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=24" },
              { title: "The Tale of the Sands", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=26" },
              { title: "The Blind Ones and the Matter of the Elephant", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=28" },
              { title: "The Dog, the Stick and the Sufi", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=30" },
              { title: "How to Catch Monkeys", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=32" },
              { title: "The Ancient Coffer of Nuri Bey", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=34" },
              { title: "The Three Truths", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=36" },
              { title: "The Sultan Who Became an Exile", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=38" },
              { title: "The Story of Fire", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=43" },
              { title: "The Ogre and the Sufi", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=47" },
              { title: "The Merchant and the Christian Dervish", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=50" },
              { title: "The Golden Fortune", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=52" },
              { title: "The Candlestick of Iron", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=55" },
              { title: "Strike on This Spot", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=59" },
              { title: "Why the Clay Birds Flew Away", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=61" },
              { title: "The Gnat Namouss and the Elephant", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=63" },
              { title: "The Idiot, the Wise Man and the Jug", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=66" },
              { title: "The Wayward Princess", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=68" },
              { title: "The Bequest", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=71" },
              { title: "The Oath", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=73" },
              { title: "The Idiot in the Great City", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=74" },
              { title: "The Founding of a Tradition", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=75" },
              { title: "Fatima the Spinner and the Tent", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=77" },
              { title: "The Gates of Paradise", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=81" },
              { title: "The Man Who Was Aware of Death", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=83" },
              { title: "The Man Who Was Easily Angered", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=85" },
              { title: "The Dog and the Donkey", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=87" },
              { title: "Carrying Shoes", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=88" },
              { title: "The Man Who Walked on Water", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=90" },
              { title: "The Ant and the Dragonfly", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=92" },
              { title: "The Story of Tea", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=94" },
              { title: "The King Who Decided to Be Generous", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=97" },
              { title: "The Cure of Human Blood", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=103" },
              { title: "The Dam", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=107" },
              { title: "The Three Dervishes", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=111" },
              { title: "The Four Magic Treasures", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=116" },
              { title: "The Dreams and the Loaf of Bread", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=119" },
              { title: "Bread and Jewels", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=121" },
              { title: "The Limitations of Dogma", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=123" },
              { title: "The Fisherman and the Genie", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=125" },
              { title: "The Time, the Place and the People", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=130" },
              { title: "The Parable of the Three Domains", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=134" },
              { title: "Valuable-and Worthless", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=136" },
              { title: "The Bird and the Egg", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=139" },
              { title: "Three Pieces of Advice", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=141" },
              { title: "The Mountain Path", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=143" },
              { title: "The Snake and the Peacock", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=145" },
              { title: "The Water of Paradise", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=148" },
              { title: "The Horseman and the Snake", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=150" },
              { title: "Isa and the Doubters", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=152" },
              { title: "In the Street of the Perfume-Sellers", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=154" },
              { title: "The Parable of the Greedy Sons", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=155" },
              { title: "The Nature of Discipleship", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=157" },
              { title: "The Initiation of Malik Dinar", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=159" },
              { title: "The Idiot and the Browsing Camel", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=163" },
              { title: "The Three Jewelled Rings", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=164" },
              { title: "The Man with the Inexplicable Life", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=166" },
              { title: "The Man Whose Time Was Wrong", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=170" },
              { title: "Maruf the Cobbler", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=175" },
              { title: "Wisdom for Sale", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=183" },
              { title: "The King and the Poor Boy", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=192" },
              { title: "The Three Teachers and the Muleteers", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=194" },
              { title: "Bayazid and the Selfish Man", page: 182, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=196" },
              { title: "The People Who Attain", page: 184, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=198" },
              { title: "Wayfarer, Strangeness and Savetime", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=200" },
              { title: "Timur Agha and the Speech of Animals", page: 190, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=204" },
              { title: "The Indian Bird", page: 193, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=207" },
              { title: "When Death Came to Baghdad", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=209" },
              { title: "The Grammarian and the Dervish", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=211" },
              { title: "The Dervish and the Princess", page: 198, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=212" },
              { title: "The Increasing of Necessity", page: 200, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=214" },
              { title: "The Man Who Looked Only at the Obvious", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=217" },
              { title: "How Knowledge Was Earned", page: 207, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=221" },
              { title: "The Lamp Shop", page: 212, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=226" },
              { title: "The Chariot", page: 215, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=229" },
              { title: "The Lame Man and the Blind Man", page: 217, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=231" },
              { title: "The Servants and the House", page: 219, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=233" },
              { title: "The Generous Man", page: 221, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=235" },
              { title: "The Host and the Guests", page: 223, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=237" },
              { title: "The King's Son", page: 226, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=240" },
              { title: "Appendix: Authors and teachers, in chronological order", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/tales-of-the-dervishes/?auto_viewer=true#page=243" }
            ]
        },

        {
          "title": "Caravan of Dreams",
          "main_url": "https://idriesshahfoundation.org/books/caravan-of-dreams/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true",
          "description": "Magical anthology bringing readers closer to Middle Eastern wisdom",
          "note": "Mixed format: stories, poems, sayings, and fragments",
          "chapters": [
          { title: "Preface", page: "xiii", url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=13" },
          { title: "Traditions of the Prophet", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=17" },
          { title: "Adventures of Mulla Nasrudin", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=33" },
          { title: "Red Sea Journey", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=43" },
          { title: "Pilgrimage to Mecca", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=63" },
          { title: "Thoughts from Omar Khayyam", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=87" },
          { title: "Meditations of Rumi", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=91" },
          { title: "The Tale of Melon City", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=95" },
          { title: "Haughty and Generous", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=98" },
          { title: "The Chests of Gold", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=100" },
          { title: "The Lowliest of the Arabs", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=103" },
          { title: "The Man, the Snake and the Stone", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=104" },
          { title: "The Value of Kingdoms", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=109" },
          { title: "The Magic Horse", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=110" },
          { title: "The Prince of Darkness", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=123" },
          { title: "Encounter at a Hermitage", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=128" },
          { title: "The Shrine", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=132" },
          { title: "Mushkil Gusha", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=135" },
          { title: "The Story of Mushkil Gusha", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=137" },
          { title: "Cheating Death", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=145" },
          { title: "The Three Perceptives", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=150" },
          { title: "Extracts", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=153" },
          { title: "Definitions from Mulla Do-Piaza", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=155" },
          { title: "The Two Brothers", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=157" },
          { title: "The Angel and the Charitable Man", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=158" },
          { title: "Hospitality", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=160" },
          { title: "The Mongols", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=161" },
          { title: "Letter from a Queen", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=163" },
          { title: "The Artillery", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=164" },
          { title: "Jan-Fishan Khan's Favour", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=166" },
          { title: "Omar and the Wine-drinker", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=167" },
          { title: "The Proper Channels", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=168" },
          { title: "In Spain", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=169" },
          { title: "Baghdad", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=170" },
          { title: "Commander of the Faithful", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=173" },
          { title: "The Ball of Marzipan", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=175" },
          { title: "Ahmad Hussain and the Emperor", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=178" },
          { title: "The King, the Sufi and the Surgeon", page: 166, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=180" },
          { title: "A Matter of Honour", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=182" },
          { title: "The Pulse of the Princess", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=183" },
          { title: "Maulana Dervish", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=186" },
          { title: "Self-Deception", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=187" },
          { title: "The Camel and the Tent", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=188" },
          { title: "The Curse", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=190" },
          { title: "Pleasant and Unpleasant", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=191" },
          { title: "Khwaja Ahrar", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=192" },
          { title: "Saadi: On Envy", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=194" },
          { title: "Hazrat Bahaudin Naqshband", page: 182, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=196" },
          { title: "Prayer", page: 184, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=198" },
          { title: "The Horseman in a Hurry", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=200" },
          { title: "Class and Nation", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=201" },
          { title: "Letters", page: 188, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=202" },
          { title: "The Voice", page: 190, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=204" },
          { title: "The Four Men and the Interpreter", page: 191, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=205" },
          { title: "The Sultans and the Taxpayer", page: 193, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=207" },
          { title: "The Thief", page: 194, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=208" },
          { title: "Seeing Double", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=209" },
          { title: "Why?", page: 196, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=210" },
          { title: "Yusuf, Son of Husain", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=211" },
          { title: "Why the Dervish Hides Himself", page: 199, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=213" },
          { title: "The Dog and the Dervishes", page: 200, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=214" },
          { title: "The Prayer and the Curse of the Dervish", page: 201, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=215" },
          { title: "Encounter with the Devil", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=217" },
          { title: "The Beard of the Dervish", page: 204, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=218" },
          { title: "The Ants and the Pen", page: 206, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=220" },
          { title: "Who Recognised the Master", page: 208, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=222" },
          { title: "Solomon, the Mosquito and the Wind", page: 210, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=224" },
          { title: "The Bees and the Hollow Tree", page: 212, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=226" },
          { title: "The Effects – and Use – of Music", page: 214, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=228" },
          { title: "Confessions of John of Antioch", page: 216, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=230" },
          { title: "Silent Teaching", page: 219, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=233" },
          { title: "Three Things", page: 220, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=234" },
          { title: "Table Talk", page: 223, url: "https://idriesshahfoundation.org/pdfviewer/caravan-of-dreams/?auto_viewer=true#page=237" }
          ]
        },

        {
          "title": "The Way of the Sufi",
          "main_url": "https://idriesshahfoundation.org/books/the-way-of-the-sufi/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true",
          "description": "Classical Sufi masters, their lives and teachings",
          "chapters": [
          { title: "Introduction", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=11" },
          { title: "Part One: The Study of Sufism in the West", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=13" },
          { title: "The Study of Sufism in the West", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=15" },
          { title: "Notes and Bibliography", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=44" },
          { title: "Part Two: Classical Authors", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=63" },
          { title: "El-Ghazali", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=65" },
          { title: "Omar Khayyam", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=75" },
          { title: "Attar of Nishapur", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=79" },
          { title: "Ibn el-Arabi", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=95" },
          { title: "Saadi of Shiraz", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=102" },
          { title: "Hakim Jami", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=115" },
          { title: "Hakim Sanai", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=121" },
          { title: "Jalaludin Rumi", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=124" },
          { title: "Part Three: Four Major Orders", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=135" },
          { title: "Four Major Orders", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=137" },
          { title: "The Chishti Order", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=141" },
          { title: "The Qadiri Order", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=154" },
          { title: "The Suhrawardi Order", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=165" },
          { title: "The Naqshbandi Order", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=173" },
          { title: "Part Four: Among the Masters", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=195" },
          { title: "A Meeting with Khidr", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=197" },
          { title: "Part Five: Teaching-Stories", page: 227, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=237" },
          { title: "Part Six: Themes for Solitary Contemplation", page: 253, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=263" },
          { title: "Solitary Contemplation Themes", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=265" },
          { title: "A Sufi Notebook: Some Contemplation-Themes", page: 267, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=277" },
          { title: "Part Seven: Group Recitals", page: 275, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=285" },
          { title: "Part Eight: Letters and Lectures", page: 299, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=309" },
          { title: "Part Nine: Questions and Answers on Sufism", page: 331, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=341" },
          { title: "Sufism and Islam", page: 335, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=345" },
          { title: "Deep Understanding", page: 340, url: "https://idriesshahfoundation.org/pdfviewer/the-way-of-the-sufi/?auto_viewer=true#page=350" }
          ]
        },

        {
          "title": "Wisdom of the Idiots",
          "main_url": "https://idriesshahfoundation.org/books/wisdom-of-the-idiots/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true",
          "description": "Stories illustrating the 'wise fool' tradition in Sufism",
          "chapters": [
          { title: "The Fruit of Heaven", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=13" },
          { title: "Haughty and Generous", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=15" },
          { title: "The Casket of Jewels", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=19" },
          { title: "Ahrar and the Wealthy Couple", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=21" },
          { title: "Bahaudin and the Wanderer", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=23" },
          { title: "Food and Pens", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=25" },
          { title: "The Glance of Power", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=27" },
          { title: "Nothing for Man Except What He Has Earned", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=31" },
          { title: "Milk and Buttermilk", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=33" },
          { title: "Talisman", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=35" },
          { title: "Dispute with Academics", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=37" },
          { title: "Story of Hiravi", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=39" },
          { title: "Something to Learn from Miri", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=43" },
          { title: "The Mad King's Idol", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=45" },
          { title: "Two Sides", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=47" },
          { title: "Welcomes", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=49" },
          { title: "Ajmal Hussein and the Scholars", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=51" },
          { title: "Timur and Hafiz", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=53" },
          { title: "Full Up", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=55" },
          { title: "Charkhi and His Uncle", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=57" },
          { title: "The Prisoner of Samarkand", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=59" },
          { title: "The Book in Turki", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=61" },
          { title: "Beggars and Workers", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=63" },
          { title: "Unaltered", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=65" },
          { title: "Diagnosis", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=67" },
          { title: "The Kashkul", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=69" },
          { title: "The Cow", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=71" },
          { title: "Individuality and Quality", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=73" },
          { title: "Paradise of Song", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=75" },
          { title: "The Treasure of the Custodians", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=79" },
          { title: "The Attachment Called Grace", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=83" },
          { title: "Correction", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=85" },
          { title: "The Saint and the Sinner", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=87" },
          { title: "The Sheikhs of the Skullcaps", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=89" },
          { title: "The Secret of the Locked Room", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=93" },
          { title: "The Miracle of the Royal Dervish", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=95" },
          { title: "Ishan Wali's Test", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=97" },
          { title: "Hidden Miracles", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=101" },
          { title: "Entry into a Sufi Circle", page: 91, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=103" },
          { title: "A Story of Ibn Halim", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=105" },
          { title: "The Woman Sufi and the Queen", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=107" },
          { title: "The Cook's Assistant", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=109" },
          { title: "Why Is Wet Not Dry?", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=113" },
          { title: "Books", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=115" },
          { title: "When a Man Meets Himself", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=117" },
          { title: "The Sufi and the Tale of Halaku", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=119" },
          { title: "Fish on the Moon", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=121" },
          { title: "Kilidi and the Gold Pieces", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=123" },
          { title: "Wheat and Barley", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=125" },
          { title: "The Wine Flask", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=127" },
          { title: "Said Bahaudin Naqshband", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=129" },
          { title: "The Sponge of Troubles", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=131" },
          { title: "The Crystal Fish", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=133" },
          { title: "The Seal Bearer", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=135" },
          { title: "Full", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=137" },
          { title: "Voice in the Night", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=139" },
          { title: "Perception", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=141" },
          { title: "Scraps", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=143" },
          { title: "The Golden Fly", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=145" },
          { title: "Tavern Pledge", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=147" },
          { title: "The Knife", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=149" },
          { title: "Caravanserai", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=151" },
          { title: "Fantasies", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=155" },
          { title: "Irrelevance", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=157" },
          { title: "Fidelity", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=159" },
          { title: "The Sanctuary of John the Baptist", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=161" },
          { title: "The Meaning", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=163" },
          { title: "The Method", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=165" },
          { title: "Abu Tahir", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=167" },
          { title: "Containment", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=169" },
          { title: "Sifting", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=171" },
          { title: "The Perfect Master", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=173" },
          { title: "Give and Take", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=175" },
          { title: "The Fox's Proof", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=177" },
          { title: "Opportunity", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=179" },
          { title: "The Loan", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=181" },
          { title: "Light-Weaving", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=183" },
          { title: "Explanation", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=185" },
          { title: "Day and Night", page: 175, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=187" },
          { title: "Source of Being", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=189" },
          { title: "Stained", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=191" },
          { title: "Wahab Imri", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=193" },
          { title: "The Rogue and the Dervish", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=195" },
          { title: "Hope", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=197" },
          { title: "Wanting", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=199" },
          { title: "The Archer", page: 189, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=201" },
          { title: "Mahmud and the Dervish", page: 191, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=203" },
          { title: "Stages", page: 193, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=205" },
          { title: "What Is in It", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=207" },
          { title: "Sound and Unsound", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=209" },
          { title: "Lamb Stew", page: 199, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=211" },
          { title: "Finding Fault", page: 201, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=213" },
          { title: "Hearing", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=215" },
          { title: "The Baby Elephant", page: 205, url: "https://idriesshahfoundation.org/pdfviewer/wisdom-of-the-idiots/?auto_viewer=true#page=217" }
          ]
        },
        {
          "title": "The Hundred Tales of Wisdom",
          "main_url": "https://idriesshahfoundation.org/books/the-hundred-tales-of-wisdom/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true",
          "description": "Traditional tales translated and adapted by Shah",
          "chapters": [
          { title: "Rumi's Childhood and Youth", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=11" },
          { title: "The Green-Mantled Figures", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=15" },
          { title: "Sayed Burhanuddin Transmits Perceptions to Rumi", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=19" },
          { title: "The Monks of Cicilia", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=20" },
          { title: "Appearance of the Enigmatic Shams-i-Tabriz", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=22" },
          { title: "Sayed Bahauddin's Teachings", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=23" },
          { title: "The Vision of Shamsuddin", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=27" },
          { title: "Assayer of Mystic Treasures", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=28" },
          { title: "The Tabriz Master Disappears", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=31" },
          { title: "The Six Apparitions and the Flowers", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=34" },
          { title: "The Spirits and the Lights", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=37" },
          { title: "The Secret Ride to Battle", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=38" },
          { title: "The Rich Merchant and the Dervish of the West", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=41" },
          { title: "Glistening Eyes", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=46" },
          { title: "Books and the Inner Meaning within Books", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=50" },
          { title: "The Mystic Dance", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=52" },
          { title: "The Path", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=53" },
          { title: "The Parrot and the Bald Man", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=54" },
          { title: "A Quarrel", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=55" },
          { title: "The Grammarian and the Well", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=56" },
          { title: "The Dervish and the Camel", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=58" },
          { title: "The Donkey", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=60" },
          { title: "Worldly Loss", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=63" },
          { title: "The Place of Honour", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=65" },
          { title: "Miracle of the Medicaments", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=70" },
          { title: "Miracle of the Blood", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=73" },
          { title: "Why Sages Speak of Saints", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=75" },
          { title: "Impervious to Cold", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=77" },
          { title: "The Unruly Self", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=78" },
          { title: "Admission of a Disciple", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=79" },
          { title: "Poor Quality of Disciples", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=81" },
          { title: "Telepathic Visit", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=83" },
          { title: "Rich and Poor", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=86" },
          { title: "The Name of a City", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=88" },
          { title: "The Ladder and the Rope", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=90" },
          { title: "The Monk and the Miracle", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=92" },
          { title: "Perfecting the Inner Being", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=96" },
          { title: "Stone Into Ruby", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=98" },
          { title: "Shoes of Iron", page: 91, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=101" },
          { title: "If God Wills...", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=103" },
          { title: "Mystical Rapture", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=104" },
          { title: "Calling upon Moulana", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=105" },
          { title: "The Mysterious Flight", page: 98, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=108" },
          { title: "Part of a Greater Whole", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=110" },
          { title: "Shocks", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=112" },
          { title: "Humility", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=113" },
          { title: "Courtesy", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=115" },
          { title: "Forgiveness", page: 108, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=118" },
          { title: "The Inward Eye", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=119" },
          { title: "The Market-Place", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=120" },
          { title: "Self-Deception", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=121" },
          { title: "Wealth and Poverty", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=123" },
          { title: "The Radiance", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=126" },
          { title: "The Audience of Dogs", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=127" },
          { title: "The Miraculous Kohl", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=129" },
          { title: "Mind-Reading", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=131" },
          { title: "All Mankind", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=132" },
          { title: "Special Mystical Projection", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=133" },
          { title: "Parable of the Fruit-Trees", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=134" },
          { title: "Memory and Action", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=135" },
          { title: "That which is Apparent and that which is Hidden", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=136" },
          { title: "Miracle of the Pilgrimage", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=139" },
          { title: "The Last Discourse", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=142" },
          { title: "Remembering Death", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=144" },
          { title: "At the Hot Springs", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=146" },
          { title: "The Cow Takes Refuge from the Butchers", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=147" },
          { title: "Which way lies the Path", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=149" },
          { title: "Mother Earth", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=151" },
          { title: "Admit thy Work...", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=152" },
          { title: "The Wonder of the Candles", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=156" },
          { title: "The Meaning of Possessions", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=158" },
          { title: "The Perceiving Eye", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=161" },
          { title: "Seeing the Evil in the Man of Learning", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=163" },
          { title: "Dogs and Men", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=165" },
          { title: "The Coins of Gold", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=167" },
          { title: "The Hidden Dervish", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=169" },
          { title: "'Die before your Death...'", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=171" },
          { title: "Similar Effects must have Similar Causes", page: 162, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=172" },
          { title: "Give me the Whole, not the Parts...", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=173" },
          { title: "The King and the Slave-Girl", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=174" },
          { title: "The Lovers", page: 166, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=176" },
          { title: "The Stolen Snake", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=177" },
          { title: "Jesus and the Name", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=178" },
          { title: "The Sufi and the Donkey", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=179" },
          { title: "The Old Woman and the Hawk", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=180" },
          { title: "The Sage and the Halwa", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=181" },
          { title: "The Cow and the Lion", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=183" },
          { title: "The Sufi and the Servant", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=184" },
          { title: "The Bankrupt and the Camel", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=186" },
          { title: "The Thirsty Man and the Water", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=187" },
          { title: "The Insane Behaviour of Dhun'nun", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=188" },
          { title: "The Sage and the Man Asleep", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=189" },
          { title: "The Bear", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=190" },
          { title: "The Gardener and the Three Men", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=191" },
          { title: "The Dervish who Married a Prostitute", page: 184, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=194" },
          { title: "The King's Hawk and the Owls", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=195" },
          { title: "Manipulation of the Mind", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=196" },
          { title: "The Love-Poems", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=197" },
          { title: "The King's Slave", page: 188, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=198" },
          { title: "The Story of the Learned Teacher", page: 190, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=200" },
          { title: "The Story of the Seeker from India", page: 191, url: "https://idriesshahfoundation.org/pdfviewer/the-hundred-tales-of-wisdom/?auto_viewer=true#page=201" }
          ]
        },

        {
          "title": "World Tales",
          "main_url": "https://idriesshahfoundation.org/books/world-tales/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true",
          "description": "Folktales from around the world with Sufi commentary",
          "chapters": [
          { title: "Tales of a Parrot", origin: "India", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=17" },
          { title: "Dick Whittington and his Cat", origin: "England", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=32" },
          { title: "Don't Count Your Chickens", origin: "Spain", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=41" },
          { title: "The Hawk and the Nightingale", origin: "Greece", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=43" },
          { title: "Cecino the Tiny", origin: "Tuscany", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=45" },
          { title: "Her Lover's Heart", origin: "India", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=54" },
          { title: "The New Hand", origin: "United States", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=59" },
          { title: "The Mastermaid", origin: "Norway", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=63" },
          { title: "The Hermit", origin: "France", page: 64, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=80" },
          { title: "The Maiden Wiser than the Tsar", origin: "Serbia", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=86" },
          { title: "The Travelling Companion", origin: "Denmark", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=91" },
          { title: "The Riddles", origin: "Turkestan", page: 98, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=114" },
          { title: "The Grateful Animals and the Ungrateful Man", origin: "Tibet", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=119" },
          { title: "The Value of a Treasure Hoard", origin: "China", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=123" },
          { title: "Patient Griselda", origin: "England", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=125" },
          { title: "How Evil Produces Evil", origin: "Italy", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=132" },
          { title: "The Ghoul and the Youth of Ispahan", origin: "Persia", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=135" },
          { title: "The Pilgrim from Paradise", origin: "India", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=139" },
          { title: "The Blind Ones and the Matter of the Elephant", origin: "Afghanistan", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=142" },
          { title: "Anpu and Bata", origin: "Egypt", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=145" },
          { title: "God is Stronger", origin: "Madagascar", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=155" },
          { title: "The Happiest Man in the World", origin: "Uzbekistan", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=157" },
          { title: "The Gorgon's Head", origin: "Greece", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=160" },
          { title: "The Brahmin's Wife and the Mongoose", origin: "India", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=172" },
          { title: "The Magic Bag", origin: "Morocco", page: 158, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=174" },
          { title: "Catherine's Fate", origin: "Sicily", page: 162, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=178" },
          { title: "The Desolate Island", origin: "Palestine", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=186" },
          { title: "Gazelle Horn", origin: "Tibet", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=190" },
          { title: "Tom Tit Tot", origin: "England", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=195" },
          { title: "The Silent Couple", origin: "Arabia", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=202" },
          { title: "Childe Rowland", origin: "Scotland", page: 189, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=205" },
          { title: "The Tale of Mushkil Gusha", origin: "Middle East", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=213" },
          { title: "The Food of Paradise", origin: "Central Asia", page: 206, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=222" },
          { title: "The Lamb with the Golden Fleece", origin: "Europe", page: 218, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=234" },
          { title: "The Man with the Wen", origin: "Japan", page: 222, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=238" },
          { title: "The Skilful Brothers", origin: "Albania", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=245" },
          { title: "The Algonquin Cinderella", origin: "North American Indian", page: 233, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=249" },
          { title: "The Kindly Ghost", origin: "Sudan", page: 237, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=253" },
          { title: "The Ass in Pantherskin", origin: "India", page: 244, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=260" },
          { title: "The Water of Life", origin: "Germany", page: 246, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=262" },
          { title: "The Serpent", origin: "Albania", page: 254, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=270" },
          { title: "The Wonderful Lamp", origin: "Italy", page: 257, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=273" },
          { title: "Who Was the Most Generous?", origin: "England", page: 262, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=278" },
          { title: "Cupid and Psyche", origin: "Italy", page: 266, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=282" },
          { title: "The Royal Detectives", origin: "Egypt", page: 274, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=290" },
          { title: "Conflict of the Magicians", origin: "Wales", page: 277, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=293" },
          { title: "False Witnesses", origin: "Germany", page: 281, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=297" },
          { title: "The Cobbler Who Became an Astrologer", origin: "Persia", page: 283, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=299" },
          { title: "The Two Travellers", origin: "China", page: 293, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=309" },
          { title: "The Fisherman and his Wife", origin: "Germany", page: 296, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=312" },
          { title: "Impossible Judgement", origin: "Spain", page: 304, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=320" },
          { title: "Hudden and Dudden and Donald O'Neary", origin: "Ireland", page: 306, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=322" },
          { title: "Riquet with the Tuft", origin: "France", page: 315, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=331" },
          { title: "The Lost Camel", origin: "India", page: 324, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=340" },
          { title: "The Beggar and the Gazelle", origin: "Middle East", page: 328, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=344" },
          { title: "The Apple on the Boy's Head", origin: "Iceland", page: 335, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=351" },
          { title: "The Boots of Hunain", origin: "Arabia", page: 338, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=354" },
          { title: "The Three Caskets", origin: "England", page: 340, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=356" },
          { title: "The Land Where Time Stood Still", origin: "Romania", page: 347, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=363" },
          { title: "The Man Turned into a Mule", origin: "Spain", page: 353, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=369" },
          { title: "The Fox and the Hedgehog", origin: "Greece", page: 358, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=374" },
          { title: "The Bird Maiden", origin: "Arabia", page: 360, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=376" },
          { title: "The Slowest May Win the Race", origin: "Thailand", page: 389, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=405" },
          { title: "The Three Imposters", origin: "Spain", page: 391, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=407" },
          { title: "Occasion", origin: "Sicily", page: 395, url: "https://idriesshahfoundation.org/pdfviewer/world-tales/?auto_viewer=true#page=411" }
          ]

        },

        {
          "title": "Thinkers of the East",
          "main_url": "https://idriesshahfoundation.org/books/thinkers-of-the-east/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true",
          "description": "Studies in experientialism - Sufi thinking in action",
          "chapters": [
          { title: "Preface", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=13" },
          { title: "Subjects Dealt With in Thinkers of the East", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=15" },
          { title: "A Death is Indicated", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=17" },
          { title: "Ordinary", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=20" },
          { title: "Bravery", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=22" },
          { title: "A Disciple of Haidar", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=23" },
          { title: "The Most Great Name", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=24" },
          { title: "The Book of Wisdom", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=26" },
          { title: "Kadudar and the Pilgrimage", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=27" },
          { title: "Dismissal", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=28" },
          { title: "Words of Israil of Bokhara", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=29" },
          { title: "Lands of the Gurus", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=30" },
          { title: "Nili", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=31" },
          { title: "How Man Is Sustained", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=33" },
          { title: "Jan Fishan and the Seeker", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=34" },
          { title: "Objectors", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=36" },
          { title: "Exclusion", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=37" },
          { title: "The Philosopher’s Stone", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=38" },
          { title: "Barbari and the Imitator", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=39" },
          { title: "Iskandar of Balkh", page: 26, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=40" },
          { title: "Ali, Son of the Father of the Seeker", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=42" },
          { title: "Rabia el-Adawiya", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=43" },
          { title: "Abboud of Omdurman", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=44" },
          { title: "Ajami", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=45" },
          { title: "Conversion", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=46" },
          { title: "Raised and Cast Down", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=48" },
          { title: "Perplexity", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=49" },
          { title: "Admonition to Disciples", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=52" },
          { title: "Hasan of Basra", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=53" },
          { title: "What to Do", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=55" },
          { title: "The Test", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=56" },
          { title: "The Hundred Books", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=59" },
          { title: "Vehicle", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=60" },
          { title: "The Formula", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=61" },
          { title: "The Lives and Doings of the Masters", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=63" },
          { title: "Change", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=64" },
          { title: "Appetite", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=65" },
          { title: "Oil, Water, Cotton", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=67" },
          { title: "Sayed Sabir Ali-Shah", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=68" },
          { title: "In Mecca", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=69" },
          { title: "Halqavi", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=70" },
          { title: "The Journeys of Kazwini", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=71" },
          { title: "Inconsistencies", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=73" },
          { title: "A Report by Kirmani", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=74" },
          { title: "The Land of Truth", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=75" },
          { title: "Language", page: 64, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=78" },
          { title: "Almost an Apple", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=79" },
          { title: "Etiquette", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=80" },
          { title: "Reactions", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=82" },
          { title: "Motivation", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=84" },
          { title: "Three Interpretations", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=85" },
          { title: "Farmyard", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=87" },
          { title: "Streaky Sand", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=88" },
          { title: "To Seek to Learn to Seek", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=90" },
          { title: "The Necessity for the Teaching", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=91" },
          { title: "Observing One’s Own Opinions", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=93" },
          { title: "Great Worth", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=94" },
          { title: "Analogy", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=95" },
          { title: "Lucky People", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=96" },
          { title: "Value for Money", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=97" },
          { title: "The Man Who Gave More – and Less", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=98" },
          { title: "When Even Kings Are Weak...", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=99" },
          { title: "Conversion", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=101" },
          { title: "Astrology", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=102" },
          { title: "I'll Make You Remember", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=104" },
          { title: "The Next Generation", page: 91, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=105" },
          { title: "If He Looks Good, He Is Good", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=107" },
          { title: "Ruling and Ruled", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=108" },
          { title: "Hariri the Good Man", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=110" },
          { title: "Camlet", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=111" },
          { title: "Respect", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=113" },
          { title: "The Legend of the Three Men", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=114" },
          { title: "Mystery", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=115" },
          { title: "Merchant of Secrets", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=116" },
          { title: "Distant Projection", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=118" },
          { title: "Imam Baqir", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=120" },
          { title: "Ajnabi", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=121" },
          { title: "Rahimi", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=124" },
          { title: "Reading", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=125" },
          { title: "Haji Bektash Wali", page: 112, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=126" },
          { title: "The Book of Nonsense", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=127" },
          { title: "Shakir Amali", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=128" },
          { title: "How and What to Understand", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=129" },
          { title: "Displacement", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=131" },
          { title: "Dividing Camels", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=132" },
          { title: "Revolting", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=134" },
          { title: "Laws", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=135" },
          { title: "Example", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=136" },
          { title: "The Miracle", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=138" },
          { title: "Every Luxury", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=140" },
          { title: "Unsuitable", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=141" },
          { title: "Sayed Sultan", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=143" },
          { title: "Three Men of Turkestan", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=144" },
          { title: "Feeling", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=146" },
          { title: "The Precious Jewel", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=147" },
          { title: "The Price of a Symbol", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=149" },
          { title: "The Water-Wheel", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=150" },
          { title: "Rauf Mazari", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=151" },
          { title: "Meaning of a Legend", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=152" },
          { title: "Ardabili", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=154" },
          { title: "Inward and Outward Knowledge", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=155" },
          { title: "The Secret Teacher", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=156" },
          { title: "A Morning's Marketing", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=157" },
          { title: "Moss", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=159" },
          { title: "Bahaudin and the Scholar", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=160" },
          { title: "Visiting and Obtaining", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=162" },
          { title: "Bahaudin", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=163" },
          { title: "Bahaudin Naqshband", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=164" },
          { title: "Storing and Transmitting", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=165" },
          { title: "How it Feels to Be a Teacher", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=166" },
          { title: "Founding of a School", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=167" },
          { title: "Opulence", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=168" },
          { title: "Wisdom", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=169" },
          { title: "Luxury and Simplicity", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=170" },
          { title: "The Caravan", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=171" },
          { title: "Giant Apples", page: 158, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=172" },
          { title: "Effort", page: 160, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=174" },
          { title: "The New Initiate", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=175" },
          { title: "Unanswerable", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=177" },
          { title: "Literalism", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=178" },
          { title: "Hilmi", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=179" },
          { title: "The High Knowledge", page: 166, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=180" },
          { title: "Charikari", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=181" },
          { title: "Hazrat Bahaudin Shah", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=182" },
          { title: "Difficult", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=184" },
          { title: "Presents", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=185" },
          { title: "Nahas", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=187" },
          { title: "Chances", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=188" },
          { title: "Siyahposh", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=190" },
          { title: "The Embassy from China", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=191" },
          { title: "The Question", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=193" },
          { title: "Transition", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=194" },
          { title: "Seeing", page: 182, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=196" },
          { title: "The Deputation from Syria", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=197" },
          { title: "Literature", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=199" },
          { title: "Environment", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=200" },
          { title: "Andaki", page: 188, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=202" },
          { title: "Buyer and Seller", page: 189, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=203" },
          { title: "Learning by Signs", page: 190, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=204" },
          { title: "The Pardoned Murderer", page: 191, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=205" },
          { title: "Halabi", page: 193, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=207" },
          { title: "The Abode of Truth", page: 194, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=208" },
          { title: "Rights and Duties", page: 196, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=210" },
          { title: "Alisher Nawai", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=211" },
          { title: "The Design", page: 198, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=212" },
          { title: "Ghazali", page: 200, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=214" },
          { title: "The Rules of the Schools", page: 205, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=219" },
          { title: "Bahaudin Naqshband Discipleship and Development", page: 207, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=221" },
          { title: "Counsels of Bahaudin", page: 213, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=227" },
          { title: "The Legend of Nasrudin", page: 218, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=232" },
          { title: "The Sufi Quest", page: 224, url: "https://idriesshahfoundation.org/pdfviewer/thinkers-of-the-east/?auto_viewer=true#page=238" }
          ]
        }
      ]
    },
    "3. Psychological Methodology": {
      "function": "Examines learning processes and psychological barriers",
      "approach": "Different perspectives on psychological themes create scattered insights",
      "books": [

        {"title": "Learning How to Learn",
        "main_url": "https://idriesshahfoundation.org/books/learning-how-to-learn/",
        "pdf_url": "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true",
        "description": "Psychology and Spirituality in the Sufi Way - 100 conversations with Idries Shah",
        "chapters": [
              { title: "Introduction: \"Beginning to Begin\" by Idries Shah", page: "xvii", url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=17" },

  // Section 1: REAL AND IMAGINED STUDY
              { title: "REAL AND IMAGINED STUDY", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=25" },
              { title: "Sufis and Their Imitators", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=25" },
              { title: "Attaining Knowledge", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=32" },
              { title: "Secrets and the Sufis", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=44" },
              { title: "When to Have Meetings", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=46" },
              { title: "The Ceiling", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=51" },
              { title: "Conflicting Texts", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=57" },
              { title: "Self-Deception", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=59" },
              { title: "Journeys to the East", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=61" },
              { title: "What a Sufi Teacher Looks Like", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=64" },
              { title: "Books and Beyond Books", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=68" },
              { title: "Saintliness", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=73" },
              { title: "Secrecy", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=76" },
              { title: "'You Can't Teach by Correspondence'", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=80" },
              { title: "Background to 'Humility'", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=85" },
              { title: "How Serious Is the Student?", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=93" },
              { title: "Social and Psychological Elements in Sufi Study", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=96" },

              // Section 2: ON ATTENTION
              { title: "ON ATTENTION", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=103" },
              { title: "Characteristics of Attention and Observation", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=103" },

              // Section 3: SUFI STUDY THEMES
              { title: "SUFI STUDY THEMES", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=111" },

              // Section 4: THINGS OF THE WORLD
              { title: "THINGS OF THE WORLD", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=117" },
              { title: "An Eastern Sage and the Newspapers", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=117" },
              { title: "Basis for People's Interest", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=119" },
              { title: "Thinking in Terms of Supply-and-Demand", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=122" },
              { title: "The Effect of Tales and Narratives", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=125" },
              { title: "Stories of the Miraculous", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=128" },
              { title: "Continuous versus Effective Activity", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=131" },
              { title: "Capacity Comes before Opinion", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=133" },
              { title: "Sanctified Greed", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=135" },
              { title: "Psychic Idiots", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=138" },
              { title: "When Criticism Can Stop", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=140" },
              { title: "Information and Experience", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=142" },
              { title: "The Teaching Is a Matter of Conduct", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=144" },
              { title: "Knowing One's Own Sincerity", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=149" },
              { title: "The Would-Be and Should-Be People", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=152" },
              { title: "Satisfactions and Purpose of Ritual", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=155" },
              { title: "Real and Ostensible Self-Improvement", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=157" },
              { title: "Roles of Teacher and Student", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=159" },

              // Section 5: ACTION AND MEANING
              { title: "ACTION AND MEANING", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=165" },
              { title: "Real and Relative Generosity", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=165" },
              { title: "Why Do Sufis Excel?", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=167" },
              { title: "Confusion as a Personal Problem", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=169" },
              { title: "Being a 'Guru'", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=172" },
              { title: "Systems", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=174" },
              { title: "The Vehicle and the Objective", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=177" },
              { title: "Concern and Campaign", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=179" },
              { title: "Use, Misuse and Disuse of Forms of Study", page: 160, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=182" },
              { title: "Potentiality and Function", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=185" },
              { title: "Conditioning and Education", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=187" },
              { title: "The Search for an Honest Man", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=189" },
              { title: "How Can One Method Be as Good as Another?", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=192" },

              // Section 6: TWENTY-THREE STUDY POINTS
              { title: "TWENTY-THREE STUDY POINTS", page: 175, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=197" },

              // Section 7: OVERALL STUDY
              { title: "OVERALL STUDY", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=205" },
              { title: "Learning and Non-Learning", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=205" },
              { title: "Some Characteristics of Sufi Literature", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=209" },
              { title: "Impartiality as a Point of View", page: 193, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=215" },
              { title: "Characteristics and Purposes of a Sufi Group", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=217" },
              { title: "Prerequisites for a Student of Sufism", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=219" },
              { title: "In Step Is Out Of Step", page: 201, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=223" },
              { title: "'Dye Your Prayer-Rug with Wine'", page: 204, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=226" },
              { title: "The Master-Dyer", page: 207, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=229" },
              { title: "Method, System and Conditioning", page: 210, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=232" },
              { title: "Western Culture", page: 213, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=235" },
              { title: "The Western Tradition", page: 215, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=237" },
              { title: "How Does the Sufi Teach?", page: 218, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=240" },
              { title: "Idiot's Wisdom", page: 222, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=244" },
              { title: "Attacking Fires", page: 226, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=248" },
              { title: "A Bridge and Its Use", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=251" },
              { title: "Deterioration of Studies", page: 231, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=253" },
              { title: "Community and Human Growth", page: 234, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=256" },
              { title: "The Value of Question and Answer Sessions", page: 239, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=261" },
              { title: "Dedication, Service, Sincerity", page: 243, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=265" },
              { title: "Sufis and Scholars", page: 247, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=269" },
              { title: "An Enterprise Is Measured by Intention, Not by Appearance", page: 254, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=276" },
              { title: "Sufi Organisations", page: 256, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=278" },

              // Section 8: SUFI STUDIES
              { title: "SUFI STUDIES", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=283" },
              { title: "Coming Together", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=283" },
              { title: "Concealment of Shortcomings", page: 265, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=287" },
              { title: "Saints and Heroes", page: 267, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=289" },
              { title: "The Levels of Service", page: 269, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=291" },
              { title: "Ritual and Practice", page: 272, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=294" },
              { title: "To Be Present", page: 274, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=296" },
              { title: "The Way to Sufism", page: 277, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=299" },
              { title: "The Giving of Charity", page: 284, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=306" },
              { title: "The Number of Readings of a Book", page: 287, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=309" },
              { title: "Decline in Religious Influence", page: 290, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=312" },
              { title: "Why Can't We Have a British Karakul Lamb?", page: 293, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=315" },
              { title: "Teaching Methods and Prerequisites", page: 298, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=320" },
              { title: "Sorrow in 'Spiritual Enterprises'", page: 305, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=327" },
              { title: "Shock-Teaching", page: 309, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=331" },
              { title: "Emotional Expectations", page: 313, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=335" },
              { title: "Jumping to Conclusions", page: 315, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=337" },
              { title: "The Rosary and the Robe", page: 318, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=340" },
              { title: "Random Exercises", page: 320, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=342" },
              { title: "On the Lines of a School", page: 324, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=346" },
              { title: "Conduct-Teaching", page: 327, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=349" },
              { title: "The Curriculum of a School", page: 330, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=352" },
              { title: "Knowing All About Someone", page: 337, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=359" },
              { title: "Remarks upon the Matter of the Dervish Path", page: 339, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=361" },
              { title: "Meetings, Groups, Classes", page: 342, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=364" },
              { title: "Internal Dimensions", page: 347, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=369" },
              { title: "Explanation", page: 350, url: "https://idriesshahfoundation.org/pdfviewer/learning-how-to-learn/?auto_viewer=true#page=372" }
          ]
        },

        {
          "title": "Knowing How to Know",
          "main_url": "https://idriesshahfoundation.org/books/knowing-how-to-know/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true",
          "description": "Cornerstone work on conditions necessary for real knowledge",
          "chapters": [
              { title: "Preface", page: "xvii", url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=17" },
              { title: "SECTION I", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=19" },
              { title: "Inclusion and Exclusion – a prologue", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=21" },
              // SECTION II
              { title: "SECTION II", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=47" },
              { title: "Real and Imitation Sufi Groups", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=49" },
              { title: "An Assumption Underlying All Human Cultures", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=59" },
              { title: "Acceptance", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=61" },
              { title: "Attention", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=61" },
              { title: "Notice", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=62" },
              { title: "A Real Community", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=63" },
              { title: "Are Men Machines?", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=64" },
              { title: "Assessment and Service", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=65" },
              { title: "Academics Anonymous", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=67" },
              { title: "Are You Above or Beyond This?", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=68" },
              { title: "All Knowledge Is Everywhere", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=69" },
              { title: "Adopted Methods", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=69" },
              { title: "Apparatus", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=70" },
              { title: "Books and Reading", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=71" },
              { title: "Boredom, Study and Entertainment", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=74" },
              { title: "Basic Considerations", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=75" },
              // SECTION III
              { title: "SECTION III", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=87" },
              { title: "Background, Techniques and Theory of Esoteric Systems", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=89" },
              { title: "Conceit", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=91" },
              { title: "Charity", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=92" },
              { title: "Consideration", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=92" },
              { title: "Constant Exhortation", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=93" },
              { title: "Criticism", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=94" },
              { title: "Corrective", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=95" },
              { title: "Clarity and Perplexity", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=95" },
              { title: "Cause and Effect", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=96" },
              { title: "Cult-Makers", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=96" },
              { title: "Caution", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=97" },
              { title: "Discovery", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=98" },
              { title: "Direct Transmission", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=98" },
              { title: "Didactic", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=99" },
              { title: "Dilution and Concentration", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=100" },
              { title: "Depths and Range of Traditional Materials", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=101" },
              { title: "Effect of Opinion, When Ingrained, Even on Scientists", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=102" },
              { title: "Elements Being Used in Our Courses", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=103" },
              { title: "Exercising Power", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=105" },
              { title: "Effort, Stretching and Straining", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=107" },
              { title: "Environmental Maladjustment", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=110" },
              { title: "Exercises", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=110" },
              { title: "Eight Points on Initiatory Literature", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=111" },
              { title: "Energy and Enthusiasm", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=113" },
              { title: "Emotion", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=114" },
              { title: "Emotion and Primitive State", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=114" },
              { title: "Egregious", page: 98, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=116" },
              { title: "Eternalism as a Vice", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=117" },
              { title: "Every Feeling Is Qualitative", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=118" },
              { title: "Fame and Altruism", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=118" },
              { title: "Fools' Wisdom", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=119" },
              { title: "Four States of Being", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=120" },
              { title: "Fear", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=121" },
              { title: "Fill the Pitcher", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=121" },
              { title: "Greed Is Always Greed", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=122" },
              { title: "Greed", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=123" },
              { title: "Guilt, Reward, Punishment", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=124" },
              { title: "Guarding the Woad Supplies", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=125" },
              { title: "Group Politics", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=125" },
              { title: "'Gharadh'", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=128" },
              { title: "Golden Age", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=129" },
              { title: "SECTION IV", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=131" },
              { title: "Humility and Superiority", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=133" },
              { title: "How to Study", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=135" },
              { title: "Human Knowledge", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=136" },
              { title: "How to 'Broaden Your Outlook' by Narrowing It", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=137" },
              { title: "Honour", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=138" },
              { title: "Higher Ranges of Study", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=139" },
              { title: "Human Duty", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=141" },
              { title: "Hypocrisy", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=142" },
              { title: "Human Thought Passing Through the Whole Organism", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=143" },
              { title: "Higher Nutritions", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=144" },
              { title: "Honour of the Wise", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=144" },
              { title: "Harmful Ideas", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=145" },
              { title: "Single-Formula Systems", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=145" },
              { title: "Students", page: 128, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=146" },
              { title: "Stupidity", page: 128, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=146" },
              { title: "Social Concern", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=147" },
              { title: "Summary of Orientation Points", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=152" },
              { title: "Solving Problems", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=153" },
              { title: "Seeking and Finding", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=154" },
              { title: "Showing", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=155" },
              { title: "Specialists", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=155" },
              { title: "Strange World", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=156" },
              { title: "Single-Minded", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=156" },
              { title: "Sane and Mad", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=157" },
              { title: "Service and Self-Satisfaction", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=158" },
              { title: "Sufism", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=158" },
              { title: "To an Enquirer", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=159" },
              { title: "Time, Place and Materials", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=159" },
              { title: "Transformation Process", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=160" },
              { title: "Threes and Ones", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=160" },
              { title: "To Be Remembered", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=161" },
              { title: "Truth and Belief", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=162" },
              { title: "Transformation of One's Worldly Life", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=163" },
              { title: "Three Disabling Consequences of Generalisation", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=163" },
              { title: "Thought", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=167" },
              { title: "There Comes a Time", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=167" },
              { title: "Thought and Property", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=168" },
              { title: "Terminology", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=169" },
              { title: "The Worst Ailment", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=170" },
              { title: "The Meaning of Life", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=170" },
              { title: "'The Right to Know'", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=170" },
              { title: "The Higher Learning", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=171" },
              { title: "The Sufis and Worldly Success", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=172" },
              { title: "The Use of Initiatory Texts", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=173" },
              { title: "SECTION V", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=175" },
              { title: "The Nature of Sufic Study", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=177" },
              { title: "The Nature of the Study Circle", page: 160, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=178" },
              { title: "The Anopheles Mosquito Situation", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=179" },
              { title: "The Sociological Problem", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=182" },
              { title: "The Age of the Fish", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=186" },
              { title: "The Faculty of Speech", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=187" },
              { title: "The Influence of a Teaching", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=187" },
              { title: "The Emperor's Clothes", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=188" },
              { title: "The Unknown", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=188" },
              { title: "The More You Think", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=189" },
              { title: "The Eighth Day", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=189" },
              { title: "The Village", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=190" },
              { title: "The Greed of Generosity", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=190" },
              { title: "The Hidden Current in Man", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=191" },
              { title: "The Value of Opinion", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=191" },
              { title: "The Values of Alchemy", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=192" },
              { title: "The Cycle of Human Thought", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=192" },
              { title: "The Use of Direct Language", page: 175, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=193" },
              { title: "The Rewards of Virtue", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=194" },
              { title: "The Third System", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=195" },
              { title: "The Defeatist Culture", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=196" },
              { title: "Unusual Experiences", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=198" },
              { title: "What Cannot Be Answered", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=198" },
              { title: "When 'This Is Not the Time' Does Not Have to Mean 'I Am Busy'", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=199" },
              { title: "Walking", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=201" },
              { title: "World of Their Own", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=201" },
              { title: "Words and Violence", page: 184, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=202" },
              { title: "Will Travel", page: 184, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=202" },
              { title: "Why People Follow Lesser Aims", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=203" },
              { title: "Why Not Tell Me?", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=204" },
              { title: "Working Within Limitations", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=204" },
              { title: "What Self-Examination Is", page: 188, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=206" },
              { title: "Why No No-Book Teaching?", page: 188, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=206" },
              { title: "Warming Water", page: 189, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=207" },
              { title: "Why People Escape Learning", page: 190, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=208" },
              { title: "Ways to Understand the Teaching", page: 190, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=208" },
              { title: "Virtuality", page: 192, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=210" },
              { title: "Views on Incongruity", page: 192, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=210" },
              { title: "When and Where?", page: 193, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=211" },
              { title: "What Have You Got?", page: 194, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=212" },
              { title: "Withdrawing From the World", page: 194, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=212" },
              { title: "Studies and Exercises as Variables", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=213" },
              { title: "Technology", page: 196, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=214" },
              { title: "Imitation in Techniques", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=215" },
              { title: "Infantile Desires", page: 198, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=216" },
              { title: "Ignorance and Hate", page: 198, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=216" },
              { title: "Information and Experiences", page: 199, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=217" },
              { title: "Imagination versus Understanding", page: 199, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=217" },
              { title: "Information and Knowledge", page: 200, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=218" },
              { title: "Ideology's Effect", page: 200, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=218" },
              { title: "Importation of Technique", page: 201, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=219" },
              { title: "I Can Teach You", page: 202, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=220" },
              { title: "'I Did Not Come Here to Be Insulted!'", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=221" },
              { title: "Information and Expectation", page: 204, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=222" },
              { title: "Judgement", page: 205, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=223" },
              { title: "Keeping On", page: 205, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=223" },
              { title: "Knowledge and Behaviour", page: 206, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=224" },
              { title: "SECTION VI", page: 207, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=225" },
              { title: "Liking and Disliking", page: 209, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=227" },
              { title: "Labels and Ancestry", page: 209, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=227" },
              { title: "Listen", page: 210, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=228" },
              { title: "Last Resort", page: 210, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=228" },
              { title: "Look At Me", page: 211, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=229" },
              { title: "Metaphor of the Kaleidoscope", page: 212, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=230" },
              { title: "Man Becoming Something Else", page: 215, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=233" },
              { title: "'Man Hates What Is Good for Him, Loves What Is Bad'", page: 215, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=233" },
              { title: "Men of Learning", page: 216, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=234" },
              { title: "Morality and Culture", page: 216, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=234" },
              { title: "Merit", page: 217, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=235" },
              { title: "Meditation", page: 218, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=236" },
              { title: "No Accident in These Studies", page: 219, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=237" },
              { title: "Needs, Not Fantasy", page: 219, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=237" },
              { title: "'Nothing Is Happening'", page: 220, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=238" },
              { title: "News", page: 221, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=239" },
              { title: "Observation", page: 221, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=239" },
              { title: "Organisation, Study, Belief", page: 222, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=240" },
              { title: "Original Function of Practices", page: 223, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=241" },
              { title: "Pure Water", page: 224, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=242" },
              { title: "Pupil and Teacher Interchange", page: 225, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=243" },
              { title: "Payment", page: 225, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=243" },
              { title: "Purposes of Experiences", page: 226, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=244" },
              { title: "Prescience", page: 227, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=245" },
              { title: "Possible Functions of Studies", page: 228, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=246" },
              { title: "Patience", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=247" },
              { title: "Practice of Virtue", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=247" },
              { title: "'Prescription' versus Mixing", page: 230, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=248" },
              { title: "Purpose of Regular Meetings", page: 230, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=248" },
              { title: "Qualitative Perceptions", page: 232, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=250" },
              { title: "Questions and Desires", page: 233, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=251" },
              { title: "Real Teaching", page: 233, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=251" },
              { title: "Random and Real Seeking", page: 234, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=252" },
              { title: "Reinfection", page: 236, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=254" },
              { title: "Ritual", page: 236, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=254" },
              { title: "Nitrogen", page: 237, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=255" },
              { title: "Reason for Exercising Sincerity", page: 238, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=256" },
              { title: "Reviews", page: 238, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=256" },
              { title: "Relationship With a School", page: 239, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=257" },
              { title: "Right Thought", page: 240, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=258" },
              { title: "Running Before You Can Walk", page: 240, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=258" },
              { title: "Reflection Theme", page: 241, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=259" },
              { title: "Respect", page: 241, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=259" },
              { title: "Real, Empirical and Imitative Study", page: 242, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=260" },
              { title: "Reasons for Discipline", page: 243, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=261" },
              { title: "The Loaf", page: 243, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=261" },
              { title: "Sufi Sayings and Their Application in Teaching Situations", page: 245, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=263" },
              { title: "SECTION VII", page: 251, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=269" },
              { title: "Systematic Study", page: 253, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=271" },
              { title: "Strange Literature, Odd People", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=273" },
              { title: "Slaps", page: 256, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=274" },
              { title: "Teachers and Pupils", page: 257, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=275" },
              { title: "The Sheep's Ear", page: 258, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=276" },
              { title: "Love and Fear", page: 259, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=277" },
              { title: "The Sign of a Master", page: 259, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=277" },
              { title: "The Guardian", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=279" },
              { title: "The Mad Rabbit", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=279" },
              { title: "The Hammer", page: 262, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=280" },
              { title: "Unaltered", page: 263, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=281" },
              { title: "Unwitting Knowledge", page: 264, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=282" },
              { title: "Withered", page: 264, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=282" },
              { title: "Why Some Stay and Some Pass By...", page: 265, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=283" },
              { title: "What Is the Sufi Enterprise?", page: 266, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=284" },
              { title: "Wind and Water", page: 267, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=285" },
              { title: "Wirewalkers", page: 268, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=286" },
              { title: "Why Do We Not Get More?", page: 269, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=287" },
              { title: "Human Identity", page: 270, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=288" },
              { title: "The Spice-Market", page: 271, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=289" },
              { title: "Understanding Sufi Study", page: 273, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=291" },
              { title: "The Elements of the Situation", page: 276, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=294" },
              { title: "The Melon", page: 281, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=299" },
              { title: "The Stone and the Tree", page: 283, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=301" },
              { title: "The Path of Love", page: 285, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=303" },
              { title: "One's Own Advantage", page: 286, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=304" },

              { title: "SECTION VIII", page: 289, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=307" },
              { title: "Turnips", page: 291, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=309" },
              { title: "The Wise Man", page: 295, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=313" },
              { title: "After a Swim", page: 297, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=315" },
              { title: "All in One Man", page: 298, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=316" },
              { title: "The Fish-Eating Monkey", page: 299, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=317" },
              { title: "The Chocolate Bar", page: 310, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=328" },
              { title: "The Vanishing Dirham", page: 312, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=330" },
              { title: "Diseases of Learning", page: 313, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=331" },

              { title: "SECTION IX", page: 325, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=343" },
              { title: "Guide to Major Principles in the Use of Humour in Human Development", page: 327, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=345" },
              { title: "The Story of the Fool", page: 334, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=352" },
              { title: "Choosing a New Teacher", page: 342, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=360" },
              { title: "Fire and Straw", page: 343, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=361" },
              { title: "And Wear Them Out…?", page: 344, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=362" },
              { title: "Mystical States", page: 344, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=362" },
              { title: "In a Sufi School", page: 346, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=364" },
              { title: "Where the People of Learning Go Wrong", page: 347, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=365" },
              { title: "Working Through the World", page: 348, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=366" },
              { title: "Today and Yesterday: Jami", page: 349, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=367" },
              { title: "The Taste of No Taste", page: 351, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=369" },
              { title: "Protecting People Against False Teachers", page: 352, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=370" },
              { title: "Pleasing All the People", page: 352, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=370" },
              { title: "How to Find the Right Way", page: 353, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=371" },
              { title: "Conduct", page: 354, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=372" },
              { title: "Testing the Disciple", page: 355, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=373" },
              { title: "Criticism by Sufis", page: 356, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=374" },
              { title: "What the Master Does", page: 357, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=375" },
              { title: "You and Me", page: 358, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=376" },
              { title: "Just as Useful", page: 359, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=377" },
              { title: "Webbed Feet", page: 360, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=378" },
              { title: "Authenticity", page: 361, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=379" },
              { title: "Speech and Silence", page: 362, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=380" },
              { title: "Fire-Worshipper", page: 363, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=381" },

              { title: "SECTION X", page: 365, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=383" },
              { title: "The Giving of Knowledge", page: 367, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=385" },
              { title: "Religious and Wise", page: 368, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=386" },
              { title: "The Three Chests and the Balance", page: 369, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=387" },
              { title: "When Is a Prayer Not a Prayer?", page: 371, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=389" },
              { title: "Wisdom...", page: 372, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=390" },
              { title: "The Half-Blind King", page: 374, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=392" },
              { title: "Sufi Introduction", page: 375, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=393" },
              { title: "Sufi Attitudes Towards Religious and Other Cults", page: 376, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=394" },
              { title: "The Tale of Two Frogs", page: 381, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=399" },
              { title: "The 'Net' at the Meetings", page: 382, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=400" },
              { title: "Shearing", page: 383, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=401" },
              { title: "Efficiency", page: 384, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=402" },
              { title: "Uncomplimentary", page: 385, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=403" },
              { title: "The American", page: 386, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=404" },
              { title: "Confrontation", page: 387, url: "https://idriesshahfoundation.org/pdfviewer/knowing-how-to-know/?auto_viewer=true#page=405" }
          ]
        },

        { "title": "The Commanding Self",
          "main_url": "https://idriesshahfoundation.org/books/the-commanding-self/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true",
          "description": "A comprehensive exploration of the psychological and spiritual barriers to human development",
          "chapters": [
                { title: "Sufi Thought, Experience and Teaching", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=17" },
                { title: "Cultural and Psychological Problems of the Commanding Self", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=23" },
                { title: "Introduction", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=25" },
                { title: "The Pit...", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=27" },
                { title: "Purpose of Study and Research", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=29" },
                { title: "Section I", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=35" },
                { title: "Outworn Techniques", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=37" },
                { title: "Recruitment and Education", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=38" },
                { title: "Understanding Oneself", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=39" },
                { title: "Criticism and Learning", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=41" },
                { title: "Why Should I Change Now?", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=43" },
                { title: "Science and Philosophy", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=46" },
                { title: "Human Development", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=48" },
                { title: "The Quality of One's Search", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=49" },
                { title: "The World", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=50" },
                { title: "The Short Cut", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=52" },
                { title: "Ass and Camel", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=53" },
                { title: "Telling the Time", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=54" },
                { title: "The Teacher", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=55" },
                { title: "Knife and Fork...", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=56" },
                { title: "Mystical Formulas", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=57" },
                { title: "Repeatable Experiments", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=58" },
                { title: "How Things Seem to Be", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=61" },
                { title: "Misunderstood", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=62" },
                { title: "Simplifying Sufi Teaching", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=63" },
                { title: "Perils of Imitation", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=64" },
                { title: "The Mouse and the Elephant", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=65" },
                { title: "Intolerable Mishmash?", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=66" },
                { title: "Appearance and Content in Sufi Tales", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=67" },
                { title: "Supreme Importance", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=68" },
                { title: "What it is Really Like", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=69" },
                { title: "Escape", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=70" },
                { title: "Inner Space", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=71" },
                { title: "Section II", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=73" },
                { title: "Three Significant Modes of Human Organisation and Learning", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=75" },
                { title: "'The Donkey which Brought You Here...'", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=76" },
                { title: "Timing", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=78" },
                { title: "Look to the End", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=81" },
                { title: "Adventurous Frogs", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=83" },
                { title: "Heat and Thirst", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=84" },
                { title: "The Conversation of the Birds", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=85" },
                { title: "Imagination", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=90" },
                { title: "The Birds", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=91" },
                { title: "Knowledge or Experiment?", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=91" },
                { title: "Sweet Water", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=93" },
                { title: "Direct and Indirect Learning", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=94" },
                { title: "Starting to Learn", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=96" },
                { title: "Advice and Seeking", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=98" },
                { title: "The High Cost of Learning", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=101" },
                { title: "Whom Do You Imitate?", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=104" },
                { title: "Deeper Things Affect Surface Ones", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=104" },
                { title: "People 'On Different Levels'", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=106" },
                { title: "Uncertainty, Dissatisfaction, Confusion", page: 91, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=107" },
                { title: "Time and Occasion", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=108" },
                { title: "Approaching Eastern Teachings", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=110" },
                { title: "Meditation and Other Topics", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=111" },
                { title: "Section III", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=115" },
                { title: "Quality, Quantity and Time", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=117" },
                { title: "Flavour", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=117" },
                { title: "Right and Wrong Study", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=118" },
                { title: "Trust", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=120" },
                { title: "Inconsequential", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=121" },
                { title: "Value for Money", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=122" },
                { title: "Bombardment", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=123" },
                { title: "Stolen Property", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=125" },
                { title: "The Five Animals", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=125" },
                { title: "Your Share and Mine", page: 112, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=128" },
                { title: "Arguing with Gifts...", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=129" },
                { title: "Ants", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=130" },
                { title: "Finding a Teacher", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=132" },
                { title: "How to Tell", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=133" },
                { title: "Imitators", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=134" },
                { title: "Today He Understands...", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=134" },
                { title: "The Cook", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=137" },
                { title: "Major and Minor Actions", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=140" },
                { title: "The Indian Teacher", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=141" },
                { title: "Whose Animals?", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=142" },
                { title: "Illiberal Behaviour of Sufis", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=143" },
                { title: "Being Rude to People", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=145" },
                { title: "Opening Another Door", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=147" },
                { title: "Fierce and Mild", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=148" },
                { title: "What is a Dervish?", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=149" },
                { title: "The Dervish and the Disciple", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=150" },
                { title: "Dervish, Sufi, Disciple", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=152" },
                { title: "The Trick", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=154" },
                { title: "What a Teacher Is", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=155" },
                { title: "The Chess-Players", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=156" },
                { title: "Way of Teaching...", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=157" },
                { title: "The Rope", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=158" },
                { title: "Wisdom of the West", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=159" },
                { title: "Section IV", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=161" },
                { title: "Hypocrite", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=163" },
                { title: "On The Way...", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=164" },
                { title: "The Shroud Has No Pockets", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=165" },
                { title: "Both Sides of the Road", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=166" },
                { title: "Doctor and Patient", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=167" },
                { title: "Maximum Effort", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=168" },
                { title: "Duality", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=171" },
                { title: "Two Swords", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=172" },
                { title: "Confrontation and Support", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=173" },
                { title: "Rukhsa", page: 158, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=174" },
                { title: "Etiquette", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=175" },
                { title: "Fellow Feeling", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=177" },
                { title: "Fate", page: 162, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=178" },
                { title: "Living Forever", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=179" },
                { title: "The Raft", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=180" },
                { title: "Impossible", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=181" },
                { title: "Sincerity and Truth", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=183" },
                { title: "Eastward Journeys", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=184" },
                { title: "The Magic Potion of Onkink", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=186" },
                { title: "Knock Quietly", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=188" },
                { title: "Clockwise", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=189" },
                { title: "Meaning of Words and Experiences", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=190" },
                { title: "Things You Cannot Say", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=192" },
                { title: "The Rich Man's State", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=193" },
                { title: "Car Keys", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=194" },
                { title: "Section V", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=195" },
                { title: "Eight Analogies", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=197" },
                { title: "The Need to Understand Restrictive Roles", page: 184, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=200" },
                { title: "Work", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=202" },
                { title: "Frozen Attention", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=203" },
                { title: "Heedlessness", page: 188, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=204" },
                { title: "Revealing His True Nature", page: 189, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=205" },
                { title: "Hypocrisy", page: 192, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=208" },
                { title: "Missed the Point...", page: 194, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=210" },
                { title: "Black and Blue", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=211" },
                { title: "The Barriers", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=213" },
                { title: "Undigested", page: 198, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=214" },
                { title: "Apricot Pies", page: 199, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=215" },
                { title: "Loading and Unloading", page: 202, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=218" },
                { title: "Diet of Grapes", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=219" },
                { title: "Attention", page: 206, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=222" },
                { title: "When is Learning Not Indoctrination?", page: 207, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=223" },
                { title: "Connection Between the Traditions", page: 208, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=224" },
                { title: "'Barbarians'", page: 217, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=233" },
                { title: "The Refined Barbarian", page: 218, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=234" },
                { title: "How to Measure Human Development", page: 219, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=235" },
                { title: "Laws and the Teacher", page: 221, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=237" },
                { title: "Upper Class", page: 222, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=238" },
                { title: "Justification", page: 223, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=239" },
                { title: "The Machine", page: 225, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=241" },
                { title: "Translations", page: 225, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=241" },
                { title: "Section VI", page: 227, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=243" },
                { title: "Questions", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=245" },
                { title: "Negligence", page: 230, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=246" },
                { title: "Cyclic", page: 231, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=247" },
                { title: "Why Questions are Asked", page: 233, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=249" },
                { title: "Why People Ask Questions", page: 234, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=250" },
                { title: "Answer", page: 236, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=252" },
                { title: "No Answer", page: 237, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=253" },
                { title: "Letters and Answers", page: 238, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=254" },
                { title: "Rhetoric", page: 240, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=256" },
                { title: "Idealism", page: 242, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=258" },
                { title: "Remembering Conversations", page: 244, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=260" },
                { title: "Too Vague", page: 245, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=261" },
                { title: "Prisons of Thought", page: 245, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=261" },
                { title: "Discouraging", page: 246, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=262" },
                { title: "The Importance of Intention", page: 247, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=263" },
                { title: "Nature", page: 249, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=265" },
                { title: "The Boat", page: 249, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=265" },
                { title: "Superficial Reading", page: 250, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=266" },
                { title: "Writing", page: 252, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=268" },
                { title: "The Shade Without the Tree", page: 253, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=269" },
                { title: "Dervish Literature", page: 254, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=270" },
                { title: "Meaning of Biographies", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=271" },
                { title: "Section VII", page: 259, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=275" },
                { title: "Religious or Sufi Presentation", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=277" },
                { title: "Which Is Which?", page: 262, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=278" },
                { title: "Invincible Ignorance", page: 264, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=280" },
                { title: "Sufis and Cultists", page: 268, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=284" },
                { title: "Conditioning", page: 269, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=285" },
                { title: "Deception", page: 272, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=288" },
                { title: "Gods and Demons", page: 273, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=289" },
                { title: "Prayer", page: 275, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=291" },
                { title: "Demons", page: 276, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=292" },
                { title: "Hero or Ignoramus?", page: 277, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=293" },
                { title: "Publicity", page: 278, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=294" },
                { title: "The People of God", page: 279, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=295" },
                { title: "Easier...", page: 280, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=296" },
                { title: "Idiot", page: 281, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=297" },
                { title: "Distress", page: 282, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=298" },
                { title: "Displacement Activity", page: 282, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=298" },
                { title: "Emergency", page: 283, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=299" },
                { title: "What They Respond To", page: 284, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=300" },
                { title: "Levitation", page: 285, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=301" },
                { title: "Blinding Them with Science", page: 286, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=302" },
                { title: "The Two-Thirty", page: 287, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=303" },
                { title: "The People Who Impress Us", page: 289, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=305" },
                { title: "Valuable Secrets", page: 291, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=307" },
                { title: "Piety", page: 292, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=308" },
                { title: "Believing", page: 293, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=309" },
                { title: "Human Beliefs", page: 294, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=310" },
                { title: "No Better Proof...", page: 295, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=311" },
                { title: "Spiritual Teachers", page: 296, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=312" },
                { title: "Gold Talks, Not Belief", page: 298, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=314" },
                { title: "The Moth and the Soot", page: 300, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=316" },
                { title: "Intake", page: 301, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=317" },
                { title: "Earth, Sun, Black Cats...", page: 302, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=318" },
                { title: "Warning", page: 303, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=319" },
                { title: "Travelling Tales", page: 304, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=320" },
                { title: "Miracles...", page: 305, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=321" },
                { title: "Names", page: 307, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=323" },
                { title: "Missionaries", page: 307, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=323" },
                { title: "Rice", page: 308, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=324" },
                { title: "Section VIII", page: 311, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=327" },
                { title: "Sacred Rituals, Dances, Ceremonials", page: 313, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=329" },
                { title: "'Togetherness'", page: 314, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=330" },
                { title: "Deterioration of Costumes", page: 315, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=331" },
                { title: "To Be Present", page: 316, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=332" },
                { title: "The Mystics", page: 317, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=333" },
                { title: "Yoga and Illumination", page: 318, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=334" },
                { title: "The 'Work' Situation", page: 319, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=335" },
                { title: "The 'Work' Situation II", page: 321, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=337" },
                { title: "Ancient Monuments", page: 322, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=338" },
                { title: "Special Meanings in Service", page: 324, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=340" },
                { title: "Symbols, Especially the Enneagon", page: 325, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=341" },
                { title: "Origin of Planetary Symbols", page: 327, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=343" },
                { title: "About Recognition...", page: 328, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=344" },
                { title: "Secret Meaning of Reincarnation Theory", page: 329, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=345" },
                { title: "Laboratory Experiments", page: 330, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=346" },
                { title: "Studying Here and Now", page: 331, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=347" },
                { title: "Dangers of Automatic Reasoning", page: 332, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=348" },
                { title: "How I See You", page: 334, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=350" },
                { title: "Not For You", page: 335, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=351" },
                { title: "Preconditions...", page: 336, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=352" },
                { title: "Telepathy", page: 338, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=354" },
                { title: "Curiosity", page: 339, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=355" },
                { title: "Section IX", page: 341, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=357" },
                { title: "A Little Anthropology", page: 343, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=359" },
                { title: "More Anthropology", page: 344, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=360" },
                { title: "How the World Works", page: 345, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=361" },
                { title: "Chewing", page: 346, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=362" },
                { title: "The Fisherman's Neighbour", page: 347, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=363" },
                { title: "Denunciation", page: 348, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=364" },
                { title: "Trifles", page: 349, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=365" },
                { title: "Humility", page: 350, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=366" },
                { title: "Advisable", page: 351, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=367" },
                { title: "Analogy", page: 352, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=368" },
                { title: "Nice", page: 352, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=368" },
                { title: "Consciousness of Good", page: 353, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=369" },
                { title: "How Many Miles…?", page: 355, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=371" },
                { title: "Patience, Faith and Honour", page: 356, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=372" },
                { title: "The Valiant Trader-Knight", page: 360, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=376" },
                { title: "Hoard", page: 363, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=379" },
                { title: "Music and Goodness", page: 364, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=380" },
                { title: "Inner Value of Music", page: 365, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=381" },
                { title: "Behind the Image", page: 367, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=383" },
                { title: "Path of Blame", page: 369, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=385" },
                { title: "Perspective", page: 370, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=386" },
                { title: "Spirituality and Materialism", page: 371, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=387" },
                { title: "Possession and Possessing", page: 372, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=388" },
                { title: "Problems of the World", page: 374, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=390" },
                { title: "Exchange", page: 375, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=391" },
                { title: "The Diamond", page: 376, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=392" },
                { title: "Irritated", page: 377, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=393" },
                { title: "How to Get a Job", page: 378, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=394" },
                { title: "The Demon and the Happy Couple", page: 379, url: "https://idriesshahfoundation.org/pdfviewer/the-commanding-self/?auto_viewer=true#page=395" }
              ]
            },

        {
          "title": "Observations",
          "main_url": "https://idriesshahfoundation.org/books/observations/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true",
          "description": "Short observations and aphorisms on human behavior patterns",
          "note": "The title naming is AI generated.",
          "chapters": [
          { title: "Foreword", page: "viii", url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=8" },
          { title: "Teaching and Memory", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=9" },
          { title: "Lord Wavell and Reformed Bandits", page: 2, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=10" },
          { title: "Sufis and Power (Maruf Karkhi)", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=11" },
          { title: "Religion vs Religiosity", page: 4, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=12" },
          { title: "Research on Sufi Materials", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=13" },
          { title: "Behavior and Significance", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=14" },
          { title: "Fame at Last (Afghan Stamps)", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=15" },
          { title: "Difficulties of Study", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=16" },
          { title: "Self-observation", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=17" },
          { title: "Three Classes of Bus Passengers", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=18" },
          { title: "Manufacturing Enemies", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=19" },
          { title: "Hostility and Self-love", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=20" },
          { title: "Robert Graves on Reviews", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=21" },
          { title: "The Mind and Thoughts", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=22" },
          { title: "Wisdom vs Knowledge", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=23" },
          { title: "Simplification", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=24" },
          { title: "Mulla Nasrudin and the Barking Dog", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=25" },
          { title: "Shortage of Available Sufis", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=26" },
          { title: "Television Interview Translation", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=27" },
          { title: "The Sufi's Role in the World", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=28" },
          { title: "Fame and Qualification", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=29" },
          { title: "Mr. Bloggs and the Drains", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=30" },
          { title: "Questions vs Answers", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=31" },
          { title: "Giving a Comb to a Bald Man", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=32" },
          { title: "Interest of Fools", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=33" },
          { title: "The Renowned Sage's Journey", page: 26, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=34" },
          { title: "Being Wrong vs Being Right", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=35" },
          { title: "Teaching Like Setting Bones", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=36" },
          { title: "The Stationary Wheel", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=37" },
          { title: "The Ugly Monkey and the Witch", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=38" },
          { title: "Disagreeing with the Sufis", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=39" },
          { title: "Spiritual Traditions as Lifeboats", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=40" },
          { title: "Conference on World Problems", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=41" },
          { title: "Words as Food of Minds", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=42" },
          { title: "Extra Dimensions and Butterflies", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=43" },
          { title: "Sufism and Ten Thousand Years", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=44" },
          { title: "Three Understandings", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=45" },
          { title: "Modern Arts: Healing and Destruction", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=46" },
          { title: "The Limit to Negligence", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=47" },
          { title: "Scholars and Sufism", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=48" },
          { title: "Ignorance, Knowledge, Understanding", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=49" },
          { title: "Self-appointed Specialists", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=50" },
          { title: "Laughter and Superficiality", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=51" },
          { title: "Self-deception", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=52" },
          { title: "Gnats and Elephants", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=53" },
          { title: "Why Sufis Are Difficult to Find", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=54" },
          { title: "The Sheikh of Khorasan (continued)", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=55" },
          { title: "Academic Reputation Swings", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=56" },
          { title: "Surrey University and Orlando the Cat", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=57" },
          { title: "Curses and Paper", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=58" },
          { title: "Duty vs Birthright", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=59" },
          { title: "Original Sin vs Greed", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=60" },
          { title: "Esoteric Genuineness", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=61" },
          { title: "The Lion and Lamb Circus", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=62" },
          { title: "Friends and Enemies (Animals)", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=63" },
          { title: "Sponges and Spiritual Dishonesty", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=64" },
          { title: "Recognition of Gold", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=65" },
          { title: "British vs American Language", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=66" },
          { title: "Sufis Called Liars", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=67" },
          { title: "Victory Over the Weak", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=68" },
          { title: "Listening vs Waiting", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=69" },
          { title: "Bad Teachers vs Bad Students", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=70" },
          { title: "Learning vs Teaching (St. Augustine)", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=71" },
          { title: "Sufi Sayings and Reality Levels", page: 64, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=72" },
          { title: "Speaking and Hearing", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=73" },
          { title: "Fools and Speaking", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=74" },
          { title: "The Western Seeker's Journey", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=75" },
          { title: "Master Saadi Quote (continued)", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=76" },
          { title: "Meeting Yourself", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=77" },
          { title: "Truth and Hypocrites", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=78" },
          { title: "Wisdom vs Knowledge of Everything", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=79" },
          { title: "The Sun Always Shining", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=80" },
          { title: "Going to England for Weather", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=81" },
          { title: "Seeing Through Hypocrites", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=82" },
          { title: "Making Hopes Come True", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=83" },
          { title: "Progress in Inward Studies", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=84" },
          { title: "Truth and Dishonesty", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=85" },
          { title: "Born as Moving Target", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=86" },
          { title: "Horsemanship from Blacksmiths", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=87" },
          { title: "Planting Cheese, Harvesting Milk", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=88" },
          { title: "Wisdom and Nobility", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=89" },
          { title: "Nourishing Stupidity with Avarice", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=90" },
          { title: "Education's Problems", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=91" },
          { title: "Sufis Exist for Practice", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=92" },
          { title: "Imagination of the Wise", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=93" },
          { title: "Radio Interview About Sufis", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=94" },
          { title: "The Scholar's Response (continued)", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=95" },
          { title: "Eastern and Western Techniques", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=96" },
          { title: "Advice Based on Experience", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=97" },
          { title: "Getting Anywhere vs Communities", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=98" },
          { title: "Knowledge Without Depth", page: 91, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=99" },
          { title: "Public Complaints and Self-stimulation", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=100" },
          { title: "Justice and Heroism", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=101" },
          { title: "Seeking Comfort and Instructions", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=102" },
          { title: "Planning Your Own Studies", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=103" },
          { title: "Jan-Fishan Khan on Tyrants", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=104" },
          { title: "Every Raisin May Contain a Pip", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=105" },
          { title: "Butter Before Milking", page: 98, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=106" },
          { title: "Teacher's Least Striking Words", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=107" },
          { title: "Wisdom vs Ignorance", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=108" },
          { title: "Teaching How to Argue", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=109" },
          { title: "Hindsight and Aphorisms", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=110" },
          { title: "Nothing Ever Lost", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=111" },
          { title: "Misunderstanding and Vilification", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=112" },
          { title: "Writers as Emperors", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=113" },
          { title: "Bahaudin Naqshband on Vanity", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=114" },
          { title: "The Unusual vs The Significant", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=115" },
          { title: "Getting to Wednesday Before Monday", page: 108, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=116" },
          { title: "Wish vs Can Do", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=117" },
          { title: "The Expert on Idries Shah", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=118" },
          { title: "Clerical Attire for the Lord", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=119" },
          { title: "Thermometer and Fever", page: 112, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=120" },
          { title: "Unifying Creeds", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=121" },
          { title: "The Iconosphere", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=122" },
          { title: "Demons and Help", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=123" },
          { title: "Saints and Religion", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=124" },
          { title: "Wise Scholar Paradox", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=125" },
          { title: "Civil Service Non-verbalization", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=126" },
          { title: "Looking for Excitement", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=127" },
          { title: "Eastern Saying for the West", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=128" },
          { title: "Kurdish, Tibetan, Armenian Peoples", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=129" },
          { title: "Simplicity's Complications", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=130" },
          { title: "The Great Thinker's Rage", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=131" },
          { title: "Value of the Husk", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=132" },
          { title: "Teacher's Lightest Word", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=133" },
          { title: "Water Trapped in Iceberg", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=134" },
          { title: "Orientalists and Madness", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=135" },
          { title: "Tell It Like It Is", page: 128, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=136" },
          { title: "Offered Kindness", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=137" },
          { title: "Finding Time in Clock Shop", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=138" },
          { title: "Sheikh Abdul-Qadir Gilani", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=139" },
          { title: "Spiritual Teacher Madness", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=140" },
          { title: "Conventional Experience", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=141" },
          { title: "Western Politician's Moral Authority", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=142" },
          { title: "Moral Authority (continued)", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=143" },
          { title: "Pot and Ladle", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=144" },
          { title: "Human Beings Operating Instructions", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=145" },
          { title: "Replacements and Attention", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=146" },
          { title: "Greed and Foolishness Circle", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=147" },
          { title: "Selling Lanterns to the Blind", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=148" },
          { title: "University Doctorate Controversy", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=149" },
          { title: "Honorary Doctorate Details (continued)", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=150" },
          { title: "Academic Accusations (continued)", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=151" },
          { title: "Judging Others' Assessments", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=152" },
          { title: "Deception Warning", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=153" },
          { title: "The Traveller on the Path", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=154" },
          { title: "Envy Upside-down", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=155" },
          { title: "Forbidden to Forbid", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=156" },
          { title: "Worthless Comments", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=157" },
          { title: "Hiding and Revealing", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=158" },
          { title: "What You Need to Know", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=159" },
          { title: "Human Duty and Selfishness", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=160" },
          { title: "Never Saying \"I am Ignorant\"", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=161" },
          { title: "Psychology and Christianity", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=162" },
          { title: "Wisdom vs Folly", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=163" },
          { title: "Bad Writers and Bad Readers", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=164" },
          { title: "Emotional vs Spiritual", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=165" },
          { title: "Spiritual Groups vs Teaching Bodies", page: 158, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=166" },
          { title: "Sufi Adventures in the West", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=167" },
          { title: "Two Forms of Laziness", page: 160, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=168" },
          { title: "Truth and Lies in Relationships", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=169" },
          { title: "Six Stages in Sufi Development", page: 162, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=170" },
          { title: "Guardian of Your Secret", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=171" },
          { title: "Consumers and Consumption", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=172" },
          { title: "The Football Game Lesson", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=173" },
          { title: "Impressive but Valueless Remarks", page: 166, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=174" },
          { title: "Remove Desire from Thought", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=175" },
          { title: "Finding Hope Through Patience", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=176" },
          { title: "Mind Without Inner Knowledge", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=177" },
          { title: "Anger and Placidity as Madness", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=178" },
          { title: "Tongue as Prisoner", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=179" },
          { title: "Refusing to Learn", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=180" },
          { title: "Ignorance and Disease", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=181" },
          { title: "Envying the Good", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=182" },
          { title: "Humility and Pride", page: 175, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=183" },
          { title: "Knowing Branch and Root", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/observations/?auto_viewer=true#page=184" }
          ]
        },

        {
          "title": "Reflections",
          "main_url": "https://idriesshahfoundation.org/books/reflections/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true",
          "description": "Fables and reflections from the Sufi tradition",
          "chapters": [
          { title: "The Ambitious Rats", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=9" },
          { title: "Dramatic", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=9" },
          { title: "The Highest Principles", page: 2, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=10" },
          { title: "Point of View (Saadi of Shiraz)", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=11" },
          { title: "Different Every Time", page: 4, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=12" },
          { title: "History", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=13" },
          { title: "Affection and Regard", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=13" },
          { title: "Forms of Love", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=14" },
          { title: "What I Say", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=14" },
          { title: "The Oyster", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=15" },
          { title: "Drowning", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=15" },
          { title: "The Lightning and the Oak", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=16" },
          { title: "Causes", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=16" },
          { title: "Trust", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=17" },
          { title: "Indirect Route", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=17" },
          { title: "Changing Sense of Humour", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=17" },
          { title: "The Older the Better", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=18" },
          { title: "Signwriters", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=18" },
          { title: "Heat and Cold", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=19" },
          { title: "Inspirations", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=19" },
          { title: "Local and Real Truth", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=20" },
          { title: "A Hare", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=20" },
          { title: "Attention", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=20" },
          { title: "Freedom", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=21" },
          { title: "Generalisations Are Perilous", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=21" },
          { title: "Arms and Legs", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=22" },
          { title: "Function", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=22" },
          { title: "Adult Toddlers", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=22" },
          { title: "Presence and Absence", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=23" },
          { title: "Carpenter's Shop", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=23" },
          { title: "Comprehension", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=24" },
          { title: "The Nail", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=24" },
          { title: "Study", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=25" },
          { title: "Original Perfection", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=25" },
          { title: "Humility", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=26" },
          { title: "Wasps", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=26" },
          { title: "Different and the Same", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=26" },
          { title: "Choice", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=27" },
          { title: "Occasion (Story of Aslam)", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=27" },
          { title: "Subordinates", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=29" },
          { title: "The Lizard and the Spider", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=29" },
          { title: "Unknown", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=30" },
          { title: "Report On the Planet Earth", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=31" },
          { title: "The Demon and the Wise Man", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=32" },
          { title: "Debunking", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=33" },
          { title: "Improvement", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=33" },
          { title: "The Two Demons", page: 26, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=34" },
          { title: "Contraries", page: 26, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=34" },
          { title: "Motives of the Rabbit", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=35" },
          { title: "Reading a Book", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=35" },
          { title: "Goat-Leader", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=36" },
          { title: "Broth and Cooks", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=36" },
          { title: "Trapped Rat", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=37" },
          { title: "'I'", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=37" },
          { title: "The Rich Man Who Was a Beggar", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=38" },
          { title: "The Philosopher", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=39" },
          { title: "Thinking that One Knows", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=39" },
          { title: "The Intelligent Man", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=40" },
          { title: "Hooliganism", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=41" },
          { title: "Being", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=41" },
          { title: "Talking", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=41" },
          { title: "Anticipated", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=42" },
          { title: "Solving Problems", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=42" },
          { title: "Virtue", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=43" },
          { title: "The Cheese", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=43" },
          { title: "Belief and the Impossible", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=43" },
          { title: "Why He Was Chosen", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=44" },
          { title: "New Names", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=45" },
          { title: "The Dervishes From the Other World", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=45" },
          { title: "Clever and Profound", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=46" },
          { title: "The Reason", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=46" },
          { title: "Epoch-Making", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=46" },
          { title: "Permanence", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=47" },
          { title: "The Toads in the Castle", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=47" },
          { title: "Man and the Tiger", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=48" },
          { title: "Thinking and Knowing", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=49" },
          { title: "Teachers and Students", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=49" },
          { title: "The Driver, Horse and Cart", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=49" },
          { title: "Who Cares?", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=50" },
          { title: "Three Wishes", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=51" },
          { title: "Higher Perceptions", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=51" },
          { title: "The Donkey and the Cactus", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=52" },
          { title: "Positive and Negative", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=52" },
          { title: "In the Land of Fools", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=53" },
          { title: "Confession", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=54" },
          { title: "The Spider", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=55" },
          { title: "Defensiveness", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=55" },
          { title: "The Scholar and the Philosopher", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=56" },
          { title: "Suggestion and Attention", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=56" },
          { title: "Dragon", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=57" },
          { title: "Understanding", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=57" },
          { title: "Time", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=58" },
          { title: "Melons and Mountaintops", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=58" },
          { title: "Cat and Dog", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=59" },
          { title: "Curse and Blessing", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=59" },
          { title: "Dogs and Jackals", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=60" },
          { title: "Man and Hero", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=61" },
          { title: "What I Am...", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=61" },
          { title: "Taboos, Totemism, Image-Building", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=62" },
          { title: "Demonstration", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=62" },
          { title: "Function of Religious Symbols", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=63" },
          { title: "A Motto of the Human Race", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=63" },
          { title: "Unreliable Friends", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=63" },
          { title: "Genius", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=64" },
          { title: "What a Horse", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=64" },
          { title: "The Answer To a Fool", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=65" },
          { title: "Duty", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=65" },
          { title: "Both Sides", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=65" },
          { title: "Communication", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=65" },
          { title: "Power", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=66" },
          { title: "Generosity and Wisdom", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=67" },
          { title: "Exaggeration", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=67" },
          { title: "When Advice Exceeds Its Function", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=67" },
          { title: "Saying a Thing", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=67" },
          { title: "Opinion", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=68" },
          { title: "Myth and Man", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=68" },
          { title: "Credulity", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=68" },
          { title: "Pessimist", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=68" },
          { title: "Affronted Man", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=69" },
          { title: "Shut Doors", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=69" },
          { title: "Belief", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=69" },
          { title: "The Wise and the Foolish", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=70" },
          { title: "Words and Thought", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=70" },
          { title: "Talk", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=70" },
          { title: "Higher Experience", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=71" },
          { title: "Three Kinds of Literature", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=71" },
          { title: "Truth", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=71" },
          { title: "Study and Method", page: 64, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=72" },
          { title: "Stimuli", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=73" },
          { title: "Tasting", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=74" },
          { title: "Meditation", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=74" },
          { title: "Knowledge and Power", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=74" },
          { title: "Too Late To Learn?", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=74" },
          { title: "Difficulties in Teaching", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=75" },
          { title: "Born Yesterday", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=75" },
          { title: "Change Everything", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=75" },
          { title: "Seeking", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=76" },
          { title: "Preparation", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=76" },
          { title: "Smoke and Fire", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=76" },
          { title: "Sheepskin", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=76" },
          { title: "Metaphysics", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=77" },
          { title: "Questions and Answers", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=77" },
          { title: "Out of the Trees", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=77" },
          { title: "Desire", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=78" },
          { title: "The Door Shuts", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=78" },
          { title: "Miracles", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=78" },
          { title: "Doing", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=79" },
          { title: "Man", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=79" },
          { title: "Deafness", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=79" },
          { title: "The Stag", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=79" },
          { title: "'I' and 'Me'", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=80" },
          { title: "Him Who Waits", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=80" },
          { title: "Raw Material", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=80" },
          { title: "Sore Eyes", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=81" },
          { title: "Hard and Easy Work", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=81" },
          { title: "Contradictions", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=81" },
          { title: "Evolution", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=82" },
          { title: "Chalk and Cheese", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=82" },
          { title: "Comprehensive Materials", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=82" },
          { title: "Attraction", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=83" },
          { title: "Both Ends", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=83" },
          { title: "Fools", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=84" },
          { title: "Supersession", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=84" },
          { title: "The Candle", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=84" },
          { title: "Unworthy Friend", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=85" },
          { title: "The Difference Between Saying and Doing", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=85" },
          { title: "Self-Satisfaction", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=85" },
          { title: "Behind the Machine", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=86" },
          { title: "Good and Bad", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=86" },
          { title: "Your Problem", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=87" },
          { title: "Books and Donkeys", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=88" },
          { title: "Specificity", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=88" },
          { title: "M.C.O.", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=88" },
          { title: "History", "page": 81, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=89" },
          { title: "The Wise and Ignorant", "page": 81, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=89" },
          { title: "'Better Try Something Than Nothing at All'", "page": 81, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=89" },
          { title: "To Find a Way of Life", "page": 82, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=90" },
          { title: "Intellectual Exercise", "page": 82, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=90" },
          { title: "Reactions", "page": 85, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=93" },
          { title: "Caterpillar", "page": 86, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=94" },
          { title: "Manoeuvring", "page": 86, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=94" },
          { title: "Pen-Names", "page": 87, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=95" },
          { title: "The First and Last Battles", "page": 88, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=96" },
          { title: "What Goes On Inside", "page": 88, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=96" },
          { title: "Perception and Objective Truth", "page": 89, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=97" },
          { title: "The Execrated Sheikh", "page": 91, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=99" },
          { title: "The Wise Man and the Critics", "page": 98, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=106" },
          { title: "The Aim", "page": 99, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=107" },
          { title: "The Wandering Baba", "page": 100, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=108" },
          { title: "Unnecessary", "page": 103, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=111" },
          { title: "Lying", "page": 104, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=112" },
          { title: "Doubt", "page": 105, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=113" },
          { title: "Right and Flattering", "page": 105, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=113" },
          { title: "Lichen", "page": 107, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=115" },
          { title: "The Log and the Mushroom", "page": 109, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=117" },
          { title: "The Demons Oath", "page": 110, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=118" },
          { title: "Delights of a Visit To Hell", "page": 113, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=121" },
          { title: "Monks and Modesty", "page": 116, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=124" },
          { title: "Two Gurus", "page": 117, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=125" },
          { title: "Deserts", "page": 120, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=128" },
          { title: "Overweight", "page": 120, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=128" },
          { title: "Banal", "page": 121, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=129" },
          { title: "Milk", "page": 121, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=129" },
          { title: "Criticising", "page": 122, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=130" },
          { title: "Crudity", "page": 122, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=130" },
          { title: "Secrets", "page": 122, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=130" },
          { title: "Games", "page": 122, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=130" },
          { title: "Understanding", "page": 123, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=131" },
          { title: "Thinking Point", "page": 123, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=131" },
          { title: "Overheard at a Party", "page": 123, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=131" },
          { title: "The Talisman", "page": 123, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=131" },
          { title: "Hope", "page": 124, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=132" },
          { title: "Enemies", "page": 124, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=132" },
          { title: "Teaching", "page": 124, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=132" },
          { title: "Perfection", "page": 124, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=132" },
          { title: "Hatred", "page": 125, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=133" },
          { title: "The Reason", "page": 125, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=133" },
          { title: "Aphorisms", "page": 125, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=133" },
          { title: "Stimulus", "page": 125, "url": "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=133" },
          { title: "Belief and Knowledge", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=134" },
          { title: "Shade", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=134" },
          { title: "Hand-Crafted", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=134" },
          { title: "Childhood", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=135" },
          { title: "Opinions", page: 128, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=136" },
          { title: "Defying Experience", page: 128, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=136" },
          { title: "Waiting", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=137" },
          { title: "Golden Rule", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=137" },
          { title: "Short Cuts", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=138" },
          { title: "What the Culture Transmits", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=138" },
          { title: "Time, Place, Manner", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=139" },
          { title: "Out of Context", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=139" },
          { title: "Tolerance", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=140" },
          { title: "Shins and Arms", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=140" },
          { title: "Have a Care", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=141" },
          { title: "Certainty", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=141" },
          { title: "Opportunity", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=141" },
          { title: "Ends", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=142" },
          { title: "Society", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=142" },
          { title: "Fame and Effort", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=142" },
          { title: "Prejudice", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=142" },
          { title: "Drop-Out", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=143" },
          { title: "Straws and Camels", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=143" },
          { title: "Optimist and Pessimist", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=143" },
          { title: "Talent", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=143" },
          { title: "Unrecorded History", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=144" },
          { title: "Did You?", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=145" },
          { title: "The First Ape and the Bananas", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=145" },
          { title: "The Second Ape and the Bananas", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=146" },
          { title: "Death", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=147" },
          { title: "Evolution", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=147" },
          { title: "Grit", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=148" },
          { title: "Worried", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=149" },
          { title: "Truth", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=149" },
          { title: "Common Knowledge", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=150" },
          { title: "Two Religions", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=150" },
          { title: "Expectation", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=150" },
          { title: "Giving and Taking", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=151" },
          { title: "Life and Disappointment", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=151" },
          { title: "Tantalising", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=151" },
          { title: "What Did You Learn?", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=152" },
          { title: "Rights", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=152" },
          { title: "People and Ideas", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=152" },
          { title: "For Extra-Terrestrial Beings", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=153" },
          { title: "Decisions", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=153" },
          { title: "Big and Small", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=154" },
          { title: "Wetter Water", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=154" },
          { title: "Tourism", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=154" },
          { title: "Toys", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=155" },
          { title: "Remembering and Forgetting", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=155" },
          { title: "Advanced", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=155" },
          { title: "Shrinkage", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=156" },
          { title: "Against God", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=156" },
          { title: "The Emperor's New Clothes", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=156" },
          { title: "Digestion", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=156" },
          { title: "Versatile Thought", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=157" },
          { title: "What Do You Think I Am?", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=157" },
          { title: "Laziness", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=157" },
          { title: "The Seeking of the Master", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/reflections/?auto_viewer=true#page=157" }
          ]
        },

        {
          "title": "The Magic Monastery",
          "main_url": "https://idriesshahfoundation.org/books/the-magic-monastery/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true",
          "description": "Course in non-linear thinking through Eastern teaching tales",
          "chapters": [
              { "title": "Preface", "page": "xiii", "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=13" },
              { "title": "The Magic Monastery", "page": 1, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=15" },
              { "title": "Cat Think", "page": 4, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=18" },
              { "title": "The Self-Congratulating Fruit", "page": 5, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=19" },
              { "title": "Greed, Obligement and Impossibility", "page": 7, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=21" },
              { "title": "Delusion", "page": 8, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=22" },
              { "title": "Cat and Rabbit", "page": 9, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=23" },
              { "title": "An Answer of Humanyun Adil", "page": 10, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=24" },
              { "title": "The Disease", "page": 11, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=25" },
              { "title": "The Son of a Beggar", "page": 12, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=26" },
              { "title": "Three Epochs", "page": 13, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=27" },
              { "title": "A Sufi of Pamiristan", "page": 15, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=29" },
              { "title": "Last Day", "page": 16, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=30" },
              { "title": "Vine Thought", "page": 17, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=31" },
              { "title": "Appearances", "page": 18, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=32" },
              { "title": "Disguise", "page": 19, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=33" },
              { "title": "Eating and Wonderment", "page": 20, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=34" },
              { "title": "Pitcher Lore", "page": 21, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=35" },
              { "title": "Exercises", "page": 22, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=36" },
              { "title": "Nectar", "page": 23, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=37" },
              { "title": "Absurdities", "page": 24, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=38" },
              { "title": "Onions", "page": 25, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=39" },
              { "title": "Tokens", "page": 26, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=40" },
              { "title": "The Ass", "page": 27, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=41" },
              { "title": "The Method", "page": 28, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=42" },
              { "title": "Nuts", "page": 29, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=43" },
              { "title": "Visitors", "page": 30, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=44" },
              { "title": "Thirsty", "page": 31, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=45" },
              { "title": "The Realm", "page": 33, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=47" },
              { "title": "Vanity", "page": 35, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=49" },
              { "title": "Destitution", "page": 36, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=50" },
              { "title": "Where it Starts", "page": 37, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=51" },
              { "title": "Statistic", "page": 39, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=53" },
              { "title": "Night and Morning", "page": 40, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=54" },
              { "title": "Man and Animal", "page": 42, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=56" },
              { "title": "Obvious", "page": 43, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=57" },
              { "title": "Prisoner", "page": 44, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=58" },
              { "title": "Characteristics", "page": 46, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=60" },
              { "title": "Theoretician", "page": 47, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=61" },
              { "title": "Catharsis", "page": 48, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=62" },
              { "title": "Fantasy", "page": 49, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=63" },
              { "title": "Kindness", "page": 51, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=65" },
              { "title": "Misjudged", "page": 52, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=66" },
              { "title": "Scratching", "page": 53, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=67" },
              { "title": "The Oatland Story", "page": 54, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=68" },
              { "title": "Zaky and the Dove", "page": 60, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=74" },
              { "title": "Grass", "page": 61, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=75" },
              { "title": "Prospects", "page": 63, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=77" },
              { "title": "The Mirror, the Cup and the Goldsmith", "page": 64, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=78" },
              { "title": "The Onion", "page": 66, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=80" },
              { "title": "Time", "page": 68, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=82" },
              { "title": "The Wand", "page": 69, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=83" },
              { "title": "The Sun and the Lamps", "page": 70, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=84" },
              { "title": "The Goat", "page": 71, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=85" },
              { "title": "The Imbecile Teacher", "page": 73, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=87" },
              { "title": "The Fool", "page": 74, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=88" },
              { "title": "Transaction", "page": 75, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=89" },
              { "title": "The Fish and the Water", "page": 76, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=90" },
              { "title": "Mouseolatry", "page": 77, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=91" },
              { "title": "Six Lives in One", "page": 79, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=93" },
              { "title": "Opposition", "page": 81, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=95" },
              { "title": "Scientific Advance", "page": 82, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=96" },
              { "title": "Service", "page": 83, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=97" },
              { "title": "The Tristomachic Survival", "page": 85, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=99" },
              { "title": "Tiger", "page": 86, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=100" },
              { "title": "Please Do This", "page": 87, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=101" },
              { "title": "Sting", "page": 88, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=102" },
              { "title": "Contradictions", "page": 89, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=103" },
              { "title": "The Fruit", "page": 90, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=104" },
              { "title": "The Slave Sufi", "page": 91, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=105" },
              { "title": "Unlikely Legend", "page": 92, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=106" },
              { "title": "Surroundings", "page": 93, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=107" },
              { "title": "The Outline", "page": 94, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=108" },
              { "title": "The Difference", "page": 95, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=109" },
              { "title": "The Crystal", "page": 96, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=110" },
              { "title": "Selfishness", "page": 97, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=111" },
              { "title": "Experience", "page": 98, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=112" },
              { "title": "The Botanists: Land without Medicine", "page": 99, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=113" },
              { "title": "Worse", "page": 102, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=116" },
              { "title": "Money", "page": 103, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=117" },
              { "title": "Evaluate", "page": 104, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=118" },
              { "title": "In Due Season", "page": 105, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=119" },
              { "title": "Radios", "page": 106, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=120" },
              { "title": "The Young Sufi", "page": 107, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=121" },
              { "title": "The Magical Book", "page": 108, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=122" },
              { "title": "The Man", "page": 111, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=125" },
              { "title": "Psychoanthropological Report", "page": 112, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=126" },
              { "title": "Frivolous", "page": 114, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=128" },
              { "title": "Stop Og Now...", "page": 115, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=129" },
              { "title": "Five Thousand", "page": 119, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=133" },
              { "title": "The Man and the Snail", "page": 120, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=134" },
              { "title": "The Doorkeeper", "page": 121, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=135" },
              { "title": "The Letter of Thanks", "page": 122, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=136" },
              { "title": "The Knife", "page": 123, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=137" },
              { "title": "The Elixir", "page": 124, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=138" },
              { "title": "The Lion", "page": 126, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=140" },
              { "title": "The Certificate", "page": 127, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=141" },
              { "title": "Cheese for Choice", "page": 128, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=142" },
              { "title": "Hidden Hand", "page": 129, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=143" },
              { "title": "City of Storms", "page": 130, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=144" },
              { "title": "People", "page": 132, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=146" },
              { "title": "What to Shun", "page": 133, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=147" },
              { "title": "Posture", "page": 134, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=148" },
              { "title": "The Killer", "page": 135, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=149" },
              { "title": "Magician", "page": 137, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=151" },
              { "title": "Visitors' Information", "page": 138, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=152" },
              { "title": "Cheetahs and Awarts", "page": 139, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=153" },
              { "title": "Ant Research", "page": 141, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=155" },
              { "title": "? Duty", "page": 142, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=156" },
              { "title": "The Right Man", "page": 143, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=157" },
              { "title": "Burdens", "page": 144, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=158" },
              { "title": "The Wisest Tiger", "page": 145, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=159" },
              { "title": "The Wrong Department", "page": 146, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=160" },
              { "title": "Expectations", "page": 148, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=162" },
              { "title": "Personal Wisdom", "page": 149, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=163" },
              { "title": "How Can It Mean Anything?", "page": 150, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=164" },
              { "title": "Economics", "page": 151, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=165" },
              { "title": "Two Pilgrims", "page": 152, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=166" },
              { "title": "Service", "page": 153, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=167" },
              { "title": "The Boy and the Wolf", "page": 154, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=168" },
              { "title": "Literature", "page": 156, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=170" },
              { "title": "Legend of the Nightingale", "page": 157, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=171" },
              { "title": "Inner Senses", "page": 158, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=172" },
              { "title": "Grain", "page": 159, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=173" },
              { "title": "Mistakes", "page": 160, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=174" },
              { "title": "Mixed Behaviour", "page": 161, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=175" },
              { "title": "Difficulty", "page": 163, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=177" },
              { "title": "The Greatest Vanity", "page": 164, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=178" },
              { "title": "Secret Teaching", "page": 165, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=179" },
              { "title": "Working Together", "page": 167, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=181" },
              { "title": "A House to which the Key Is Lost", "page": 168, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=182" },
              { "title": "Hali in Converse with an Inquirer", "page": 169, "url": "https://idriesshahfoundation.org/pdfviewer/the-magic-monastery/?auto_viewer=true#page=183" }
          ]
        }
      ]
    },
    "4. Humor as Teaching Tool": {
      "function": "Uses Nasrudin character for non-linear insight transmission",
      "approach": "Humor bypasses intellectual defenses through scattered comic impacts",
      "books": [
        {
          "title": "The Exploits of the Incomparable Mulla Nasrudin",
          "main_url": "https://idriesshahfoundation.org/books/the-exploits-of-the-incomparable-mulla-nasrudin/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true",
          "description": "First major collection of Nasrudin stories and adventures",
          "chapters": [
          { title: "Introduction", page: "xi", url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=11" },
          { title: "The Alternative", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=15" },
          { title: "Why We Are Here", page: 2, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=16" },
          { title: "Never Know When It Might Come in Useful", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=17" },
          { title: "? See What I Mean?", page: 4, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=18" },
          { title: "If a Pot Can Multiply", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=19" },
          { title: "The Smuggler", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=20" },
          { title: "How Nasrudin Created Truth", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=21" },
          { title: "The Cat and The Meat", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=22" },
          { title: "There Is More Light Here", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=23" },
          { title: "The Fool", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=24" },
          { title: "Cooking by Candle", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=25" },
          { title: "Danger Has No Favourites", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=26" },
          { title: "Salt Is Not Wool", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=27" },
          { title: "Can Good Turns Be Accidental?", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=28" },
          { title: "The Unsuspected Element", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=29" },
          { title: "The Burglars", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=30" },
          { title: "Eating-Matter and Reading-Matter", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=31" },
          { title: "Adventures in the Desert", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=32" },
          { title: "Circumstances Alter Cases", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=33" },
          { title: "The Food of the Cloak", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=34" },
          { title: "The Sermon of Nasrudin", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=35" },
          { title: "His Excellency", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=36" },
          { title: "Nasrudin and the Wise Men", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=42" },
          { title: "Judgement", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=43" },
          { title: "First Things First", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=44" },
          { title: "Whose Shot Was That?", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=46" },
          { title: "The Magic Bag", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=48" },
          { title: "Fear", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=50" },
          { title: "The Robe", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=52" },
          { title: "Saved His Life", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=53" },
          { title: "Four-Legged", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=55" },
          { title: "Quiz", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=56" },
          { title: "The Sign", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=57" },
          { title: "All Her Fault", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=58" },
          { title: "The Ways of Foreigners", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=59" },
          { title: "Burnt Foot", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=60" },
          { title: "Old Moons", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=61" },
          { title: "Letter of the Law", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=62" },
          { title: "The Cat Is Wet", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=63" },
          { title: "Sleep Is an Activity", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=64" },
          { title: "The Child Is Father to the Man", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=65" },
          { title: "Every Little Helps", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=66" },
          { title: "Hidden Depths", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=67" },
          { title: "Back to Front", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=68" },
          { title: "Principles of Life-Saving", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=69" },
          { title: "Unsuited", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=70" },
          { title: "Creeping Up on Himself", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=71" },
          { title: "His Need Is Greater Than Mine", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=72" },
          { title: "Caught", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=73" },
          { title: "But For the Grace...", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=74" },
          { title: "Takes After His Father", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=75" },
          { title: "Light the Candle", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=76" },
          { title: "Learning the Hard Way", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=77" },
          { title: "Something Fell", page: 64, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=78" },
          { title: "The Last Day", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=79" },
          { title: "I'll Take the Nine", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=80" },
          { title: "He Knows the Answer", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=81" },
          { title: "What a Bird Should Look Like", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=82" },
          { title: "The Veil", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=83" },
          { title: "Your Poor Old Mother", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=84" },
          { title: "I Know Her Best", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=85" },
          { title: "The Secret", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=86" },
          { title: "Do Not Disturb the Camels", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=87" },
          { title: "Happiness Is Not Where You Seek It", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=88" },
          { title: "Early to Rise", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=89" },
          { title: "The Majesty of the Sea", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=90" },
          { title: "Moment in Time", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=91" },
          { title: "Division of Labour", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=92" },
          { title: "You Can't Be Too Careful", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=93" },
          { title: "All I Needed Was Time", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=94" },
          { title: "Cut Down on Your Harness Intake", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=95" },
          { title: "At Court", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=96" },
          { title: "Theoretical Instances", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=97" },
          { title: "The Pace of Life", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=98" },
          { title: "The Sample", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=99" },
          { title: "Other People's Mail", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=100" },
          { title: "Why Didn't You Tell Me Before?", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=101" },
          { title: "Supply and Demand", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=102" },
          { title: "The Value of the Past", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=103" },
          { title: "Aplomb", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=104" },
          { title: "Kinds of Day", page: 91, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=105" },
          { title: "Alone in the Desert", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=106" },
          { title: "Maiden in Distress", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=107" },
          { title: "Unfair", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=108" },
          { title: "What Has Gone Before...", page: 95, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=109" },
          { title: "All You Need", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=110" },
          { title: "? Why Are We Waiting?", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=111" },
          { title: "The Flood", page: 98, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=112" },
          { title: "The Omen", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=113" },
          { title: "Turnips Are Harder", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=114" },
          { title: "How Nasrudin Spoke Up", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=115" },
          { title: "In the Midst of Life", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=116" },
          { title: "Awake or Asleep?", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=118" },
          { title: "The Short Cut", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=119" },
          { title: "Change the Subject", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=120" },
          { title: "The Rope and the Sky", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=121" },
          { title: "Who Am I?", page: 108, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=122" },
          { title: "I'd Have Shown You", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=123" },
          { title: "Only One Thing Wrong With It", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=124" },
          { title: "Duck Soup", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/the-exploits-of-the-incomparable-mulla-nasrudin/?auto_viewer=true#page=125" }
          ]
        },

        {
          "title": "The Pleasantries of the Incredible Mulla Nasrudin",
          "main_url": "https://idriesshahfoundation.org/books/the-pleasantries-of-the-incredible-mulla-nasrudin/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true",
          "description": "Second collection of Nasrudin's humorous wisdom",
          "chapters": [
          { title: "Introduction", page: "xv", url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=15" },
          { title: "The Reason", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=17" },
          { title: "Eating His Money", page: 2, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=18" },
          { title: "The Use of a Light", page: 4, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=20" },
          { title: "Why Don't You?", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=21" },
          { title: "Prudence", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=22" },
          { title: "Assumptions", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=23" },
          { title: "Just Suppose...", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=24" },
          { title: "Alternate Crop", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=25" },
          { title: "Tit for Tat", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=26" },
          { title: "Whose Servant Am I?", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=27" },
          { title: "Inscrutable Fate", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=28" },
          { title: "The Answer", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=29" },
          { title: "Idiots", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=30" },
          { title: "If Allah Wills It", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=31" },
          { title: "A Great Thought", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=32" },
          { title: "The Exploit", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=33" },
          { title: "The Hunt", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=34" },
          { title: "Both, Your Majesty!", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=35" },
          { title: "Forgotten Himself", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=36" },
          { title: "Not So Difficult", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=37" },
          { title: "Obligation", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=38" },
          { title: "Fixed Ideas", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=39" },
          { title: "There Is a Different Time-Scale", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=40" },
          { title: "Man Bites Dog - That's News", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=41" },
          { title: "Just as Well I Came Along", page: 26, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=42" },
          { title: "Strange That You Should Ask...", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=43" },
          { title: "Avoid Entanglement", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=44" },
          { title: "How Foolish Can a Man Be?", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=45" },
          { title: "Cause and Effect", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=46" },
          { title: "That's Why They Bunged It Up", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=47" },
          { title: "The Burden of Guilt", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=48" },
          { title: "Description of the Goods", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=49" },
          { title: "More Useful", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=50" },
          { title: "Which Is My Half?", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=51" },
          { title: "Learn How to Learn", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=52" },
          { title: "Face the Facts", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=53" },
          { title: "Congratulations", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=54" },
          { title: "Too-Obvious Principles", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=55" },
          { title: "When You Face Things Alone", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=56" },
          { title: "The Roles of Man", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=57" },
          { title: "Dry in the Rain", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=58" },
          { title: "What Is Real Evidence?", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=60" },
          { title: "Behind the Obvious", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=61" },
          { title: "Objectivity", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=62" },
          { title: "Nobody Complains...", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=63" },
          { title: "How Far Can You Usefully Be from the Truth?", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=64" },
          { title: "I Believe You Are Right!", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=65" },
          { title: "It Appears to Be Thou!", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=66" },
          { title: "Ladder for Sale", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=67" },
          { title: "Why Camels Have No Wings", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=68" },
          { title: "The Gold, The Cloak and The Horse", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=69" },
          { title: "Give Him Time", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=71" },
          { title: "The Yogi, The Priest and The Sufi", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=72" },
          { title: "Remembering", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=74" },
          { title: "Refutation of the Philosophers", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=76" },
          { title: "Ask Me Another", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=78" },
          { title: "The Reward", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=79" },
          { title: "The High Cost of Learning", page: 64, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=80" },
          { title: "The Spiritual Teacher", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=81" },
          { title: "Hot Soup, Cold Hands", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=83" },
          { title: "A Word for It", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=85" },
          { title: "Science", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=86" },
          { title: "A Question Is an Answer", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=87" },
          { title: "Aren't We All?", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=88" },
          { title: "The Value of Truth", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=89" },
          { title: "Take No Chances", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=90" },
          { title: "Guess What?", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=91" },
          { title: "The Merchant", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=92" },
          { title: "Don't Run Away with the Idea...", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=94" },
          { title: "The Chickens", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=95" },
          { title: "Prayer Is Better than Sleep...", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=97" },
          { title: "What Is to Be", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=98" },
          { title: "The Logician", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=99" },
          { title: "Once Bitten", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=100" },
          { title: "Good News", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=101" },

          { title: "The Dog at His Feet", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=102" },
          { title: "Facts Are Facts", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=103" },
          { title: "Not to Be Taken Away", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=104" },
          { title: "Not My Business to Know", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=105" },
          { title: "Not as Easy as It Seems", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=106" },
          { title: "Repetitiousness", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=108" },
          { title: "Never Miss a Bargain", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=110" },
          { title: "The Omen That Worked", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=112" },
          { title: "The Change", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=113" },
          { title: "The Value of a Desire", page: 98, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=114" },
          { title: "When to Worry", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=115" },
          { title: "Or Else...", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=116" },
          { title: "How Long Is Too Long?", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=117" },
          { title: "Anachronism", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=118" },
          { title: "No Time to Waste", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=119" },
          { title: "Altruism", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=120" },
          { title: "Perhaps There Is a Road Up There", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=121" },
          { title: "The Announcement", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=122" },
          { title: "What Is Above and What Is Below...", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=123" },
          { title: "The Speculator", page: 108, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=124" },
          { title: "Louder than an Ox", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=125" },
          { title: "I Did Not Start It", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=126" },
          { title: "In the Mosque", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=127" },
          { title: "Eggs", page: 112, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=128" },
          { title: "Allah Will Provide", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=129" },
          { title: "The School", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=130" },
          { title: "Clairvoyance", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=131" },

          { title: "Invisible Extension", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=132" },
          { title: "Mistaken Identity", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=133" },
          { title: "Deductive Reasoning", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=134" },
          { title: "Let It Be Wheat", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=135" },
          { title: "The Genius", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=136" },
          { title: "Why?", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=137" },
          { title: "It Is What He Says That Counts", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=138" },
          { title: "What Will He Find?", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=139" },
          { title: "Just for the Asking", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=140" },
          { title: "We Come and We Go", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=141" },
          { title: "The Karkorajami", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=142" },
          { title: "The Smell of a Thought", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=143" },
          { title: "The Burglar", page: 128, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=144" },
          { title: "A Matter of Time, Not Place", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=145" },
          { title: "All in My Wife's Name", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=146" },
          { title: "Waiting for the Yeast to Rise", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=147" },
          { title: "Even Fire", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=148" },
          { title: "Later than You Think", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=149" },
          { title: "On His Own", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=150" },
          { title: "Limits of Perception", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=151" },
          { title: "Which Way Round?", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=152" },
          { title: "The Milkman's Horse", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=153" },
          { title: "What Is it All for?", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=154" },
          { title: "Pyramid Expert", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=155" },
          { title: "Where I Sit", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=156" },
          { title: "Anyone Can Do It That Way", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=157" },
          { title: "Life and Death", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=159" },

          { title: "A Penny Less to Pay", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=160" },
          { title: "Why Ask Me?", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=161" },
          { title: "The Daughters", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=162" },
          { title: "All Included", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=163" },
          { title: "Why Shouldn't They Mourn?", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=164" },
          { title: "Not Worth Keeping", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=165" },
          { title: "The Physician", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=166" },
          { title: "Appetite", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=167" },
          { title: "The Secret", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=168" },
          { title: "Maximum Capacity", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=169" },
          { title: "Battle of the Sexes", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=170" },
          { title: "At the Frontier", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=171" },
          { title: "Try Anything Once", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=173" },
          { title: "Seven with One Stroke", page: 158, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=174" },
          { title: "Raw Material", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=175" },
          { title: "Catch Your Rabbit", page: 160, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=176" },
          { title: "Pity the Poor Natives", page: 162, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=178" },
          { title: "How Far Is Far Enough?", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=179" },
          { title: "Economic Law", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=180" },
          { title: "Private Property", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=181" },
          { title: "Tie up Below!", page: 166, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=182" },
          { title: "Fire", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=183" },
          { title: "Instinct", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=184" },
          { title: "The Question Contains Its Answer", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=185" },
          { title: "Nosebags and Donkeys", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=186" },
          { title: "The Mulla's Dream", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=187" },
          { title: "The King Spoke to Me", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=188" },
          { title: "Truth", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=190" },
          { title: "Last Year's Nests", page: 175, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=191" },
          { title: "Head and Heels", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=192" },
          { title: "Just in Case", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=193" },
          { title: "Old Graves for New", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=194" },
          { title: "Nasrudin's Will", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=195" },
          { title: "Incomplete", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=196" },
          { title: "The Mulla's Tomb", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=197" }
          ]
        },

        {
          "title": "The Subtleties of the Inimitable Mulla Nasrudin",
          "main_url": "https://idriesshahfoundation.org/books/the-subtleties-of-the-inimitable-mulla-nasrudin/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-subtleties-of-the-inimitable-mulla-nasrudin/?auto_viewer=true",
          "description": "Third collection focusing on subtle and sophisticated teachings",
          "chapters": [
          { title: "Introduction", page: "xv", url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=15" },
          { title: "The Reason", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=17" },
          { title: "Eating His Money", page: 2, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=18" },
          { title: "The Use of a Light", page: 4, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=20" },
          { title: "Why Don't You?", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=21" },
          { title: "Prudence", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=22" },
          { title: "Assumptions", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=23" },
          { title: "Just Suppose...", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=24" },
          { title: "Alternate Crop", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=25" },
          { title: "Tit for Tat", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=26" },
          { title: "Whose Servant Am I?", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=27" },
          { title: "Inscrutable Fate", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=28" },
          { title: "The Answer", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=29" },
          { title: "Idiots", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=30" },
          { title: "If Allah Wills It", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=31" },
          { title: "A Great Thought", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=32" },
          { title: "The Exploit", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=33" },
          { title: "The Hunt", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=34" },
          { title: "Both, Your Majesty!", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=35" },
          { title: "Forgotten Himself", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=36" },
          { title: "Not So Difficult", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=37" },
          { title: "Obligation", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=38" },
          { title: "Fixed Ideas", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=39" },
          { title: "There Is a Different Time-Scale", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=40" },
          { title: "Man Bites Dog - That's News", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=41" },
          { title: "Just as Well I Came Along", page: 26, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=42" },
          { title: "Strange That You Should Ask...", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=43" },
          { title: "Avoid Entanglement", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=44" },
          { title: "How Foolish Can a Man Be?", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=45" },
          { title: "Cause and Effect", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=46" },
          { title: "That's Why They Bunged It Up", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=47" },
          { title: "The Burden of Guilt", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=48" },
          { title: "Description of the Goods", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=49" },
          { title: "More Useful", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=50" },
          { title: "Which Is My Half?", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=51" },
          { title: "Learn How to Learn", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=52" },
          { title: "Face the Facts", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=53" },
          { title: "Congratulations", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=54" },
          { title: "Too-Obvious Principles", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=55" },
          { title: "When You Face Things Alone", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=56" },
          { title: "The Roles of Man", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=57" },
          { title: "Dry in the Rain", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=58" },
          { title: "What Is Real Evidence?", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=60" },
          { title: "Behind the Obvious", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=61" },
          { title: "Objectivity", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=62" },
          { title: "Nobody Complains...", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=63" },
          { title: "How Far Can You Usefully Be from the Truth?", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=64" },
          { title: "I Believe You Are Right!", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=65" },
          { title: "It Appears to Be Thou!", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=66" },
          { title: "Ladder for Sale", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=67" },
          { title: "Why Camels Have No Wings", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=68" },
          { title: "The Gold, The Cloak and The Horse", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=69" },
          { title: "Give Him Time", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=71" },
          { title: "The Yogi, The Priest and The Sufi", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=72" },
          { title: "Remembering", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=74" },
          { title: "Refutation of the Philosophers", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=76" },
          { title: "Ask Me Another", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=78" },
          { title: "The Reward", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=79" },
          { title: "The High Cost of Learning", page: 64, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=80" },
          { title: "The Spiritual Teacher", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=81" },
          { title: "Hot Soup, Cold Hands", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=83" },
          { title: "A Word for It", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=85" },
          { title: "Science", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=86" },
          { title: "A Question Is an Answer", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=87" },
          { title: "Aren't We All?", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=88" },
          { title: "The Value of Truth", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=89" },
          { title: "Take No Chances", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=90" },
          { title: "Guess What?", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=91" },
          { title: "The Merchant", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=92" },
          { title: "Don't Run Away with the Idea...", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=94" },
          { title: "The Chickens", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=95" },
          { title: "Prayer Is Better than Sleep...", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=97" },
          { title: "What Is to Be", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=98" },
          { title: "The Logician", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=99" },
          { title: "Once Bitten", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=100" },
          { title: "Good News", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=101" },

          { title: "The Dog at His Feet", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=102" },
          { title: "Facts Are Facts", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=103" },
          { title: "Not to Be Taken Away", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=104" },
          { title: "Not My Business to Know", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=105" },
          { title: "Not as Easy as It Seems", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=106" },
          { title: "Repetitiousness", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=108" },
          { title: "Never Miss a Bargain", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=110" },
          { title: "The Omen That Worked", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=112" },
          { title: "The Change", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=113" },
          { title: "The Value of a Desire", page: 98, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=114" },
          { title: "When to Worry", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=115" },
          { title: "Or Else...", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=116" },
          { title: "How Long Is Too Long?", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=117" },
          { title: "Anachronism", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=118" },
          { title: "No Time to Waste", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=119" },
          { title: "Altruism", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=120" },
          { title: "Perhaps There Is a Road Up There", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=121" },
          { title: "The Announcement", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=122" },
          { title: "What Is Above and What Is Below...", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=123" },
          { title: "The Speculator", page: 108, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=124" },
          { title: "Louder than an Ox", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=125" },
          { title: "I Did Not Start It", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=126" },
          { title: "In the Mosque", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=127" },
          { title: "Eggs", page: 112, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=128" },
          { title: "Allah Will Provide", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=129" },
          { title: "The School", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=130" },
          { title: "Clairvoyance", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=131" },

          { title: "Invisible Extension", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=132" },
          { title: "Mistaken Identity", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=133" },
          { title: "Deductive Reasoning", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=134" },
          { title: "Let It Be Wheat", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=135" },
          { title: "The Genius", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=136" },
          { title: "Why?", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=137" },
          { title: "It Is What He Says That Counts", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=138" },
          { title: "What Will He Find?", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=139" },
          { title: "Just for the Asking", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=140" },
          { title: "We Come and We Go", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=141" },
          { title: "The Karkorajami", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=142" },
          { title: "The Smell of a Thought", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=143" },
          { title: "The Burglar", page: 128, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=144" },
          { title: "A Matter of Time, Not Place", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=145" },
          { title: "All in My Wife's Name", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=146" },
          { title: "Waiting for the Yeast to Rise", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=147" },
          { title: "Even Fire", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=148" },
          { title: "Later than You Think", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=149" },
          { title: "On His Own", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=150" },
          { title: "Limits of Perception", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=151" },
          { title: "Which Way Round?", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=152" },
          { title: "The Milkman's Horse", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=153" },
          { title: "What Is it All for?", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=154" },
          { title: "Pyramid Expert", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=155" },
          { title: "Where I Sit", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=156" },
          { title: "Anyone Can Do It That Way", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=157" },
          { title: "Life and Death", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=159" },

          { title: "A Penny Less to Pay", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=160" },
          { title: "Why Ask Me?", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=161" },
          { title: "The Daughters", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=162" },
          { title: "All Included", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=163" },
          { title: "Why Shouldn't They Mourn?", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=164" },
          { title: "Not Worth Keeping", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=165" },
          { title: "The Physician", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=166" },
          { title: "Appetite", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=167" },
          { title: "The Secret", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=168" },
          { title: "Maximum Capacity", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=169" },
          { title: "Battle of the Sexes", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=170" },
          { title: "At the Frontier", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=171" },
          { title: "Try Anything Once", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=173" },
          { title: "Seven with One Stroke", page: 158, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=174" },
          { title: "Raw Material", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=175" },
          { title: "Catch Your Rabbit", page: 160, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=176" },
          { title: "Pity the Poor Natives", page: 162, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=178" },
          { title: "How Far Is Far Enough?", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=179" },
          { title: "Economic Law", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=180" },
          { title: "Private Property", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=181" },
          { title: "Tie up Below!", page: 166, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=182" },
          { title: "Fire", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=183" },
          { title: "Instinct", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=184" },
          { title: "The Question Contains Its Answer", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=185" },
          { title: "Nosebags and Donkeys", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=186" },
          { title: "The Mulla's Dream", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=187" },
          { title: "The King Spoke to Me", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=188" },
          { title: "Truth", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=190" },
          { title: "Last Year's Nests", page: 175, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=191" },
          { title: "Head and Heels", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=192" },
          { title: "Just in Case", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=193" },
          { title: "Old Graves for New", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=194" },
          { title: "Nasrudin's Will", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=195" },
          { title: "Incomplete", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=196" },
          { title: "The Mulla's Tomb", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/the-pleasantries-of-the-incredible-mulla-nasrudin/?auto_viewer=true#page=197" }
          ]
        },

        {
          "title": "The World of Nasrudin",
          "main_url": "https://idriesshahfoundation.org/books/the-world-of-nasrudin/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true",
          "description": "Comprehensive guide to the Nasrudin tradition and its uses",
          "note": "The book's contents are arranged in alphabetical order.",
          "chapters": [

          // Main contents, with offset +22 for the URL anchor
          { title: "Acknowledgement", page: "xxi", url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=21" },

          // Main contents, with offset +22 for the URL anchor
          { title: "A Better Beard than Yours", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=23" },
          { title: "A Certain Clientele", page: 2, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=24" },
          { title: "A Cobbler with Wings", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=25" },
          { title: "A Gift from God", page: 4, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=26" },
          { title: "A Gift from Tamerlane", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=27" },
          { title: "A Happy Childhood", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=28" },
          { title: "A Humble Target", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=29" },
          { title: "A Loaf for the Head", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=30" },
          { title: "A Matter of Opinion", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=31" },
          { title: "A Matter of Weight", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=32" },
          { title: "A Perfect Copy", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=33" },
          { title: "A Pious Man", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=34" },
          { title: "A Question of Nature", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=35" },
          { title: "A Question of Timing", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=36" },
          { title: "A Supper of Oh and Ah", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=37" },
          { title: "A Way with Words", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=38" },
          { title: "A Weaker Man", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=39" },
          { title: "A Wolf for the Imam", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=40" },
          { title: "After your Demise", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=41" },
          { title: "Allah's Guest", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=42" },
          { title: "Allah's Mercy", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=43" },
          { title: "Allah's Words", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=44" },
          { title: "Altered Circumstances", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=45" },
          { title: "Always Too Late", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=46" },
          { title: "Among Strangers", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=47" },
          { title: "Another Man's Treasure", page: 26, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=48" },
          { title: "Appetite", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=49" },
          { title: "Apples", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=50" },
          { title: "Apricot Rewards", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=51" },
          { title: "Are You Me?", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=52" },
          { title: "Asking the Wrong Man", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=53" },
          { title: "Ask Our Neighbor", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=54" },
          { title: "Ask Them, not Me", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=55" },
          { title: "Ask the Owner", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=56" },
          { title: "Ask your Wife", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=57" },
          { title: "Avoidance", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=58" },
          { title: "Beastly Insults", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=59" },
          { title: "Being an Expert", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=60" },
          { title: "Best Way to Learn", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=61" },
          { title: "Better Be a Sinner", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=62" },
          { title: "Better Bundles", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=63" },
          { title: "Better off Barefoot", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=64" },
          { title: "Birth and Death", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=65" },
          { title: "Bitten Noses", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=66" },
          { title: "Bones and All", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=67" },
          { title: "Borrowed Names", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=68" },
          { title: "Borrowed Pies", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=69" },
          { title: "Borrowed Slippers", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=70" },
          { title: "Boy or Girl?", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=71" },
          { title: "Burglars and the King", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=72" },
          { title: "Camels and Men", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=73" },
          { title: "Careless Head", page: 52, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=74" },
          { title: "Carving Pheasant", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=75" },
          { title: "Chains Tomorrow", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=76" },
          { title: "Cheating the Stars", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=77" },
          { title: "Child Psychology", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=78" },
          { title: "Choice Meals", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=79" },
          { title: "City Doctors", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=80" },
          { title: "Hand-me-downs", page: 131, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=153" },
          { title: "Hands Full", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=154" },
          { title: "Hang On for a Cure", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=155" },
          { title: "Hard Bargains", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=156" },
          { title: "Hazardous Food", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=157" },
          { title: "Heaven and Hell", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=158" },
          { title: "Heaven is Full", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=159" },
          { title: "Heavenly Flock", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=160" },
          { title: "Heaven or Hell?", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=161" },
          { title: "Hereditary", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=162" },
          { title: "He Will Be Here Soon", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=163" },
          { title: "Hidden Strength", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=164" },
          { title: "Hiding", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=165" },
          { title: "High and Low", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=166" },
          { title: "His Own Ban", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=167" },
          { title: "Hit the Wrong Man", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=168" },
          { title: "Hole after Hole", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=169" },
          { title: "Holy Donkey", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=170" },
          { title: "Hospitality", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=171" },
          { title: "House Calls", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=172" },
          { title: "How Did they all Know?", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=173" },
          { title: "How Long Will I Live?", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=174" },
          { title: "How to be Wise", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=175" },
          { title: "How to Fall Asleep", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=176" },
          { title: "How to Find a Bride", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=177" },
          { title: "Human Nature", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=178" },
          { title: "I Cannot Be Rebuilt", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=179" },
          { title: "Identified by a Goat", page: 158, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=180" },
          { title: "If it Pleases Allah", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=181" },
          { title: "If I Were You", page: 160, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=182" },
          { title: "If Only I had Known Earlier", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=183" },
          { title: "If You Are what You Say", page: 162, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=184" },
          { title: "If Your Tongue Was Mine", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=185" },
          { title: "Immodest", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=186" },
          { title: "Impossible", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=187" },
          { title: "Impromptu Speeches", page: 166, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=188" },
          { title: "In Advance", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=189" },
          { title: "In a Ravenous Hurry", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=190" },
          { title: "In Charge of the List", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=191" },
          { title: "Incomplete Chickens", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=192" },
          { title: "Inconsiderate", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=193" },
          { title: "Indecision", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=194" },
          { title: "Infernal Snoring", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=195" },
          { title: "Inherited Talent", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=196" },
          { title: "In my Own Time", page: 175, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=197" },
          { title: "In Need of Correction", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=198" },
          { title: "Inside Out or Outside In?", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=199" },
          { title: "Interest", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=200" },
          { title: "I Should Know", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=201" },
          { title: "Itchy Palms", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=202" },
          { title: "Jaliz, the Eagle", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=203" },
          { title: "Just a Humble Loaf", page: 182, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=204" },
          { title: "Just Ask", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=205" },
          { title: "Just in Case", page: 184, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=206" },
          { title: "Just Keeping him Company", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=207" },
          { title: "Just Like his Mother", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=208" },
          { title: "Just Reward", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=209" },
          { title: "Just Testing", page: 188, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=210" },
          { title: "Just the Judge", page: 189, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=211" },
          { title: "Keeping an Eye Out", page: 190, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=212" },
          { title: "Keeping Sleep Away", page: 191, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=213" },
          { title: "Knowing the Name", page: 192, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=214" },
          { title: "Large Sparrows", page: 193, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=215" },
          { title: "Last In, First Out", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=217" },
          { title: "Laughter and Tears", page: 196, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=218" },
          { title: "Left-handed Hooves", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=219" },
          { title: "Left or Right?", page: 198, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=220" },
          { title: "Life as a Hermit", page: 199, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=221" },
          { title: "Literate Animals", page: 200, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=222" },
          { title: "Literate Donkey", page: 201, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=223" },
          { title: "Live Long and Prosper", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=225" },
          { title: "Longer Days", page: 204, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=226" },
          { title: "Look and See", page: 205, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=227" },
          { title: "Losing One's Head?", page: 206, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=228" },
          { title: "Lost Donkey", page: 207, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=229" },
          { title: "Lucky Escape", page: 208, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=230" },
          { title: "Lying Low", page: 209, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=231" },
          { title: "Magician or Locksmith?", page: 210, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=232" },
          { title: "Manners Cannot Be Disguised", page: 211, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=233" },
          { title: "Many Ways to Kill a Tiger", page: 212, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=234" },
          { title: "Master and Servant", page: 213, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=235" },
          { title: "Meditation", page: 214, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=236" },
          { title: "Melon or Mountain?", page: 215, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=237" },
          { title: "Misjudged", page: 216, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=238" },
          { title: "Missing Saddlebags", page: 217, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=239" },
          { title: "Mistaken", page: 218, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=240" },
          { title: "Money for his Funeral", page: 219, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=241" },
          { title: "Monkey in Court", page: 220, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=242" },
          { title: "Multiple Questions", page: 221, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=243" },
          { title: "Mustapha, Ruler of the World", page: 222, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=244" },
          { title: "Mutual Gain", page: 223, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=245" },
          { title: "Mutual Respect", page: 225, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=247" },
          { title: "My Back Told Me", page: 226, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=248" },
          { title: "My Burden", page: 227, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=249" },
          { title: "My Donkey's Idea", page: 228, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=250" },
          { title: "My Enemies", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=251" },
          { title: "My Master's Importance", page: 230, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=252" },
          { title: "My Wife's Money", page: 231, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=253" },
          { title: "Naked Truth", page: 232, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=254" },
          { title: "Nasrudin Dies", page: 233, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=255" },
          { title: "Nasrudin's Parrot", page: 234, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=256" },
          { title: "Nasrudin's Shoes", page: 235, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=257" },
          { title: "Nasrudin's Unruly Sandal", page: 236, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=258" },
          { title: "Natural Layout", page: 237, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=259" },
          { title: "Natural Skill", page: 238, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=260" },
          { title: "Nature's Blanket", page: 239, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=261" },
          { title: "Never Born", page: 240, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=262" },
          { title: "Never Satisfied", page: 241, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=263" },
          { title: "Next Time", page: 242, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=264" },
          { title: "Night Blindness", page: 243, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=265" },
          { title: "Nobody's Fool", page: 244, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=266" },
          { title: "No Consideration", page: 245, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=267" },
          { title: "No Ears, No Crime", page: 246, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=268" },
          { title: "No Good for my Health", page: 247, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=269" },
          { title: "No Need for Brains", page: 248, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=270" },
          { title: "No Room for More", page: 249, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=271" },
          { title: "No Such Thing as a Free Lunch", page: 250, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=272" },
          { title: "Not a Question of Age", page: 252, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=274" },
          { title: "Nothing to Do with Me", page: 253, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=275" },
          { title: "No Time for Clothes", page: 254, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=276" },
          { title: "No Time to Grieve", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=277" },
          { title: "Not in Stock", page: 256, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=278" },
          { title: "Not until I Say", page: 257, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=279" },
          { title: "No Witnesses", page: 259, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=281" },
          { title: "Offensive Explanations", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=283" },
          { title: "Once on Dry Land", page: 262, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=284" },
          { title: "One Horse, Two Owners", page: 263, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=285" },
          { title: "One Little Word", page: 264, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=286" },
          { title: "One or the Other", page: 265, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=287" },
          { title: "On Foot", page: 266, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=288" },
          { title: "Only One Prophet", page: 267, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=289" },
          { title: "On my Mother's Behalf", page: 268, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=290" },
          { title: "Outliving Death", page: 269, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=291" },
          { title: "Painful Dreams", page: 270, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=292" },
          { title: "Palpitations", page: 271, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=293" },
          { title: "Paradise Is Not Far", page: 272, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=294" },
          { title: "Partial Recovery", page: 273, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=295" },
          { title: "Pastry without Pies", page: 274, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=296" },
          { title: "Payment in Kind", page: 275, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=297" },
          { title: "Peasants and Kings", page: 276, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=298" },
          { title: "Peel and All", page: 277, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=299" },
          { title: "Pen or Axe?", page: 278, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=300" },
          { title: "My Enemies", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=251" },
          { title: "My Master's Importance", page: 230, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=252" },
          { title: "My Wife's Money", page: 231, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=253" },
          { title: "Naked Truth", page: 232, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=254" },
          { title: "Nasrudin Dies", page: 233, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=255" },
          { title: "Nasrudin's Parrot", page: 234, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=256" },
          { title: "Nasrudin's Shoes", page: 235, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=257" },
          { title: "Nasrudin's Unruly Sandal", page: 236, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=258" },
          { title: "Natural Layout", page: 237, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=259" },
          { title: "Natural Skill", page: 238, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=260" },
          { title: "Nature's Blanket", page: 239, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=261" },
          { title: "Never Born", page: 240, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=262" },
          { title: "Never Satisfied", page: 241, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=263" },
          { title: "Next Time", page: 242, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=264" },
          { title: "Night Blindness", page: 243, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=265" },
          { title: "Nobody's Fool", page: 244, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=266" },
          { title: "No Consideration", page: 245, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=267" },
          { title: "No Ears, No Crime", page: 246, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=268" },
          { title: "No Good for my Health", page: 247, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=269" },
          { title: "No Need for Brains", page: 248, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=270" },
          { title: "No Room for More", page: 249, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=271" },
          { title: "No Such Thing as a Free Lunch", page: 250, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=272" },
          { title: "Not a Question of Age", page: 252, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=274" },
          { title: "Nothing to Do with Me", page: 253, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=275" },
          { title: "No Time for Clothes", page: 254, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=276" },
          { title: "No Time to Grieve", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=277" },
          { title: "Not in Stock", page: 256, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=278" },
          { title: "Not until I Say", page: 257, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=279" },
          { title: "No Witnesses", page: 259, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=281" },
          { title: "Offensive Explanations", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=283" },
          { title: "Once on Dry Land", page: 262, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=284" },
          { title: "One Horse, Two Owners", page: 263, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=285" },
          { title: "One Little Word", page: 264, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=286" },
          { title: "One or the Other", page: 265, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=287" },
          { title: "On Foot", page: 266, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=288" },
          { title: "Only One Prophet", page: 267, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=289" },
          { title: "On my Mother's Behalf", page: 268, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=290" },
          { title: "Outliving Death", page: 269, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=291" },
          { title: "Painful Dreams", page: 270, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=292" },
          { title: "Palpitations", page: 271, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=293" },
          { title: "Paradise Is Not Far", page: 272, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=294" },
          { title: "Partial Recovery", page: 273, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=295" },
          { title: "Pastry without Pies", page: 274, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=296" },
          { title: "Payment in Kind", page: 275, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=297" },
          { title: "Peasants and Kings", page: 276, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=298" },
          { title: "Peel and All", page: 277, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=299" },
          { title: "Pen or Axe?", page: 278, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=300" },
          { title: "Pheasant Messenger", page: 279, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=301" },
          { title: "Pies or Crumbs?", page: 282, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=304" },
          { title: "Plans for Expansion", page: 283, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=305" },
          { title: "Poor Conditions", page: 284, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=306" },
          { title: "Power of the Prophets", page: 285, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=307" },
          { title: "Prayers", page: 286, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=308" },
          { title: "Prayers for Hire", page: 287, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=309" },
          { title: "Praying for Miracles", page: 288, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=310" },
          { title: "Precociousness", page: 289, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=311" },
          { title: "Present and Correct", page: 290, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=312" },
          { title: "Preserving the Fish", page: 291, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=313" },
          { title: "Price of an Education", page: 292, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=314" },
          { title: "Professional Fee", page: 293, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=315" },
          { title: "Quite Possible", page: 294, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=316" },
          { title: "Reading Aloud", page: 295, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=317" },
          { title: "Real Bravery", page: 296, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=318" },
          { title: "Reasons for Lament", page: 297, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=319" },
          { title: "Reckless Salt", page: 298, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=320" },
          { title: "Relayed Messages", page: 299, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=321" },
          { title: "Repaid Debt", page: 300, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=322" },
          { title: "Repeated Words", page: 301, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=323" },
          { title: "Repentant Thief", page: 302, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=324" },
          { title: "Rescue, not Theft", page: 303, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=325" },
          { title: "Respect", page: 304, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=326" },
          { title: "Respectable Gourmets", page: 305, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=327" },
          { title: "Rice, Mice and Children", page: 306, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=328" },
          { title: "Riches or Rice", page: 307, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=329" },
          { title: "Ridiculous Proportions", page: 308, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=330" },
          { title: "Ripe Apples", page: 309, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=331" },
          { title: "Ruler of the World", page: 310, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=332" },
          { title: "Ruler or Tyrant?", page: 311, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=333" },
          { title: "Rumble the Mouse", page: 312, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=334" },
          { title: "Saint Nasrudin", page: 313, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=335" },
          { title: "Sandbags", page: 314, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=336" },
          { title: "Satan's Replacement", page: 315, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=337" },
          { title: "Saved Shoes", page: 316, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=338" },
          { title: "Secret Seeds", page: 317, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=339" },
          { title: "Self Defense", page: 318, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=340" },
          { title: "Sensitivity", page: 319, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=341" },
          { title: "Sent by God", page: 320, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=342" },
          { title: "Servant and Master", page: 321, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=343" },
          { title: "Seven Days", page: 322, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=344" },
          { title: "Sharp Ribs", page: 323, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=345" },
          { title: "Shock Tactics", page: 324, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=346" },
          { title: "Shoes and Donkeys", page: 325, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=347" },
          { title: "Simple Arithmetic", page: 326, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=348" },
          { title: "Since becoming a Mulla", page: 327, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=349" },
          { title: "Sinner for the Evening", page: 328, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=350" },
          { title: "Six and Three make Nine", page: 329, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=351" },
          { title: "Small Appetite", page: 330, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=352" },
          { title: "Soldiers and Weapons", page: 331, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=353" },
          { title: "Statement and Belief", page: 332, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=354" },
          { title: "Strict Sentences", page: 333, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=355" },
          { title: "Strong Teeth", page: 334, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=356" },
          { title: "Stuck in the Mud", page: 335, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=357" },
          { title: "Successive Tyrants", page: 336, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=358" },
          { title: "Sugar Coins", page: 337, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=359" },
          { title: "Superlatives", page: 338, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=360" },
          { title: "Sweet Revenge", page: 339, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=361" },
          { title: "Swollen Feet", page: 340, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=362" },
          { title: "Sympathy Pains", page: 341, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=363" },
          { title: "Talking in Gestures", page: 342, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=364" },
          { title: "Tamerlane's Death", page: 345, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=367" },
          { title: "Teaching by Example", page: 346, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=368" },
          { title: "Terrible Nature", page: 347, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=369" },
          { title: "The Angry Pot", page: 348, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=370" },
          { title: "The Best Liar", page: 349, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=371" },
          { title: "The Best Teacher", page: 350, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=372" },
          { title: "The Beautiful Guest", page: 351, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=373" },
          { title: "The Boastful King", page: 352, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=374" },
          { title: "The Butcher's Cat", page: 353, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=375" },
          { title: "The Charmer", page: 354, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=376" },
          { title: "The Cost of a Curse", page: 355, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=377" },
          { title: "The Cursed Leg", page: 356, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=378" },
          { title: "The Desert Speaks", page: 357, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=379" },
          { title: "The Devil's Advice", page: 358, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=380" },
          { title: "The Drowned Man Returns", page: 359, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=381" },
          { title: "The Forgotten Groom", page: 360, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=382" },
          { title: "The Historian's Bet", page: 361, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=383" },
          { title: "Pheasant Messenger", page: 279, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=301" },
          { title: "Pies or Crumbs?", page: 282, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=304" },
          { title: "Plans for Expansion", page: 283, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=305" },
          { title: "Poor Conditions", page: 284, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=306" },
          { title: "Power of the Prophets", page: 285, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=307" },
          { title: "Prayers", page: 286, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=308" },
          { title: "Prayers for Hire", page: 287, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=309" },
          { title: "Praying for Miracles", page: 288, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=310" },
          { title: "Precociousness", page: 289, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=311" },
          { title: "Present and Correct", page: 290, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=312" },
          { title: "Preserving the Fish", page: 291, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=313" },
          { title: "Price of an Education", page: 292, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=314" },
          { title: "Professional Fee", page: 293, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=315" },
          { title: "Quite Possible", page: 294, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=316" },
          { title: "Reading Aloud", page: 295, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=317" },
          { title: "Real Bravery", page: 296, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=318" },
          { title: "Reasons for Lament", page: 297, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=319" },
          { title: "Reckless Salt", page: 298, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=320" },
          { title: "Relayed Messages", page: 299, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=321" },
          { title: "Repaid Debt", page: 300, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=322" },
          { title: "Repeated Words", page: 301, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=323" },
          { title: "Repentant Thief", page: 302, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=324" },
          { title: "Rescue, not Theft", page: 303, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=325" },
          { title: "Respect", page: 304, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=326" },
          { title: "Respectable Gourmets", page: 305, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=327" },
          { title: "Rice, Mice and Children", page: 306, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=328" },
          { title: "Riches or Rice", page: 307, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=329" },
          { title: "Ridiculous Proportions", page: 308, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=330" },
          { title: "Ripe Apples", page: 309, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=331" },
          { title: "Ruler of the World", page: 310, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=332" },
          { title: "Ruler or Tyrant?", page: 311, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=333" },
          { title: "Rumble the Mouse", page: 312, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=334" },
          { title: "Saint Nasrudin", page: 313, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=335" },
          { title: "Sandbags", page: 314, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=336" },
          { title: "Satan's Replacement", page: 315, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=337" },
          { title: "Saved Shoes", page: 316, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=338" },
          { title: "Secret Seeds", page: 317, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=339" },
          { title: "Self Defense", page: 318, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=340" },
          { title: "Sensitivity", page: 319, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=341" },
          { title: "Sent by God", page: 320, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=342" },
          { title: "Servant and Master", page: 321, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=343" },
          { title: "Seven Days", page: 322, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=344" },
          { title: "Sharp Ribs", page: 323, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=345" },
          { title: "Shock Tactics", page: 324, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=346" },
          { title: "Shoes and Donkeys", page: 325, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=347" },
          { title: "Simple Arithmetic", page: 326, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=348" },
          { title: "Since becoming a Mulla", page: 327, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=349" },
          { title: "Sinner for the Evening", page: 328, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=350" },
          { title: "Six and Three make Nine", page: 329, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=351" },
          { title: "Small Appetite", page: 330, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=352" },
          { title: "Soldiers and Weapons", page: 331, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=353" },
          { title: "Statement and Belief", page: 332, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=354" },
          { title: "Strict Sentences", page: 333, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=355" },
          { title: "Strong Teeth", page: 334, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=356" },
          { title: "Stuck in the Mud", page: 335, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=357" },
          { title: "Successive Tyrants", page: 336, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=358" },
          { title: "Sugar Coins", page: 337, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=359" },
          { title: "Superlatives", page: 338, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=360" },
          { title: "Sweet Revenge", page: 339, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=361" },
          { title: "Swollen Feet", page: 340, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=362" },
          { title: "Sympathy Pains", page: 341, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=363" },
          { title: "Talking in Gestures", page: 342, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=364" },
          { title: "Tamerlane's Death", page: 345, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=367" },
          { title: "Teaching by Example", page: 346, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=368" },
          { title: "Terrible Nature", page: 347, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=369" },
          { title: "The Angry Pot", page: 348, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=370" },
          { title: "The Best Liar", page: 349, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=371" },
          { title: "The Best Teacher", page: 350, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=372" },
          { title: "The Beautiful Guest", page: 351, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=373" },
          { title: "The Boastful King", page: 352, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=374" },
          { title: "The Butcher's Cat", page: 353, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=375" },
          { title: "The Charmer", page: 354, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=376" },
          { title: "The Cost of a Curse", page: 355, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=377" },
          { title: "The Cursed Leg", page: 356, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=378" },
          { title: "The Desert Speaks", page: 357, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=379" },
          { title: "The Devil's Advice", page: 358, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=380" },
          { title: "The Drowned Man Returns", page: 359, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=381" },
          { title: "The Forgotten Groom", page: 360, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=382" },
          { title: "The Historian's Bet", page: 361, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-nasrudin/?auto_viewer=true#page=383" }



          ]
        },
        {
          "title": "Special Illumination: The Sufi Use of Humour",
          "main_url": "https://idriesshahfoundation.org/books/special-illumination-the-sufi-use-of-humour/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/special-illumination/?auto_viewer=true",
          "description": "Theoretical framework for understanding humor in spiritual development",
          "note": "This work does not have a formal table of contents. It is a single extended essay on The Sufi Use of Humour"
        }
      ]
    },
    "5. Contemporary Applications": {
      "function": "Applies Sufi perspective to modern contexts and issues",
      "approach": "Scattered observations on contemporary life create broader understanding",
      "books": [
        {
          "title": "A Veiled Gazelle: Seeing How to See",
          "main_url": "https://idriesshahfoundation.org/books/a-veiled-gazelle-seeing-how-to-see/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true",
          "description": "Contemporary applications of perceptual awareness and insight",
          "chapters": [
              { title: "Introduction", page: "ix", url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=9" },
              { title: "Master of the Option", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=11" },
              { title: "Four Friends", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=17" },
              { title: "When Bad is Good: The Legend of Asili", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=22" },
              { title: "Too Good to Miss", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=25" },
              { title: "What Not to Do", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=26" },
              { title: "Young and Old", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=27" },
              { title: "Never Complain", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=29" },
              { title: "His Lips are Sealed", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=31" },
              { title: "Third Year Studies", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=33" },
              { title: "The Man in the White Hat", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=34" },
              { title: "Subjective", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=39" },
              { title: "Final", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=40" },
              { title: "Trial Postponed", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=41" },
              { title: "The Spring of Life", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=42" },
              { title: "Not So Many", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=43" },
              { title: "The Reason...", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=44" },
              { title: "Another Way of Doing Things", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=46" },
              { title: "Celestial Fruit", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=48" },
              { title: "A Gnat's Weight...", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=51" },
              { title: "Grapes", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=55" },
              { title: "The Book of the Secrets of the Ancients", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=56" },
              { title: "The Nuristanis' Boots", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=61" },
              { title: "The Magic Mountain", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=63" },
              { title: "The Boy Who had a Dream", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=67" },
              { title: "Belief", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=72" },
              { title: "Camel's Head", page: 64, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=74" },
              { title: "The Horse-Khan, Son of a Khan", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=76" },
              { title: "Tigers", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=82" },
              { title: "Unsolved", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=84" },
              { title: "Gourou, The Perspicacious Mouse", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=85" },
              { title: "Will it Work?", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=95" },
              { title: "Alim the Artful", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=96" },
              { title: "The Inward Observer", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=114" },
              { title: "Latif and the Miser's Gold", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=115" },
              { title: "When Dishonest is Honest", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=119" },
              { title: "Unbalanced", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=123" },
              { title: "True Story", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=124" },
              { title: "The Murder", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/a-veiled-gazelle/?auto_viewer=true#page=125" }
          ]
        },
        {
          "title": "The Book of the Book",
          "main_url": "https://idriesshahfoundation.org/books/the-book-of-the-book/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true",
          "description": "Meta-commentary on books, reading, and knowledge transmission",
          "chapters": [
              { title: "Preface", page: "ix", url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=9" },
              { title: "1. The Dervish Who Became a King", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=11" },
              { title: "2. The Stranger Dressed in Green", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=13" },
              { title: "3. Contrary to Expectation", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=15" },
              { title: "4. The Opinion of the Scholars", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=17" },
              { title: "5. The Interpretation of the Dervish", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=19" },
              { title: "6. The Guarding and Theft of the Book", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=21" },
              { title: "7. Mali Saves the Book", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=23" },
              { title: "8. Yasavi Buys It for Twelve Gold Pieces", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=25" },
              { title: "9. Yasavi of the Masters Transmits It", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/the-book-of-the-book/?auto_viewer=true#page=27" }
          ]
        },

        {
          "title": "Evenings with Idries Shah",
          "main_url": "https://idriesshahfoundation.org/books/evenings-with-idries-shah/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true",
          "description": "Informal conversations and teachings from Shah's later years",
          "chapters": [
              { title: "Evenings with Idries Shah", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=7" },
              { title: "Nature and Discipline", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=9" },
              { title: "Overdose", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=14" },
              { title: "Monarch and Artist", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=16" },
              { title: "Unknown Capacities of Man", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=23" },
              { title: "The Importance of Grouping", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=28" },
              { title: "Derivative", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=31" },
              { title: "What Prevents Learning?", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=33" },
              { title: "Eastern Cults", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=39" },
              { title: "Spiritual Exercises", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=42" },
              { title: "The Sentry and the Vault", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=44" },
              { title: "Observation", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=51" },
              { title: "Running A Study Group", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=53" },
              { title: "The Reason", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=54" },
              { title: "What is Missing", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=56" },
              { title: "Understanding", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=63" },
              { title: "Crazes", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=67" },
              { title: "Sinning Against God and Man", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/evenings-with-idries-shah/?auto_viewer=true#page=69" }
          ]
        },

        {
          "title": "Seeker After Truth",
          "main_url": "https://idriesshahfoundation.org/books/seeker-after-truth/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true",
          "description": "Guidance for contemporary spiritual seekers navigating modern challenges",
          "chapters": [
            { title: "1 Tales of the Classical Masters", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=13" },
            { title: "Praying for Rain", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=15" },
            { title: "The One without the Other", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=15" },
            { title: "The Disobedience of Moses", page: 4, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=16" },
            { title: "Sting into Remedy", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=17" },
            { title: "Weapons", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=18" },
            { title: "Elephant-meat", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=20" },
            { title: "Generosity", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=23" },
            { title: "Grouping", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=24" },
            { title: "Scent and Reality", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=25" },
            { title: "The Heretics", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=27" },
            { title: "Neighbour", page: 16, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=28" },
            { title: "Teaching", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=29" },
            { title: "The Four Types", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=30" },
            { title: "The Fires of Today...", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=31" },
            { title: "The Law of Reverse Effect", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=32" },
            { title: "Treasure", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=33" },
            { title: "Permission to Expound", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=35" },
            { title: "2 Questions and Answers", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=37" },
            { title: "Not their Way, but their Way", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=39" },
            { title: "Prayers and Rituals", page: 28, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=40" },
            { title: "The True and the False Sufi", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=41" },
            { title: "A Ruse", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=42" },
            { title: "Instrumental", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=43" },
            { title: "Vicissitudes of a Teaching", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=44" },
            { title: "Present and Absent", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=45" },
            { title: "Ancient Traditions", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=46" },
            { title: "The Mother of Opposition", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=49" },
            { title: "Science and Omniscience", page: 38, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=50" },
            { title: "Keeping People Away", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=52" },
            { title: "Parable of the King and the Youth", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=54" },
            { title: "Biographers and Saints", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=55" },
            { title: "Fox and Lion", page: 46, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=58" },
            { title: "The Effect of Mystical Knowledge", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=59" },
            { title: "Museum-keeping", page: 48, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=60" },
            { title: "Subjective Behaviour", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=61" },
            { title: "Cause and Effect", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=62" },
            { title: "Attraction and Importance", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=63" },
            { title: "3 Sufi Stories", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=65" },
            { title: "Rich and Poor", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=67" },
            { title: "Played Upon", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=68" },
            { title: "The Dervish and his Wish", page: 57, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=69" },
            { title: "Do as your Friends Wish", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=71" },
            { title: "Hypocrite", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=72" },
            { title: "The Monster", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=73" },
            { title: "Asleep and Awake", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=75" },
            { title: "The Greater World", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=78" },
            { title: "The Lost Jewel", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=80" },
            { title: "The Magician's Dinner", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=82" },
            { title: "The Astrologers", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=83" },
            { title: "In the Desert", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=84" },
            { title: "4 Master and Disciple", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=87" },
            { title: "Answers", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=89" },
            { title: "Take Care...", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=91" },
            { title: "Measurement of Loyalty", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=92" },
            { title: "Poisoning the Untutored", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=94" },
            { title: "The Promise", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=95" },
            { title: "Idolatry", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=95" },
            { title: "Understanding", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=96" },
            { title: "How the World Aids the Sufi", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=98" },
            { title: "The Loaf of Bread", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=100" },
            { title: "Intelligence and Obedience", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=102" },
            { title: "How to Make Them Hear", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=104" },
            { title: "Hypocrisy", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=105" },
            { title: "Whispering", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=106" },
            { title: "Self-obsessed", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=108" },
            { title: "Alternative View", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=109" },
            { title: "Disguise", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=111" },
            { title: "Follower", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=111" },
            { title: "The Ignorant", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=112" },
            { title: "1001 Days", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=113" },
            { title: "Classical Encounter", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=114" },
            { title: "The Doorways", page: 104, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=116" },
            { title: "Wishing to be Wise", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=117" },
            { title: "Bound Hand and Foot", page: 106, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=118" },
            { title: "Value of Parables", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=119" },
            { title: "Heeding and Unheeding", page: 108, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=120" },
            { title: "Disputation", page: 109, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=121" },
            { title: "5 Anecdotes and Narratives", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=123" },
            { title: "Relevance", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=125" },
            { title: "Emotion and Drink", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=125" },
            { title: "Ghalib and Qalib", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=126" },
            { title: "Virtually Unknown Principle of Human Organisation: Group Studies Paradox", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=127" },
            { title: "How to Learn What is Already Known", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=129" },
            { title: "Poor Donkey", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=132" },
            { title: "Nail or Screw?", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=133" },
            { title: "Washerwomen", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=133" },
            { title: "Knowledgeability of the Audience", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=134" },
            { title: "What They Are Like", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=135" },
            { title: "Samples", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=135" },
            { title: "The Road to Khorasan", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=136" },
            { title: "Service", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=138" },
            { title: "As Rich as You...", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=138" },
            { title: "A Word can be One of Three Things...", page: 128, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=140" },
            { title: "Croaker", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=141" },
            { title: "Wealth of Satisfactions", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=141" },
            { title: "The More the Better", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=142" },
            { title: "Who is at Fault?", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=144" },
            { title: "Pleasant and Unpleasant", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=145" },
            { title: "6 In Western Garb...", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=147" },
            { title: "Sufis in the West", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=149" },
            { title: "Reasons", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=150" },
            { title: "Folk-memory", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=151" },
            { title: "'Men are not Rats!'", page: 140, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=152" },
            { title: "Science", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=154" },
            { title: "Reality and Imagination", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=154" },
            { title: "Confusion of Superficial and Perceptive", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=155" },
            { title: "Real and Unreal", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=157" },
            { title: "Disreputable", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=159" },
            { title: "What it Really Meant...", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=160" },
            { title: "Who Can Learn?", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=161" },
            { title: "What do you Really Know?", page: 151, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=163" },
            { title: "Human Nature", page: 153, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=165" },
            { title: "New Knowledge from Old", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=167" },
            { title: "Floor Covering", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=169" },
            { title: "Economics", page: 158, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=170" },
            { title: "Invention versus Development", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=171" },
            { title: "Deterrent", page: 160, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=172" },
            { title: "Cause and Effect", page: 162, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=174" },
            { title: "False Masters", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=175" },
            { title: "Troubadours", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=176" },
            { title: "7 Remarks at the Dinner-meetings", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=179" },
            { title: "Satisfaction", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=181" },
            { title: "Bases and Essentials of Sufi Knowledge", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=181" },
            { title: "Who is the More Spiritual?", page: 170, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=182" },
            { title: "Recognising It", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=183" },
            { title: "The King and his Son", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=183" },
            { title: "Definitions", page: 172, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=184" },
            { title: "The Guru", page: 173, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=185" },
            { title: "Critiques of Sufism", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=186" },
            { title: "Side-effects", page: 175, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=187" },
            { title: "According to the Best Advice", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=188" },
            { title: "Sweets for the Wise", page: 176, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=188" },
            { title: "Alarm", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=191" },
            { title: "A Basic Pattern", page: 180, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=192" },
            { title: "Impact", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=193" },
            { title: "8 The Skill that Nobody Has: Twelve Tales", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=197" },
            { title: "The Skill that Nobody Has", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=199" },
            { title: "The Man who Went in Search of his Fate", page: 196, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=208" },
            { title: "The Greed for Obstinacy", page: 202, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=214" },
            { title: "Milk of the Lioness", page: 206, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=218" },
            { title: "The Spirit of the Well", page: 213, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=225" },
            { title: "The Princess of the Water of Life", page: 216, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=228" },
            { title: "Fahima and the Prince", page: 218, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=230" },
            { title: "Salik and Kamala", page: 222, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=234" },
            { title: "When the Devil Went to Amman", page: 227, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=239" },
            { title: "The Robe", page: 234, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=246" },
            { title: "The Magic Pocket", page: 240, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=252" },
            { title: "The Son of a Story-teller", page: 248, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=260" },
            { title: "Finding the Teaching", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/seeker-after-truth/?auto_viewer=true#page=267" }
          ]
        }
      ]
    },
    "6. Academic & Formal Presentations": {
      "function": "Materials designed for academic and lecture contexts",
      "approach": "Formal presentations scatter key concepts for scholarly audiences",
      "books": [
        {
          "title": "The Elephant in the Dark",
          "main_url": "https://idriesshahfoundation.org/books/the-elephant-in-the-dark/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true",
          "description": "University lectures on Sufi approaches to knowledge and learning",
          "chapters": [
              { title: "The Information-Gap and Ecumenism", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=13" },
              { title: "The Islamic attitude to Jesus", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=21" },
              { title: "Understanding between Christians and Muslims / Role of Christians in the acceptance and protection of Muslims", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=25" },
              { title: "Co-operation of the Negus: Benefits accorded to Muslims", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=37" },
              { title: "Islamic protection of the Mount Sinai monks", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=43" },
              { title: "The Arab Christians", page: 33, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=45" },
              { title: "The Monk Bahaira and Abu Talib", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=47" },
              { title: "The Cave of Hira and the prediction of Waraqah", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=49" },
              { title: "The Throne Verse and the Light Verse of the Qur'an", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=53" },
              { title: "Islamic Tales of Jesus", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=55" },
              { title: "Dialogue and Differences", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=59" },
              { title: "Ghazzali and the Way of the Worshippers", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=65" },
              { title: "The Valley of Knowledge", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=70" },
              { title: "The Valley of Repentance", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=71" },
              { title: "The Valley of Stumbling Blocks", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=71" },
              { title: "The Valley of Tribulations", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=72" },
              { title: "The Thundering Valley", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=73" },
              { title: "The Abysmal Valley", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=73" },
              { title: "The Valley of Hymns", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=74" },
              { title: "Interaction and relationships: Christians and Muslims: Rodrigo; Rumi; Ramon Lull", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=77" },
              { title: "Islam as Surrender, Salam as Salvation", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=89" },
              { title: "The Western mystics and thinkers affected by Islam and the Sufis", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=93" },
              { title: "Contemporary scholars, writers and others on the Islamic and Sufi contribution in the future", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=95" },
              { title: "Bibliography", page: 99, url: "https://idriesshahfoundation.org/pdfviewer/the-elephant-in-the-dark/?auto_viewer=true#page=111" }
          ]
        },

        {
          "title": "Neglected Aspects of Sufi Study",
          "main_url": "https://idriesshahfoundation.org/books/neglected-aspects-of-sufi-study/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/neglected-aspects-of-sufi-study/?auto_viewer=true",
          "description": "Scholarly examination of overlooked elements in Sufi research",
          "note": "This is a single essay, based  on  lectures  at  the  New  School  for  Social  Research,  New York, and the University of California, San Francisco, May 1976"
        },
        {
          "title": "Special Problems in the Study of Sufi Ideas",
          "main_url": "https://idriesshahfoundation.org/books/special-problems-in-the-study-of-sufi-ideas/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true",
          "description": "Academic challenges and methodological issues in Sufi studies",
          "note":"The annotated text of a lecture given at the University of Sussex, in 1966.",
          "chapters": [
              { title: "Preface", page: "xi", url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=11" },
              { title: "Theories about Sufism", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=27" },
              { title: "Limitations of Contemporary Approaches to Sufism", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=40" },
              { title: "Misunderstandings of Sufi Ideas and Formulations", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=51" },
              { title: "Forms of Sufi Activity", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=69" },
              { title: "Difficulties in Understanding Sufi Materials", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=84" },
              { title: "Example of Sufi Ideas from Jalaludin Rumi (1205–1273)", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=95" },
              { title: "Some Assessments of Contemporary Contemporary Sufi Writing", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=100" },
              { title: "Notes and Bibliography", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=115" },
              { title: "Index", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/special-problems-in-the-study-of-sufi-ideas/?auto_viewer=true#page=145" }
          ]
        },

        {
          "title": "A Perfumed Scorpion",
          "main_url": "https://idriesshahfoundation.org/books/a-perfumed-scorpion/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true",
          "description": "University lectures on psychology and human development",
          "chapters": [
              { title: "I Sufi Education", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=13" },
              { title: "II On the Nature of Sufi Knowledge", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=55" },
              { title: "III The Path and the Duties and Techniques", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=87" },
              { title: "IV The Teaching Story – 1", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=109" },
              { title: "V The Teaching Story – 2", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=145" },
              { title: "VI A Framework for New Knowledge", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=151" },
              { title: "VII Involvement in Sufi Study", page: 187, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=199" },
              { title: "VIII Conclusion", page: 201, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=213" },
              { title: "Some Further Reading", page: 205, url: "https://idriesshahfoundation.org/pdfviewer/a-perfumed-scorpion/?auto_viewer=true#page=217" }
          ]
        },

        {
          "title": "Letters and Lectures of Idries Shah",
          "main_url": "https://idriesshahfoundation.org/books/lectures-and-lectures-of-idries-shah/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true",
          "description": "Collection of correspondence and formal presentations",
          "chapters": [
              { title: "The Fox and the Birds", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=7" },
              { title: "Abundance", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=11" },
              { title: "Obligation", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=14" },
              { title: "The Three Priests and the Truth", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=16" },
              { title: "Ready to Learn", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=21" },
              { title: "Throwing Away and Ignoring Knowledge", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=24" },
              { title: "The Effects of Greed and Heedlessness", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=27" },
              { title: "The Men and the Butterfly", page: 30, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=36" },
              { title: "The Source of Sustenance", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=42" },
              { title: "The Powerful Effect of Rituals", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=45" },
              { title: "Stupid and Important Ideas", page: 40, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=46" },
              { title: "Loss of Joy", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=47" },
              { title: "My False Self", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=49" },
              { title: "Organisations", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=50" },
              { title: "Humour and Sufi Understanding", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=53" },
              { title: "Sectarianism", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=59" },
              { title: "Brainpower", page: 55, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=61" },
              { title: "Obtuse", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/letters-and-lectures/?auto_viewer=true#page=64" }
          ]
        }
      ]
    },
    "7. Cultural & Historical Studies": {
      "function": "Examines cultural transmission and historical connections",
      "approach": "Scattered evidence of Sufi influence reveals hidden historical patterns",
      "books": [
        {
          "title": "Oriental Magic",
          "main_url": "https://idriesshahfoundation.org/books/oriental-magic/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true",
          "description": "Study of magical traditions and their relationship to Sufism",
          "chapters": [
              { title: "List of Illustrations", page: "xi", url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=11" },
              { title: "Foreword", page: "xiii", url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=13" },
              { title: "Preface", page: "xvii", url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=17" },
              { title: "Chapter 1: Magic Is International", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=23" },
              { title: "Chapter 2: Jewish Magic", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=37" },
              { title: "Chapter 3: Solomon: King and Magician", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=51" },
              { title: "Chapter 4: The Occult in Babylonia", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=57" },
              { title: "Chapter 5: Egyptian Magic", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=71" },
              { title: "Chapter 6: Ju-Ju Land of the Twin Niles", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=93" },
              { title: "Chapter 7: The Fakirs and their Doctrines", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=105" },
              { title: "Chapter 8: The Arabian Contribution", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=129" },
              { title: "Chapter 9: Legends of the Sorcerers", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=143" },
              { title: "Chapter 10: Calling the Spirits", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=155" },
              { title: "Chapter 11: Iranian Magic", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=169" },
              { title: "Chapter 12: Magical Rites of the Atharva Veda", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=181" },
              { title: "Chapter 13: India: Rites of the Priest-Magicians", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=199" },
              { title: "Chapter 14: Indian Alchemy Today", page: 189, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=211" },
              { title: "Chapter 15: A New Thought-Force?", page: 205, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=227" },
              { title: "Chapter 16: Love-Magic", page: 213, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=235" },
              { title: "Chapter 17: The Occult Art in China", page: 223, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=245" },
              { title: "Chapter 18: Wonder-Workers of Tibet", page: 259, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=281" },
              { title: "Chapter 19: Magic Art of Japan", page: 275, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=297" },
              { title: "Bibliography", page: 285, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=307" },
              { title: "Notes", page: 295, url: "https://idriesshahfoundation.org/pdfviewer/oriental-magic/?auto_viewer=true#page=317" }
          ]
        },

        {
          "title": "The Secret Lore of Magic",
          "main_url": "https://idriesshahfoundation.org/books/the-secret-lore-of-magic/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true",
          "description": "Historical examination of magical practices and beliefs",
          "chapters": [
                      { title: "The Complete Ritual of Ceremonial Magic: The Key of Solomon, Son of David", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=11" },
                      { title: "The Clavicle: Spells and Medallions", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=44" },
                      { title: "The Complete Ritual of Black Magic: The Pact of the Black Art", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=73" },
                      { title: "'A Book by the Devil' – The Grimorium Verum", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=89" },
                      { title: "The Magical Powers of Stones", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=137" },
                      { title: "The Magical Uses of Certain Herbs", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=152" },
                      { title: "Animals in Magic", page: 161, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=169" },
                      { title: "A Book of Spells", page: 169, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=177" },
                      { title: "The Magical Talisman", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=205" },
                      { title: "The Book of the Spirits", page: 210, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=218" },
                      { title: "The Catalogue of Demons", page: 248, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=256" },
                      { title: "Cornelius Agrippa: On Calling Spirits", page: 264, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=272" },
                      { title: "The Book of Power, by Aptolcater", page: 271, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=279" },
                      { title: "Preparing the Magical Skin", page: 297, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=305" },
                      { title: "The Liber Spirituum", page: 311, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=319" },
                      { title: "The Circle of Evocation", page: 315, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=323" },
                      { title: "Conjuring the Kings of the Demons", page: 318, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=326" },
                      { title: "Conjurations of each Day of the Week", page: 322, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=330" },
                      { title: "Hours and Times for Magical Rites", page: 331, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=339" },
                      { title: "The Spirits, Planets and Data of Magic", page: 338, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=346" },
                      { title: "Powers and Second Conjuration of Spirits", page: 353, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=361" },
                      { title: "Third Conjuration of Spirits", page: 357, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=365" },
                      { title: "Commanding the King of Reluctant Spirits", page: 359, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=367" },
                      { title: "'The Burning', Invocation to Rebellious Spirits", page: 360, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=368" },
                      { title: "'Curse of Chains', addressed to Spirits", page: 361, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=369" },
                      { title: "'The Pit', Second Invocation to a Rebellious Spirit", page: 362, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=370" },
                      { title: "List of Abbreviations", page: 363, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=371" },
                      { title: "Index", page: 365, url: "https://idriesshahfoundation.org/pdfviewer/the-secret-lore-of-magic/?auto_viewer=true#page=373" }
          ]
        },

        {
          "title": "Destination Mecca",
          "main_url": "https://idriesshahfoundation.org/books/destination-mecca/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true",
          "description": "Travel narrative exploring cultural and spiritual traditions",
          "chapters": [
              { title: "I Gentleman at Large", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=11" },
              { title: "II Tangier: Smugglers' Paradise", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=17" },
              { title: "III Contraband Runner", page: 11, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=21" },
              { title: "IV Eastward to Egypt", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=33" },
              { title: "V New Arabian Knights", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=45" },
              { title: "VI Marching Orders", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=61" },
              { title: "VII Red Sea Journey", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=69" },
              { title: "VIII The Shrine of the Black Stone", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=91" },
              { title: "IX Life in Mecca", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=117" },
              { title: "X Camel Lore", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=125" },
              { title: "XI Locust Army", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=129" },
              { title: "XII Audience with Ibn Saud", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=133" },
              { title: "XIII Saud, Son of Abdul-Aziz", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=145" },
              { title: "XIV In Search of Solomon's Mines", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=153" },
              { title: "XV Mahdism on the March", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=165" },
              { title: "XVI Domes of Omdurman", page: 163, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=173" },
              { title: "XVII Land of the Phoenicians", page: 171, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=181" },
              { title: "XVIII Kingdom of the Jordan", page: 179, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=189" },
              { title: "XIX Petra the Mysterious", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=195" },
              { title: "XX The Rock of Paradise", page: 193, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=203" },
              { title: "XXI In Search of Venus", page: 197, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=207" },
              { title: "XXII Sorcerer's Apprentice", page: 207, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=217" },
              { title: "XXIII Guerrilla King of No Man's Land", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/destination-mecca/?auto_viewer=true#page=239"}
          ]
        },
        {
          "title": "Sufi Thought and Action",
          "main_url": "https://idriesshahfoundation.org/books/sufi-thought-and-action/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true",
          "description": "Historical overview of Sufi contributions to world culture",
          "note": "Assembled by Idries Shah. The Table of contents is partially arranged by subject matter, rather than title of the section.",
          "chapters": [
          { title: "Sufi Spiritual Rituals and Beliefs - Idries Shah", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=11" },

            // 2. Sufi Principles and Learning Methods
          { title: "Sufi Principles and Learning Methods", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=51" },
          { title: "Trust - Humayun Abbas", page: 43, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=53" },
          { title: "Sufi Activity - Emir Ali Khan", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=60" },
          { title: "Sufi Learning Methods - Benjamin Ellis Fourd", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=66" },
          { title: "The Sufis on the Scholars - Mohandis el Alouite", page: 67, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=77" },
          { title: "The Sufi Meeting Place - Ferrucio Amadeo (Faruq Ahmad)", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=81" },
          { title: "Avoiding Imitators - Gashim Mirzoeff", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=86" },
          { title: "The Western Seeker Seen through Eastern Eyes - Alirida Ghulam Sarwar", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=90" },

          // 3. Current Sufi Activity: Work, Literature, Groups and Techniques
          { title: "Current Sufi Activity: Work, Literature, Groups and Techniques - Chawan Thurlnas", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=97" },
          { title: "Their Work Enterprises", page: 89, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=99" },
          { title: "Sufi Use of Literature", page: 91, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=101" },
          { title: "Controlling Oneself", page: 92, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=102" },
          { title: "Discouraging Potential Recruits: 'Deflection'", page: 93, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=103" },
          { title: "The Idea of Organic Enterprises", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=106" },
          { title: "Entry into a Sufi Group", page: 102, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=112" },
          { title: "The Sufis as a Cult", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=115" },
          { title: "Religion, Evolution and Intervention", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=120" },
          { title: "Representative Writings: Tradition and Potentiality", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=123" },

          // 4. Ritual, Initiation and Secrets in Sufi Circles
          { title: "Ritual, Initiation and Secrets in Sufi Circles - Franz Heidelberger and Others", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=125" },
          { title: "Time Spent among Sufis - Franz Heidelberger", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=127" },
          { title: "The Sufi Adept and the Projection of the Mind", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=128" },
          { title: "Priest, Magician and Sufi", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=129" },
          { title: "The Learner's and the Teacher's Viewpoints", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=132" },
          { title: "The Three Major Lessons", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=134" },
          { title: "The Sufis in Current Idiom", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=135" },
          { title: "Sufi Orders - Rosalie Marsham", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=137" },
          { title: "Ritual and Perception", page: 127, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=137" },
          { title: "Exercises, Movements, Costumes", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=139" },
          { title: "The Ineffable Secret", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=142" },
          { title: "The Chain of Initiation", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=143" },
          { title: "Founders and Early Masters", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=144" },
          { title: "Special Selection for Teachings and Students", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=146" },
          { title: "Effect of Hierarchy and Tradition", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=147" },
          { title: "Observation of a Sufi School - Hoda Azizian", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=149" },
          { title: "Primary, Secondary and Deteriorated Schools", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=149" },
          { title: "Materials, Attunement, Energy and Focus", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=151" },
          { title: "Extra-sensory Perception", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=157" },
          { title: "Worldly and Spiritual Progress", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=158" },
          { title: "Tests: True and False Sufis – Judging the Teacher", page: 149, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=159" },
          { title: "The Path of Blame and Other Technicalities", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=160" },
          { title: "Other Works", page: 155, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=165" },

          // 5. Theories, Practices and Training Systems of a Sufi School
          { title: "Theories, Practices and Training Systems of a Sufi School - Canon W.H.T. Gairdner", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=169" },

          // 6. Key Concepts in Sufi Understanding
          { title: "Key Concepts in Sufi Understanding - Edited by Professor Hafiz Jamal", page: 189, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=199" },
          { title: "Those Astonishing Sufis - Adilbai Kharkovli", page: 191, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=201" },
          { title: "The General Principles of Sufism - Sirdar Ikbal Ali Shah", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=213" },
          { title: "Sufism and the Indian Philosophies - Sirdar Ikbal Ali Shah", page: 219, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=229" },

          // 7. Visits to Sufi Centres
          { title: "Visits to Sufi Centres: Recent Research Papers - Djaleddin Ansari and Others", page: 227, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=237" },
          { title: "Basic Teachings of the Sufis - Djaleddin Ansari", page: 229, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=239" },
          { title: "The Dinner-meeting and Other Topics - Abdul-Wahab T. Tiryaqi", page: 238, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=248" },
          { title: "Making Sense of Sufi Literature, Experts, Paradox - Andrew C.C. Ellis", page: 241, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=251" },
          { title: "Aphorisms of a Sufi Teacher - Hilmi Abbas Jamil", page: 249, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=259" },
          { title: "Three Forms of Knowledge, according to the Naqshbandi School - Gustav Schneck", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=265" },

          // 8. The Sufis of Today
          { title: "The Sufis of Today - Seyyed F. Hossain", page: 259, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=269" },
          { title: "Summary", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=271" },
          { title: "The Sufis of Today", page: 263, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=273" },
          { title: "Reviews and Comments on Sufi Affairs", page: 277, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=287" },

          // 9. In a Sufi Monastery and Other Papers
          { title: "In a Sufi Monastery - Najib Siddiqi", page: 283, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=293" },
          { title: "Vanity and Imitation - Fares de Logres", page: 286, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=296" },
          { title: "Sufis over Two Centuries - Valentino de Mezquita, Sr", page: 289, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=299" },
          { title: "What the Sufis Do Not Want Us to Know - Edwin Clitheroe", page: 291, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=301" },
          { title: "Two Sufi Lectures - Hafiz Jamal", page: 296, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=306" },
          { title: "Religion as Repetition or Experience", page: 296, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=306" },
          { title: "Outer and Inner Activity and Knowledge", page: 301, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=311" },
          { title: "Conversation with a Sufi Master - Aziza Al-Akbari", page: 304, url: "https://idriesshahfoundation.org/pdfviewer/sufi-thought-and-action/?auto_viewer=true#page=314" }
          ]
        },

        {
          "title": "The World of the Sufi",
          "main_url": "https://idriesshahfoundation.org/books/the-world-of-the-sufi/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true",
          "description": "Comprehensive look at Sufi influence across civilizations",
          "chapters": [
          { title: "Introduction - Idries Shah", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=13" },

  // Section 2: The Classical Tradition of the Sufi
          { title: "The Classical Tradition of the Sufi", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=19" },
          { title: "The Classical Masters - Peter Brent", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=19" },
          { title: "Sanai and Sufism in the 20th Century West - David Pendlebury", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=47" },
          { title: "Some Sufi Tales from Burton's Arabian Nights", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=57" },
          { title: "In the World, Not Of It - Doris Lessing", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=77" },

          // Section 3: Humour and the Sufi
          { title: "Humour and the Sufi", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=87" },
          { title: "In a Naqshbandi Circle - Raoul Simac", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=87" },
          { title: "Forty-five Adventures of Mulla Nasrudin - Marjory A. Bancroft", page: 80, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=92" },

          // Section 4: Sufism in Eastern Religion
          { title: "Indian Thought and the Sufis - Dr Tara Chand", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=112" },
          { title: "Sufi Influence on the Formation of Sikhism - Frederic Pincott, MRAS", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=151" },
          { title: "Yoga and the Sufis - Pundit Kishan Chand", page: 167, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=179" },

          // Section 5: Therapy and the Sufi
          { title: "Specialised Techniques in Central Asia - Ja'far Hallaji", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=189" },
          { title: "Nasrudin Looks at Mental Health - Marjory A. Bancroft", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=195" },
          { title: "Sufism and Psychiatry - Arthur J. Deikman, MD", page: 199, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=211" },
          { title: "Report on Mysticism - Arthur J. Deikman, MD", page: 230, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=242" },

          // Section 6: The Practice of the Sufi
          { title: "Learning and Teaching - Peter Brent", page: 243, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=255" },
          { title: "Sufi Studies Today - William Foster", page: 258, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=270" },
          { title: "Sufi Studies: East and West - Leonard Lewin, PhD", page: 270, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=282" },
          { title: "Abshar Monastery - Julian Shaw", page: 292, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=304" },
          { title: "The Pointing Finger Teaching System - Ahmed Abdullah", page: 296, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=308" },
          { title: "The Known and Unknown in Studies - John Grant", page: 298, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=310" },
          { title: "Emulation and Cycles of Study - Ali Sultan", page: 301, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=313" },
          { title: "Learning by Contact - Rustam Khan-Urff", page: 303, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=315" },
          { title: "Meditation Method - Mir S. Khan", page: 305, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=317" },
          { title: "A Sufi Organisation in Britain - Arkon Daraul", page: 307, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=319" },
          { title: "A Dervish Assembly in the West - Selim Brook-White", page: 311, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=323" },
          { title: "Use of The Five Gems - Edouard Chatelherault", page: 314, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=326" },

          // Section 7: Current Study Materials
          { title: "First Principles", page: 316, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=328" },
          { title: "The Known as the Channel to the Unknown", page: 320, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=332" },
          { title: "Journey Beyond History", page: 325, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=337" },
          { title: "The Regeneration and Degeneration Cycles in Mystical Study", page: 327, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=339" },
          { title: "An Important Aspect of Sufic Study", page: 356, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=368" },
          { title: "Letter from a Sufi Teacher", page: 358, url: "https://idriesshahfoundation.org/pdfviewer/the-world-of-the-sufis/?auto_viewer=true#page=370" }
          ]
        },
        {
          "title": "The Dermis Probe",
          "main_url": "https://idriesshahfoundation.org/books/the-dermis-probe/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true",
          "description": "Analysis of surface versus deeper cultural understanding",
          "chapters":[
          { title: "Preface: Goldfish", page: "xi", url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=11" },
          { title: "The Dermis Probe", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=17" },
          { title: "Salute to the Thief", page: 4, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=20" },
          { title: "The Critic", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=21" },
          { title: "The Materials of the Locality", page: 6, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=22" },
          { title: "The Strange Becomes Commonplace", page: 7, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=23" },
          { title: "Invisible Service", page: 8, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=24" },
          { title: "Dismissed", page: 9, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=25" },
          { title: "Four Communities", page: 10, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=26" },
          { title: "Accumulated Supplications", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=28" },
          { title: "Opinion and Fact", page: 13, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=29" },
          { title: "Full Circle", page: 15, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=31" },
          { title: "The Insane", page: 17, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=33" },
          { title: "A Group of Sufis", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=34" },
          { title: "Salik on the Road to Qandahar", page: 19, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=35" },
          { title: "Absent", page: 20, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=36" },
          { title: "Three Sufi Masters", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=37" },
          { title: "Secret Knowledge", page: 22, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=38" },
          { title: "The Mob", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=40" },
          { title: "Invisible", page: 25, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=41" },
          { title: "Ahmed Yasavi", page: 26, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=42" },
          { title: "The Steam of the Pot of Ikhtiari", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=43" },
          { title: "The Journey", page: 29, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=45" },
          { title: "I Don't Know", page: 31, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=47" },
          { title: "How Kashmir Got its Name", page: 32, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=48" },
          { title: "The Way which Seems to Lead to Worthlessness…", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=50" },
          { title: "Anwar", page: 36, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=52" },
          { title: "Qualities", page: 37, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=53" },
          { title: "Anwar Abbasi", page: 39, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=55" },
          { title: "Protection", page: 41, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=57" },
          { title: "The Aristocrat", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=58" },
          { title: "Grief and Joy", page: 44, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=60" },
          { title: "The Magician", page: 45, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=61" },
          { title: "Grammar", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=63" },
          { title: "Dissatisfied", page: 49, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=65" },
          { title: "Conviction", page: 50, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=66" },
          { title: "The Light-Taker", page: 51, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=67" },
          { title: "Interpretation", page: 54, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=70" },
          { title: "Yusuf Son of Hayula", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=72" },
          { title: "In China", page: 58, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=74" },
          { title: "To Cause Annoyance", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=75" },
          { title: "Discouraging Visitors", page: 61, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=77" },
          { title: "Bahaudin", page: 62, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=78" },
          { title: "Reading", page: 63, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=79" },
          { title: "Eyes and Light", page: 65, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=81" },
          { title: "Kasab of Mazar", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=82" },
          { title: "Money", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=84" },
          { title: "Digestion", page: 69, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=85" },
          { title: "Target", page: 70, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=86" },
          { title: "The Food of the Peacock", page: 71, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=87" },
          { title: "The Perfect Man", page: 72, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=88" },
          { title: "Now Begin", page: 73, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=89" },
          { title: "A Thousand Dinars", page: 74, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=90" },
          { title: "The Ordeals", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=91" },
          { title: "Men and Camels", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=92" },
          { title: "Illustrative Exclamations", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=93" },
          { title: "Success in Discipleship", page: 78, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=94" },
          { title: "Pomegranates", page: 79, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=95" },
          { title: "The Sleeping Man", page: 81, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=97" },
          { title: "Abdali", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=98" },
          { title: "The Stone", page: 83, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=99" },
          { title: "Unfettered", page: 84, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=100" },
          { title: "Musa of Isfahan", page: 85, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=101" },
          { title: "Sandals", page: 86, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=102" },
          { title: "Struggle", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=103" },
          { title: "The Yemenite Inquirer", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=104" },
          { title: "Minai's Journey", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=106" },
          { title: "The Legend of the Hidden Physician", page: 94, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=110" },
          { title: "Only Three Men in the World", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=112" },
          { title: "The Palace of the Man in Blue", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=116" },
          { title: "The Man Who Wanted Knowledge", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=119" },
          { title: "The Mantle", page: 105, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=121" },
          { title: "Unwritten History", page: 107, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=123" },
          { title: "The Legend of the Cattleman", page: 108, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=124" },
          { title: "The Handicap", page: 110, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=126" },
          { title: "How Things Work", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=127" },
          { title: "Three Villages", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=129" },
          { title: "The Sutra of Neglectfulness", page: 115, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=131" },
          { title: "Remedy", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=133" },
          { title: "In the Land of Fools", page: 118, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=134" },
          { title: "Cooking the Cabbage", page: 119, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=135" },
          { title: "The Branch", page: 120, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=136" },
          { title: "The Fruit", page: 121, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=137" },
          { title: "The Magic Word", page: 122, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=138" },
          { title: "How To Prove It", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=139" },
          { title: "Yearning", page: 124, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=140" },
          { title: "Man and Sufi", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=141" },
          { title: "The Book", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=142" },
          { title: "Dervishhood", page: 129, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=145" },
          { title: "The Reflection Chamber at Doshambe", page: 130, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=146" },
          { title: "Learning of the Unripe", page: 132, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=148" },
          { title: "Alacrity and Respect", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=149" },
          { title: "The Cripples", page: 134, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=150" },
          { title: "Names", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=151" },
          { title: "Repetition", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=152" },
          { title: "Bricks and Walls", page: 137, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=153" },
          { title: "The Hole and the Thread", page: 138, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=154" },
          { title: "The Squirrel", page: 139, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=155" },
          { title: "Behaviour", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=157" },
          { title: "Bahaudin Naqshband said:", page: 142, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=158" },
          { title: "Genealogy", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=159" },
          { title: "One of Ours", page: 144, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=160" },
          { title: "Three Reasons", page: 145, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=161" },
          { title: "Exile", page: 147, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=163" },
          { title: "The Medicine", page: 148, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=164" },
          { title: "Ansari's Answer", page: 150, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=166" },
          { title: "Two Pieces of Advice", page: 152, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=168" },
          { title: "The Gifts", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=170" },
          { title: "The Fox who Was Made a Sufi", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=172" },
          { title: "When a Man Comes to See You…", page: 157, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=173" },
          { title: "Notes", page: 159, url: "https://idriesshahfoundation.org/pdfviewer/the-dermis-probe/?auto_viewer=true#page=175" }
          ]
        }
      ]
    },
    "8. Children's Literature": {
      "function": "Stories for children that also work for adults - multi-generational impact",
      "approach": "Simple surface narratives with deeper patterns scattered across age groups",
      "books": [
        {
          "title": "The Tale of the Sands",
          "main_url": "https://idriesshahfoundation.org/books/the-tale-of-the-sands/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-tale-of-the-sands/?auto_viewer=true",
          "description": "Classic tale of transformation and adaptation"
        },
        {
          "title": "The Story of Mushkil Gusha",
          "main_url": "https://idriesshahfoundation.org/books/the-story-of-mushkil-gusha/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-story-of-mushkil-gusha/?auto_viewer=true",
          "description": "Traditional tale of the remover of difficulties"
        },
        {
          "title": "The Ants and the Pen",
          "main_url": "https://idriesshahfoundation.org/books/the-ants-and-the-pen/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-ants-and-the-pen/?auto_viewer=true",
          "description": "Story about perspective and understanding different viewpoints"
        },
        {
          "title": "The Boy With No Voice and the Men Who Couldn't Hear",
          "main_url": "https://idriesshahfoundation.org/books/the-boy-with-no-voice/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-boy-with-no-voice/?auto_viewer=true",
          "description": "Tale exploring communication and understanding"
        },
        {
          "title": "The Fisherman's Neighbour",
          "main_url": "https://idriesshahfoundation.org/books/the-fishermans-neighbour/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-fishermans-neighbour/?auto_viewer=true",
          "description": "Story about assumptions and reality"
        },
        {
          "title": "The Horrible Dib Dib",
          "main_url": "https://idriesshahfoundation.org/books/the-horrible-dib-dib/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-horrible-dib-dib/?auto_viewer=true",
          "description": "Tale about confronting fears and the unknown"
        },
        {
          "title": "The Man The Tree and The Wolf",
          "main_url": "https://idriesshahfoundation.org/books/the-man-the-tree-and-the-wolf/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-man-the-tree-and-the-wolf/?auto_viewer=true",
          "description": "Story exploring relationship dynamics and wisdom"
        },
        {
          "title": "The Onion",
          "main_url": "https://idriesshahfoundation.org/books/the-onion/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-onion/?auto_viewer=true",
          "description": "Tale about layers of understanding and truth"
        },
        {
          "title": "The Rich Man and the Monkey",
          "main_url": "https://idriesshahfoundation.org/books/the-rich-man-and-the-monkey/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-rich-man-and-the-monkey/?auto_viewer=true",
          "description": "Story about values, assumptions and unexpected wisdom"
        },
        {
          "title": "The Tale of Melon City",
          "main_url": "https://idriesshahfoundation.org/books/the-tale-of-melon-city/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-tale-of-melon-city/?auto_viewer=true",
          "description": "Humorous tale about justice, leadership and absurdity"
        },
        {
          "title": "Speak First and Lose",
          "main_url": "https://idriesshahfoundation.org/books/speak-first-and-lose/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/speak-first-and-lose/?auto_viewer=true",
          "description": "Story about patience, timing and wisdom"
        },
        {
          "title": "After a Swim",
          "main_url": "https://idriesshahfoundation.org/books/after-a-swim/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/after-a-swim/?auto_viewer=true",
          "description": "Simple tale with deeper meanings about experience and understanding"
        }
      ]
    },
    "9. Social Commentary": {
      "function": "Satirical examination of contemporary Western society",
      "approach": "Scattered observations and critiques reveal patterns of cultural conditioning",
      "books": [
        {
          "title": "Darkest England",
          "main_url": "https://idriesshahfoundation.org/books/darkest-england/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true",
          "description": "Satirical look at British society and cultural assumptions",
          "chapters": [
              { title: "Foreword", page: "ix", url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=9" },
              { title: "Roots and Anglekins", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=11" },
              { title: "Cruel Lords", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=28" },
              { title: "Damage Control", page: 24, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=34" },
              { title: "Certainly Not From Trinidad", page: 34, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=44" },
              { title: "Angles Down the Road", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=57" },
              { title: "Pliny Rules in Badgersden", page: 59, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=69" },
              { title: "The Cypher", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=85" },
              { title: "Gy-i Fee-a", page: 87, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=97" },
              { title: "The Dear Martian", page: 101, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=111" },
              { title: "Wise Men Never Tell", page: 116, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=126" },
              { title: "Tribal Rituals", page: 136, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=146" },
              { title: "Unsuitable for Antarctica", page: 156, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=166" },
              { title: "All Very Well in Nairobi", page: 168, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=178" },
              { title: "Woadlore", page: 178, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=188" },
              { title: "Carriemoss", page: 186, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=196" },
              { title: "Pirates and Admirals", page: 195, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=205" },
              { title: "Xavier Turlough is My Name", page: 206, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=216" },
              { title: "Stands to Reason", page: 217, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=227" },
              { title: "Smoke and Frozen Tiger", page: 222, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=232" },
              { title: "Demons of the Upper Air", page: 233, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=243" },
              { title: "Just Before Albania", page: 242, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=252" },
              { title: "Mouse in Milk", page: 255, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=265" },
              { title: "Government by Astonishment", page: 260, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=270" },
              { title: "Guerrilla at the Palace", page: 271, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=281" },
              { title: "Security, and So On", page: 279, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=289" },
              { title: "The Secret System of the Angleans", page: 291, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=301" },
              { title: "What He's Really Like", page: 303, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=313" },
              { title: "Thrakintwist and Ciclaton", page: 312, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=322" },
              { title: "Watching Them", page: 327, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=337" },
              { title: "Heisenberg Wasn't So Original", page: 335, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=345" },
              { title: "Secret Rituals", page: 348, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=358" },
              { title: "The Hidden Teaching Method", page: 355, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=365" },
              { title: "Where IS Everybody?", page: 365, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=375" },
              { title: "Going Native", page: 379, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=389" },
              { title: "New English Bottles", page: 392, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=402" },
              { title: "The Solution", page: 398, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=408" },
              { title: "Nothing of Significance to Say", page: 405, url: "https://idriesshahfoundation.org/pdfviewer/darkest-england/?auto_viewer=true#page=415" }
          ]
        },
        {
          "title": "The Englishman's Handbook",
          "main_url": "https://idriesshahfoundation.org/books/the-englishmans-handbook/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true",
          "description": "Humorous guide to understanding English cultural patterns",
          "chapters": [
            { title: "Foreword", page: "ix", url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=9" },
            { title: "The Questions They Ask", page: 1, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=25" },
            { title: "Aversion Therapy", page: 5, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=29" },
            { title: "The French", page: 12, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=36" },
            { title: "The Spanish", page: 18, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=42" },
            { title: "The Americans", page: 21, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=45" },
            { title: "The Lights – and the Dogs!", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=51" },
            { title: "Masterly Inactivity", page: 42, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=66" },
            { title: "Teapoys and Boiled Potatoes", page: 56, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=80" },
            { title: "Say It Loud Enough and They Won't Believe It...", page: 66, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=90" },
            { title: "Travelling, Visiting, Empiring", page: 76, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=100" },
            { title: "Not a Person, But...", page: 88, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=112" },
            { title: "Culture at a Distance", page: 100, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=124" },
            { title: "Dealing With Foreigners I: Disinformation", page: 113, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=137" },
            { title: "Dealing With Foreigners II: Scaring Them", page: 126, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=150" },
            { title: "Joining the Third World", page: 143, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=167" },
            { title: "Contrary to Expectation", page: 164, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=188" },
            { title: "Mr Thomas's Fruit", page: 177, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=201" },
            { title: "Doublethink or Doublespeak?", page: 185, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=209" },
            { title: "The Foreignness of Foreigners", page: 192, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=216" },
            { title: "How Horrid IS Abroad?", page: 199, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=223" },
            { title: "Loathsome or Lovable?", page: 213, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=237" },
            { title: "Can Foreigners Deal With the British?", page: 220, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=244" },
            { title: "Life in Britain", page: 227, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=251" },
            { title: "Alarm and Despondency", page: 238, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=262" },
            { title: "Secret Meanings, Hidden Hands…", page: 248, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=272" },
            { title: "Notes", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/the-englishmans-handbook/?auto_viewer=true#page=285" }
         ]
      },

        {
          "title": "The Natives are Restless",
          "main_url": "https://idriesshahfoundation.org/books/the-natives-are-restless/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true",
          "description": "Sharp observations on Western society from an outsider's perspective",
          "chapters": [
              { title: "See Worri Mean?", page: 3, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=11" },
              { title: "Up-Country", page: 14, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=22" },
              { title: "The Natives are Restless", page: 27, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=35" },
              { title: "It's Those Damned Drums Again, Isa", page: 35, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=43" },
              { title: "Sloonjin Summf", page: 47, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=55" },
              { title: "Bringing an Afghan", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=61" },
              { title: "I Never Give Them", page: 60, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=68" },
              { title: "Awfully Near Tibet", page: 68, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=76" },
              { title: "Jungle of the Holy Yahya", page: 75, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=83" },
              { title: "Dave", page: 82, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=90" },
              { title: "On the Telly", page: 90, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=98" },
              { title: "Going to a Mortimer", page: 97, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=105" },
              { title: "Mr Verloren Hoop", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=111" },
              { title: "Ark Not Found as Recluse Leaves Thousands", page: 114, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=122" },
              { title: "Istabrandt", page: 125, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=133" },
              { title: "Treasure Beyond Belief", page: 135, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=143" },
              { title: "The Mortgaged Castle", page: 141, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=149" },
              { title: "Sammy's Place", page: 154, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=162" },
              { title: "The Dove of Peace", page: 165, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=173" },
              { title: "How to Become an Imperial Presence", page: 174, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=182" },
              { title: "My Stubborn Insensitivity", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=189" },
              { title: "Detrigent", page: 191, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=199" },
              { title: "Oil-Rich Prince and Man from Grim Fastness", page: 200, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=208" },
              { title: "Not Perfidious, but Lucky", page: 207, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=215" },
              { title: "Disinformation", page: 215, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=223" },
              { title: "The Mysterious Quaker", page: 235, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=243" },
              { title: "Foxas Habbath Holu", page: 242, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=250" },
              { title: "Confidence Trick", page: 253, url: "https://idriesshahfoundation.org/pdfviewer/the-natives-are-restless/?auto_viewer=true#page=261" }
          ]
        }
      ]
    },
    "10. Fiction & Literary Works": {
      "function": "Creative literature carrying Sufi themes through narrative fiction",
      "approach": "Teaching through story while maintaining literary integrity",
      "books": [
        {
          "title": "Kara Kush",
          "main_url": "https://idriesshahfoundation.org/books/kara-kush/",
          "pdf_url": "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true",
          "description": "Shah's novel set in Afghanistan, weaving Sufi themes through adventure narrative",
          "chapters": [
              { title: "1. Ura Pobeyda – Hail Victory!", page: 23, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=42" },
              { title: "2. 'I thank the court for its clemency…'", page: 53, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=72" },
              { title: "3. Karima: 'If you push me too far…'", page: 77, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=96" },
              { title: "4. Business on the Frontier", page: 96, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=115" },
              { title: "5. A Caravan for David Callil", page: 103, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=122" },
              { title: "6. Bright Wolf", page: 111, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=130" },
              { title: "7. Noor Sharifi, Hostage", page: 117, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=136" },
              { title: "8. A Formal Case has been Initiated", page: 123, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=142" },
              { title: "9. Captain Azambai, Soviet Red Army", page: 133, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=152" },
              { title: "10. The Treasure", page: 146, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=165" },
              { title: "Book Three: Halzun, the Snail", page: 181, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=200" },
              { title: "0. Nurhan Aliyev, Uzbek Librarian", page: 183, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=202" },
              { title: "1. The Artefacts Department", page: 191, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=210" },
              { title: "2. A Passport for Tezbin, Carpenter", page: 203, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=222" },
              { title: "Book Four: Hail Jamal, Son of Zaid!", page: 213, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=232" },
              { title: "0. 'This is your mission, Jamal…'", page: 215, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=234" },
              { title: "1. 'Highness, I am Samir, servant of Akbar'", page: 222, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=241" },
              { title: "2. Send for Yunanian, the Chemist", page: 234, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=253" },
              { title: "3. Thank you, Dr Anddrews", page: 254, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=273" },
              { title: "Book Five: A Mirza in a Mulberry Tree", page: 259, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=278" },
              { title: "0. Hang the Bandit Scum!", page: 261, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=280" },
              { title: "1. Compassionate leave for Mr Khan", page: 278, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=297" },
              { title: "2. Account Paid", page: 282, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=301" },
              { title: "Book Six: Daughter of Daniyel", page: 323, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=342" },
              { title: "0. Prem Lal, KGB Rezident", page: 325, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=344" },
              { title: "1. Fazli Rabbi, Innkeeper", page: 339, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=358" },
              { title: "2. To the Castle of the Yusuf-Born", page: 346, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=365" },
              { title: "Book Seven: Ataka! Ataka! Ataka!", page: 367, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=386" },
              { title: "0. Nanpaz the Baker", page: 369, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=388" },
              { title: "1. The Whirlwind to see Colonel Slavsky", page: 376, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=395" },
              { title: "Book Eight: Nest of the Eagle", page: 389, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=408" },
              { title: "0. One hundred and fifty-eight – and volunteering", page: 391, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=410" },
              { title: "1. 'Silahdar Haidar, Weapon-Bearer, reporting, Komondon'", page: 404, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=423" },
              { title: "2. Time to move on, Big One…", page: 418, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=437" },
              { title: "3. The Fourth Battle", page: 426, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=445" },
              { title: "Book Nine: Across the Hindu Kush", page: 449, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=468" },
              { title: "0. An Izba in Nuristan", page: 451, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=470" },
              { title: "1. The Wild Ones of Murad Shah", page: 465, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=484" },
              { title: "2. Land of the Living Prince", page: 475, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=494" },
              { title: "3. We must cross Black Mountain…", page: 488, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=507" },
              { title: "4. Kara Dagh is Icebound", page: 496, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=515" },
              { title: "Book Ten: The Wolves of Turkestan", page: 505, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=524" },
              { title: "0. Like lice on a dinner plate…", page: 507, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=526" },
              { title: "1. Guerrilla City", page: 515, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=534" },
              { title: "2. The Gunboat Jihun", page: 525, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=544" },
              { title: "3. Leninised", page: 543, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=562" },
              { title: "4. March South…", page: 551, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=570" },
              { title: "Book Eleven: Southwards to Kandahar", page: 557, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=576" },
              { title: "0. Ride and Die!", page: 559, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=578" },
              { title: "1. The Mulla and the Water of Life", page: 566, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=585" },
              { title: "Book Twelve: Ekranoplan, the Sea Monsters", page: 573, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=592" },
              { title: "0. Wild Horses", page: 575, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=594" },
              { title: "1. Kandahar in Disguise", page: 581, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=600" },
              { title: "2. Council of War", page: 587, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=606" },
              { title: "Book Thirteen: Into the Abode of War", page: 595, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=614" },
              { title: "0. Target: Kandahar Airport", page: 597, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=616" },
              { title: "1. The Russians are Coming", page: 613, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=632" },
              { title: "2. Pendergood's Army, approaching the Airport", page: 615, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=634" },
              { title: "3. The Eagle's force, north of Kandahar City", page: 622, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=641" },
              { title: "4. Pendergood's Army, Kandahar Airport", page: 627, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=646" },
              { title: "5. The Eagle's force, Herat Road boundary", page: 633, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=652" },
              { title: "6. Pendergood's Army, Kandahar Airport", page: 641, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=660" },
              { title: "Book Fourteen: The Secret Weapon", page: 649, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=668" },
              { title: "0. Stand to Arms!", page: 651, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=670" },
              { title: "1. Kandahar Airport", page: 660, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=679" },
              { title: "2. The Tanks must not get through", page: 671, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=690" },
              { title: "Book Fifteen: Zoo-Bear", page: 675, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=694" },
              { title: "o The Super-Redeyes", page: 677, url: "https://idriesshahfoundation.org/pdfviewer/kara-kush/?auto_viewer=true#page=696" }
          ]
        }
      ]
    }
  }
};

// Global variables
let currentModal = null;
let searchIndex = [];

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function getBookSlug(book) {
    const url = book.main_url || book.pdf_url || '';
    const match = url.match(/\/(?:books|pdfviewer)\/([^\/\?]+)/);
    return match ? match[1] : null;
}

function initializeApp() {
  buildSearchIndex();
  renderLibrary();
  setupEventListeners();
}

// Build search index for quick searching
function buildSearchIndex() {
  searchIndex = [];
  
  Object.entries(libraryData.categories).forEach(([categoryName, categoryData]) => {
    categoryData.books.forEach(book => {
      // Add book to search index
      searchIndex.push({
        type: 'book',
        categoryName: categoryName,
        title: book.title,
        description: book.description,
        note: book.note || '',
        book: book
      });
      
      // Add chapters to search index if they exist
      if (book.chapters) {
        book.chapters.forEach(chapter => {
          searchIndex.push({
            type: 'chapter',
            categoryName: categoryName,
            bookTitle: book.title,
            title: chapter.title,
            page: chapter.page,
            url: chapter.url,
            book: book,
            chapter: chapter
          });
        });
      }
    });
  });
}

// Render the library categories and books
function renderLibrary() {
  const categoriesGrid = document.getElementById('categories-grid');
  if (!categoriesGrid) return;
  
  categoriesGrid.innerHTML = '';
  
  Object.entries(libraryData.categories).forEach(([categoryName, categoryData]) => {
    const categoryElement = createCategoryElement(categoryName, categoryData);
    categoriesGrid.appendChild(categoryElement);
  });
}

// Create category element with expand/collapse functionality
function createCategoryElement(categoryName, categoryData) {
  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'category collapsed'; // Default collapsed state
  categoryDiv.setAttribute('data-category', categoryName);
  
  const bookCount = categoryData.books.length;
  const bookCountText = bookCount === 1 ? '1 book' : `${bookCount} books`;
  
  categoryDiv.innerHTML = `
    <div class="category-header" data-category="${categoryName}">
      <button class="expand-toggle" aria-label="Expand section" data-category="${categoryName}"></button>
      <div class="category-header-content">
        <h2 class="category-title">${categoryName}</h2>
        <div class="category-function">${categoryData.function}</div>
        <div class="category-approach">${categoryData.approach}</div>
      </div>
      <div class="category-summary">
        <span class="book-count">${bookCountText}</span>
      </div>
    </div>
    <div class="category-content">
      <div class="books-grid">
        ${categoryData.books.map(book => createBookCardHTML(book)).join('')}
      </div>
    </div>
  `;
  
  return categoryDiv;
}

// Create book card HTML
function createBookCardHTML(book) {
  const hasNote = book.note && book.note.length > 0;

  // Get book slug for thumbnail lookup
  const slug = getBookSlug(book);
  const thumbnailPath = slug ? `images/thumbnails/${slug}.png` : '';

  return `
    <div class="book-card" data-book-title="${book.title}">
      ${thumbnailPath ? `
        <div class="book-thumbnail">
          <img src="${thumbnailPath}"
               alt="${book.title}"
               onerror="this.parentElement.style.display='none';">
        </div>
      ` : ''}
      <h3 class="book-title">${book.title}</h3>
      <p class="book-description">${book.description}</p>
      ${hasNote ? `<div class="book-note">${book.note}</div>` : ''}
      <div class="book-actions">
        <button class="btn btn--primary btn--sm quick-read-btn" data-pdf-url="${book.pdf_url}">
          <span class="external-icon">📖</span>Quick Read
        </button>
        <button class="btn btn--outline btn--sm view-details-btn">
          <span class="external-icon">📋</span>View Details
        </button>
      </div>
    </div>
  `;
}

// Toggle category expansion
function toggleCategory(categoryName) {
  const categoryElement = document.querySelector(`[data-category="${categoryName}"].category`);
  if (!categoryElement) return;
  
  const isCollapsed = categoryElement.classList.contains('collapsed');
  
  if (isCollapsed) {
    categoryElement.classList.remove('collapsed');
    categoryElement.classList.add('expanded');
  } else {
    categoryElement.classList.remove('expanded');
    categoryElement.classList.add('collapsed');
  }
}

// Setup event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  
  // Search functionality - direct event listeners on input element
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keyup', handleSearch); // Add keyup as backup
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        clearSearch();
      }
    });
    
    // Ensure input is not being blocked
    searchInput.addEventListener('focus', function() {
      console.log('Search input focused');
    });
  }
  
  if (searchClear) {
    searchClear.addEventListener('click', function(e) {
      e.preventDefault();
      clearSearch();
    });
  }
  
  // Event delegation for click events - but avoid interfering with input
  document.body.addEventListener('click', function(e) {
    // Skip if clicking on search input or its container
    if (e.target.closest('.search-container')) {
      return;
    }
    
    // Handle expand/collapse toggle buttons
    if (e.target.classList.contains('expand-toggle')) {
      e.preventDefault();
      e.stopPropagation();
      
      const categoryName = e.target.getAttribute('data-category');
      if (categoryName) {
        toggleCategory(categoryName);
      }
      return;
    }
    
    // Handle category header clicks (but not the toggle button)
    if (e.target.closest('.category-header') && !e.target.classList.contains('expand-toggle')) {
      e.preventDefault();
      const header = e.target.closest('.category-header');
      const categoryName = header.getAttribute('data-category');
      if (categoryName) {
        toggleCategory(categoryName);
      }
      return;
    }
    
    // Handle quick read buttons
     if (e.target.closest('.quick-read-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const button = e.target.closest('.quick-read-btn');
      const pdfUrl = button.getAttribute('data-pdf-url');
      if (pdfUrl) {
        // Use the enhanced PDF opening function
        openPDFWithFix(pdfUrl);
      }
      return;
    }
    
    // Handle view details buttons
    if (e.target.closest('.view-details-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const bookCard = e.target.closest('.book-card');
      if (bookCard) {
        const bookTitle = bookCard.getAttribute('data-book-title');
        const book = findBookByTitle(bookTitle);
        if (book) {
          openBookModal(book);
        }
      }
      return;
    }
    
    // Handle book card clicks (but not on actions)
    if (e.target.closest('.book-card') && !e.target.closest('.book-actions')) {
      e.preventDefault();
      const bookCard = e.target.closest('.book-card');
      const bookTitle = bookCard.getAttribute('data-book-title');
      const book = findBookByTitle(bookTitle);
      if (book) {
        openBookModal(book);
      }
      return;
    }
    
    // Handle search result clicks
    if (e.target.closest('.result-item')) {
      e.preventDefault();
      const resultItem = e.target.closest('.result-item');
      const resultType = resultItem.getAttribute('data-result-type');
      
      if (resultType === 'chapter') {
        const chapterUrl = resultItem.getAttribute('data-chapter-url');
        if (chapterUrl) {
          window.open(chapterUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        const bookTitle = resultItem.getAttribute('data-book-title');
        const book = findBookByTitle(bookTitle);
        if (book) {
          openBookModal(book);
        }
      }
      return;
    }
    
    // Modal close functionality
    if (e.target.id === 'modal-close' || e.target.id === 'modal-backdrop') {
      e.preventDefault();
      closeBookModal();
      return;
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentModal) {
      closeBookModal();
    }
  });
}

// Handle search input
function handleSearch(e) {
  const searchInput = e.target;
  const searchClear = document.getElementById('search-clear');
  
  if (!searchInput) return;
  
  const query = searchInput.value.trim().toLowerCase();
  console.log('Search query:', query); // Debug log
  
  if (query.length === 0) {
    clearSearch();
    return;
  }
  
  if (searchClear) {
    searchClear.classList.add('visible');
  }
  
  const results = searchIndex.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(query);
    const descMatch = item.description && item.description.toLowerCase().includes(query);
    const noteMatch = item.note && item.note.toLowerCase().includes(query);
    const bookTitleMatch = item.bookTitle && item.bookTitle.toLowerCase().includes(query);
    
    return titleMatch || descMatch || noteMatch || bookTitleMatch;
  });
  
  console.log('Search results:', results.length); // Debug log
  displaySearchResults(results, query);
}

// Display search results
function displaySearchResults(results, query) {
  const searchResults = document.getElementById('search-results');
  const resultsContainer = document.getElementById('results-container');
  const libraryContent = document.getElementById('library-content');
  
  if (!searchResults || !resultsContainer || !libraryContent) return;
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `<p>No results found for "${query}"</p>`;
  } else {
    resultsContainer.innerHTML = results.map(result => {
      if (result.type === 'book') {
        return `
          <div class="result-item" data-result-type="book" data-book-title="${result.title}">
            <div class="result-type">Book</div>
            <div class="result-title">${highlightQuery(result.title, query)}</div>
            <div class="result-description">${highlightQuery(result.description, query)}</div>
          </div>
        `;
      } else {
        return `
          <div class="result-item" data-result-type="chapter" data-book-title="${result.bookTitle}" data-chapter-url="${result.url}">
            <div class="result-type">Chapter • ${result.bookTitle}</div>
            <div class="result-title">${highlightQuery(result.title, query)} <span style="color: var(--color-text-secondary);">(Page ${result.page})</span></div>
            <div class="result-description">Click to jump directly to this chapter</div>
          </div>
        `;
      }
    }).join('');
  }
  
  searchResults.style.display = 'block';
  libraryContent.style.display = 'none';
}

// Highlight search query in text
function highlightQuery(text, query) {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark style="background: var(--color-bg-2); color: var(--color-text);">$1</mark>');
}

// Escape special regex characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Clear search
function clearSearch() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const searchResults = document.getElementById('search-results');
  const libraryContent = document.getElementById('library-content');
  
  if (searchInput) searchInput.value = '';
  if (searchClear) searchClear.classList.remove('visible');
  if (searchResults) searchResults.style.display = 'none';
  if (libraryContent) libraryContent.style.display = 'block';
}

// Find book by title
function findBookByTitle(title) {
  for (const categoryData of Object.values(libraryData.categories)) {
    const book = categoryData.books.find(b => b.title === title);
    if (book) return book;
  }
  return null;
}

// Open book modal
function openBookModal(book) {
  const bookModal = document.getElementById('book-modal');
  const modalBookTitle = document.getElementById('modal-book-title');
  const modalBookDescription = document.getElementById('modal-book-description');
  const modalReadFull = document.getElementById('modal-read-full');
  const modalBookInfo = document.getElementById('modal-book-info');
  const modalChaptersSection = document.getElementById('modal-chapters-section');
  const modalChaptersList = document.getElementById('modal-chapters-list');
  const modalBookNote = document.getElementById('modal-book-note');
  
  if (!bookModal) return;
  
  currentModal = book;
  
  if (modalBookTitle) modalBookTitle.textContent = book.title;
  if (modalBookDescription) modalBookDescription.textContent = book.description;
  if (modalReadFull) {
      modalReadFull.href = '#'; // Prevent default link behavior
      modalReadFull.onclick = function(e) {
        e.preventDefault();
        openPDFWithFix(book.pdf_url);
      };
    }
  if (modalBookInfo) modalBookInfo.href = book.main_url;
  
  // Handle chapters
  if (book.chapters && book.chapters.length > 0 && modalChaptersSection && modalChaptersList) {
    modalChaptersSection.style.display = 'block';
    modalChaptersList.innerHTML = book.chapters.map(chapter => `
      <a href="${chapter.url}" class="chapter-item" target="_blank" rel="noopener noreferrer">
        <span class="chapter-title">${chapter.title}</span>
        <span class="chapter-page">Page ${chapter.page}</span>
      </a>
    `).join('');
  } else if (modalChaptersSection) {
    modalChaptersSection.style.display = 'none';
  }
  
  // Handle book note
  if (book.note && modalBookNote) {
    modalBookNote.style.display = 'block';
    const noteText = modalBookNote.querySelector('.note-text');
    if (noteText) noteText.textContent = book.note;
  } else if (modalBookNote) {
    modalBookNote.style.display = 'none';
  }
  
  bookModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
  // Focus management for accessibility
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    setTimeout(() => modalClose.focus(), 100);
  }
}

// Close book modal
function closeBookModal() {
  const bookModal = document.getElementById('book-modal');
  if (!bookModal) return;
  
  currentModal = null;
  bookModal.classList.add('hidden');
  document.body.style.overflow = '';
}
