import * as React from "react"
import { useToast } from "./use-toast"
import { Toast } from "./toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, type }) => (
        <Toast
          key={id}
          variant={type}
          onClose={() => {
            const { dismiss } = useToast()
            dismiss(id)
          }}
        >
          <Toast.Title>{title}</Toast.Title>
          {description && (
            <Toast.Description>{description}</Toast.Description>
          )}
        </Toast>
      ))}
    </div>
  )
}
