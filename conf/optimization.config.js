/**
 * 网站性能优化相关配置
 */
module.exports = {
  // 图片优化
  IMAGE_LAZY_LOADING: process.env.NEXT_PUBLIC_IMAGE_LAZY_LOADING || true, // 图片懒加载
  IMAGE_COMPRESS_QUALITY: process.env.NEXT_PUBLIC_IMAGE_COMPRESS_QUALITY || 0.8, // 图片压缩质量(0-1)

  // 资源优化  
  PRELOAD_CRITICAL_ASSETS: process.env.NEXT_PUBLIC_PRELOAD_CRITICAL_ASSETS || true, // 预加载关键资源
  ENABLE_RESOURCE_HINT: process.env.NEXT_PUBLIC_ENABLE_RESOURCE_HINT || true, // 资源提示(dns-prefetch等)
  
  // 代码优化
  CODE_SPLITTING: process.env.NEXT_PUBLIC_CODE_SPLITTING || true, // 代码分割
  MINIMIZE_JS: process.env.NEXT_PUBLIC_MINIMIZE_JS || true, // JS最小化
  MINIMIZE_CSS: process.env.NEXT_PUBLIC_MINIMIZE_CSS || true, // CSS最小化

  // 页面加载优化
  DISABLE_ANIMATIONS_ON_WEAK_DEVICES: true, // 在低性能设备上禁用动画
  FORCE_DNS_PREFETCH: true, // 强制DNS预获取
  USE_WEBP_IF_SUPPORTED: true // 如果浏览器支持，使用WebP图片格式
}
