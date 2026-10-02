class UnsupportedDocumentTypeError(ValueError):
    """Raised when an upload has an unsupported file extension."""


class InvalidDocumentError(ValueError):
    """Raised when uploaded content cannot be decoded or parsed."""


class EmptyDocumentError(ValueError):
    """Raised when a document contains no extractable text."""