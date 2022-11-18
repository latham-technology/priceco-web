export default function () {
  const slots = useSlots()

  return {
    hasExtra: !!slots.extra,
    hasError: !!slots.error
  }
}
