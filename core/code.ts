import { mergeCollectionsAndVariables } from "../src/utils/figTok"

/*
 * Figma UI
 * https://www.figma.com/plugin-docs/api/properties/showui/
 *
 * Show the UI
 */
const settingsFigmaUI = {
  themeColors: true,
  height: 620, // Initial height
  width: 600
}

figma.showUI(__html__, settingsFigmaUI)

/*
 * Figma listeners
 * https://www.figma.com/plugin-docs/api/properties/onmessage/
 *
 * The "onmessage" method returns an object.
 * The "type" variable can be used to identify the type of message.
 */
figma.ui.onmessage = async (msg: any) => {
  try {
    switch (msg.type) {
      case "request-figma":
        handle_figma()
        break

      case "ui-resize": {
        resizeFigma(msg.height)
        break
      }

      default:
        console.error("Figma:", msg.type)
    }
  } catch (error) {
    figma.ui.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

const resizeFigma = (newHeight: number) => {
  const requestedHeight = Math.ceil(Number(newHeight))
  if (!Number.isNaN(requestedHeight) && requestedHeight > 0) {
    figma.ui.resize(settingsFigmaUI.width, requestedHeight)
  }
}

const handle_figma = async () => {
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync()
    const variables = await figma.variables.getLocalVariablesAsync()
    const data = mergeCollectionsAndVariables(collections, variables)

    figma.ui.postMessage({
      type: "data-figma",
      data
    })
  } catch (error) {
    figma.ui.postMessage({
      type: "error",
      message:
        "Error getting collections: " +
        (error instanceof Error ? error.message : "Error desconocido")
    })
  }
}
