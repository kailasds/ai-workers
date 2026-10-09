import { createCn } from 'cn/config'

// The type-scale utilities (index.css @theme) are font sizes, and the extra colour tokens are
// colours. Without this, merging `text-meta` with `text-primary-strong` drops one of them.
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['page', 'section', 'item', 'body', 'meta', 'overline'] }],
      'text-color': [{ text: ['primary-soft', 'primary-strong', 'subtle-foreground', 'identity', 'identity-foreground', 'part-skill', 'part-language', 'part-eval', 'brand', 'brand-foreground', 'success', 'warning', 'info', 'sidebar-muted'] }],
    },
  },
})
