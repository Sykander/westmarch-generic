Searches configured library or book sources available to the server.

Usage: `!library <topics> [comprehend] [bonuses]`

Topic input depends on `subsystems.content.config.library_topic_source`: manual/restricted modes require player topics, while inferred/balanced modes can use the character's current location and reading history. Book and catalogue names use the shared lookup behavior: no matches, exactly one match, or a request to be more specific with a short match list.

Use `!library help` for server-aware runtime help.

Configured under: `Content -> library`
