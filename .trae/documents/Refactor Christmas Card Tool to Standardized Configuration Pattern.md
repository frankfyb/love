I have analyzed the current code structure in `app/tools/christmas-card`. The current implementation separates configuration data (`DEFAULT_CONFIG`) from its UI description (`CONFIG_METADATA`).

To meet your request for a **standardized configuration instance**, I propose refactoring the code to implement a "Unified Configuration Pattern".

### Plan: Implement Standardized Configuration System

**1. Unified Configuration Definition (`config.ts`)**
*   **Goal**: Merge data and metadata into a single source of truth.
*   **Change**: Define a `ConfigSchema` object where each key contains both its `defaultValue` and its UI properties (`label`, `type`, `min`, `max`, etc.).
*   **Benefit**: Adding a new config item only requires editing one place. Type safety is derived automatically.

**2. Configuration Manager (`useConfig.ts`)**
*   **Goal**: Centralize state management logic.
*   **Change**: Create a custom hook `useConfig(schema)` that:
    *   Initializes state from the schema's default values.
    *   Provides a type-safe `update(key, value)` function.
    *   Exports a `metaList` for the UI to render.
    *   (Optional) Handles URL query parameter syncing or local storage in the future.

**3. Auto-Rendering Configuration Panel (`ConfigUI.tsx`)**
*   **Goal**: Render UI strictly based on the schema.
*   **Change**: Update the component to accept the `metaList` and `update` function from the manager, making it a pure component that knows nothing about specific business logic, only data types (slider, color, text).

**4. Display Layer Integration (`page.tsx` & `DisplayUI.tsx`)**
*   **Goal**: Connect the Manager to the View.
*   **Change**:
    *   Create/Update `page.tsx` to use the `useConfig` hook.
    *   Pass the reactive `config` object to `DisplayUI`.
    *   Pass `metaList` and `update` to `ConfigUI`.

### Execution Steps
1.  **Refactor `config.ts`**: Re-write to use the unified `ConfigSchema` pattern.
2.  **Create `useConfig.ts`**: Implement the state management hook.
3.  **Update `ConfigUI.tsx`**: Adapt to the new schema structure.
4.  **Create `page.tsx`**: Assemble the components to complete the demo.
