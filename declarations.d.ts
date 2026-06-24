// Ambient module declarations.
// TypeScript 6 (error TS2882) requires a type declaration for side-effect imports
// of non-code assets such as global CSS (`import './globals.css'`). Next.js handles
// the actual bundling; this declaration just satisfies the type-checker.
declare module '*.css';
