/** 차트 축·범례용 프로젝트명 단축 */
export function formatChartProjectLabel(name: string, maxLength = 16) {
  if (name.length <= maxLength) {
    return name
  }

  const words = name.split(/\s+/)
  if (words.length > 1) {
    let result = words[0]

    for (let index = 1; index < words.length; index += 1) {
      const candidate = `${result} ${words[index]}`
      if (candidate.length > maxLength) {
        break
      }
      result = candidate
    }

    if (result.length < name.length) {
      return result.length <= maxLength - 1 ? `${result}…` : result
    }
  }

  return `${name.slice(0, maxLength - 1)}…`
}
