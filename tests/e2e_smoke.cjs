const path = require('path')
const fs = require('fs')
const { chromium } = require('playwright')

;(async () => {
  const output = path.resolve(__dirname, '..', 'test-output')
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  })
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })
  const consoleErrors = []
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

  await page.goto('http://127.0.0.1:5173/login')
  await page.waitForLoadState('networkidle')
  if (!await page.getByText('登录社区档案').isVisible()) throw new Error('登录页未显示')
  await page.screenshot({ path: path.join(output, '01-login.png'), fullPage: true })

  await page.getByPlaceholder('请输入账号').fill('admin')
  await page.getByPlaceholder('请输入密码').fill('123456')
  await page.getByRole('button', { name: '进入系统' }).click()
  await page.waitForURL('**/dashboard')
  await page.waitForLoadState('networkidle')
  if (!await page.getByText('民警已完成任务', { exact: true }).isVisible()) throw new Error('统计图未显示')
  await page.screenshot({ path: path.join(output, '02-dashboard.png'), fullPage: true })

  await page.getByText('房屋与门牌', { exact: true }).click()
  await page.waitForURL('**/houses')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: '二维码' }).first().click()
  await page.getByText('智慧门牌二维码', { exact: true }).waitFor()
  await page.screenshot({ path: path.join(output, '03-house-qr.png'), fullPage: true })
  await page.keyboard.press('Escape')

  await page.goto('http://127.0.0.1:5173/doorplate/67c544c8-6df0-4c73-aabc-810cd9a01a01')
  await page.waitForLoadState('networkidle')
  if (!await page.getByText('正在出租', { exact: true }).isVisible()) throw new Error('公共门牌信息未显示')
  await page.screenshot({ path: path.join(output, '04-doorplate.png'), fullPage: true })

  await browser.close()
  if (consoleErrors.length) throw new Error(`浏览器控制台错误: ${consoleErrors.join(' | ')}`)
  console.log('E2E_SMOKE_OK')
})().catch(error => { console.error(error); process.exit(1) })
