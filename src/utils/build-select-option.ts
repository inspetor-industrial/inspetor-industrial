export class BuildSelectOption {
  static build(label: string, value: string) {
    return {
      label,
      value: `${label}|${value}`,
    }
  }
}
