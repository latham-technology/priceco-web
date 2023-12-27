import * as Toast from 'vue-toastification/dist/index.mjs'

const { useToast } = Toast

export function useNotification() {
    const toast = useToast()

    const success = (message: string) => {
        toast.success(message)
    }

    const error = (message: string) => {
        toast.error(message)
    }

    return {
        success,
        error,
    }
}
