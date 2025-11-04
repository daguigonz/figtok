import { ExportOption } from "../types/figma.type"
import {
  FigmaCollection,
  FigmaVariable,
  ToCssParams
} from "../interfaces/figma.interface"

const getExportOptions = (): ExportOption[] => {
  return ["Css", "Tokens", "Color"]
}

/**
 * Converts normalized RGB values to a hexadecimal color string.
 *
 * Each RGB component (r, g, b) is expected to be a number between 0 and 1.
 * The function multiplies each component by 255, rounds it to the nearest
 * integer, converts it to a two-character hexadecimal string, and concatenates
 * the result into a valid hex color.
 *
 * Example:
 * ```ts
 * rgbtohex(1, 0.5, 0); // returns "#ff8000"
 * ```
 *
 * @param {number} r - Red component (range: 0 to 1)
 * @param {number} g - Green component (range: 0 to 1)
 * @param {number} b - Blue component (range: 0 to 1)
 * @returns {string} Hexadecimal color string (e.g. "#ffcc00")
 */
const rgbtohex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Cleans and formats a given string for use in URLs or file names.
 *
 * This function performs the following transformations:
 * 1. Removes accents and replaces "ñ" with "n".
 * 2. Removes all special characters except letters, numbers, spaces, and slashes (/).
 * 3. Replaces slashes (/) with hyphens (-).
 * 4. Replaces spaces with hyphens (-).
 * 5. Converts the final string to lowercase.
 *
 * Example:
 * ```ts
 * fixText("Señal / Número 100%") // returns "senal-numero-100"
 * ```
 *
 * @param {string} texto - The input text to be cleaned and formatted.
 * @returns {string} A lowercase, hyphenated, special-character-free string.
 */
const fixText = (texto: string): string => {
  if (!texto) {
    return ""
  }
  // Step 1: remove accents and convert ñ to n
  const normalizedText: string = texto
    .normalize("NFD") // decompose
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")

  // Step 2: remove special characters except letters, numbers, spaces, and /
  const noSpecialCharacters: string = normalizedText.replace(
    /[^a-zA-Z0-9 \/]/g,
    ""
  )

  // Step 3: replace / with -
  const replacedSlashes: string = noSpecialCharacters.replace(/\//g, "-")

  // Step 4: replace spaces with -
  const replacedSpaces: string = replacedSlashes.replace(/ /g, "-")

  // Step 5: convert to lowercase
  const finalText: string = replacedSpaces.toLowerCase()

  return finalText
}

/**
 * Normalizes Figma collections and variables into a structured object.
 *
 * @template T - A list of Figma variable collections.
 * @param {T} dataFigma - The array of Figma collections to normalize.
 * @returns {Record<string, unknown>} A structured object with normalized collection and variable names.
 */
const normalizeCollectionsAndVariables = <T extends FigmaCollection[]>(
  dataFigma: T
): Record<string, unknown> => {
  const tokenObject = dataFigma.reduce(
    (tokenBuilder, collection) => {
      tokenBuilder[fixText(collection.name)] = collection.variables.reduce(
        (vars, variable) => {
          const variableName = fixText(variable.name)

          const value =
            variable.resolvedType === "COLOR"
              ? rgbtohex(variable.value.r, variable.value.g, variable.value.b)
              : variable.value

          let type = variable.resolvedType.toLowerCase()
          if (type === "float") type = "number"

          vars[variableName] = {
            value: value,
            type: type
          }

          return vars
        },
        {} as Record<string, any>
      )

      return tokenBuilder
    },
    {} as Record<string, any>
  )

  return tokenObject
}

/**
 * Applies presets to the normalized Figma data, creating a flat key-value object for CSS variables.
 * It filters variables based on type (color, number) and formats them with a prefix.
 *
 * @param {Record<string, any>} data - The normalized Figma data object.
 * @param {ToCssParams} params - Parameters for filtering and formatting, like prefix, and flags for including collections, colors, or numbers.
 * @returns {Record<string, any>} A flat object of CSS custom properties.
 */
const applyPresets = (
  data: Record<string, any>,
  params: ToCssParams
): Record<string, any> => {
  const prefix = params.prefix ?? "--"
  const newVariables = Object.entries(data).flatMap(
    ([collectionName, variables]: [string, any]) =>
      Object.entries(variables as Record<string, any>)
        .filter(
          ([, { type }]: [string, { type: string }]) =>
            (params.filterColors && type === "color") ||
            (params.filterNumber && type === "number")
        )
        .map(
          ([variableName, { value, type }]: [
            string,
            { value: any; type: string }
          ]): [string, string] => {
            const newKey = [
              prefix,
              params.includeCollections ? collectionName : "",
              variableName
            ]
              .filter(Boolean)
              .join("-")
            const newValue = type === "number" ? `${value}px` : value
            return [newKey, newValue]
          }
        )
  )

  return Object.fromEntries(newVariables)
}

/*
 * Filters the Figma data to only include the "Colors" collection.
 *
 * @param {FigmaCollection[]} dataFigma - The array of Figma collections to filter.
 * @returns {FigmaCollection[]} An array of Figma collections that match the "Colors" name.
 */
const filterColors = (dataFigma: FigmaCollection[]): FigmaCollection[] => {
  return dataFigma.filter(collection => collection.name === "Colors")
}

/**
 * Transforms a list of Figma variable collections into a CSS `:root` block.
 * This function specifically processes variables of type 'color' and 'number'.
 *
 * @template T - A list of Figma variable collections.
 * @param {T} dataFigma - The array of Figma collections to transform.
 * @param {ToCssParams} params - Parameters for CSS conversion, like an optional prefix and a flag to include collection names.
 * @returns {string} A formatted CSS string containing all 'color' and 'number' variables under a `:root` block.
 *
 * @example
 * const css = toCss(figmaCollections, { prefix: "--theme", includeCollections: true });
 * console.log(css);
 * // :root {
 * //   --theme-colors-primary: #ff0000;
 * //   --theme-spacing-md: 16px;
 * // }
 */
const toCss = <T extends FigmaCollection[]>(
  dataFigma: T,
  params: ToCssParams
): string => {
  const normalizedData = normalizeCollectionsAndVariables(dataFigma)
  const presetsData = applyPresets(normalizedData, {
    ...params,
    filterColors: true,
    filterNumber: true
  })
  const cssVariables = Object.entries(presetsData).map(
    ([key, value]: [string, string]) => `    ${key}: ${value};`
  )
  return [":root {", ...cssVariables, "}"].join("\n")
}

/**
 * Converts Figma variable collections into a structured JSON Design Tokens format.
 *
 * Each variable is normalized with a `$value` and `$type` property. Colors are converted to hexadecimal,
 * and type names are adapted to common token conventions (e.g. "FLOAT" becomes "number").
 *
 * @template T - A list of Figma variable collections.
 * @param {T} dataFigma - The array of Figma collections to convert.
 * @returns {string} A JSON string representing the design tokens.
 *
 * @example
 * const json = toTokens(figmaCollections);
 * console.log(json);
 * // {
 * //   "colors": {
 * //     "primary": {
 * //       "$value": "#ff0000",
 * //       "$type": "color"
 * //     }
 * //   }
 * // }
 */
const toTokens = <T extends FigmaCollection[]>(dataFigma: T): string => {
  const normalizedData = normalizeCollectionsAndVariables(dataFigma)
  return JSON.stringify(normalizedData, null, 2).replace(/"([^"]+)":/g, "$1:")
}

