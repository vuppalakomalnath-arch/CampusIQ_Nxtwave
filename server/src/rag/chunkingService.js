const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

class ChunkingService {
  constructor() {
    this.defaultChunkSize = 800; // Optimal for college document paragraphs
    this.defaultChunkOverlap = 150;
  }

  async splitDocument(text, metadata = {}, options = {}) {
    const chunkSize = options.chunkSize || this.defaultChunkSize;
    const chunkOverlap = options.chunkOverlap || this.defaultChunkOverlap;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n\n', '\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' '],
    });

    const docs = await splitter.createDocuments([text]);

    return docs.map((doc, idx) => {
      // Extract possible heading from the first line of chunk if markdown or title formatted
      const firstLine = doc.pageContent.split('\n')[0].trim();
      const isHeading = firstLine.startsWith('#') || (firstLine.length < 60 && /^[A-Z0-9\s:.-]+$/.test(firstLine));
      const heading = isHeading ? firstLine.replace(/^[#\s]+/, '') : (metadata.title || '');

      return {
        text: doc.pageContent.trim(),
        chunkIndex: idx,
        pageNumber: metadata.pageNumber || Math.floor(idx / 4) + 1,
        heading: heading.slice(0, 120),
        metadata: {
          documentTitle: metadata.title || '',
          originalFilename: metadata.originalFilename || '',
          mimeType: metadata.mimeType || '',
          collectionSlug: metadata.collectionSlug || '',
          sourceUrl: metadata.sourceUrl || '',
        },
      };
    });
  }
}

module.exports = new ChunkingService();
