import defaultSettings from '@/settings'

const title = defaultSettings.title || '张飞读书'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
