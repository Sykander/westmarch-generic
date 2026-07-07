Creates or refreshes the server's `westmarch_config` binding.

Usage:

```text
!westmarch setup
!westmarch setup <config gvar id>
!westmarch setup <page>
```

The setup command shows setup guidance. With a gvar id, it prints the copy-paste svar command for binding the server to that config. Server-specific data should live in that config gvar, not hard-coded inside aliases.

After setup, use the web config editor Check page for validation and `!westmarch show` for a Discord-side summary.

Configured under: `Admin -> setup`
