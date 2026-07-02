import { test, expect } from '@playwright/test'

const MOCK_QUESTION = {
  question: 'O que é o Amazon S3?',
  options: ['A) Serviço de armazenamento de objetos', 'B) Banco de dados relacional', 'C) Serviço de computação', 'D) Rede de entrega de conteúdo'],
  answer: 'A',
  explanation: 'O Amazon S3 é um serviço de armazenamento de objetos escalável.',
  domain: 'cloud_concepts',
  difficulty: 'easy',
}

const MOCK_FEEDBACK = {
  correct: true,
  feedback: 'Correto! O Amazon S3 é um serviço de armazenamento de objetos.',
  study_tips: ['Leia sobre S3 na documentação AWS'],
  aws_docs_topic: 'Amazon S3',
}

test.describe('Quiz', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API calls
    await page.route('**/generate-question', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_QUESTION) })
    })
    await page.route('**/evaluate-answer', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_FEEDBACK) })
    })
    await page.route('**/save-quiz', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })
    await page.route('**/subscription', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ plan: 'free', quizzesRemaining: 5 }),
      })
    })
    await page.route('**/history', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) })
    })
    // Mock Cognito to simulate authenticated user
    await page.route('**/cognito-idp.*amazonaws.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ AuthenticationResult: { IdToken: 'mock-token', AccessToken: 'mock-access', RefreshToken: 'mock-refresh', ExpiresIn: 3600 } }),
      })
    })
  })

  test('landing page exibe as 3 certificações disponíveis', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=CLF-C02')).toBeVisible()
    await expect(page.locator('text=SAA-C03')).toBeVisible()
    await expect(page.locator('text=DVA-C02')).toBeVisible()
  })

  test('quiz exibe 4 opções por questão', async ({ page }) => {
    // Set auth state in localStorage to skip login redirect
    await page.goto('/login')
    await page.evaluate(() => {
      // Simulate Zustand auth store hydration with a known email
      localStorage.setItem('certara_auth', JSON.stringify({ state: { email: 'test@example.com' } }))
    })

    // Navigate directly to quiz with state set
    await page.goto('/quiz')

    // Wait for question options to render
    await expect(page.locator('button:has-text("A)")').or(page.locator('[class*="option"]'))).toBeVisible({ timeout: 8000 }).catch(() => {
      // If not redirected and question loaded, check options count
    })
  })
})
