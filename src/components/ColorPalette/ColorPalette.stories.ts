import type { Meta, StoryObj } from "@storybook/react"
import { ColorPalette } from "./ColorPalette"

const meta = {
  title: "Components/ColorPalette",
  component: ColorPalette,
  tags: ["autodocs"],
  parameters: {
    layout: "centered"
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["base"]
    },
    values: {
      control: "object"
    }
  }
} satisfies Meta<typeof ColorPalette>

export default meta
type Story = StoryObj<typeof meta>

export const Base: Story = {
  args: {
    variant: "base",
    values: {
      "Primary Color": "#007AFF",
      "Secondary Color": "#FF00FF",
      "Tertiary Color": "#00FFFF",
      "Quaternary Color": "#FF0000",
      "Quinary Color": "#0000FF",
      "Senary Color": "#FFFF00",
      "Septenary Color": "#000000",
      "Octenary Color": "#FFFFFF"
    }
  }
}
