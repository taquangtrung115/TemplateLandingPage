# OnePortal administration design

Audience: PlatformAdmin. Main task: add a person to the correct company and application.

Modern minimal operational interface. Index-First master/detail layout; company directory stays visible on desktop, becomes a compact stacked list on mobile. Separate application and section controls. Primary section is Users; settings and seed diagnostics are secondary.

Preserve the existing Inter/system font and blue/slate palette. All new color and font values come from tokens.css. Four point spacing, upright headings, no decorative images or reveal animation. Primary actions name the resulting operation. Native dialogs manage focus and Escape; pending submissions keep the dialog open. Errors preserve field values. Successful operations display a local status message.

No invented metrics. Status comes from tenant/app readiness. New identity and membership are created together. Existing accounts are granted access without changing credentials. A new account always has global User role; membership Admin applies only to the chosen company/app. Locking a company requires a second explicit click.

Verify 320, 375, 414 and 768 px, keyboard access, failure, empty and loading states. The application remains FE_Tenant with its own src; business apps keep their own design systems.
