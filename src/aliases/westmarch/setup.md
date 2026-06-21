Creates or refreshes the server's `westmarch_config` binding.

Usage: `!westmarch setup <config gvar id>`

The setup command stores the gvar id that contains your server configuration. Server-specific data should live in that config gvar, not hard-coded inside aliases.

After setup, use the web config editor Check page for validation and `!westmarch show` for a Discord-side summary.

Configured under: `Admin -> setup`
