# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e5]:
    - generic [ref=e8]:
      - heading "Login" [level=1] [ref=e9]
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: "Username:"
          - textbox "Username:" [ref=e14]
        - button "Continue" [ref=e15] [cursor=pointer]
  - generic:
    - img
  - generic:
    - generic:
      - generic:
        - button "Go to parent" [disabled]
        - button "Open in editor"
        - button "Close"
  - generic [ref=e16]:
    - button "Toggle Nuxt DevTools" [ref=e17] [cursor=pointer]:
      - img [ref=e18]
    - generic "Page load time" [ref=e21]:
      - generic [ref=e22]: "1.5"
      - generic [ref=e23]: s
    - button "Toggle Component Inspector" [ref=e25] [cursor=pointer]:
      - img [ref=e26]
```