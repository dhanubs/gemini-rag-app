def split_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    """Split text into word-based chunks with the requested overlap."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than zero")
    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be between zero and chunk_size - 1")

    words = text.split()
    if not words:
        return []

    step = chunk_size - chunk_overlap
    chunks = []
    for start in range(0, len(words), step):
        chunk = words[start : start + chunk_size]
        if chunk:
            chunks.append(" ".join(chunk))
        if start + chunk_size >= len(words):
            break
    return chunks