import React from "react"
import { forwardRef, useCallback } from "react"
import { cva } from "class-variance-authority"
import { clsx } from "clsx"
import styles from "./Button.module.css"
import type { ButtonProps, ButtonRef } from "./Button.type"

// Config Buttons CVA - https://cva.style/docs/config
export const buttonVariants = cva(styles.base, {
  variants: {
    variant: {
      primary: styles.primary,
      active: styles.active,
      secondary: styles.secondary,
      outline: styles.outline,
      danger: styles.danger,
      text: styles.text,
      link: styles.link
    },
    size: {
      small: styles.small,
      medium: styles.medium,
      large: styles.large
    },
    fullWidth: {
      true: styles.fullWidth
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "medium",
    fullWidth: false
  }
})

// <Button>
export const Button = forwardRef<ButtonRef, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      children,
      startIcon,
      endIcon,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    // click
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isLoading || disabled) {
          e.preventDefault()
          return
        }
        onClick?.(e)
      },
      [onClick, isLoading, disabled]
    )

    const isDisabled = isLoading || disabled
    const clsWidth: string = fullWidth ? styles.fullWidth : styles.autoWidth

    return (
      <button
        className={clsx(buttonVariants({ variant, size }), clsWidth, className)}
        disabled={isDisabled}
        onClick={handleClick}
        aria-disabled={isDisabled}
        data-loading={isLoading ? "true" : undefined}
        {...props}
      >
        {!isLoading && startIcon && (
          <span className={styles.startIcon}>{startIcon}</span>
        )}
        {children && <span className={styles.content}>{children}</span>}

        {!isLoading && endIcon && (
          <span className={styles.endIcon}>{endIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"
export default Button