/**
 * Builds a color palette from Figma collections, transforming variables into a flat key-value object.
 *
 * This function processes Figma variables, normalizes them, and then applies presets
 * to generate CSS-like variable names (e.g., '--c-colors-primary'). It can also filter
 * to include only color variables based on the params.
 *
 * @template T - A list of Figma variable collections.
 * @param {T} dataFigma - The array of Figma collections to convert.
 * @param {ToCssParams} params - Parameters for conversion, including prefix and filtering options.
 * @returns {Record<string, any>} A flat object where keys are CSS custom property names and values are the color values.
 */
const toColorPalette = <T extends FigmaCollection[]>(
  dataFigma: T,
  params: ToCssParams
): Record<string, any> => {
  const normalizedData = normalizeCollectionsAndVariables(dataFigma)
  const presetsData = applyPresets(normalizedData, {
    ...params,
    filterColors: true
  })
  return presetsData
}

/**
 * Merges Figma collections and variables into a single array of objects.
 *
 * @template T - A list of Figma collections.
 * @template U - A list of Figma variables.
 * @param {T} collections - The array of Figma collections to merge.
 * @param {U} variables - The array of Figma variables to merge.
 * @returns {FigmaCollection[]} An array of merged Figma collections and variables.
 */
const mergeCollectionsAndVariables = (
  collections: any[],
  variables: any[]
): FigmaCollection[] => {
  const tokens: FigmaCollection[] = []

  // Map over collections
  collections.map(collection => {
    // Map over variables
    const newVariables: FigmaVariable[] = collection.variableIds
      .map((variableId: string) => {
        const variable = variables.find(v => v.id === variableId)
        if (variable) {
          return Object.assign({}, variable, {
            name: variable.name,
            value: variable.valuesByMode[Object.keys(variable.valuesByMode)[0]],
            resolvedType: variable.resolvedType
          })
        }
        return undefined
      })
      .filter(
        (variable: any): variable is FigmaVariable => variable !== undefined
      )

    // Create a new collection object with the desired structure
    const newCollection: FigmaCollection = {
      id: collection.id,
      name: collection.name,
      variables: newVariables,
      variableIds: collection.variableIds
    }

    tokens.push(newCollection)
  })

  return tokens
}

export {
  getExportOptions,
  filterColors,
  toTokens,
  toCss,
  toColorPalette,
  mergeCollectionsAndVariables
}
