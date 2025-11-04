import type { Meta, StoryObj } from "@storybook/react"
import { ArrowRight, Download } from "lucide-react"
import { Button } from "./Button"

const icons = {
  None: null,
  Download: <Download size={16} />,
  ArrowRight: <ArrowRight size={16} />,
};

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered"
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "active",
        "secondary",
        "outline",
        "danger",
        "text",
        "link"
      ]
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"]
    },
    disabled: {
      control: "boolean"
    },
    onClick: { action: "clicked" },
    startIcon: {
      options: Object.keys(icons),
      mapping: icons,
      control: {
        type: 'select',
      },
    },
    endIcon: {
      options: Object.keys(icons),
      mapping: icons,
      control: {
        type: 'select',
      },
    },
  }
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Button",
    disabled: false
  }
}

export const Icon: Story = {
  args: {
    variant: "primary",
    children: "Button",
    disabled: false,
    startIcon: "Download",
    endIcon: "None",
  } as any,
}