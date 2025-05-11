import BLOG, { LAYOUT_MAPPINGS } from '@/blog.config'
import * as ThemeComponents from '@theme-components'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { getQueryParam, getQueryVariable, isBrowser } from '../lib/utils'

// 在next.config.js中扫描所有主题
export const { THEMES = [] } = getConfig()?.publicRuntimeConfig || {}

/**
 * 获取主题配置 - 优化版本
 * @param {string} themeQuery - 主题查询参数
 * @returns {Promise<object>} 主题配置对象
 */
export const getThemeConfig = async themeQuery => {
  // 如果没有themeQuery或等于默认主题，直接返回默认配置
  if (!themeQuery || themeQuery === BLOG.THEME) {
    return ThemeComponents?.THEME_CONFIG
  }

  // 取 themeQuery 中第一个主题（以逗号为分隔符）
  const themeName = themeQuery.split(',')[0].trim()

  try {
    // 动态导入主题配置
    const THEME_CONFIG = await import(`@/themes/${themeName}`)
      .then(m => m.THEME_CONFIG)
      .catch(() => null)

    // 如果主题配置加载成功，返回配置，否则返回默认配置
    return THEME_CONFIG || ThemeComponents?.THEME_CONFIG
  } catch (error) {
    console.error(`Error loading theme configuration for ${themeName}:`, error)
    return ThemeComponents?.THEME_CONFIG
  }
}

/**
 * 加载全局布局 - 简化版
 */
export const getBaseLayoutByTheme = theme => {
  const LayoutBase = ThemeComponents['LayoutBase']
  const isDefaultTheme = !theme || theme === BLOG.THEME
  
  if (isDefaultTheme) {
    return LayoutBase
  }
  
  return dynamic(
    () => import(`@/themes/${theme}`).then(m => m['LayoutBase']),
    { ssr: true }
  )
}

/**
 * 动态获取布局 - 简化版
 */
export const DynamicLayout = props => {
  const { theme, layoutName } = props
  const SelectedLayout = getLayoutByTheme({ layoutName, theme })
  return <SelectedLayout {...props} />
}

/**
 * 加载主题文件 - 优化版
 */
export const getLayoutByTheme = ({ layoutName, theme }) => {
  const LayoutComponents =
    ThemeComponents[layoutName] || ThemeComponents.LayoutSlug

  const router = useRouter()
  const themeQuery = getQueryParam(router?.asPath, 'theme') || theme
  const isDefaultTheme = !themeQuery || themeQuery === BLOG.THEME

  if (isDefaultTheme) {
    setTimeout(fixThemeDOM, 100)
    return LayoutComponents
  }

  return dynamic(
    () => import(`@/themes/${themeQuery}`).then(m => {
      const components = m[layoutName] || m.LayoutSlug
      setTimeout(fixThemeDOM, 500)
      return components
    }),
    { ssr: true }
  )
}

/**
 * 根据路径 获取对应的layout名称
 * @param {*} path
 * @returns
 */
const getLayoutNameByPath = path => {
  const layoutName = LAYOUT_MAPPINGS[path] || 'LayoutSlug'
  return layoutName
}

/**
 * 切换主题时的特殊处理
 * 删除多余的元素
 */
const fixThemeDOM = () => {
  if (isBrowser) {
    const elements = document.querySelectorAll('[id^="theme-"]')
    if (elements?.length > 1) {
      for (let i = 0; i < elements.length - 1; i++) {
        if (
          elements[i] &&
          elements[i].parentNode &&
          elements[i].parentNode.contains(elements[i])
        ) {
          elements[i].parentNode.removeChild(elements[i])
        }
      }
      elements[0]?.scrollIntoView()
    }
  }
}

/**
 * 初始化主题 , 优先级 query > cookies > systemPrefer
 * @param isDarkMode
 * @param updateDarkMode 更改主题ChangeState函数
 * @description 读取cookie中存的用户主题
 */
export const initDarkMode = (updateDarkMode, defaultDarkMode) => {
  // 查看用户设备浏览器是否深色模型
  let newDarkMode = isPreferDark()

  // 查看localStorage中用户记录的是否深色模式
  const userDarkMode = loadDarkModeFromLocalStorage()
  if (userDarkMode) {
    newDarkMode = userDarkMode === 'dark' || userDarkMode === 'true'
    saveDarkModeToLocalStorage(newDarkMode) // 用户手动的才保存
  }

  // 如果站点强制设置默认深色，则优先级改过用
  if (defaultDarkMode === 'true') {
    newDarkMode = true
  }

  // url查询条件中是否深色模式
  const queryMode = getQueryVariable('mode')
  if (queryMode) {
    newDarkMode = queryMode === 'dark'
  }

  updateDarkMode(newDarkMode)
  document
    .getElementsByTagName('html')[0]
    .setAttribute('class', newDarkMode ? 'dark' : 'light')
}

/**
 * 是否优先深色模式， 根据系统深色模式以及当前时间判断
 * @returns {*}
 */
export function isPreferDark() {
  if (BLOG.APPEARANCE === 'dark') {
    return true
  }
  if (BLOG.APPEARANCE === 'auto') {
    // 系统深色模式或时间是夜间时，强行置为夜间模式
    const date = new Date()
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return (
      prefersDarkMode ||
      (BLOG.APPEARANCE_DARK_TIME &&
        (date.getHours() >= BLOG.APPEARANCE_DARK_TIME[0] ||
          date.getHours() < BLOG.APPEARANCE_DARK_TIME[1]))
    )
  }
  return false
}

/**
 * 读取深色模式
 * @returns {*}
 */
export const loadDarkModeFromLocalStorage = () => {
  return localStorage.getItem('darkMode')
}

/**
 * 保存深色模式
 * @param newTheme
 */
export const saveDarkModeToLocalStorage = newTheme => {
  localStorage.setItem('darkMode', newTheme)
}
