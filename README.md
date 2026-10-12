# desktop-ui

![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

**A starter template for scalable React applications.** Clone it, customize it, and start building serious projects without reinventing architecture, testing, or documentation.

This project aims to provide a scalable starting point for large React applications, emphasizing modular architecture, isolated state domains, and maintainable testing infrastructure.

- **Modular architecture** – Feature-based structure, dynamic reducer injection, lazy loading
- **Documentation** – [Architecture](./docs/ARCHITECTURE.md), [ADRs](./docs/decisions/0001-dynamic-reducer-injection.md), [Best Practices](./docs/BEST_PRACTICES.md), and [full index](#-documentation)
- **Testing infrastructure** – Jest, React Testing Library, Playwright E2E, memory/performance tests

Built with React, TypeScript, and Redux. PWA-ready. → [Full docs index](#-documentation)

---

## 🚀 Quick Start

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd desktop-ui
npm install
```

Start the development server:

```bash
npm run start
```

Run tests:

```bash
npm run test:unit      # Unit tests (Jest)
npm run test:e2e       # E2E tests (Playwright)
npm run test:all       # Unit + E2E
```

---

## 🧠 Why This Starter Exists

Most React starters are either too minimal (no structure) or too opinionated (framework lock-in). Large applications often hit the same problems:

- **Global state bloat** – Every feature adds to a single Redux store
- **Unclear module boundaries** – Features become interdependent, changes get risky
- **No testing story** – E2E and performance tests bolted on later
- **Scaling pain** – Initial bundle grows, teams step on each other

This starter provides a structured foundation for building scalable React applications without reinventing architecture or tooling.

---

## 👥 Who This Is For

This starter is designed for:

- Teams building large React applications
- SaaS platforms and dashboards
- Multi-team frontend development
- Long-lived frontend platforms

---

## 🏗 Architectural Goals

The main objectives were:

- Feature-based module boundaries
- Isolated state domains per module
- Dynamic feature injection
- Lazy loading & performance-aware rendering
- Scalable structure for independent evolution

---

## ⚙️ How It Works (Quick Overview)

1. The application boots with a minimal core.
2. Features are dynamically loaded when required.
3. Each feature injects its own reducer into the store.
4. State remains isolated to prevent global coupling.
5. Unused modules are not part of the initial bundle.

```
     Application Core (App, Store, Router)
                    │
                    ▼
            Component Loader (feature registry)
                    │
        ┌───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼
     Counter    FormEditor    Notes      Timer
     Module      Module      Module     Module
   (lazy)      (lazy)      (lazy)     (lazy)
```

---

## 📂 Example Feature Module
Each feature is self-contained. When you add a new feature, follow this structure:

```
src/features/MyFeature/
├── __tests__/
│   ├── unit/           # Jest unit tests
│   │   └── MyFeature.test.tsx
│   └── e2e/            # Playwright E2E tests (optional)
│       └── my-feature.spec.ts
├── MyFeature.tsx       # Main component
├── MyFeatureSlice.ts   # Redux slice (optional)
├── MyFeature.module.css
└── README.md           # Feature docs (optional)
```

Register the feature in `src/core/utils/componentLoader.ts` and add a button in the header. See [Module System](./docs/FEATURE_COMPONENTS.md) for details.

---

## 📦 Core Concepts

### 1️⃣ Feature-Based Structure

Each feature is treated as an independent module with:

- Its own state logic
- Clear responsibility
- Encapsulated domain boundaries

This reduces cross-feature coupling.

---

### 2️⃣ Dynamic Reducer Injection

Instead of a single monolithic global store, reducers are injected dynamically as modules are loaded.

Benefits:
- Prevents unnecessary state bloat
- Improves scalability
- Allows independent feature evolution

Trade-off:
- Slightly increased architectural complexity

---

### 3️⃣ Lazy Loading

Modules are loaded on demand using dynamic imports.

Benefits:
- Reduced initial bundle size
- Improved perceived performance
- Better scalability for large systems

---

### 4️⃣ Performance & Memory Awareness

The architecture enforces controlled rendering boundaries and encourages explicit module ownership through:

- Isolated module lifecycles
- Reduced unnecessary global state updates
- Memory-aware cleanup patterns

---

## 🔌 PWA Support

The project includes Progressive Web App configuration to explore:

- Offline readiness
- Caching strategies
- Production-like deployment behavior

---

## ⚖️ Trade-Offs

This architecture increases:

- Structural complexity
- Initial setup overhead
- Mental model requirements for contributors

It is not ideal for:

- Small applications
- Rapid prototypes
- Simple CRUD dashboards

It is intended for:
- Large enterprise systems
- Multi-team development environments
- Long-term maintainability focus

---

## 🚀 When to Use This Pattern

Consider this approach when:

- The application is expected to grow significantly
- Multiple teams (3+) contribute to the same frontend
- Feature isolation is critical for independent releases
- Long-term maintainability outweighs initial simplicity
- You've experienced the pain of refactoring a 100k+ LOC monolithic SPA

---

## 🧪 Testing Strategy

- Unit testing with Jest
- Component testing
- E2E testing with Playwright
- Architectural boundaries validated via modular isolation

---

## 🔭 Future Exploration

Potential areas of expansion:

- Runtime module federation comparison
- Independent deployment pipelines
- Advanced performance instrumentation
- DevTools visualization of injected modules

---

## 📌 Using This Starter

Use this as your foundation. The architecture, docs, and tests are there so you can start a serious project without bootstrapping from scratch. Adapt patterns to your needs; the structure is meant to scale with you.

---

## 📚 Documentation

### Architecture
- [Architecture Overview](./docs/ARCHITECTURE.md) – Patterns, structure, and design decisions
- [Module System](./docs/FEATURE_COMPONENTS.md) – How to add and structure features
- [State Management](./docs/MIDDLEWARE_PERSISTENCE.md) – Persistence and reducer injection  
- [Architecture Decision Records](./docs/decisions/0001-dynamic-reducer-injection.md) – ADRs for key choices (reducer injection, storage, error boundaries)

### Development
- [Best Practices](./docs/BEST_PRACTICES.md) – Code quality and conventions
- [Configuration](./docs/CONFIGURATION.md) – Environment and settings
- [Debugging](./docs/DEBUGGING.md) – Breakpoints and dev setup
- [API & Hooks](./docs/API_DOCUMENTATION.md) – Hooks and utilities reference
- [PWA Guide](./docs/PWA_GUIDE.md) – Progressive Web App setup

### Testing
- [E2E Tests](./docs/WINDOW_INTERACTIONS_TESTS.md) – Playwright and window interaction patterns
- [Performance Testing](./docs/PERFORMANCE.md) – Web Vitals, optimization, and memory testing

### Features & Reference
- [Implemented Features](./docs/IMPLEMENTED_FEATURES.md) – Current feature set
- [Mock API](./docs/MOCK_API.md) – Mock API for FormEditor and demos
- [Shared Forms](./src/shared/forms/README.md) – Reusable form components

---

## 📬 Feedback

I welcome discussions and architectural feedback from other engineers exploring modular SPA or micro-frontend strategies.
