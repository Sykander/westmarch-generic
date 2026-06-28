Performs a configured job skill check and applies the server's reward rules.

Usage: `!job <skill> [bonuses]`

The skill is matched against the configured allowed skill list, or the standard
skill list when no allow-list is set. If
`subsystems.economy.config.job_location_policy` is `warn` or `check`, the
command also checks the character's current location: `location.commands.job`
must be `True`, and configured job rows can restrict which skills are listed
there.

Use `!job help` for server-aware runtime help.

Configured under: `subsystems.economy.commands.job`,
`subsystems.economy.command_config.job`, and `subsystems.economy.config`.
