# Add request logging with timing

**Labels:** enhancement, observability

> Demo note: start the coding agent on this ~30 min before the demo so a finished PR is ready
> to walk through in Act 5.

## Acceptance criteria
- [ ] Middleware logs method, path, status code and duration (ms) for every request
- [ ] Log format is JSON when `LOG_FORMAT=json`, plain text otherwise
- [ ] Never log request bodies (they may contain document content)
- [ ] Test asserts a log record is emitted with the expected fields
