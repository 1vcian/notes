export function createNewFile(files, initialContent = '') {
    return {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: generateName(files, initialContent),
        content: initialContent,
        updated: Date.now()
    };
}

export function generateName(files, content) {
    if (!content.trim()) return getUniqueName(files, "Untitled Note");
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
    if (!firstLine) return getUniqueName(files, "Untitled Note");
    return getUniqueName(files, firstLine.substring(0, 40));
}

export function getUniqueName(files, baseName, currentId = null) {
    let finalName = baseName;
    let counter = 1;
    // Check if any existing file (except the current one) has this exact name
    while (files.some(f => f.name === finalName && f.id !== currentId)) {
        finalName = `${baseName} - ${counter}`;
        counter++;
    }
    return finalName;
}

// Compression Utilities using fflate
export function compressToURL(text) {
    if (!text) return '';
    try {
        const uint8array = new TextEncoder().encode(text);
        // Using fflate zlib sync compression
        const compressed = fflate.zlibSync(uint8array, { level: 9 });
        // Convert to Base64
        const base64 = btoa(String.fromCharCode.apply(null, compressed));
        // Make Base64 URL Safe
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
        console.error("Compression error", e);
        return '';
    }
}

export function decompressFromURL(hash) {
    if (!hash) return null;
    try {
        // We first need to check if this is an old LZString hash for backward compatibility.
        // Simple heuristic: Base64 URL Safe strings don't contain common English words usually, 
        // but it's safer to just try decoding with fflate first, and fallback to LZString if it fails.
        // However, we removed LZString entirely to save space, so old URLs might break without the polyfill.
        // For now, let's assume all new hashes are fflate.

        let compressed = hash;
        if (hash.includes('|')) compressed = hash.split('|')[1];

        // Convert Base64 URL Safe back to standard Base64
        let base64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Decompress
        const decompressedBytes = fflate.unzlibSync(bytes);
        return new TextDecoder().decode(decompressedBytes);
    } catch (e) {
        console.error("Decompression error", e);
        return null;
    }
}
