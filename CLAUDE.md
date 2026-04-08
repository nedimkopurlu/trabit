<!-- GSD:project-start source:PROJECT.md -->
## Project

**Trabit**

Trabit, tek kullanıcılı bir alışkanlık takip PWA'sıdır. Google Auth ile giriş yapılır, alışkanlıklar bugün/seri/ayarlar üç sekmesinde yönetilir. iPhone ana ekranına kurulum desteği ile günlük, hafta içi veya hafta sonu alışkanlıkları takip edilir; her tamamlamada micro-animasyon ve kişisel bir kimlik mesajı gösterilir.

**Core Value:** Kullanıcı, o güne ait alışkanlıklarını hızla görmeli, tamamlamalı ve serisinin kırılmadığını anında hissetmelidir.

### Constraints

- **Tech Stack:** Next.js 14 + Firebase + Tailwind + Framer Motion — değiştirilemez
- **Deployment:** Vercel — CI/CD sağlar
- **Platform:** iPhone PWA birinci öncelik — iOS Safari kısıtları (bildirim, arka plan sync) gözetilmeli
- **Kullanıcı:** Tek hesap — multi-tenant tasarım gereksiz
- **Veri:** Firestore gerçek zamanlı sync — offline destek next-pwa ile
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
