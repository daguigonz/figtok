import type { Preview } from "@storybook/react-vite"
import type { Decorator } from "@storybook/react"
import { useEffect } from "react"
import "@/App.css"
import "@/css/reset.css"
import "@/css/utils.css"

// @detect dark mode in the preview
const withTheme: Decorator = (Story, context) => {
  const { backgrounds } = context.globals

  useEffect(() => {
    let isDark = false

    if (backgrounds) {
      isDark =
        backgrounds.value === "#2c2c2c" ||
        backgrounds.value === "rgb(44, 44, 44)" ||
        backgrounds.value === "dark" ||
        backgrounds === "dark"
    }

    // apply dark mode
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    )

    document.body.setAttribute("data-theme", isDark ? "dark" : "light")
  }, [backgrounds])

  return Story()
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      run: true
    },
    options: {
      storySort: {
        order: ["Intro", "Design Tokens", "Components"]
      }
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff"
        },
        {
          name: "dark",
          value: "#2c2c2c"
        }
      ]
    },
    docs: {
      source: {
        type: "code" // 'code' | 'dynamic' | 'auto'
      },
      canvas: {
        sourceState: "shown" // 'shown' | 'hidden' | 'none'
      }
    },
    toolbar: {
      title: { hidden: false },
      zoom: { hidden: false },
      eject: { hidden: false },
      copy: { hidden: false },
      fullscreen: { hidden: false }
    }
  },
  decorators: [withTheme],
  tags: ["autodocs"]
}

export default preview
