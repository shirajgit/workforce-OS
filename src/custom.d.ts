declare module "*.jsx" {
  import type { ComponentType, ReactNode } from "react";

  export const Icon: ComponentType<{ name: string; size?: number }>;
  export const Spinner: ComponentType<{ lg?: boolean }>;
  export const Badge: ComponentType<{ label: string }>;
  export const Avatar: ComponentType<{ name: string; size?: string }>;
  export const Modal: ComponentType<{ title: string; onClose: () => void; children: ReactNode }>;
  export const Confirm: ComponentType<{ message: string; onConfirm: () => void; onCancel: () => void }>;
  export const Empty: ComponentType<{ icon: string; title: string; sub: string }>;
}
